import type UsageReportsV4 from '@ibm-cloud/platform-services/usage-reports/v4.js';

import type { CostEntry } from '../../domain/index.js';

export function toCostEntry(instance: UsageReportsV4.InstanceUsage): CostEntry {
  if (instance.currency_code !== 'USD') {
    throw new Error(
      `Unsupported currency: ${instance.currency_code} for instance ${instance.resource_instance_id}`,
    );
  }

  const cost = instance.usage
    .filter((metric) => !metric.non_chargeable)
    .reduce((sum, metric) => sum + metric.cost, 0);

  return {
    accountId: instance.account_id,
    resourceInstanceId: instance.resource_instance_id,
    resourceInstanceName: instance.resource_instance_name,
    resourceId: instance.resource_id,
    resourceName: instance.resource_name,
    planId: instance.plan_id,
    planName: instance.plan_name,
    region: instance.region,
    resourceGroupId: instance.resource_group_id,
    resourceGroupName: instance.resource_group_name,
    cost,
    currency: 'USD',
    month: instance.month,
  };
}
