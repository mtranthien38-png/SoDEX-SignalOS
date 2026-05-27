import { config } from '../src/core/env.js';
import { sodexClient } from '../src/clients/sodex.js';

import { json } from '../src/core/http.js';
async function handle(req) {
  const cfg = config();
  const url = new URL(req.url, 'http://localhost');
  const market = url.searchParams.get('market') || 'perps';
  const client = sodexClient({ ...cfg.sodex, mockMode: cfg.mockMode });
  return {
    ok: true,
    data: await client.signingPreview({
      market,
      symbolID: Number(url.searchParams.get('symbolID') || 1),
      symbol: url.searchParams.get('symbol') || 'BTC-PERP',
      side: url.searchParams.get('side') || 'buy',
      orderType: url.searchParams.get('orderType') || 'market',
      quantity: url.searchParams.get('quantity') || '0.001',
      price: url.searchParams.get('price') || ''
    })
  };
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
