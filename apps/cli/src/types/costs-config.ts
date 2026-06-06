export interface AccountConfig {
  id: string
  name: string
  apiKey: string
}

export interface CostsConfig {
  accounts: AccountConfig[]
}
