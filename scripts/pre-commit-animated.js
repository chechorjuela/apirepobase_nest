const chalk = require('chalk').default;
const ora = require('ora').default;
const boxen = require('boxen').default;
const figlet = require('figlet');
const gradient = require('gradient-string');
const { spawnSync } = require('child_process');

console.log(gradient.rainbow(figlet.textSync('Linting...', { horizontalLayout: 'full' })));

const spinner = ora({ text: 'Running pre-commit checks...', spinner: 'dots'}).start();

const result = spawnSync('npx', ['lint-staged'], { 
    stdio: 'pipe', 
    encoding: 'utf8' 
});

if (result.status === 0) {
    spinner.succeed('Lint-staged completed successfully!');
    
    console.log(boxen(gradient.pastel(figlet.textSync('SUCCESS', { horizontalLayout: 'full' })), {
        padding: 1,
        borderStyle: 'double',
        margin: 1,
        align: 'center'
    }));

    console.log(chalk.green('All checks passed! You\'re good to go!'));
} else {
    spinner.fail('Lint-staged failed. Fix the errors and try again.');
    console.log(gradient.cristal(figlet.textSync('FAILED', { horizontalLayout: 'full' })));
    if (result.stdout) console.log('STDOUT:', result.stdout);
    if (result.stderr) console.log('STDERR:', result.stderr);
    process.exit(result.status || 1);
}
