import { config } from '../src/core/env.js';
import { readBody, json } from '../src/core/http.js';
import { sodexClient } from '../src/clients/sodex.js';
import { assertOrderInput } from '../src/core/validate.js';

async function handle(req) {
  if (req.method !== 'POST') return { ok: false, error: 'POST required' };
  const body = assertOrderInput(await readBody(req));
  const cfg = config();
  const client = sodexClient({ ...cfg.sodex, mockMode: cfg.mockMode });
  if (body.mode === 'live') return client.liveOrder(body);
  const order = await client.paperOrder(body);
  return { ok: true, data: order };
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
