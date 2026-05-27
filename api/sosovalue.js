import { config } from '../src/core/env.js';
import { sosovalueClient } from '../src/clients/sosovalue.js';

export default async function handler(req) {
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
