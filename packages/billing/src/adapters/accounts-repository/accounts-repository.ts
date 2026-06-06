import type { DataSource, Repository } from 'typeorm';

import type { Account } from '../../domain/index.js';
import type { ToPersistAccounts } from '../../ports/index.js';

import { AccountEntity } from './account-entity.js';

export class AccountsRepository implements ToPersistAccounts {
  private readonly repo: Repository<AccountEntity>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(AccountEntity);
  }

  async save(account: Account): Promise<Account> {
    await this.repo.save({ id: account.id, name: account.name, apiKey: account.apiKey });
    return account;
  }
}
