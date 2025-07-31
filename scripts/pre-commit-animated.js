const chalk = require('chalk').default;
const ora = require('ora').default;
const boxen = require('boxen').default;
const { spawnSync } = require('child_process');

// Compact ASCII art
console.log(chalk.cyan('🔍 Pre-commit checks...'));

const spinner = ora({ text: 'Running validations...', spinner: 'dots'}).start();

// Enhanced validations
const validations = [
  { cmd: 'npx', args: ['lint-staged'], name: 'Code formatting & linting' },
  { cmd: 'npx', args: ['tsc', '--noEmit'], name: 'TypeScript compilation' },
  { cmd: 'npm', args: ['run', 'test', '--', '--passWithNoTests', '--watchAll=false'], name: 'Unit tests' },
  { cmd: 'npm', args: ['audit', '--audit-level=high'], name: 'Security audit' },
  { cmd: 'docker', args: ['--version'], name: 'Docker availability' },
  { cmd: 'docker', args: ['compose', '--profile', 'prod', 'build'], name: 'Docker build test' }
];

let allPassed = true;
const results = [];

for (const validation of validations) {
  spinner.text = `Running ${validation.name}...`;
  const result = spawnSync(validation.cmd, validation.args, { 
    stdio: 'pipe', 
    encoding: 'utf8' 
  });
  
  if (result.status === 0) {
    results.push(`✅ ${validation.name}`);
  } else {
    results.push(`❌ ${validation.name}`);
    allPassed = false;
    if (result.stderr && !result.stderr.includes('npm audit')) {
      console.log(`\n${chalk.red('Error in ' + validation.name + ':')}`);
      console.log(result.stderr);
    }
  }
}

if (allPassed) {
  spinner.succeed('All validations passed!');
  console.log(boxen(results.join('\n') + '\n\n🚀 Ready to commit!', {
    padding: 1,
    borderStyle: 'round',
    borderColor: 'green',
    margin: 1
  }));
} else {
  spinner.fail('Some validations failed');
  console.log(boxen(results.join('\n') + '\n\n❌ Fix issues before committing', {
    padding: 1,
    borderStyle: 'round',
    borderColor: 'red',
    margin: 1
  }));
  process.exit(1);
}
