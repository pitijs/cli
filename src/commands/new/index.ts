import { Command, Message, Arguments } from '@pitijs/core';
import { test, mkdir, cp, mv, cat, cd, ShellString, chmod } from 'shelljs';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora, { Ora } from 'ora';

type NewCommandArgs = {
  name: string;
};

type Answers = {
  scriptName: string;
};

@Command({
  name: 'new [name]',
  description: 'Create a new piti projects',
})
class NewCommand {
  private answers: Answers = {} as Answers;
  private args: Arguments<NewCommandArgs> = {} as any;
  private spinner: Ora = ora();

  handler(args: Arguments<NewCommandArgs>) {
    this.args = args;
    const { name, $0 } = args;

    if (!name) {
      Message.error(
        `Please enter directory name. For example: ${chalk.italic.yellow(`${$0} new newApp`)}`,
      );
      process.exit(1);
    }

    if (test('-d', `./${name}`)) {
      Message.error(
        `${chalk.italic.yellow(
          name,
        )} directroy is already exists in the ${chalk.italic.underline.yellow('./src/commands')}`,
      );
      process.exit(1);
    }
    this.install(args);
  }

  private install(args: Arguments<NewCommandArgs>) {
    console.log('..:: PitiJS cli project creator ::..');
    this.requestScriptName();
  }

  // 1. take script name
  private requestScriptName() {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'scriptName',
          message: 'Please enter a script name:',
          validate: (input) => {
            return /^[\w-]+$/.test(input) ? true : 'Please enter a correct script name:';
          },
        },
      ])
      .then((value) => {
        this.answers = {
          ...this.answers,
          ...value,
        };
        this.createDirectory();
      });
  }

  // 2. create directory
  private createDirectory() {
    this.spinner = ora(
      `${chalk.italic.cyan(this.answers.scriptName)} project is creating...`,
    ).start();

    if (mkdir(this.args.name)) {
      this.copyBlueprints();
    }
  }

  // 3. copy blueprints into the project
  private copyBlueprints() {
    const destRoot = `${process.cwd()}/${this.args.name}`;
    const appRoot = `${global.__dirname}/..`;

    // copy root templates
    cp('-r', `${appRoot}/templates/root/*`, `${destRoot}`);
    mv(`${destRoot}/_gitignore`, `${destRoot}/.gitignore`);

    // create src destination
    mkdir(`${destRoot}/src`);

    // move src files
    cp('-rf', `${appRoot}/templates/source/*`, `${destRoot}/src/`);

    // rename all template files
    mv(`${destRoot}/src/index.txt`, `${destRoot}/src/index.ts`);
    mv(`${destRoot}/src/commands/hello/index.txt`, `${destRoot}/src/commands/hello/index.ts`);

    if (process.platform !== 'win32') {
      cp(`${appRoot}/templates/os/scriptname.cmd`, `${destRoot}/${this.answers.scriptName}.cmd`);
    } else {
      cp(`${appRoot}/templates/os/scriptname`, `${destRoot}/${this.answers.scriptName}`);
      chmod('+x', `${destRoot}/${this.answers.scriptName}`);
    }

    this.replacePlaceHolders();
  }

  // 4. Replace placeholders to variables
  private replacePlaceHolders() {
    ['package.json', 'README.md'].forEach((file: string) => {
      const fileContent = cat(`${this.args.name}/${file}`).replace(
        /\{\{scriptName\}\}/g,
        this.answers.scriptName,
      );
      const shellString = new ShellString(fileContent);
      shellString.to(`${this.args.name}/${file}`);
    });
    this.installCore();
  }

  // 6. install piti
  private installCore() {
    cd(this.args.name).exec(
      `npm i @pitijs/core --save && npm i ts-node --save-dev`,
      { silent: true },
      (code, stdout, stderr) => {
        if (!code) {
          this.spinner.stop().clear();
          console.log(`🎉 The project created.`);
          console.log(chalk.gray('run:'));
          console.log(chalk.cyan(`➡️  cd ${this.args.name} && npm run start`));
        }
      },
    );
  }
}

export default NewCommand;
