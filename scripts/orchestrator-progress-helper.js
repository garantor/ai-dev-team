/**
 * Shared helper: Update orchestrator issue progress counter.
 *
 * Usage inside actions/github-script (after actions/checkout):
 *   const { updateOrchestratorProgress } = require('./scripts/orchestrator-progress-helper');
 *   await updateOrchestratorProgress(github, context, closedIssueNumber);
 */

async function updateOrchestratorProgress(github, context, closedIssueNumber) {
  const owner = context.repo.owner;
  const repo = context.repo.repo;

  try {
    // Get the closed issue to find its parent orchestrator
    const { data: closedIssue } = await github.rest.issues.get({
      owner,
      repo,
      issue_number: closedIssueNumber
    });

    const parentMatch = (closedIssue.body || '').match(/Parent Issue:\s*#(\d+)/i);
    if (!parentMatch) {
      console.log(`No parent orchestrator issue found for #${closedIssueNumber}`);
      return;
    }

    const orchestratorNumber = parseInt(parentMatch[1]);

    // Get all issues linked to this orchestrator
    const { data: allIssues } = await github.rest.issues.listForRepo({
      owner,
      repo,
      state: 'all',
      per_page: 100
    });

    const linkedIssues = allIssues.filter(issue => {
      const body = issue.body || '';
      return body.includes(`Parent Issue: #${orchestratorNumber}`) &&
             issue.number !== orchestratorNumber;
    });

    const totalIssues = linkedIssues.length;
    const completedIssues = linkedIssues.filter(i => i.state === 'closed').length;

    // Update orchestrator issue title with progress
    const { data: orchestrator } = await github.rest.issues.get({
      owner,
      repo,
      issue_number: orchestratorNumber
    });

    const newTitle = orchestrator.title.replace(/\s*\[\d+\/\d+\]\s*$/, '') +
                     ` [${completedIssues}/${totalIssues}]`;

    await github.rest.issues.update({
      owner,
      repo,
      issue_number: orchestratorNumber,
      title: newTitle
    });

    console.log(`Updated orchestrator #${orchestratorNumber}: [${completedIssues}/${totalIssues}]`);

    // If all issues are complete, post a completion comment
    if (completedIssues === totalIssues && totalIssues > 0) {
      await github.rest.issues.createComment({
        owner,
        repo,
        issue_number: orchestratorNumber,
        body: `## 🎉 All Issues Completed!

**Congratulations!** All ${totalIssues} issues have been successfully completed.

**Final Status:**
- ✅ Completed: ${completedIssues}/${totalIssues} (100%)

**Next Steps:**
1. Test the complete implementation
2. Deploy to production
3. Close this orchestrator issue when satisfied

Thank you for using the AI Dev Team! 🚀`
      });
    }
  } catch (error) {
    console.log(`Error updating orchestrator progress: ${error.message}`);
  }
}

module.exports = { updateOrchestratorProgress };
