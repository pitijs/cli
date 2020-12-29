import { Command } from "piti";

@Command()
class NewCommand {
  name = 'new';
  description = 'Create a new piti project';

  handle() {
    console.log('hello');
  }
}

export default NewCommand;
