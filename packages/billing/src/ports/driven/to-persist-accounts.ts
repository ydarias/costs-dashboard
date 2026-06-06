import type { Account } from '../../domain/index.js';

export interface ToPersistAccounts {
  save(account: Account): Promise<Account>;
}
