/**
 * Orchestrator Issue Creator
 * 
 * Logic to parse a product plan from an issue comment and create the corresponding sub-issues.
 */

module.exports = async ({ github, context, core, issueNumber }) => {
  const orchestratorNumber = issueNumber || context.issue.number;
  const owner = context.repo.owner;
  const repo = context.repo.repo;

  console.log(`Starting issue creation for Orchestrator #${orchestratorNumber}`);

  // 1. Extract approved plan from comments
  const comments = await github.rest.issues.listComments({
    owner,
    repo,
    issue_number: orchestratorNumber
  });

  // Find the most recent plan comment
  const planComments = comments.data.filter(c =>
    c.body.includes('## 🎯 PROJECT OVERVIEW') ||
    c.body.includes('## 📝 GITHUB ISSUES TO CREATE') ||
    c.body.includes('## 📋 Product Agent Analysis')
  );

  if (planComments.length === 0) {
    throw new Error('No plan found in comments for issue #' + orchestratorNumber);
  }

  const latestPlan = planComments[planComments.length - 1].body;

  // 2. Parse issues from plan
  const parsedIssues = parseIssuesFromPlan(latestPlan);
  console.log(`Parsed ${parsedIssues.length} issues from plan.`);

  if (parsedIssues.length === 0) {
    console.log('No issues parsed. Attempting fallback to agent tasks...');
    // Attempt fallback logic if standard section not found
    const fallbackIssues = parseFromAgentTasks(latestPlan);
    parsedIssues.push(...fallbackIssues);
    console.log(`Fallback parsed ${fallbackIssues.length} issues.`);
  }

  if (parsedIssues.length === 0) {
    throw new Error('Could not parse any issues from the plan.');
  }

  // 3. Create GitHub issues
  const createdIssues = [];
  const issueMapping = {}; // Map local IDs (e.g. #1) to real GitHub issue numbers

  for (const issueData of parsedIssues) {
    try {
      let body = issueData.description;
      body += `\n\n---\n\n**Parent Issue:** #${orchestratorNumber}`;

      if (issueData.dependencies && issueData.dependencies.length > 0) {
        const mappedDeps = issueData.dependencies
          .map(dep => issueMapping[dep] || dep)
          .filter(dep => dep);

        if (mappedDeps.length > 0) {
          body += `\n**Depends on:** ${mappedDeps.map(d => `#${d}`).join(', ')}`;
          body += `\n\n⚠️ This issue is blocked until the dependencies are resolved.`;
        }
      }

      body += `\n\n---\n\n**@copilot** Please implement this ${issueData.agentType} task following the ${issueData.agentType} agent guidelines.`;

      let labels = [...issueData.labels];
      if (issueData.dependencies && issueData.dependencies.length > 0) {
        labels.push('blocked');
      } else {
        labels.push('ready');
      }

      const issue = await github.rest.issues.create({
        owner,
        repo,
        title: issueData.title,
        body,
        labels
      });

      console.log(`Created issue #${issue.data.number}: ${issueData.title}`);

      createdIssues.push({
        number: issue.data.number,
        title: issueData.title,
        url: issue.data.html_url,
        agentType: issueData.agentType,
        status: issueData.dependencies?.length > 0 ? 'blocked' : 'ready'
      });

      // Update mapping if the plan used internal IDs (e.g. #1, #2)
      if (issueData.localId) {
        issueMapping[issueData.localId] = issue.data.number;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error creating issue: ${error.message}`);
    }
  }

  // 4. Post summary to orchestrator issue
  const summary = buildSummary(createdIssues);
  await github.rest.issues.createComment({
    owner,
    repo,
    issue_number: orchestratorNumber,
    body: summary
  });

  // 5. Update orchestrator labels and title
  await github.rest.issues.removeLabel({
    owner,
    repo,
    issue_number: orchestratorNumber,
    name: 'creating-issues'
  }).catch(() => { });

  await github.rest.issues.addLabels({
    owner,
    repo,
    issue_number: orchestratorNumber,
    labels: ['in-progress']
  });

  const issue = await github.rest.issues.get({
    owner,
    repo,
    issue_number: orchestratorNumber
  });

  const newTitle = issue.data.title.replace(/\s*\[.*?\]\s*$/, '') + ` [0/${createdIssues.length}]`;
  await github.rest.issues.update({
    owner,
    repo,
    issue_number: orchestratorNumber,
    title: newTitle
  });

  console.log('Orchestrator update complete.');
};

function parseIssuesFromPlan(planText) {
  const issues = [];

  // 1. Find the GITHUB ISSUES section with a flexible regex
  // Matches "## ... GITHUB ISSUES TO CREATE" and captures everything until the next "## " or end of string
  const sectionHeaderRegex = /## .*GITHUB ISSUES TO CREATE.*/i;
  const parts = planText.split(sectionHeaderRegex);
  if (parts.length < 2) return issues;

  let sectionContent = parts[1].split(/\n## /)[0].trim();

  // 2. Strip markdown code block decorators if the AI wrapped the content
  sectionContent = sectionContent.replace(/^```markdown\n?/i, '')
    .replace(/```$/i, '')
    .trim();

  // 3. Identify and split into individual issue blocks
  // Common separators: "---", "### Issue #1", or a double newline before a title pattern
  let blocks = [];
  if (sectionContent.includes('---')) {
    blocks = sectionContent.split(/\n---\n+/).map(b => b.trim()).filter(b => b);
  } else if (sectionContent.match(/### Issue #\d+/i)) {
    blocks = sectionContent.split(/\n### Issue #\d+[:\s]*/i).map(b => b.trim()).filter(b => b);
  } else {
    // Fallback: split by double newlines
    blocks = sectionContent.split(/\n\n+/).map(b => b.trim()).filter(b => b);
  }

  // 4. Parse each block for fields
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // Look for Title
    const titleMatch = block.match(/(?:\*\*Title:\*\*|Title:)\s*(.+)/i) ||
      block.match(/^\[([^\]]+)\]\s+(.+)/m) ||
      block.match(/^\*\*\[([^\]]+)\]\s+(.+)\*\*/m);

    if (!titleMatch) continue;

    let agentType = 'generic';
    let title = '';

    if (titleMatch[2]) {
      agentType = titleMatch[1].toLowerCase().replace(/agent/g, '').trim();
      title = titleMatch[2].trim();
    } else {
      title = titleMatch[1].trim();
      // Try to extract agent type from title prefix like [BACKEND]
      const agentFromTitle = title.match(/^\[([^\]]+)\]/);
      if (agentFromTitle) {
        agentType = agentFromTitle[1].toLowerCase().replace(/agent/g, '').trim();
      }
    }

    // Look for Labels
    const labelsMatch = block.match(/(?:\*\*Labels:\*\*|Labels:)\s*(.+)/i);
    const labels = labelsMatch ?
      labelsMatch[1].split(/[,|]/).map(l => l.trim().toLowerCase()).filter(l => l) :
      [agentType];

    // Look for Dependencies
    const depsMatch = block.match(/(?:\*\*Depends on:\*\*|Depends on:)\s*(.+)/i);
    const dependencies = depsMatch ?
      depsMatch[1].match(/#\d+/g)?.map(d => parseInt(d.replace('#', ''))) || [] :
      [];

    // Look for Description / Deliverables
    const descMatch = block.match(/(?:\*\*Description:\*\*|Description:)\s*([\s\S]+)$/i) ||
      block.match(/(?:\*\*Deliverables:\*\*)?\s*([\s\S]+)$/i);

    let description = descMatch ? descMatch[1].trim() : block;
    // Clean up metadata lines from description
    description = description.replace(/^(?:Title|Labels|Depends on|Parent):.*$/gmi, '').trim();

    issues.push({
      localId: i + 1,
      title: `[${agentType.toUpperCase()}] ${title.replace(/^\[[^\]]+\]\s*/, '')}`,
      agentType: agentType,
      labels: labels,
      dependencies: dependencies,
      description: description
    });
  }

  return issues;
}

function parseFromAgentTasks(planText) {
  const issues = [];

  // 1. Look for the AGENT TASK BREAKDOWN section header
  const sectionMatch = planText.match(/## .*AGENT TASK BREAKDOWN.*/i);
  if (!sectionMatch) return issues;

  const parts = planText.split(sectionMatch[0]);
  const tableContent = parts[1].split(/\n## /)[0].trim();

  // 2. Parse markdown table
  const lines = tableContent.split('\n');
  const taskRows = lines.filter(l => l.includes('|') && !l.includes(':---') && !l.toLowerCase().includes('| task |'));

  taskRows.forEach((row, index) => {
    const cols = row.split('|').map(c => c.trim()).filter(c => c !== '');
    if (cols.length >= 3) {
      const taskName = cols[0].replace(/^\*\*|\*\*$/g, '');
      const description = cols[1];
      const agent = cols[2].toLowerCase().replace(/agent/g, '').trim();

      issues.push({
        localId: 100 + index,
        title: `[${agent.toUpperCase()}] ${taskName}`,
        agentType: agent,
        labels: [agent, 'p0'],
        dependencies: [],
        description: description
      });
    }
  });

  return issues;
}

function buildSummary(createdIssues) {
  const byAgent = {};
  createdIssues.forEach(issue => {
    const type = issue.agentType || 'other';
    if (!byAgent[type]) byAgent[type] = [];
    byAgent[type].push(issue);
  });

  let summary = `## 🎉 Issues Created Successfully!\n\n`;
  summary += `**Total Issues:** ${createdIssues.length}\n\n`;

  for (const [agentType, issues] of Object.entries(byAgent)) {
    const emojiMap = {
      'backend': '⚙️', 'integration': '🔌', 'frontend': '🎨', 'qa': '🧪', 'product': '📋', 'mobile': '📱'
    };
    const agentEmoji = emojiMap[agentType] || '📝';

    summary += `### ${agentEmoji} ${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Agent Issues\n\n`;
    issues.forEach(issue => {
      const statusEmoji = issue.status === 'ready' ? '🟢' : '🔴';
      summary += `- ${statusEmoji} #${issue.number} - ${issue.title.replace(/^\[[^\]]+\]\s*/, '')}\n`;
    });
    summary += '\n';
  }

  summary += `---\n\n## 📊 Status Overview\n\n`;
  const readyCount = createdIssues.filter(i => i.status === 'ready').length;
  const blockedCount = createdIssues.filter(i => i.status === 'blocked').length;
  summary += `- 🟢 **Ready to start:** ${readyCount} issues\n`;
  summary += `- 🔴 **Blocked:** ${blockedCount} issues\n\n`;
  summary += `---\n\n## 🚀 Next Steps\n\nAgents will automatically start working on ready issues. You can track progress by checking the labels.`;
  return summary;
}
