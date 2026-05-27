import { config, redact } from '../src/core/env.js';
import { sosovalueClient } from '../src/clients/sosovalue.js';
import { sodexClient } from '../src/clients/sodex.js';

import { json } from '../src/core/http.js';
async function handle(req, res) {
  const cfg = config();
  const [soso, sodex] = await Promise.all([
    sosovalueClient({ ...cfg.sosovalue, mockMode: cfg.mockMode }).currencies(),
    sodexClient({ ...cfg.sodex, mockMode: cfg.mockMode }).tickers('perps')
  ]);
  return {
    ok: true,
    mode: cfg.mockMode ? 'mock' : 'live-with-fallback',
    services: {
      sosovalue: { configured: Boolean(cfg.sosovalue.key), key: redact(cfg.sosovalue.key), healthy: soso.ok, source: soso.source, fallback: Boolean(soso.fallback) },
      sodex: { network: cfg.sodex.network, apiKeyName: cfg.sodex.apiKeyName || null, healthy: sodex.ok, source: sodex.source, fallback: Boolean(sodex.fallback), liveTrading: cfg.sodex.liveTrading },
      agent: { healthy: true, provider: cfg.ai.deepseekKey ? 'deepseek' : cfg.ai.openaiKey ? 'openai' : 'local-rules' }
    }
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
