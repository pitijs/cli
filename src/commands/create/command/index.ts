import { Command } from 'piti';

@Command()
class CreateCommandCommand {
  name = 'create';
  description = 'Create a new piti project';

  handle() {
    console.log('hello CreateCommandCommand');
  }
}

export default CreateCommandCommand;
