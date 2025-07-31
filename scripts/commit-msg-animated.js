const fs = require('fs');
const chalk = require('chalk').default;
const ora = require('ora').default;
const boxen = require('boxen').default;

// Compact message
console.log(chalk.cyan('📝 Commit message validation...'));

const commitMsgFile = process.argv[2];
const commitMsg = fs.readFileSync(commitMsgFile, 'utf8').trim();

const spinner = ora({ text: 'Checking format...', spinner: 'dots' }).start();

// Conventional commit pattern
const conventionalCommitPattern = /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\(.+\))?: .{1,50}/;

// Check if commit message follows conventional commits
if (!conventionalCommitPattern.test(commitMsg)) {
  spinner.fail('Commit message format invalid!');
  console.log(boxen(chalk.red.bold('❌ Use Conventional Commits format')), {
    padding: 1,
    borderStyle: 'round'
  });
  process.exit(1);
}

// Additional checks for better commit messages
const lines = commitMsg.split('\n');
const firstLine = lines[0];

if (firstLine.length > 72) {
  spinner.warn('Commit message first line is too long');
  console.log(chalk.yellow('⚠️ Consider shortening the first line'));
}

if (firstLine.endsWith('.')) {
  spinner.warn('First line ends with a period');
  console.log(chalk.yellow('⚠️ Remove trailing period'));
}

if (!commitMsg.includes('JIRA-')) {
    spinner.warn('No JIRA ticket found!');
    console.log(chalk.yellow('⚠️ Include JIRA ticket for tracking'));
}

spinner.succeed('Commit message is valid!');
console.log(boxen(chalk.green('✅ Good to go!'), {
  padding: 1,
  borderStyle: 'round'
}));
