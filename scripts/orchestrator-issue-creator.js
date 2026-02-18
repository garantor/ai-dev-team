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
  }).catch(() => {});
  
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
  const issuesSection = planText.match(/## 📝 GITHUB ISSUES TO CREATE\s+([\s\S]*?)(?=##|$)/i);
  if (!issuesSection) return issues;

  const issuesText = issuesSection[1];
  const issueBlocks = issuesText.split(/### Issue #(\d+)[:\s]/);
  
  for (let i = 1; i < issueBlocks.length; i += 2) {
    const localId = issueBlocks[i];
    const block = issueBlocks[i+1].trim();
    
    const titleMatch = block.match(/^\[([^\]]+)\]\s+(.+)/);
    if (!titleMatch) continue;
    
    const agentType = titleMatch[1];
    const title = titleMatch[2].split('\n')[0].trim();
    
    const labelsMatch = block.match(/\*\*Labels:\*\*\s+(.+)/i);
    const labels = labelsMatch ? 
      labelsMatch[1].split(',').map(l => l.trim()) : 
      [agentType.toLowerCase()];
    
    const depsMatch = block.match(/\*\*Depends on:\*\*\s+(.+)/i);
    const dependencies = depsMatch ?
      depsMatch[1].match(/#\d+/g).map(d => parseInt(d.replace('#', ''))) :
      [];
    
    const descMatch = block.match(/\*\*Description:\*\*\s+([\s\S]+?)(?=###|$)/i) ||
                     block.match(/\*\*Deliverables:\*\*\s+([\s\S]+?)(?=###|$)/i);
    let description = descMatch ? descMatch[1].trim() : block;
    description = description.replace(/\*\*[^*]+:\*\*[^\n]*\n?/g, '').trim();
    
    issues.push({
      localId: parseInt(localId),
      title: `[${agentType}] ${title}`,
      agentType: agentType.toLowerCase(),
      labels: labels,
      dependencies: dependencies,
      description: description
    });
  }
  return issues;
}

function parseFromAgentTasks(planText) {
  const issues = [];
  const sections = [
    'Backend Agent Tasks',
    'Integration Agent Tasks',
    'Frontend Agent Tasks',
    'QA Agent Tasks'
  ];
  
  sections.forEach(section => {
    const sectionMatch = planText.match(new RegExp(`### ${section}\\s+([\\s\\S]*?)(?=###|##|$)`, 'i'));
    if (sectionMatch) {
      const tasks = sectionMatch[1];
      const taskMatches = tasks.matchAll(/[-*]\s+\*\*([^*]+)\*\*:?\s+([^\n]+)/g);
      
      for (const match of taskMatches) {
        const taskName = match[1].trim();
        const description = match[2].trim();
        const agentType = section.split(' ')[0].toLowerCase();
        
        issues.push({
          title: `[${section.split(' ')[0].toUpperCase()}] ${taskName}`,
          agentType: agentType,
          labels: [agentType, 'P0'],
          dependencies: [],
          description: description
        });
      }
    }
  });
  return issues;
}

function buildSummary(createdIssues) {
  const byAgent = {};
  createdIssues.forEach(issue => {
    if (!byAgent[issue.agentType]) byAgent[issue.agentType] = [];
    byAgent[issue.agentType].push(issue);
  });

  let summary = `## 🎉 Issues Created Successfully!\n\n`;
  summary += `**Total Issues:** ${createdIssues.length}\n\n`;
  
  for (const [agentType, issues] of Object.entries(byAgent)) {
    const agentEmoji = {
      'backend': '⚙️', 'integration': '🔌', 'frontend': '🎨', 'qa': '🧪', 'product': '📋'
    }[agentType] || '📝';
    
    summary += `### ${agentEmoji} ${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Agent Issues\n\n`;
    issues.forEach(issue => {
      const statusEmoji = issue.status === 'ready' ? '🟢' : '🔴';
      summary += `- ${statusEmoji} #${issue.number} - ${issue.title.replace(`[${agentType.toUpperCase()}] `, '')}\n`;
    });
    summary += '\n';
  }
  
  summary += `---\n\n## 📊 Status Overview\n\n`;
  const readyCount = createdIssues.filter(i => i.status === 'ready').length;
  const blockedCount = createdIssues.filter(i => i.status === 'blocked').length;
  summary += `- 🟢 **Ready to start:** ${readyCount} issues\n`;
  summary += `- 🔴 **Blocked (waiting for dependencies):** ${blockedCount} issues\n\n`;
  summary += `---\n\n## 🚀 Next Steps\n\nAgents will automatically start working on ready issues.`;
  return summary;
}
