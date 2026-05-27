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
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers
  });
  res.end(body);
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
  return new Promise((resolve, reject) => {
    let body = '';
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
