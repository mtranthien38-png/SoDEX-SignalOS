import { config } from '../src/core/env.js';
import { readBody, json } from '../src/core/http.js';
import { sosovalueClient } from '../src/clients/sosovalue.js';
import { sodexClient } from '../src/clients/sodex.js';
import { buildSignal } from '../src/engine/signal.js';

async function handle(req) {
  const body = req.method === 'POST' ? await readBody(req) : {};
  const asset = body.asset || new URL(req.url, 'http://localhost').searchParams.get('asset') || 'BTC';
  const cfg = config();
  const soso = sosovalueClient({ ...cfg.sosovalue, mockMode: cfg.mockMode });
  const dex = sodexClient({ ...cfg.sodex, mockMode: cfg.mockMode });
  const [currencies, news, etfs, etfHistory, tickers] = await Promise.all([
    soso.currencies(), soso.news(), soso.etfs(asset), soso.etfHistory(asset), dex.tickers('perps')
  ]);
  return { ok: true, data: buildSignal({ asset, currencies: currencies.data, news: news.data, etfs: etfs.data, etfHistory: etfHistory.data, tickers: tickers.data }), sources: { currencies: currencies.source, news: news.source, etfs: etfs.source, sodex: tickers.source } };
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
