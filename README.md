# AI Dev Team Project

> A collaborative software project powered by specialized AI agents

## 🤖 Meet the Team

This project is developed by a team of specialized AI agents, each with specific responsibilities:

- **📋 Product Agent** - Requirements and planning
- **⚙️ Backend Agent** - API and server-side development
- **🔌 Integration Agent** - API clients and contracts
- **🎨 Frontend Agent** - UI and client-side development
- **🧪 QA/Test Agent** - Testing and quality assurance

## 📚 Documentation

- [**AI Team Guide**](docs/AI_TEAM_GUIDE.md) - Complete guide to the AI team workflow
- [**API Documentation**](docs/API.md) - Backend API reference
- [**Component Library**](docs/COMPONENTS.md) - Frontend components

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Docker (optional)

### Installation

```bash
# Install all dependencies
npm install

# Start development environment
npm run dev:all
```

### Development Workflow

1. **Create a Feature** - Use issue templates in [Issues](../../issues/new/choose)
2. **Assign to Agent** - Label with appropriate agent tag
3. **Implement** - Agent creates PR following template
4. **Test** - QA Agent reviews and tests
5. **Deploy** - Merge when all checks pass

## 🏗️ Project Structure

```
├── backend/          # Backend API (Backend Agent)
├── frontend/         # React frontend (Frontend Agent)
├── integration/      # API clients (Integration Agent)
├── qa/              # Test suites (QA Agent)
├── api/             # OpenAPI specs
└── docs/            # Documentation
```

## 🧪 Testing

```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:backend
npm run test:frontend
npm run test:integration
npm run test:e2e
```

## 📋 Issue Templates

Create issues for each agent:
- [📋 Product Feature Request](../../issues/new?template=01-product-feature.yml)
- [⚙️ Backend Task](../../issues/new?template=02-backend-task.yml)
- [🎨 Frontend Task](../../issues/new?template=03-frontend-task.yml)
- [🔌 Integration Task](../../issues/new?template=04-integration-task.yml)
- [🧪 QA/Test Task](../../issues/new?template=05-qa-task.yml)
- [🐛 Bug Report](../../issues/new?template=06-bug-report.yml)

## 🤝 Contributing

Each agent follows specific guidelines:

1. **Use templates** for issues and PRs
2. **Tag relevant agents** when your work affects them
3. **Write tests** for all code
4. **Update documentation** when needed
5. **Follow style guides** enforced by CI

See [AI Team Guide](docs/AI_TEAM_GUIDE.md) for detailed workflows.

## 📊 CI/CD

- ✅ Backend CI - Tests, linting, API validation
- ✅ Frontend CI - Tests, type checking, accessibility
- ✅ Integration CI - Contract tests, client generation
- ✅ QA E2E - End-to-end test suite
- ✅ Auto-labeling - Automatic PR labeling

## 📝 License

[MIT](LICENSE)

## 🆘 Support

- [AI Team Guide](docs/AI_TEAM_GUIDE.md) - Complete documentation
- [Create Issue](../../issues/new/choose) - Report bugs or request features
- [Discussions](../../discussions) - Ask questions
