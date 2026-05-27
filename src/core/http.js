const memory = new Map();

export class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function json(res, status, payload, headers = {}) {
  const body = JSON.stringify(payload, null, 2);
  if (!res) return payload;
  if (typeof res.setHeader === 'function') {
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.setHeader('cache-control', 'no-store');
    for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
  }
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(status).json(payload);
  }
  if (typeof res.writeHead === 'function' && typeof res.end === 'function') {
    res.writeHead(status, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers
    });
    return res.end(body);
  }
  if (typeof res.end === 'function') return res.end(body);
  return payload;
}

export async function fetchJson(url, options = {}) {
  const { ttlMs = 30_000, timeoutMs = 10_000, cacheKey = url, fallback = null, ...fetchOptions } = options;
  const cached = memory.get(cacheKey);
  if (cached && cached.expires > Date.now()) return { ...cached.value, cached: true };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
    const text = await response.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    if (!response.ok) throw new ApiError(`HTTP ${response.status}`, response.status, data);
    const value = { ok: true, data, status: response.status, source: url };
    memory.set(cacheKey, { value, expires: Date.now() + ttlMs });
    return value;
  } catch (error) {
    if (fallback != null) return { ok: false, data: fallback, error: String(error.message || error), source: url, fallback: true };
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function readBody(req) {
  if (req?.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req?.body === 'string') {
    try { return Promise.resolve(JSON.parse(req.body)); } catch { return Promise.reject(new ApiError('Invalid JSON body', 400)); }
  }
  return new Promise((resolve, reject) => {
    let body = '';
    if (!req || typeof req.on !== 'function') return resolve({});
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) reject(new ApiError('Body too large', 413));
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch { reject(new ApiError('Invalid JSON body', 400)); }
    });
    req.on('error', reject);
  });
}
