# 🤖 AI Orchestrator System

## Overview
This system allows you to provide a simple high-level statement, and the AI agents will automatically break it down, plan, and execute the full implementation.

## How It Works

### Step 1: Submit Your Idea
Create a new issue using the **"🚀 AI Orchestrator"** template with just your high-level idea:

**Example:**
```
I want to create a web app that integrates with Uniswap for blockchain swapping
```

### Step 2: Product Agent Analysis
The Product Agent AI will automatically:
1. Analyze your requirement
2. Break it down into features
3. Create technical specifications
4. Define user stories and acceptance criteria
5. Identify all required agents
6. Post the full plan as a comment for your review

### Step 3: Your Approval
You review the plan and either:
- ✅ Comment "APPROVE" to proceed
- 🔄 Comment "REVISE: [your feedback]" to iterate
- ❌ Comment "REJECT" to cancel

### Step 4: Automatic Execution
After approval, Product Agent automatically:
1. Creates issues for Backend Agent
2. Creates issues for Integration Agent
3. Creates issues for Frontend Agent
4. Creates issues for QA Agent
5. Links all issues together
6. Sets up dependency chain

### Step 5: Agent Coordination
Each agent automatically:
1. Picks up their assigned issues
2. Implements the code
3. Opens Pull Requests
4. Notifies the next agent in chain
5. Updates issue status

### Step 6: Your Review
You only need to:
- Review and merge PRs
- Test the final product
- Provide feedback if needed

## Using GitHub Copilot as Orchestrator

### Option A: Use GitHub Copilot Chat
1. Open issue with your idea
2. In VS Code, open Copilot Chat
3. Use command: `@workspace /orchestrate #[issue-number]`
4. Copilot will act as Product Agent and create the plan

### Option B: Use GitHub Copilot in Issues
1. Create issue with "🚀 AI Orchestrator" template
2. GitHub Copilot will automatically respond with breakdown
3. Comment "APPROVE" to proceed

### Option C: Use External AI (ChatGPT/Claude)
1. Copy your idea
2. Use the Product Agent prompt (see below)
3. Paste response back to GitHub issue
4. Manually create child issues from the plan

## Product Agent Prompt Template

```
You are the Product Agent AI for an automated development team. 

I need you to analyze this product idea and create a COMPLETE implementation plan:

IDEA: "[YOUR IDEA HERE]"

Please provide:

1. **PROJECT OVERVIEW**
   - One-sentence summary
   - Target users
   - Core value proposition

2. **FEATURES BREAKDOWN**
   - List all major features
   - Prioritize (P0 = Must have, P1 = Should have, P2 = Nice to have)

3. **USER STORIES**
   - As a [user], I want [goal] so that [benefit]
   - Include acceptance criteria for each

4. **TECHNICAL ARCHITECTURE**
   - Tech stack recommendations
   - System architecture diagram (text format)
   - Database schema requirements
   - API endpoints needed

5. **AGENT TASK BREAKDOWN**
   
   **Backend Agent Tasks:**
   - List specific API endpoints
   - Database models
   - Business logic requirements
   
   **Integration Agent Tasks:**
   - API clients to generate
   - Type definitions needed
   - External integrations
   
   **Frontend Agent Tasks:**
   - Pages/routes to build
   - Components to create
   - State management needs
   
   **QA Agent Tasks:**
   - Test scenarios
   - Coverage requirements
   - Performance benchmarks

6. **IMPLEMENTATION TIMELINE**
   - Phase 1: MVP (weeks 1-2)
   - Phase 2: Enhancement (weeks 3-4)
   - Phase 3: Polish (week 5)

7. **GITHUB ISSUES TO CREATE**
   - Provide exact issue titles and descriptions
   - Link dependencies
   - Assign labels

Format the response as structured markdown that can be directly used to create GitHub issues.
```

## Example Workflow

### Your Input:
```
Create a web app that integrates with Uniswap for blockchain swapping
```

### Product Agent Output:
```markdown
## 🎯 PROJECT OVERVIEW
**Summary:** A decentralized web application that allows users to swap ERC-20 tokens using Uniswap protocol

**Target Users:** Crypto traders, DeFi users

**Value Proposition:** Simple, secure token swapping without intermediaries

---

## ✨ FEATURES BREAKDOWN

### P0 (Must Have)
1. Connect Web3 wallet (MetaMask)
2. Display token balances
3. Swap tokens via Uniswap
4. Show transaction status
5. Display swap history

### P1 (Should Have)
1. Token price charts
2. Slippage settings
3. Gas fee estimation
4. Popular token shortcuts

### P2 (Nice to Have)
1. Multi-chain support
2. Limit orders
3. Portfolio tracking

---

## 📖 USER STORIES

**Story 1: Connect Wallet**
- As a user, I want to connect my MetaMask wallet so that I can interact with the blockchain
- Acceptance Criteria:
  - [ ] User can click "Connect Wallet" button
  - [ ] MetaMask popup appears
  - [ ] User's address is displayed after connection
  - [ ] User can disconnect wallet

**Story 2: Swap Tokens**
- As a user, I want to swap ETH for USDC so that I can convert my assets
- Acceptance Criteria:
  - [ ] User selects tokens from dropdown
  - [ ] User enters amount to swap
  - [ ] App displays exchange rate
  - [ ] User confirms transaction
  - [ ] Transaction succeeds and balances update

[... more stories ...]

---

## 🏗️ TECHNICAL ARCHITECTURE

**Tech Stack:**
- Frontend: React + TypeScript + Vite
- Web3: ethers.js v6
- Blockchain: Ethereum (mainnet/testnet)
- API: Uniswap V3 SDK
- Styling: Tailwind CSS
- Testing: Vitest + Playwright

**Architecture:**
```
┌─────────────┐
│   Frontend  │ (React)
└──────┬──────┘
       │
┌──────▼──────────┐
│  Integration    │ (ethers.js + Uniswap SDK)
└──────┬──────────┘
       │
┌──────▼──────────┐
│   Blockchain    │ (Ethereum + Uniswap)
└─────────────────┘
```

**Database:** Not required (blockchain is the database)

---

## 👥 AGENT TASK BREAKDOWN

### Backend Agent Tasks
**Note:** Minimal backend needed - mostly blockchain integration

- [ ] **Task 1:** Create API proxy for rate limiting (optional)
  - Endpoint: GET /api/gas-price
  - Endpoint: GET /api/token-price/:address

### Integration Agent Tasks

- [ ] **Task 1:** Set up Web3 wallet connection
  - Implement MetaMask provider detection
  - Create wallet connection hooks
  - Handle network switching
  - Create TypeScript types for wallet state

- [ ] **Task 2:** Integrate Uniswap V3 SDK
  - Initialize Uniswap SDK client
  - Create swap quote function
  - Create swap execution function
  - Handle transaction signing
  - Create TypeScript types for Uniswap responses

- [ ] **Task 3:** Create token balance fetcher
  - Fetch ETH balance
  - Fetch ERC-20 token balances
  - Create balance polling mechanism
  - Create TypeScript types

### Frontend Agent Tasks

- [ ] **Task 1:** Create WalletConnect component
  - Connect button
  - Display connected address
  - Network indicator
  - Disconnect functionality

- [ ] **Task 2:** Create TokenSwap component
  - Token selector dropdowns
  - Amount input fields
  - Swap button
  - Exchange rate display
  - Slippage settings

- [ ] **Task 3:** Create TransactionStatus component
  - Pending state
  - Success state
  - Error state
  - Transaction hash link to explorer

- [ ] **Task 4:** Create SwapHistory component
  - List recent swaps
  - Transaction details
  - Filter by token

### QA Agent Tasks

- [ ] **Task 1:** Write E2E tests for wallet connection
  - Test MetaMask connection flow
  - Test network switching
  - Test disconnect flow

- [ ] **Task 2:** Write E2E tests for token swapping
  - Test swap execution (on testnet)
  - Test transaction confirmation
  - Test balance updates
  - Test error handling

- [ ] **Task 3:** Security testing
  - Test against common Web3 vulnerabilities
  - Test transaction signing security
  - Test for phishing prevention

---

## 📅 IMPLEMENTATION TIMELINE

**Phase 1: MVP (Weeks 1-2)**
- Week 1: Wallet connection + Basic UI
- Week 2: Uniswap integration + Swap functionality

**Phase 2: Enhancement (Weeks 3-4)**
- Week 3: Transaction history + Error handling
- Week 4: Slippage settings + Gas optimization

**Phase 3: Polish (Week 5)**
- Polish UI/UX
- Performance optimization
- Final testing

---

## 📝 GITHUB ISSUES TO CREATE

### Issue #1: [FEATURE] Uniswap Token Swap Web App
**Template:** Product Feature Request
**Labels:** feature, product
**Description:** [Full project description from above]

### Issue #2: [INTEGRATION] Web3 Wallet Connection
**Template:** Integration Task
**Labels:** integration, P0
**Parent:** #1
**Description:**
Implement Web3 wallet connection with MetaMask support.

**Deliverables:**
- Wallet connection hook
- Network detection
- Address display
- TypeScript types

### Issue #3: [INTEGRATION] Uniswap SDK Integration
**Template:** Integration Task
**Labels:** integration, P0
**Parent:** #1
**Depends on:** #2
**Description:**
Integrate Uniswap V3 SDK for token swapping.

**Deliverables:**
- Swap quote function
- Swap execution function
- Transaction signing
- TypeScript types

### Issue #4: [FRONTEND] Wallet Connect Component
**Template:** Frontend Task
**Labels:** frontend, P0
**Parent:** #1
**Depends on:** #2
**Description:**
Create UI component for wallet connection.

**Components:**
- WalletButton
- AddressDisplay
- NetworkBadge

### Issue #5: [FRONTEND] Token Swap Component
**Template:** Frontend Task
**Labels:** frontend, P0
**Parent:** #1
**Depends on:** #3
**Description:**
Create main swap interface component.

**Components:**
- TokenSelector
- AmountInput
- SwapButton
- ExchangeRateDisplay

### Issue #6: [QA] E2E Testing for Swap Flow
**Template:** QA Task
**Labels:** qa, testing
**Parent:** #1
**Depends on:** #4, #5
**Description:**
Write comprehensive E2E tests for entire swap flow.

**Test Scenarios:**
- Wallet connection
- Token selection
- Swap execution
- Error handling


---

## 🎮 Commands

Use these commands in issue comments:

- `APPROVE` - Approve the plan and create all issues
- `REVISE: [feedback]` - Request changes to the plan
- `REJECT` - Cancel the orchestration
- `STATUS` - Get current status of all agent tasks
- `@[agent-name]` - Tag a specific agent for action

## 🔗 Integration with GitHub Actions

(Optional) Set up GitHub Actions to automate agent responses:
- See `.github/workflows/ai-orchestrator.yml`
- Requires GitHub Copilot API access

## 📚 References

- [AI Team Guide](../docs/AI_TEAM_GUIDE.md)
- [Issue Templates](./ISSUE_TEMPLATE/)
- [PR Template](./pull_request_template.md)