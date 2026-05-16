# GitHub Collaboration Workflow

## Branch Strategy

This project uses a professional Git workflow with the following branches:

### Main Branches
- **main**: Production-ready code. Deployable releases only.
- **develop**: Development environment. Stable, tested code.

### Feature Branches
- **feat-user-registration**: User registration and authentication
- **feat-db-integration**: PostgreSQL database integration
- Additional features: `feat-*` prefix for all new features

## Workflow Rules

### ✅ DO
- ✓ Create a GitHub Issue for every feature
- ✓ Create a feature branch from `develop`
- ✓ Create a Pull Request for code review
- ✓ Link PR to GitHub Issue
- ✓ Request review before merging
- ✓ Delete branch after merge

### ❌ DON'T
- ✗ Never push directly to `main`
- ✗ Never push directly to `develop`
- ✗ Don't start work without creating an Issue
- ✗ Don't merge without PR review
- ✗ Don't merge without all checks passing

## Development Workflow

### 1. Create GitHub Issue
```
Title: Feature Name
Description: What needs to be done
Assignee: Developer name
Labels: feat, in-progress
```

### 2. Create Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feat-feature-name
```

### 3. Make Changes
```bash
git add .
git commit -m "feat: description of changes"
git push origin feat-feature-name
```

### 4. Create Pull Request
- Go to GitHub repository
- Click "New Pull Request"
- Set base: `develop`, compare: `feat-feature-name`
- Link the GitHub Issue
- Request review from team members
- Wait for approval and CI checks to pass

### 5. Merge and Deploy
```bash
# After approval:
- Click "Merge pull request"
- Delete branch
- Pull develop locally

git checkout develop
git pull origin develop
```

### 6. Deploy to Main (Release Only)
```bash
# Only after testing on develop
git checkout main
git pull origin main
git merge develop
git push origin main
```

## Team Responsibilities

### Dev 1 - Telegram Bot Commands
- Implement `/start` command
- Implement `/help` command
- Add new bot commands
- Handle user interactions
- **Branch**: `feat-telegram-commands`

### Dev 2 - Database Integration
- PostgreSQL schema design
- User model implementation
- Database queries optimization
- Connection pooling setup
- **Branch**: `feat-db-integration`

### Dev 3 - Backend APIs & Testing
- Express routes and APIs
- Error handling
- Unit and integration tests
- Deployment configuration
- **Branch**: `feat-backend-apis`

## Commit Message Format

Follow Conventional Commits:

```
feat: add user registration
fix: resolve database connection issue
docs: update setup instructions
test: add user model tests
refactor: reorganize config files
```

## Pull Request Template

```markdown
## Description
What changes does this PR make?

## Issue
Closes #[issue-number]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Testing
- [ ] Unit tests added
- [ ] Manual testing done
- [ ] No new warnings

## Checklist
- [ ] Code follows style guidelines
- [ ] Comments added for complex code
- [ ] Tests pass
- [ ] Database changes documented
```

## Deployment

### Staging (develop branch)
```bash
git checkout develop
git pull origin develop
npm install
npm run test
npm run build
```

### Production (main branch)
```bash
git checkout main
git pull origin main
npm install
npm run test
npm run build
npm start
```

## Troubleshooting

### Branch Already Exists
```bash
git branch -d feat-branch-name
git checkout -b feat-branch-name
```

### Merge Conflicts
```bash
git fetch origin
git merge origin/develop
# Resolve conflicts in editor
git add .
git commit -m "resolve merge conflicts"
```

### Undo Last Commit
```bash
git reset --soft HEAD~1
git reset HEAD .
```
