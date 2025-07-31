const fs = require('fs');
const chalk = require('chalk').default;
const ora = require('ora').default;
const boxen = require('boxen').default;

// Compact message
console.log(chalk.cyan('📝 Commit message validation...'));

const commitMsgFile = process.argv[2];
const commitMsg = fs.readFileSync(commitMsgFile, 'utf8').trim();

const steps = [];

// Step 1: Check conventional format
const spinnerFormat = ora({ text: 'Checking conventional commit format...', spinner: 'dots' }).start();
const conventionalCommitPattern = /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\(.+\))?: .{1,50}/;

if (!conventionalCommitPattern.test(commitMsg)) {
  spinnerFormat.fail('Format invalid!');
  console.log(boxen(chalk.red.bold('❌ Use Conventional Commits format'), { padding: 1, borderStyle: 'round' }));
  process.exit(1);
} else {
  spinnerFormat.succeed('Format valid!');
  steps.push('Format');
}

// Step 2: Check first line length
const spinnerLength = ora({ text: 'Checking first line length...', spinner: 'dots' }).start();
const firstLine = commitMsg.split('\n')[0];
if (firstLine.length > 72) {
  spinnerLength.warn('First line is too long');
  console.log(chalk.yellow('⚠️ Consider shortening the first line'));
} else {
  spinnerLength.succeed('First line length OK!');
  steps.push('Length');
}

// Step 3: No trailing period
const spinnerPeriod = ora({ text: 'Checking for trailing period...', spinner: 'dots' }).start();
if (firstLine.endsWith('.')) {
  spinnerPeriod.warn('Period at the end of first line');
  console.log(chalk.yellow('⚠️ Remove trailing period'));
} else {
  spinnerPeriod.succeed('No trailing period!');
  steps.push('Period');
}

// Step 4: JIRA ticket
const spinnerJira = ora({ text: 'Looking for JIRA ticket...', spinner: 'dots' }).start();
if (!commitMsg.includes('JIRA-')) {
  spinnerJira.warn('No JIRA ticket found!');
  console.log(chalk.yellow('⚠️ Include JIRA ticket for tracking'));
} else {
  spinnerJira.succeed('JIRA ticket found!');
  steps.push('JIRA');
}

// Final message
if (steps.length === 4) {
  console.log(boxen(chalk.green('✅ Good to go!'), { padding: 1, borderStyle: 'round' }));
} else {
  console.log(boxen(chalk.yellow('⚠️ Commit is valid, but consider improving!'), { padding: 1, borderStyle: 'round' }));
}