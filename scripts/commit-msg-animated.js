const fs = require('fs');
const chalk = require('chalk').default;
const ora = require('ora').default;
const boxen = require('boxen').default;
const figlet = require('figlet');
const gradient = require('gradient-string');

const commitMsgFile = process.argv[2];
const commitMsg = fs.readFileSync(commitMsgFile, 'utf8').trim();

console.log(gradient.mind(figlet.textSync('Commit Check', { horizontalLayout: 'full' })));

const spinner = ora({ text: 'Validating commit message...', spinner: 'bouncingBar' }).start();

// Conventional commit pattern
const conventionalCommitPattern = /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\(.+\))?: .{1,50}/;

// Check if commit message follows conventional commits
if (!conventionalCommitPattern.test(commitMsg)) {
  spinner.fail('Invalid commit message format!');
  
  console.log(gradient.retro(figlet.textSync('INVALID', { horizontalLayout: 'full' })));
  
  console.log(boxen(chalk.red(`
${chalk.bold('❌ Invalid commit message format!')}

${chalk.yellow('Expected format:')}
type(scope?): description

${chalk.yellow('Valid types:')}
• feat: A new feature
• fix: A bug fix
• docs: Documentation only changes
• style: Changes that do not affect the meaning of the code
• refactor: A code change that neither fixes a bug nor adds a feature
• perf: A code change that improves performance
• test: Adding missing tests or correcting existing tests
• chore: Changes to the build process or auxiliary tools
• build: Changes that affect the build system or external dependencies
• ci: Changes to our CI configuration files and scripts
• revert: Reverts a previous commit

${chalk.yellow('Examples:')}
feat: add user authentication
fix(api): resolve login endpoint error
docs: update README with installation steps
  `), {
    padding: 1,
    borderStyle: 'round',
    borderColor: 'red',
    margin: 1
  }));
  
  process.exit(1);
}

// Additional checks for better commit messages
const lines = commitMsg.split('\n');
const firstLine = lines[0];

if (firstLine.length > 72) {
  spinner.warn('Commit message first line is longer than 72 characters');
  console.log(chalk.yellow('⚠️  Consider shortening your commit message for better readability'));
}

if (firstLine.endsWith('.')) {
  spinner.warn('Commit message ends with a period');
  console.log(chalk.yellow('⚠️  Remove the trailing period from your commit message'));
}

spinner.succeed('Commit message validation passed!');

console.log(boxen(gradient.summer(figlet.textSync('VALID', { horizontalLayout: 'full' })), {
  padding: 1,
  borderStyle: 'double',
  margin: 1,
  align: 'center'
}));

console.log(chalk.green('✅ Great commit message! Keep up the good work!'));
