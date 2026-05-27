import { config, redact } from '../src/core/env.js';
import { json } from '../src/core/http.js';

async function handle() {
  const cfg = config();
  return {
    ok: true,
    node: process.version,
    runtime: process.env.VERCEL ? 'vercel' : 'local',
    env: {
      MOCK_MODE: String(process.env.MOCK_MODE || ''),
      SOSOVALUE_API_KEY: redact(cfg.sosovalue.key),
      SOSOVALUE_BASE_URL: cfg.sosovalue.baseUrl,
      SODEX_NETWORK: cfg.sodex.network,
      SODEX_PERPS_BASE_URL: cfg.sodex.perpsBaseUrl,
      SODEX_SPOT_BASE_URL: cfg.sodex.spotBaseUrl,
      SODEX_API_KEY_NAME: cfg.sodex.apiKeyName || '',
      SODEX_API_PUBLIC_KEY: cfg.sodex.apiPublicKey || '',
      SODEX_API_PRIVATE_KEY_CONFIGURED: Boolean(cfg.sodex.apiPrivateKey),
      SODEX_LIVE_TRADING: cfg.sodex.liveTrading
    }
  };
}

export default async function handler(req, res) {
  try {
    const payload = await handle(req, res);
    if (res && !res.writableEnded) return json(res, 200, payload);
    return payload;
  } catch (error) {
    if (res && !res.writableEnded) return json(res, error.status || 500, { ok: false, error: error.message || String(error), details: error.details || null });
    throw error;
  }
}
