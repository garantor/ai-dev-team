/**
 * Auto-Rebase Script
 *
 * After an agent PR is merged, this script:
 * 1. Finds all other open agent PRs
 * 2. Rebases each onto the latest main
 * 3. If rebase fails (content conflict), uses Gemini AI to resolve
 * 4. Force-pushes rebased branches
 * 5. Posts status comments on affected PRs
 *
 * Usage in GitHub Actions (after actions/checkout with fetch-depth: 0):
 *   node scripts/auto-rebase.js
 *
 * Required env vars:
 *   GITHUB_TOKEN or GH_PAT  — for GitHub API + push
 *   GOOGLE_API_KEY           — for AI conflict resolution
 *   GITHUB_REPOSITORY        — e.g. "garantor/ai-dev-team"
 *   MERGED_PR_NUMBER         — the PR that was just merged (to skip it)
 */

const { execSync } = require('child_process');

module.exports = { autoRebaseOpenPRs, resolveConflictsWithAI };

/**
 * Main entry point: find and rebase all open agent PRs.
 */
async function autoRebaseOpenPRs(github, context) {
    const owner = context.repo.owner;
    const repo = context.repo.repo;
    const mergedPR = parseInt(process.env.MERGED_PR_NUMBER || '0');

    // 1. Find all open PRs on agent/* branches
    const { data: openPRs } = await github.rest.pulls.list({
        owner,
        repo,
        state: 'open',
        per_page: 100
    });

    const agentPRs = openPRs.filter(pr =>
        pr.head.ref.startsWith('agent/') && pr.number !== mergedPR
    );

    if (agentPRs.length === 0) {
        console.log('No open agent PRs to rebase.');
        return;
    }

    console.log(`Found ${agentPRs.length} open agent PR(s) to rebase.`);

    // Fetch latest main
    execSync('git fetch origin main', { stdio: 'inherit' });

    // Configure git
    execSync('git config user.name "github-actions[bot]"');
    execSync('git config user.email "github-actions[bot]@users.noreply.github.com"');

    for (const pr of agentPRs) {
        const branch = pr.head.ref;
        console.log(`\n--- Rebasing PR #${pr.number}: ${branch} ---`);

        try {
            // Fetch the branch
            execSync(`git fetch origin ${branch}`, { stdio: 'inherit' });
            execSync(`git checkout ${branch}`, { stdio: 'inherit' });
            execSync(`git reset --hard origin/${branch}`, { stdio: 'inherit' });

            // Attempt rebase
            try {
                execSync('git rebase origin/main', { stdio: 'pipe', encoding: 'utf-8' });
                console.log(`Rebase succeeded for ${branch}`);
            } catch (rebaseErr) {
                console.log(`Rebase conflict detected on ${branch}, attempting AI resolution...`);

                const resolved = await resolveConflictsWithAI(github, context, pr);

                if (!resolved) {
                    // Abort rebase and skip this PR
                    try { execSync('git rebase --abort'); } catch (_) { }
                    await postComment(github, owner, repo, pr.number,
                        `## ⚠️ Auto-Rebase Failed\n\n` +
                        `This PR has conflicts with \`main\` that could not be resolved automatically.\n\n` +
                        `**Please resolve manually:**\n` +
                        '```bash\n' +
                        `git checkout ${branch}\n` +
                        `git fetch origin main\n` +
                        `git rebase origin/main\n` +
                        `# resolve conflicts, then:\n` +
                        `git rebase --continue\n` +
                        `git push --force-with-lease origin ${branch}\n` +
                        '```'
                    );
                    continue;
                }
            }

            // Force-push the rebased branch
            execSync(`git push --force-with-lease origin ${branch}`, { stdio: 'inherit' });
            console.log(`Force-pushed rebased branch: ${branch}`);

            await postComment(github, owner, repo, pr.number,
                `## ✅ Auto-Rebased\n\n` +
                `This PR has been automatically rebased onto the latest \`main\` after a sibling PR was merged.\n\n` +
                `No conflicts detected — the branch is up to date.`
            );
        } catch (err) {
            console.log(`Error processing PR #${pr.number} (${branch}): ${err.message}`);
            // Clean up — go back to main
            try { execSync('git rebase --abort'); } catch (_) { }
            try { execSync('git checkout main'); } catch (_) { }
        }
    }

    // Return to main
    try { execSync('git checkout main'); } catch (_) { }
}

/**
 * Resolve merge conflicts using Gemini AI.
 * Returns true if all conflicts were resolved, false otherwise.
 */
async function resolveConflictsWithAI(github, context, pr) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.log('No GOOGLE_API_KEY — cannot use AI conflict resolution.');
        return false;
    }

    try {
        // Get list of conflicted files
        const conflictedOutput = execSync(
            'git diff --name-only --diff-filter=U',
            { encoding: 'utf-8' }
        ).trim();

        if (!conflictedOutput) {
            console.log('No conflicted files found.');
            return false;
        }

        const conflictedFiles = conflictedOutput.split('\n').filter(Boolean);
        console.log(`Conflicted files: ${conflictedFiles.join(', ')}`);

        for (const file of conflictedFiles) {
            // Read the file with conflict markers
            const conflictContent = execSync(`cat "${file}"`, { encoding: 'utf-8' });

            // Check it actually has conflict markers
            if (!conflictContent.includes('<<<<<<<') || !conflictContent.includes('>>>>>>>')) {
                console.log(`File ${file} has no conflict markers, skipping.`);
                continue;
            }

            // Ask Gemini to resolve
            const prompt = `You are a senior developer resolving a git merge conflict.

The following file has merge conflict markers. Resolve the conflicts by combining both sides intelligently.
Keep ALL functionality from both sides. Do NOT remove any imports, functions, or features from either side.
If both sides add different items to the same list/array/object, include ALL items.

FILE: ${file}
PR Title: ${pr.title}

CONFLICTED CONTENT:
\`\`\`
${conflictContent}
\`\`\`

Return ONLY the resolved file content with NO conflict markers. Do not include any explanation, markdown formatting, or code fences — just the raw resolved file content.`;

            const requestBody = JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 16384
                }
            });

            // Write request to temp file to avoid shell escaping issues
            const fs = require('fs');
            const tmpFile = `/tmp/rebase_request_${Date.now()}.json`;
            fs.writeFileSync(tmpFile, requestBody);

            const rawResponse = execSync(
                `curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}" ` +
                `-H "Content-Type: application/json" -d @${tmpFile}`,
                { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
            );

            // Clean up temp file
            try { fs.unlinkSync(tmpFile); } catch (_) { }

            const response = JSON.parse(rawResponse);

            if (response.error) {
                console.log(`Gemini API error for ${file}: ${response.error.message}`);
                return false;
            }

            let resolvedContent = response.candidates
                && response.candidates[0]
                && response.candidates[0].content
                && response.candidates[0].content.parts
                && response.candidates[0].content.parts[0]
                && response.candidates[0].content.parts[0].text;
            if (!resolvedContent) {
                console.log(`No resolution generated for ${file}`);
                return false;
            }

            // Strip code fences if the model wrapped them anyway
            resolvedContent = resolvedContent
                .replace(/^```[\w]*\n?/, '')
                .replace(/\n?```\s*$/, '');

            // Validate: resolved content should NOT have conflict markers
            if (resolvedContent.includes('<<<<<<<') || resolvedContent.includes('>>>>>>>')) {
                console.log(`AI resolution for ${file} still contains conflict markers — aborting.`);
                return false;
            }

            // Write resolved content
            fs.writeFileSync(file, resolvedContent);
            execSync(`git add "${file}"`);
            console.log(`✅ AI resolved conflicts in: ${file}`);
        }

        // Continue the rebase
        execSync('git -c core.editor=true rebase --continue', { stdio: 'pipe' });
        console.log('Rebase completed after AI conflict resolution.');

        // Post a detailed comment
        await postComment(github, context.repo.owner, context.repo.repo, pr.number,
            `## 🤖 Auto-Rebased (AI Conflict Resolution)\n\n` +
            `This PR had conflicts with \`main\` after a sibling PR was merged.\n\n` +
            `**Resolved files:**\n` +
            conflictedFiles.map(f => `- \`${f}\``).join('\n') + '\n\n' +
            `> ⚠️ Please review the AI-resolved changes carefully before merging.`
        );

        return true;
    } catch (err) {
        console.log(`AI conflict resolution failed: ${err.message}`);
        return false;
    }
}

/**
 * Post a comment on a PR (with idempotency — avoids duplicate messages).
 */
async function postComment(github, owner, repo, prNumber, body) {
    try {
        // Check for existing identical comment (first 50 chars)
        const snippet = body.substring(0, 50);
        const { data: comments } = await github.rest.issues.listComments({
            owner, repo,
            issue_number: prNumber,
            per_page: 10
        });

        const alreadyPosted = comments.some(c =>
            c.body.includes(snippet) && c.user.login === 'github-actions[bot]'
        );

        if (alreadyPosted) {
            console.log(`Skipping duplicate comment on PR #${prNumber}`);
            return;
        }

        await github.rest.issues.createComment({
            owner, repo,
            issue_number: prNumber,
            body
        });
    } catch (err) {
        console.log(`Could not post comment on PR #${prNumber}: ${err.message}`);
    }
}
