import { Command, Message, Arguments, Utils } from '@pitijs/core';
import { exec, ExecException } from 'child_process';
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
      console.log(
        Message.error(
          `Please enter directory name. For example: ${chalk.italic.yellow(`${$0} new newApp`)}`,
        ),
      );
      process.exit(1);
    }

    exec(`[ ! -d "./${name}" ]`, (error: ExecException | null) => {
      if (error) {
        Message.error(
          `${chalk.italic.yellow(
            name,
          )} directroy name is already exists in the ${chalk.italic.underline.yellow(
            './src/commands',
          )}`,
        );
        process.exit(1);
      }
      this.install(args);
    });
  }

  private install(args: Arguments<NewCommandArgs>) {
    Utils.clear();
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

    exec(`mkdir ${this.args.name}`, (error) => {
      if (!error) this.copyBlueprints();
    });
  }

  // 3. copy blueprints into the project
  private copyBlueprints() {
    const destRoot = `${process.cwd()}/${this.args.name}`;
    const appRoot = `${global.__dirname}/..`;

    exec(`cp -r ${appRoot}/templates/root/ ${destRoot}/`, (error) => {
      exec(`mv ${destRoot}/scriptname ${destRoot}/${this.answers.scriptName}`, () => {
        exec(`chmod +x ${destRoot}/${this.answers.scriptName}`, () => {
          exec(`cp -r ${appRoot}/templates/source/ ${destRoot}/src/`, () => {
            exec(`mv ${destRoot}/src/index.txt ${destRoot}/src/index.ts`);
            exec(
              `mv ${destRoot}/src/commands/hello/index.txt ${destRoot}/src/commands/hello/index.ts`,
            );
            this.replacePlaceHolders();
          });
        });
      });
    });
  }

  // 4. Replace placeholders to variables
  private replacePlaceHolders() {
    ['package.json', 'README.md'].forEach((file: string) => {
      exec(`cat ${this.args.name}/${file}`, (error, stdout) => {
        if (error) {
          console.log(Message.error(error.message));
          process.exit(1);
        }
        const fileContent = stdout.replace(/\{\{scriptName\}\}/g, this.answers.scriptName);
        exec(`echo '${fileContent}' > ${this.args.name}/${file}`);
      });
    });
    this.installCore();
  }

  // 6. install piti
  private installCore() {
    exec(`cd ${this.args.name} && yarn add @pitijs/core`, (error) => {
      if (!error) {
        this.spinner.stop().clear();
        console.log(chalk.gray('✨ Run:'));
        console.log(chalk.cyan(`➡️  cd ${this.args.name} && yarn start`));
        console.log(`🎉 The project created.`);
      }
    });
  }
}

export default NewCommand;
