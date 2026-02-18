# AI Dev Team Guide

## 🤖 Team Structure

This repository uses an AI-powered development team structure with specialized agents:

### 1. **Product Agent** 📋
**Role:** Requirements, planning, and coordination

**Responsibilities:**
- Create feature specifications
- Break down epics into tasks
- Coordinate between agents
- Maintain documentation
- Track project progress

**Workflow:**
1. Create feature request using `📋 Product Feature Request` template
2. Break down into agent-specific tasks
3. Monitor progress and coordinate
4. Review and accept completed work

---

### 2. **Backend Agent** ⚙️
**Role:** API development, database, server logic

**Responsibilities:**
- Design and implement APIs
- Create database schemas
- Write business logic
- Ensure security and performance
- Update API documentation

**Workflow:**
1. Receive task from Product Agent
2. Implement backend functionality
3. Update OpenAPI specification
4. Notify Integration Agent of API changes
5. Write unit and integration tests
6. Open PR for review

**Key Files:**
- `/backend/src/` - Source code
- `/api/openapi.yaml` - API specification
- `/backend/tests/` - Tests

---

### 3. **Integration Agent** 🔌
**Role:** API clients, contracts, and bridges

**Responsibilities:**
- Generate API clients from OpenAPI specs
- Create TypeScript type definitions
- Set up mock servers for development
- Write contract tests
- Maintain API versioning
- Bridge backend and frontend

**Workflow:**
1. Monitor backend PRs for API changes
2. Review OpenAPI specification
3. Generate/update API client
4. Create TypeScript types
5. Update mock data
6. Notify Frontend Agent
7. Write contract tests

**Key Files:**
- `/integration/generated/` - Generated API clients
- `/integration/types/` - TypeScript types
- `/integration/mocks/` - Mock data
- `/integration/tests/contract/` - Contract tests

---

### 4. **Frontend Agent** 🎨
**Role:** UI components and client-side logic

**Responsibilities:**
- Build UI components
- Implement user interactions
- Integrate with API clients
- Ensure responsive design
- Maintain accessibility standards
- Handle state management

**Workflow:**
1. Wait for Integration Agent to provide API client
2. Implement UI components
3. Integrate with API using provided client
4. Handle loading/error states
5. Write component tests
6. Open PR for review

**Key Files:**
- `/frontend/src/components/` - React components
- `/frontend/src/api/` - API integration
- `/frontend/src/hooks/` - Custom hooks
- `/frontend/tests/` - Component tests

---

### 5. **QA/Test Agent** 🧪
**Role:** Testing, quality assurance, automation

**Responsibilities:**
- Write test strategies
- Create automated tests
- Perform manual testing
- Report bugs
- Ensure code coverage
- Validate acceptance criteria

**Workflow:**
1. Monitor PRs ready for review
2. Review code changes
3. Run automated tests
4. Perform manual testing
5. Create bug reports if issues found
6. Approve or request changes

**Key Files:**
- `/qa/tests/unit/` - Unit tests
- `/qa/tests/integration/` - Integration tests
- `/qa/tests/e2e/` - End-to-end tests
- `/qa/test-results/` - Test reports

---

## 📋 Workflow Example

### Feature: User Profile Management

```
1. Product Agent creates issue:
   #100 [FEATURE] User Profile Management
   - Defines user stories
   - Lists acceptance criteria
   - Tags: backend, frontend, integration, qa

2. Product Agent creates child issues:
   #101 [BACKEND] Create user profile API
   #102 [INTEGRATION] Generate user profile API client
   #103 [FRONTEND] Build user profile UI
   #104 [QA] Test user profile feature

3. Backend Agent (#101):
   - Implements GET/PATCH /api/v1/users/:id
   - Updates openapi.yaml
   - Writes tests
   - Opens PR #105
   - Comments: "@integration-agent API ready for client generation"

4. Integration Agent (#102):
   - Reviews PR #105
   - Generates TypeScript client
   - Creates types: UserProfile, UpdateUserRequest
   - Sets up mock data
   - Opens PR #106
   - Comments: "@frontend-agent Client ready in integration/generated/userApi"

5. Frontend Agent (#103):
   - Imports userApi from integration package
   - Creates UserProfileCard component
   - Implements edit functionality
   - Handles errors with userApi error types
   - Opens PR #107

6. QA Agent (#104):
   - Reviews PRs #105, #106, #107
   - Runs automated tests
   - Creates E2E test for user profile flow
   - Tests edge cases
   - Approves PRs or creates bug reports

7. Product Agent:
   - Reviews all work
   - Verifies acceptance criteria
   - Merges PRs
   - Closes issues
   - Updates documentation
```

---

## 🏷️ Labels

| Label | Purpose | Used By |
|-------|---------|---------|
| `product` | Product planning | Product Agent |
| `backend` | Backend tasks | Backend Agent |
| `frontend` | Frontend tasks | Frontend Agent |
| `integration` | API integration | Integration Agent |
| `qa` | Testing tasks | QA Agent |
| `bug` | Bug reports | Any agent |
| `feature` | New features | Product Agent |
| `needs-triage` | Needs review | Any agent |
| `blocked` | Waiting on dependency | Any agent |
| `in-progress` | Currently being worked on | Any agent |

---

## 🔄 PR Review Process

### Backend PR Checklist
- [ ] API specification updated
- [ ] Database migrations included
- [ ] Tests written and passing
- [ ] Integration Agent notified

### Integration PR Checklist
- [ ] API client generated from spec
- [ ] TypeScript types exported
- [ ] Mock data updated
- [ ] Contract tests passing
- [ ] Frontend Agent notified

### Frontend PR Checklist
- [ ] Using Integration Agent's client
- [ ] Loading/error states handled
- [ ] Responsive and accessible
- [ ] Component tests written

### QA PR Checklist
- [ ] All test scenarios covered
- [ ] Tests passing in CI
- [ ] Edge cases tested
- [ ] Documentation updated

---

## 📁 Repository Structure

```
├── .github/
│   ├── ISSUE_TEMPLATE/           # Issue templates for each agent
│   ├── workflows/                # CI/CD workflows
│   └── pull_request_template.md  # PR template
├── api/
│   └── openapi.yaml              # API specification (Backend Agent)
├── backend/
│   ├── src/                      # Backend source code
│   └── tests/                    # Backend tests
├── integration/
│   ├── generated/                # Generated API clients
│   ├── types/                    # TypeScript type definitions
│   ├── mocks/                    # Mock data for development
│   └── tests/                    # Contract tests
├── frontend/
│   ├── src/
│   │   ├── components/           # UI components
│   │   ├── api/                  # API integration layer
│   │   └── hooks/                # Custom hooks
│   └── tests/                    # Frontend tests
├── qa/
│   ├── tests/
│   │   ├── unit/                 # Unit tests
│   │   ├── integration/          # Integration tests
│   │   └── e2e/                  # End-to-end tests
│   └── test-results/             # Test reports
└── docs/
    ├── API.md                    # API documentation
    ├── COMPONENTS.md             # Component documentation
    └── AI_TEAM_GUIDE.md          # This file
```

---

## 🚀 Getting Started

### For Product Agent
1. Create feature request using template
2. Break down into agent-specific tasks
3. Assign appropriate labels
4. Track progress in project board

### For Backend Agent
1. Find issues with `backend` label
2. Implement according to specification
3. Update OpenAPI spec
4. Tag Integration Agent when done

### For Integration Agent
1. Watch for API changes
2. Generate clients from OpenAPI spec
3. Create types and mocks
4. Tag Frontend Agent when ready

### For Frontend Agent
1. Wait for Integration Agent notification
2. Use provided API clients
3. Build UI components
4. Handle all states properly

### For QA Agent
1. Monitor PRs ready for review
2. Run test suites
3. Create bug reports
4. Approve quality work

---

## 🛠️ Tools & Automation

### GitHub Actions
- **Backend CI:** Runs tests, validates OpenAPI spec
- **Frontend CI:** Linting, type checking, accessibility tests
- **Integration CI:** Contract tests, client generation
- **QA E2E:** End-to-end test suite
- **Team Coordination:** Auto-tags agents, creates notifications

### Pre-commit Hooks
```bash
npm run pre-commit  # Runs linting, formatting, type checking
```

### Useful Commands
```bash
# Generate API client
npm run generate:client

# Run all tests
npm run test:all

# Start development environment
npm run dev:all
```

---

## 📊 Metrics & KPIs

### Team Performance
- Cycle time (feature → production)
- PR merge time
- Test coverage percentage
- Bug escape rate

### Agent Performance
- Backend: API response times, test coverage
- Frontend: Lighthouse scores, bundle size
- Integration: Contract test pass rate
- QA: Bug detection rate, test coverage

---

## 🤝 Communication

### Issue Comments
- Tag specific agents: `@backend-agent @integration-agent`
- Use clear action items with checkboxes
- Link related issues and PRs

### PR Comments
- Request reviews from specific agents
- Explain complex changes
- Add screenshots/videos for UI changes

### Blocker Protocol
1. Add `blocked` label
2. Comment what's blocking and tag responsible agent
3. Update when unblocked

---

## 📝 Best Practices

### For All Agents
- ✅ Use templates for issues and PRs
- ✅ Write clear, descriptive commit messages
- ✅ Tag other agents when your work affects them
- ✅ Keep PRs small and focused
- ✅ Update documentation
- ✅ Write tests for your code

### Backend Agent
- ✅ Always update OpenAPI spec
- ✅ Version your APIs properly
- ✅ Document error codes
- ✅ Consider backward compatibility

### Integration Agent
- ✅ Validate API specs before generating
- ✅ Export clean TypeScript types
- ✅ Keep mock data realistic
- ✅ Version your client packages

### Frontend Agent
- ✅ Use the provided API clients
- ✅ Handle all loading/error states
- ✅ Follow accessibility guidelines
- ✅ Keep components small and reusable

### QA Agent
- ✅ Test happy paths AND edge cases
- ✅ Automate repetitive tests
- ✅ Write clear bug reports
- ✅ Verify acceptance criteria

---

## 🆘 Troubleshooting

### "Frontend can't find API client"
→ Check if Integration Agent has generated and exported client

### "Contract tests failing"
→ Backend Agent: ensure OpenAPI spec matches implementation

### "Type errors in frontend"
→ Integration Agent: regenerate types from latest API spec

### "E2E tests flaky"
→ QA Agent: add proper wait conditions, check for race conditions

---

## 📚 Additional Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)