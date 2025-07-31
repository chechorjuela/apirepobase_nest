const chalk = require('chalk').default;
const boxen = require('boxen').default;
const figlet = require('figlet');
const gradient = require('gradient-string');
const { execSync } = require('child_process');

// Get the latest commit info
const commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
const commitMsg = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();

console.log(gradient.rainbow(figlet.textSync('COMMITTED!', { horizontalLayout: 'full' })));

const celebration = `
🎉 Commit successful! 🎉

${chalk.cyan('Hash:')} ${chalk.yellow(commitHash)}
${chalk.cyan('Message:')} ${chalk.white(commitMsg)}

${chalk.green('Keep up the great work!')} 🚀
`;

console.log(boxen(celebration, {
  padding: 1,
  borderStyle: 'double',
  borderColor: 'green',
  margin: 1,
  align: 'center'
}));

// Fun motivational messages
const motivationalMessages = [
  "🌟 Another step towards greatness!",
  "🔥 Your code is looking amazing!",
  "💎 Quality commit detected!",
  "🚀 Ready for launch!",
  "⚡ Lightning-fast development!",
  "🎯 Right on target!",
  "🌈 Bringing color to the codebase!",
  "🏆 Champion developer at work!"
];

const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
console.log(chalk.cyan(randomMessage));
