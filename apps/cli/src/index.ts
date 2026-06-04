import 'reflect-metadata'
import { Command } from 'commander'
import { fetchCommand } from './commands/fetch.js'

const program = new Command()

program
  .name('costs')
  .description('IBM Cloud costs dashboard CLI')
  .version('0.0.0')

program
  .command('fetch')
  .description('Fetch costs from IBM Cloud')
  .requiredOption('--from <YYYY-MM>', 'Start month (inclusive)')
  .option('--to <YYYY-MM>', 'End month (inclusive, defaults to --from)')
  .option('--config <path>', 'Path to JSON config file', './costs-config.json')
  .action(fetchCommand)

program.parse()
