# 🎨 Animated Git Hooks Setup

This project includes beautiful, animated Git hooks that enhance your development experience with visual feedback and automated quality checks.

## 🪝 Available Hooks

### Pre-commit Hook

- **Purpose**: Runs before each commit to ensure code quality
- **What it does**:
  - Shows animated "Linting..." banner
  - Runs `lint-staged` on staged files
  - Formats code with Prettier
  - Fixes ESLint issues automatically
  - Displays success/failure animations

### Commit Message Hook

- **Purpose**: Validates commit messages follow conventional commits format
- **What it does**:
  - Shows animated "Commit Check" banner
  - Validates commit message format
  - Enforces conventional commits pattern
  - Provides helpful error messages with examples
  - Warns about long messages or trailing periods

### Post-commit Hook

- **Purpose**: Celebrates successful commits
- **What it does**:
  - Shows animated "COMMITTED!" banner
  - Displays commit hash and message
  - Shows motivational messages
  - Provides visual feedback for successful commits

## 🎭 Animation Features

- **Colorful ASCII Art**: Uses figlet for large text banners
- **Gradient Colors**: Beautiful color transitions with gradient-string
- **Spinners**: Loading animations with ora
- **Boxed Messages**: Elegant message boxes with boxen
- **Progress Feedback**: Real-time status updates

## 📝 Conventional Commits Format

The commit message hook enforces the following format:

```
type(scope?): description
```

### Valid Types:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `revert`: Reverts a previous commit

### Examples:

```bash
feat: add user authentication
fix(api): resolve login endpoint error
docs: update README with installation steps
style: format code with prettier
refactor: extract utility functions
test: add unit tests for user service
chore: update dependencies
```

## 🛠️ Setup

The hooks are automatically set up when you run:

```bash
npm install
```

This runs the `prepare` script which initializes Husky.

## 🔧 Configuration

### Lint-staged Configuration

Located in `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,js}": ["prettier --write", "eslint --fix"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

### Hook Scripts

All hook scripts are located in the `scripts/` directory:

- `scripts/pre-commit-animated.js`
- `scripts/commit-msg-animated.js`
- `scripts/post-commit-animated.js`

## 🎨 Customization

You can customize the animations and behavior by editing the scripts in the `scripts/` directory:

### Change Colors

Modify the gradient colors in any script:

```javascript
gradient('cyan', 'pink'); // Change these colors
```

### Change Spinner Types

Modify the spinner type in the scripts:

```javascript
const spinner = ora({ text: 'Loading...', spinner: 'dots' }); // Try: 'bouncingBar', 'dots2', 'line'
```

### Add More Validations

Extend the commit message validation in `scripts/commit-msg-animated.js`

### Modify Box Styles

Change the boxen styles:

```javascript
boxen(message, {
  borderStyle: 'double', // Try: 'single', 'round', 'bold'
  borderColor: 'green', // Any chalk-supported color
});
```

## 🚫 Bypassing Hooks

If you need to bypass hooks (use sparingly):

```bash
# Bypass pre-commit hook
git commit --no-verify -m "emergency fix"

# Bypass all hooks
git commit --no-verify --no-post-rewrite -m "bypass all"
```

## 🎯 Benefits

1. **Consistent Code Quality**: Automatic formatting and linting
2. **Better Commit Messages**: Enforced conventional commits
3. **Visual Feedback**: Beautiful animations make Git operations more enjoyable
4. **Error Prevention**: Catches issues before they reach the repository
5. **Team Consistency**: Same standards for all team members

## 🐛 Troubleshooting

### Hook Not Running

```bash
# Check if hooks are executable
ls -la .husky/
chmod +x .husky/*
```

### Permission Denied

```bash
# Make scripts executable
chmod +x scripts/*.js
```

### Dependencies Issues

```bash
# Reinstall dependencies
npm install --legacy-peer-deps
```

## 📦 Dependencies

The animated hooks use these packages:

- `husky`: Git hooks management
- `lint-staged`: Run linters on staged files
- `chalk`: Terminal colors
- `ora`: Elegant terminal spinners
- `boxen`: Create boxes in terminal
- `figlet`: ASCII art text
- `gradient-string`: Gradient colors for text

Enjoy your beautiful, animated Git workflow! 🚀✨
