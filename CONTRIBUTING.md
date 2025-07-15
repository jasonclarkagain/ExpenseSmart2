# Contributing to ExpenseAI

Thank you for considering contributing to ExpenseAI! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up the development environment
4. Create a new branch for your feature or bugfix

## 📋 Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your development values
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## 🎯 Contributing Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing code formatting (Prettier configuration)
- Write meaningful commit messages
- Add comments for complex logic

### Branch Naming
- `feature/description` - for new features
- `bugfix/description` - for bug fixes
- `docs/description` - for documentation updates
- `refactor/description` - for code refactoring

### Commit Messages
Use conventional commit format:
```
type(scope): description

feat(receipts): add bulk delete functionality
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
```

### Pull Request Process

1. **Before submitting:**
   - Ensure all tests pass
   - Update documentation if needed
   - Add tests for new functionality
   - Verify your changes work with different receipt types

2. **PR Description should include:**
   - Clear description of changes
   - Screenshots for UI changes
   - Testing instructions
   - Related issue numbers

3. **Review Process:**
   - All PRs require review before merging
   - Address review feedback promptly
   - Keep PRs focused and reasonably sized

## 🧪 Testing

- Write tests for new features
- Ensure existing tests still pass
- Test with various receipt formats
- Verify admin and user permissions work correctly

## 🐛 Bug Reports

When reporting bugs, please include:
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment details
- Receipt images (if applicable, remove sensitive data)
- Console errors or logs

## 💡 Feature Requests

For feature requests:
- Explain the use case and benefits
- Provide mockups or examples if helpful
- Consider implementation complexity
- Discuss in issues before starting work

## 📚 Documentation

- Update README.md for user-facing changes
- Update code comments for complex logic
- Add or update API documentation
- Keep ADMIN_ACCESS.md current

## 🔒 Security

- Never commit sensitive data (API keys, passwords)
- Follow authentication best practices
- Report security issues privately
- Use environment variables for configuration

## 📞 Getting Help

- Check existing issues and documentation
- Ask questions in GitHub Discussions
- Reach out to maintainers for guidance

## 🎉 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Project documentation

Thank you for helping make ExpenseAI better!