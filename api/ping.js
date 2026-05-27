module.exports = function handler(req, res) {
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true, route: 'ping', runtime: 'vercel-commonjs', time: new Date().toISOString() }));
};
