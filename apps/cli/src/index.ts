import { Command } from 'commander'

const program = new Command()

program
  .name('costs')
  .description('IBM Cloud costs dashboard CLI')
  .version('0.0.0')

program
  .command('fetch')
  .description('Fetch costs from IBM Cloud')
  .requiredOption('--account-id <id>', 'IBM Cloud account ID')
  .requiredOption('--month <month>', 'Month to fetch (YYYY-MM)')
  .action((_options) => {
    console.log('fetch command not yet implemented')
  })

program.parse()
