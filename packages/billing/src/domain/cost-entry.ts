export interface CostEntry {
  accountId: string;
  resourceInstanceId: string;
  resourceInstanceName?: string;
  resourceId: string;
  resourceName?: string;
  planId: string;
  planName?: string;
  region?: string;
  resourceGroupId?: string;
  resourceGroupName?: string;
  cost: number;
  currency: 'USD';
  month: string;
}
