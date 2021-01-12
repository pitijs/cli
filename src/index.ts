#!/usr/bin/env node

import Piti from '@pitijs/core';
import CreateCommand from './commands/create';
import NewCommand from './commands/new';

global.__dirname = __dirname;

Piti.run({
  scriptName: 'piti',
  commands: [NewCommand, CreateCommand],
});
