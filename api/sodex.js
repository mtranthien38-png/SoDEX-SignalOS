import { config } from '../src/core/env.js';
import { sodexClient } from '../src/clients/sodex.js';

import { json } from '../src/core/http.js';
async function handle(req) {
  const cfg = config();
  const url = new URL(req.url, 'http://localhost');
  const market = url.searchParams.get('market') || 'perps';
  const resource = url.searchParams.get('resource') || 'tickers';
  const client = sodexClient({ ...cfg.sodex, mockMode: cfg.mockMode });
  if (resource === 'tickers') return client.tickers(market);
  if (resource === 'symbols') return client.symbols(market);
  if (resource === 'mark-prices') return client.markPrices();
  if (resource === 'state') return client.accountState(cfg.sodex.userAddress);
  return { ok: false, error: `Unknown resource ${resource}`, data: null };
}

export default async function handler(req, res) {
  try {
    const payload = await handle(req, res);
    if (res && !res.writableEnded) return json(res, payload?.ok === false ? 400 : 200, payload ?? { ok: true });
    return payload;
  } catch (error) {
    if (res && !res.writableEnded) return json(res, error.status || 500, { ok: false, error: error.message || String(error), details: error.details || null });
    throw error;
  }
}
