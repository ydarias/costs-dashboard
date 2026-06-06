import type { CostEntry } from '../../domain/index.js';

import type { CostEntryEntity } from './cost-entry-entity.js';

export function toCostEntry(entity: CostEntryEntity): CostEntry {
  return {
    accountId: entity.accountId,
    resourceInstanceId: entity.resourceInstanceId,
    resourceInstanceName: entity.resourceInstanceName ?? undefined,
    resourceId: entity.resourceId,
    resourceName: entity.resourceName ?? undefined,
    planId: entity.planId,
    planName: entity.planName ?? undefined,
    region: entity.region ?? undefined,
    resourceGroupId: entity.resourceGroupId ?? undefined,
    resourceGroupName: entity.resourceGroupName ?? undefined,
    cost: entity.cost,
    currency: 'USD',
    month: entity.month,
  };
}
