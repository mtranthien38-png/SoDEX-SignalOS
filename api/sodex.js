import { config } from '../src/core/env.js';
import { sodexClient } from '../src/clients/sodex.js';

export default async function handler(req) {
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
