#!/usr/bin/env node

import { Command } from 'commander';
import { createCommands } from './commands';

const program = new Command();

program.name('codeguide').description('CLI tool for code guidance').version('1.0.0');

createCommands(program);

program.parse();
