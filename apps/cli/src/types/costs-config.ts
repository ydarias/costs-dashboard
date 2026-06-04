export interface AccountConfig {
  id: string
  apiKey: string
}

export interface CostsConfig {
  accounts: AccountConfig[]
}
