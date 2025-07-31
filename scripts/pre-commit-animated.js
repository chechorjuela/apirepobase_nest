const chalk = require('chalk').default;
const ora = require('ora').default;
const boxen = require('boxen').default;
const { spawn } = require('child_process');
const figlet = require('figlet');
const gradient = require('gradient-string');

const SHOW_ERROR_LOGS = true; // Cambia a false si no quieres ver el log de error

function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'pipe', shell: true });
    let stderr = '';
    let stdout = '';

    child.stdout.on('data', data => stdout += data.toString());
    child.stderr.on('data', data => stderr += data.toString());

    child.on('close', code => {
      resolve({ status: code, stderr, stdout });
    });
    child.on('error', err => {
      reject(err);
    });
  });
}

// Encabezado bonito con ASCII art
console.log('\n' + gradient.pastel(figlet.textSync('PRE-COMMIT', {
  font: 'Small',
  horizontalLayout: 'fitted'
})));
console.log(chalk.cyan('🔍 Running comprehensive checks...\n'));

const validations = [
  { cmd: 'npx', args: ['lint-staged'], name: 'Code formatting & linting', spinner: 'boxBounce' },
  { cmd: 'npx', args: ['tsc', '--noEmit'], name: 'TypeScript compilation', spinner: 'arc' },
  { cmd: 'npm', args: ['run', 'test', '--', '--passWithNoTests', '--watchAll=false'], name: 'Unit tests', spinner: 'dots' },
  { cmd: 'npm', args: ['audit', '--audit-level=high'], name: 'Security audit', spinner: 'star' },
  { cmd: 'docker', args: ['--version'], name: 'Docker availability', spinner: 'boxBounce' },
  { cmd: 'docker', args: ['compose', '--profile', 'prod', 'build'], name: 'Docker build test', spinner: 'boxBounce' }
];

let allPassed = true;
const summaryTable = [];
const totalStart = process.hrtime();

async function validateSteps() {
  for (const validation of validations) {
    const spinner = ora({
      text: chalk.yellow(`▢ ${validation.name} (running...)`),
      spinner: validation.spinner || 'boxBounce',
      color: 'cyan',
      hideCursor: false
    }).start();

    const start = process.hrtime();
    let result;
    try {
      result = await runCommand(validation.cmd, validation.args);
    } catch (err) {
      result = { status: 1, stderr: err.message, stdout: '' };
    }
    const elapsed = process.hrtime(start);
    const elapsedSec = (elapsed[0] + elapsed[1] / 1e9).toFixed(2);

    if (result.status === 0) {
      spinner.succeed(`${chalk.green('✔')} ${chalk.bold(validation.name)} passed ${chalk.gray(`(${elapsedSec}s)`)} `);
      summaryTable.push([
        chalk.green('✔'),
        chalk.bold(validation.name),
        chalk.gray(`${elapsedSec}s`)
      ]);
    } else {
      spinner.fail(`${chalk.red('✖')} ${chalk.bold(validation.name)} failed ${chalk.gray(`(${elapsedSec}s)`)} `);
      summaryTable.push([
        chalk.red('✖'),
        chalk.bold(validation.name),
        chalk.gray(`${elapsedSec}s`)
      ]);
      allPassed = false;
      if (result.stderr && SHOW_ERROR_LOGS) {
        console.log(boxen(
          `${chalk.red('Error in ' + validation.name + ':')}\n` +
          chalk.redBright(result.stderr.trim().split('\n').slice(0, 8).join('\n')) +
          `\n${chalk.yellow('Tip: Fix the error above and try again.')}`,
          { padding: 1, borderColor: 'red', borderStyle: 'round', margin: 1 }
        ));
      }
    }
  }
}

function renderTable(rows) {
  const colWidths = [2, 28, 8];
  let output = chalk.bold.underline('Result') + '  ' +
    chalk.bold.underline('Validation') + '           ' +
    chalk.bold.underline('Time') + '\n';
  for (const row of rows) {
    output += row[0].padEnd(colWidths[0]) +
      ' ' + row[1].padEnd(colWidths[1]) +
      ' ' + row[2].padEnd(colWidths[2]) + '\n';
  }
  return output;
}

(async () => {
  await validateSteps();

  const totalElapsed = process.hrtime(totalStart);
  const totalElapsedSec = (totalElapsed[0] + totalElapsed[1] / 1e9).toFixed(2);
  const summary = renderTable(summaryTable);

  const boxColor = allPassed ? 'green' : 'red';
  const totalTimeColor = allPassed ? chalk.cyan : chalk.yellow;

  console.log(boxen(
    summary +
    (allPassed
      ? `\n${chalk.green('🚀 Ready to commit!')}\n${chalk.bold('Total time:')} ${totalTimeColor(totalElapsedSec + 's')}`
      : `\n${chalk.red('❌ Fix issues before committing')}\n${chalk.bold('Total time:')} ${totalTimeColor(totalElapsedSec + 's')}`),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: boxColor,
      margin: 1
    }
  ));

  if (!allPassed) process.exit(1);
})();