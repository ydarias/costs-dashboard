import { readFileSync } from 'node:fs';

import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('node:fs');

const mockReadFileSync = vi.mocked(readFileSync);

afterEach(() => {
  vi.restoreAllMocks();
});

async function importReadConfig() {
  vi.resetModules();
  const { readConfig } = await import('./read-config.js');
  return readConfig;
}

describe('readConfig', () => {
  it('parses a valid config file', async () => {
    mockReadFileSync.mockReturnValue(
      JSON.stringify({ accounts: [{ id: 'acc-1', apiKey: 'key-1' }] }),
    );
    const readConfig = await importReadConfig();

    const config = readConfig('./costs-config.json');

    expect(config.accounts).toEqual([{ id: 'acc-1', apiKey: 'key-1' }]);
  });

  it('calls process.exit(1) when the file is not found', async () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called');
    }) as never);

    const readConfig = await importReadConfig();

    expect(() => readConfig('./missing.json')).toThrow('process.exit called');
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('calls process.exit(1) for invalid JSON', async () => {
    mockReadFileSync.mockReturnValue('not-json');
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called');
    }) as never);

    const readConfig = await importReadConfig();

    expect(() => readConfig('./bad.json')).toThrow('process.exit called');
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('calls process.exit(1) when accounts array is missing', async () => {
    mockReadFileSync.mockReturnValue(JSON.stringify({ other: 'data' }));
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called');
    }) as never);

    const readConfig = await importReadConfig();

    expect(() => readConfig('./bad.json')).toThrow('process.exit called');
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('calls process.exit(1) when an account is missing apiKey', async () => {
    mockReadFileSync.mockReturnValue(JSON.stringify({ accounts: [{ id: 'acc-1' }] }));
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called');
    }) as never);

    const readConfig = await importReadConfig();

    expect(() => readConfig('./bad.json')).toThrow('process.exit called');
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('calls process.exit(1) when accounts array is empty', async () => {
    mockReadFileSync.mockReturnValue(JSON.stringify({ accounts: [] }));
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called');
    }) as never);

    const readConfig = await importReadConfig();

    expect(() => readConfig('./bad.json')).toThrow('process.exit called');
    expect(exit).toHaveBeenCalledWith(1);
  });
});
