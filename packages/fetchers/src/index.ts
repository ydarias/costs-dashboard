export interface CostEntry {
  resourceId: string
  resourceName: string
  cost: number
  currency: string
  month: string
}

export interface FetchCostsOptions {
  accountId: string
  month: string
  apiKey: string
}

export async function fetchCosts(_options: FetchCostsOptions): Promise<CostEntry[]> {
  throw new Error('Not implemented')
}
