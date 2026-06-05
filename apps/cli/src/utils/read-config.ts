import { readFileSync } from 'node:fs';

import type { CostsConfig } from '../types/costs-config.js';

export function readConfig(configPath: string): CostsConfig {
  let raw: string;
  try {
    raw = readFileSync(configPath, 'utf-8');
  } catch {
    process.stderr.write(`Error: config file not found at "${configPath}"\n`);
    process.exit(1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    process.stderr.write(`Error: config file at "${configPath}" is not valid JSON\n`);
    process.exit(1);
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !Array.isArray((parsed as Record<string, unknown>)['accounts'])
  ) {
    process.stderr.write(`Error: config file must have an "accounts" array\n`);
    process.exit(1);
  }

  const config = parsed as CostsConfig;

  for (const account of config.accounts) {
    if (!account.id || !account.apiKey) {
      process.stderr.write(`Error: each account must have "id" and "apiKey" fields\n`);
      process.exit(1);
    }
  }

  if (config.accounts.length === 0) {
    process.stderr.write(`Error: "accounts" must contain at least one entry\n`);
    process.exit(1);
  }

  return config;
}
