import 'reflect-metadata';
import type { DataSource } from 'typeorm';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { createDataSource } from '../costs-repository/data-source-factory.js';

import { AccountsRepository } from './accounts-repository.js';

let dataSource: DataSource;
let repository: AccountsRepository;

beforeEach(async () => {
  dataSource = createDataSource(':memory:');
  await dataSource.initialize();
  repository = new AccountsRepository(dataSource);
});

afterEach(async () => {
  await dataSource.destroy();
});

describe('AccountsRepository', () => {
  it('saves an account and returns it', async () => {
    const saved = await repository.save({ id: 'acc-1', name: 'My Account', apiKey: 'key-1' });

    expect(saved).toEqual({ id: 'acc-1', name: 'My Account', apiKey: 'key-1' });
  });

  it('upserts — second save with same id overwrites the name and apiKey', async () => {
    await repository.save({ id: 'acc-1', name: 'Old Name', apiKey: 'old-key' });
    const updated = await repository.save({ id: 'acc-1', name: 'New Name', apiKey: 'new-key' });

    expect(updated.name).toBe('New Name');
    expect(updated.apiKey).toBe('new-key');
  });
});
