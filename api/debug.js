function redact(v){ if(!v) return ''; v=String(v); return v.length<=8?'••••':`${v.slice(0,4)}••••${v.slice(-4)}`; }
module.exports = function handler(req, res) {
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.statusCode = 200;
  res.end(JSON.stringify({
    ok: true,
    runtime: 'vercel-commonjs',
    node: process.version,
    env: {
      MOCK_MODE: process.env.MOCK_MODE || null,
      SOSOVALUE_API_KEY: process.env.SOSOVALUE_API_KEY ? redact(process.env.SOSOVALUE_API_KEY) : null,
      SODEX_NETWORK: process.env.SODEX_NETWORK || null,
      SODEX_API_KEY_NAME: process.env.SODEX_API_KEY_NAME || null,
      SODEX_API_PUBLIC_KEY: process.env.SODEX_API_PUBLIC_KEY ? redact(process.env.SODEX_API_PUBLIC_KEY) : null,
      SODEX_API_PRIVATE_KEY: process.env.SODEX_API_PRIVATE_KEY ? 'set' : null,
      SODEX_LIVE_TRADING: process.env.SODEX_LIVE_TRADING || null
    }
  }, null, 2));
};
