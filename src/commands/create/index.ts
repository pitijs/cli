import { Command } from '@pitijs/core';
import CreateCommandCommand from '../createCommand';

@Command({
  name: 'create <command>',
  description: 'Creator command',
  subCommand: [CreateCommandCommand],
})
export default class CreateCommand {
  handler() {}
}
