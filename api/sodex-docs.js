import { config } from '../src/core/env.js';
import { sodexClient } from '../src/clients/sodex.js';

export default async function handler(req) {
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
