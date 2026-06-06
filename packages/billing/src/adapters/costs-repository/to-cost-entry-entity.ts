import type { CostEntry } from '../../domain/index.js';

import { CostEntryEntity } from './cost-entry-entity.js';

export function toCostEntryEntity(e: CostEntry): CostEntryEntity {
  const entity = new CostEntryEntity();
  entity.accountId = e.accountId;
  entity.resourceInstanceId = e.resourceInstanceId;
  entity.resourceInstanceName = e.resourceInstanceName ?? null;
  entity.resourceId = e.resourceId;
  entity.resourceName = e.resourceName ?? null;
  entity.planId = e.planId;
  entity.planName = e.planName ?? null;
  entity.region = e.region ?? null;
  entity.resourceGroupId = e.resourceGroupId ?? null;
  entity.resourceGroupName = e.resourceGroupName ?? null;
  entity.cost = e.cost;
  entity.currency = e.currency;
  entity.month = e.month;
  return entity;
}
