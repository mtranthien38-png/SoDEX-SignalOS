import assert from 'node:assert/strict';
import http from 'node:http';
import server from '../server.js';
process.env.MOCK_MODE = 'true';
process.env.PORT = '8799';

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:8799${path}`, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}
function post(path, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:8799${path}`, { method: 'POST', headers: { 'content-type': 'application/json' } }, res => {
      let body = ''; res.on('data', d => body += d); res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject); req.end(JSON.stringify(data));
  });
}
server.listen(8799, async () => {
  try {
    const home = await get('/'); assert.equal(home.status, 200); assert.match(home.body, /SoDEX SignalOS/);
    const status = await get('/api/status'); assert.equal(status.status, 200); assert.equal(JSON.parse(status.body).ok, true);
    const signal = await post('/api/signal', { asset: 'BTC' }); assert.equal(signal.status, 200); assert.ok(JSON.parse(signal.body).data.score >= 0);
    const order = await post('/api/order', { symbol: 'vBTC_vUSDC', side: 'buy', quantity: '0.001', price: '100000', mode: 'paper' }); assert.equal(order.status, 200); assert.equal(JSON.parse(order.body).data.mode, 'paper');
    console.log('Smoke tests passed.');
  } finally { server.close(); }
});
