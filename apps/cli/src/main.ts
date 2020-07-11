import { program } from 'commander';
import * as pkg from '../../../package.json';
import {chmod as fs} from 'fs';

async function initPlugin() {
  console.log('TEST')
  // Check if a package.json already exists and exit with an error
}


program
  .version(pkg.version);

program
  .command('plugin-init')
  .action(initPlugin);

program.parseAsync(process.argv).catch(console.error);
