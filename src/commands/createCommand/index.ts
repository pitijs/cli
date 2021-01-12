import { Command, Message } from '@pitijs/core';
import chalk from 'chalk';
import { exec, ExecException, execSync } from 'child_process';
import inquirer, { Answers } from 'inquirer';
import camelcase from 'lodash.camelcase';
import kebabcase from 'lodash.kebabcase';
import startcase from 'lodash.startcase';

@Command({
  name: 'command [name]',
  description: 'Create a new command',
})
export default class CreateCommandCommand {
  handler() {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'commandName',
          message: 'Please enter command name:',
          validate: (input: string) => {
            return input.length > 1 ? true : 'Please enter command name correctly';
          },
        },
        {
          type: 'input',
          name: 'description',
          message: 'Please enter command description:',
          validate: (input: string) => {
            return input.length > 1 ? true : 'Please enter description correctly';
          },
        },
        {
          type: 'input',
          name: 'className',
          message: (answers: Answers) => {
            return `Command class name will be -> ${chalk.cyan(
              `${startcase(camelcase(answers.commandName)).replace(/ /g, '')}Command:`,
            )}`;
          },
        },
        {
          type: 'input',
          name: 'dirName',
          message: (answers: Answers) => {
            return `Command directory name will be -> ${chalk.cyan(
              `${kebabcase(answers.commandName)}:`,
            )}`;
          },
        },
      ])
      .then((ansers: Answers) => this.create(ansers));
  }

  private create(answers: Answers) {
    const appRoot = `${global.__dirname}/..`;
    const { commandName, dirName, className, description } = answers;
    exec(`[ -d "./src/commands" ]`, (error: ExecException | null) => {
      if (error) {
        execSync(`mkdir ./src/commands`);
      }

      const newDirName = !dirName ? kebabcase(answers.commandName) : dirName;
      const newClassName = !className
        ? startcase(camelcase(answers.commandName)).replace(/ /g, '') + 'Command'
        : className;

      exec(`[ -d "./src/commands/${newDirName}" ]`, (error) => {
        if (!error) {
          Message.error(
            `${chalk.italic.yellow(
              newDirName,
            )} directroy name is already exists in the ${chalk.italic.underline.yellow(
              './src/commands',
            )}`,
          );
          process.exit(1);
        }

        execSync(`mkdir "./src/commands/${newDirName}"`);
        exec(`cat "${appRoot}/templates/command/index.txt"`, (error, stdout) => {
          if (error) {
            console.log(Message.error(error.message));
            process.exit(1);
          }

          const placeholders = [
            ['className', newClassName],
            ['commandName', commandName],
            ['dirName', newDirName],
            ['description', description],
          ];

          let fileContent = stdout;
          for (const [placeholder, value] of placeholders) {
            fileContent = fileContent.replace(`{{${placeholder}}}`, value);
          }
          execSync(`echo "${fileContent}" > "./src/commands/${newDirName}/index.ts"`);
          Message.success('Command created.');
          process.exit(0);
        });
      });
    });
  }
}
