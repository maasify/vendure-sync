import { Command } from 'commander';
import { vendureExport } from './libs/vendure.export';
import { vendureImport } from './libs/vendure.import';

const program = new Command();

program
  .command('export')
  .description('Export Vendure data into export/ directory')
  .action(async () => {
    return vendureExport(`${__dirname}/export`, true);
  });

program
  .command('import <channel>')
  .description('Import Vendure data from export/ directory')
  .action(async (channel: string) => {
    return vendureImport(`${__dirname}/export`, channel);
  });

program.parse(process.argv);
