import { config } from '../src/core/env.js';
import { sosovalueClient } from '../src/clients/sosovalue.js';

import { json } from '../src/core/http.js';
async function handle(req) {
  const url = new URL(req.url, 'http://localhost');
  const resource = url.searchParams.get('resource') || 'news';
  const symbol = url.searchParams.get('symbol') || 'BTC';
  const client = sosovalueClient({ ...config().sosovalue, mockMode: config().mockMode });
  if (resource === 'currencies') return client.currencies();
  if (resource === 'news') return client.news();
  if (resource === 'etfs') return client.etfs(symbol);
  if (resource === 'etf-history') return client.etfHistory(symbol);
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
