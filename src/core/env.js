import fs from 'node:fs';
import path from 'node:path';

export function loadDotEnv(file = '.env') {
  const full = path.resolve(process.cwd(), file);
  if (!fs.existsSync(full)) return;
  const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (!process.env[key]) process.env[key] = rest.join('=').replace(/^['"]|['"]$/g, '');
  }
}

export function boolEnv(name, fallback = false) {
  const value = process.env[name];
  if (value == null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

export function config() {
  const network = (process.env.SODEX_NETWORK || 'testnet').toLowerCase() === 'mainnet' ? 'mainnet' : 'testnet';
  const spotDefault = network === 'mainnet'
    ? 'https://mainnet-gw.sodex.dev/api/v1/spot'
    : 'https://testnet-gw.sodex.dev/api/v1/spot';
  const perpsDefault = network === 'mainnet'
    ? 'https://mainnet-gw.sodex.dev/api/v1/perps'
    : 'https://testnet-gw.sodex.dev/api/v1/perps';

  return {
    port: Number(process.env.PORT || 8787),
    mockMode: boolEnv('MOCK_MODE', false),
    sosovalue: {
      key: process.env.SOSOVALUE_API_KEY || '',
      baseUrl: process.env.SOSOVALUE_BASE_URL || 'https://openapi.sosovalue.com/openapi/v1'
    },
    sodex: {
      network,
      spotBaseUrl: process.env.SODEX_SPOT_BASE_URL || spotDefault,
      perpsBaseUrl: process.env.SODEX_PERPS_BASE_URL || perpsDefault,
      apiKeyName: process.env.SODEX_API_KEY_NAME || '',
      apiPublicKey: process.env.SODEX_API_PUBLIC_KEY || '',
      apiPrivateKey: process.env.SODEX_API_PRIVATE_KEY || '',
      accountId: process.env.SODEX_ACCOUNT_ID || '',
      userAddress: process.env.SODEX_USER_ADDRESS || '',
      liveTrading: boolEnv('SODEX_LIVE_TRADING', false)
    },
    ai: {
      deepseekKey: process.env.DEEPSEEK_API_KEY || '',
      openaiKey: process.env.OPENAI_API_KEY || ''
    }
  };
}

export function redact(value) {
  if (!value) return '';
  const v = String(value);
  if (v.length <= 8) return '••••';
  return `${v.slice(0, 4)}••••${v.slice(-4)}`;
}
