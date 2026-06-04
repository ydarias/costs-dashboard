export interface RequiredEnv {
  apiKey: string
  accountIds: string[]
}

export function validateEnv(): RequiredEnv {
  const apiKey = process.env['IBM_CLOUD_API_KEY']
  if (!apiKey) {
    process.stderr.write('Error: IBM_CLOUD_API_KEY environment variable is required\n')
    process.exit(1)
  }

  const rawIds = process.env['IBM_CLOUD_ACCOUNT_IDS']
  if (!rawIds) {
    process.stderr.write('Error: IBM_CLOUD_ACCOUNT_IDS environment variable is required\n')
    process.exit(1)
  }

  const accountIds = rawIds
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

  if (accountIds.length === 0) {
    process.stderr.write('Error: IBM_CLOUD_ACCOUNT_IDS must contain at least one account ID\n')
    process.exit(1)
  }

  return { apiKey, accountIds }
}
