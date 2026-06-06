export interface ResourceCostEntry {
  accountId: string;
  resourceName?: string;
  cost: number;
  currency: 'USD';
  month: string;
}
