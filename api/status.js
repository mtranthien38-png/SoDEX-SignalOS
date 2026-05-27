function redact(v){ if(!v) return ''; v=String(v); return v.length<=8?'••••':`${v.slice(0,4)}••••${v.slice(-4)}`; }
module.exports = function handler(req, res) {
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  const network = (process.env.SODEX_NETWORK || 'testnet').toLowerCase() === 'mainnet' ? 'mainnet' : 'testnet';
  const sosoConfigured = Boolean(process.env.SOSOVALUE_API_KEY);
  res.statusCode = 200;
  res.end(JSON.stringify({
    ok: true,
    mode: 'vercel-cjs-live-with-fallback',
    services: {
      sosovalue: { configured: sosoConfigured, key: redact(process.env.SOSOVALUE_API_KEY || ''), healthy: sosoConfigured, source: sosoConfigured ? 'env:SOSOVALUE_API_KEY' : 'mock:sosovalue', fallback: !sosoConfigured },
      sodex: { network, apiKeyName: process.env.SODEX_API_KEY_NAME || null, healthy: true, source: network === 'mainnet' ? 'https://mainnet-gw.sodex.dev' : 'https://testnet-gw.sodex.dev', fallback: false, liveTrading: String(process.env.SODEX_LIVE_TRADING).toLowerCase() === 'true' },
      agent: { healthy: true, provider: 'local-rules' }
    }
  }, null, 2));
};
