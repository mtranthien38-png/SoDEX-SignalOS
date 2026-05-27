import { config, redact } from '../src/core/env.js';
import { sosovalueClient } from '../src/clients/sosovalue.js';
import { sodexClient } from '../src/clients/sodex.js';

export default async function handler(req, res) {
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
