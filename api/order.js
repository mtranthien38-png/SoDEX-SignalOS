import { config } from '../src/core/env.js';
import { readBody } from '../src/core/http.js';
import { sodexClient } from '../src/clients/sodex.js';
import { assertOrderInput } from '../src/core/validate.js';

export default async function handler(req) {
  if (req.method !== 'POST') return { ok: false, error: 'POST required' };
  const body = assertOrderInput(await readBody(req));
  const cfg = config();
  const client = sodexClient({ ...cfg.sodex, mockMode: cfg.mockMode });
  if (body.mode === 'live') return client.liveOrder(body);
  const order = await client.paperOrder(body);
  return { ok: true, data: order };
}
