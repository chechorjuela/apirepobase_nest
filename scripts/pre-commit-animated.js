const chalk = require('chalk').default;
const ora = require('ora').default;
const boxen = require('boxen').default;
const { spawnSync } = require('child_process');
const figlet = require('figlet');
const gradient = require('gradient-string');

// Encabezado
console.log('\n' + gradient.pastel(figlet.textSync('PRE-COMMIT', {
  font: 'Small',
  horizontalLayout: 'fitted'
})));
console.log(chalk.cyan('🔍 Running comprehensive checks...\n'));

const validations = [
  { cmd: 'npx', args: ['lint-staged'], name: 'Code formatting & linting' },
  { cmd: 'npx', args: ['tsc', '--noEmit'], name: 'TypeScript compilation' },
  { cmd: 'npm', args: ['run', 'test', '--', '--passWithNoTests', '--watchAll=false'], name: 'Unit tests' },
  { cmd: 'npm', args: ['audit', '--audit-level=high'], name: 'Security audit' },
  { cmd: 'docker', args: ['--version'], name: 'Docker availability' },
  { cmd: 'docker', args: ['compose', '--profile', 'prod', 'build'], name: 'Docker build test' }
];

let allPassed = true;
const summaryTable = [];
let totalStart = process.hrtime();

for (const validation of validations) {
  // Spinner animado tipo box (cuadrito girando)
  const spinner = ora({
    text: chalk.yellow(`Checking ${validation.name}...`),
    spinner: 'boxBounce', // Puedes probar con 'arc', 'boxBounce', 'dots', etc.
    color: 'cyan',
    hideCursor: false
  }).start();

  const start = process.hrtime();
  const result = spawnSync(validation.cmd, validation.args, {
    stdio: 'pipe',
    encoding: 'utf8'
  });
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
    if (result.stderr && !result.stderr.includes('npm audit')) {
      console.log(`\n${chalk.red('Error in ' + validation.name + ':')}`);
      console.log(chalk.redBright(result.stderr));
    }
  }
}

let totalElapsed = process.hrtime(totalStart);
let totalElapsedSec = (totalElapsed[0] + totalElapsed[1] / 1e9).toFixed(2);

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

const summary = renderTable(summaryTable);

if (allPassed) {
  console.log(boxen(
    summary + `\n${chalk.green('🚀 Ready to commit!')}\n${chalk.bold('Total time:')} ${chalk.cyan(totalElapsedSec + 's')}`,
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'green',
      margin: 1
    }
  ));
} else {
  console.log(boxen(
    summary + `\n${chalk.red('❌ Fix issues before committing')}\n${chalk.bold('Total time:')} ${chalk.yellow(totalElapsedSec + 's')}`,
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'red',
      margin: 1
    }
  ));
  process.exit(1);
}