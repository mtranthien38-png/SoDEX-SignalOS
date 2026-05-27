const $ = (sel) => document.querySelector(sel);
const fmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const money = (n) => `$${fmt.format(Number(n || 0))}`;
const pct = (n) => `${Number(n || 0).toFixed(2)}%`;
const state = { tickers: [], news: [], etfs: [], history: [], signal: null, asset: 'BTC' };

async function api(path, opts = {}) {
  const res = await fetch(path, { headers: { 'content-type': 'application/json' }, ...opts });
  const data = await res.json();
  if (!res.ok && data?.ok !== false) throw new Error(`API error ${res.status}`);
  return data;
}

function setActiveNav() {
  const sections = [...document.querySelectorAll('main section, header')];
  const top = window.scrollY + 120;
  const active = sections.reverse().find(s => s.offsetTop <= top)?.id || 'command';
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('active', a.hash === `#${active}`));
}

function drawLineChart(canvas, values, labels = [], mode = 'line') {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth * dpr;
  const h = canvas.height * dpr;
  canvas.width = w;
  ctx.clearRect(0, 0, w, h);
  const pad = 28 * dpr;
  const nums = values.map(Number);
  const min = Math.min(...nums, 0);
  const max = Math.max(...nums, 1);
  const span = max - min || 1;
  const grad = ctx.createLinearGradient(0, pad, w, h - pad);
  grad.addColorStop(0, '#7dd3fc'); grad.addColorStop(.6, '#a78bfa'); grad.addColorStop(1, '#6ee7b7');
  ctx.strokeStyle = 'rgba(148,163,184,.18)'; ctx.lineWidth = 1 * dpr;
  for (let i = 0; i < 4; i++) { const y = pad + (h - pad * 2) * i / 3; ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke(); }
  if (mode === 'bar') {
    const bw = (w - pad * 2) / nums.length * .56;
    nums.forEach((v, i) => {
      const x = pad + i * (w - pad * 2) / Math.max(1, nums.length - 1) - bw / 2;
      const y = pad + (max - v) / span * (h - pad * 2);
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, bw, h - pad - y);
    });
    return;
  }
  ctx.beginPath();
  nums.forEach((v, i) => {
    const x = pad + i * (w - pad * 2) / Math.max(1, nums.length - 1);
    const y = pad + (max - v) / span * (h - pad * 2);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = grad; ctx.lineWidth = 3 * dpr; ctx.stroke();
  nums.forEach((v, i) => {
    const x = pad + i * (w - pad * 2) / Math.max(1, nums.length - 1);
    const y = pad + (max - v) / span * (h - pad * 2);
    ctx.beginPath(); ctx.arc(x, y, 4 * dpr, 0, Math.PI * 2); ctx.fillStyle = '#e0f2fe'; ctx.fill();
  });
}

function renderStatus(payload) {
  $('#mode').textContent = payload.mode || 'unknown';
  const services = payload.services || {};
  $('#health-pill').textContent = Object.values(services).every(x => x.healthy || x.configured) ? 'online' : 'fallback mode';
  $('#status-grid').innerHTML = Object.entries(services).map(([name, svc]) => `
    <div class="status-item"><small>${name}</small><b>${svc.healthy ? 'Healthy' : svc.configured ? 'Configured' : 'Fallback'}</b><small>${svc.source || svc.provider || svc.network || ''}</small></div>
  `).join('');
}

function renderKPIs() {
  const volume = state.tickers.reduce((s, x) => s + Number(x.volume24h || 0), 0);
  const avgChange = state.tickers.reduce((s, x) => s + Number(x.change24h || 0), 0) / Math.max(1, state.tickers.length);
  const flow = state.history.at(-1)?.netInflow || state.etfs.reduce((s, x) => s + Number(x.netInflow || 0), 0);
  const score = state.signal?.score ?? 0;
  $('#kpis').innerHTML = [
    ['SoDEX 24h volume', money(volume), 'spot/perps market tape'],
    ['Avg momentum', pct(avgChange), 'normalized change'],
    ['Latest ETF flow', money(flow), `${state.asset} fund pressure`],
    ['Agent score', score ? `${score}/100` : '—', 'explainable alpha']
  ].map(([a,b,c]) => `<div class="kpi"><small>${a}</small><b>${b}</b><small>${c}</small></div>`).join('');
}

function renderTickers() {
  $('#ticker-table').innerHTML = state.tickers.map(t => {
    const spread = Math.abs(Number(t.ask || 0) - Number(t.bid || 0));
    const cls = Number(t.change24h) >= 0 ? 'pos' : 'neg';
    return `<tr><td><b>${t.symbol}</b></td><td>${money(t.last)}</td><td class="${cls}">${pct(t.change24h)}</td><td>${money(t.volume24h)}</td><td>${fmt.format(spread)}</td></tr>`;
  }).join('');
  drawLineChart($('#pulse-chart'), state.tickers.map(x => Number(x.volume24h || 0)), [], 'bar');
}

function renderNews() {
  $('#news-list').innerHTML = state.news.slice(0, 8).map(n => `
    <div class="news-item"><a href="${n.url}" target="_blank" rel="noreferrer">${n.title}</a><div class="news-meta"><span>${n.source}</span><span>${n.sentiment}</span><span>${new Date(n.publishedAt).toLocaleString()}</span></div></div>
  `).join('');
}

function renderFlows() {
  drawLineChart($('#flow-chart'), state.history.map(x => Number(x.netInflow || 0)), state.history.map(x => x.date));
  $('#etf-list').innerHTML = state.etfs.slice(0, 6).map(e => `<div class="etf-card"><b>${e.ticker}</b><small>${e.symbol}</small><p>${money(e.netInflow)}</p></div>`).join('');
}

function renderSignal() {
  const s = state.signal;
  if (!s) return;
  document.documentElement.style.setProperty('--score', s.score);
  $('#score').textContent = s.score;
  $('#action').textContent = `${s.action} ${s.asset}`;
  $('#confidence').textContent = `${s.confidence.toUpperCase()} confidence · last ${money(s.metrics.last)} · 24h ${pct(s.metrics.priceChange)}`;
  $('#signal-time').textContent = new Date(s.timestamp).toLocaleTimeString();
  $('#component-bars').innerHTML = Object.entries(s.components).map(([k, v]) => `<div class="bar"><div class="bar-top"><span>${k.replace('Score','')}</span><b>${v}</b></div><div class="bar-line"><span style="width:${v}%"></span></div></div>`).join('');
  $('#rationale').innerHTML = s.rationale.map(r => `<li>${r}</li>`).join('');
  $('#order-preview').innerHTML = s.suggestedOrder ? `<b>Suggested paper order</b><pre>${JSON.stringify(s.suggestedOrder, null, 2)}</pre>` : '<b>No trade suggested.</b><p>Agent recommends watch mode until signal improves.</p>';
  if (s.suggestedOrder) {
    const f = $('#order-form');
    f.symbol.value = s.suggestedOrder.symbol;
    f.side.value = s.suggestedOrder.side;
    f.quantity.value = s.suggestedOrder.quantity;
    f.price.value = s.suggestedOrder.price;
  }
}

async function loadStatus() { renderStatus(await api('/api/status')); }
async function loadSodex() { const r = await api('/api/sodex?market=perps&resource=tickers'); state.tickers = r.data || []; renderTickers(); renderKPIs(); }
async function loadNews() { const r = await api('/api/sosovalue?resource=news'); state.news = r.data || []; renderNews(); }
async function loadFlows() { const [e, h] = await Promise.all([api(`/api/sosovalue?resource=etfs&symbol=${state.asset}`), api(`/api/sosovalue?resource=etf-history&symbol=${state.asset}`)]); state.etfs = e.data || []; state.history = h.data || []; renderFlows(); renderKPIs(); }
async function runAgent() { const r = await api('/api/signal', { method: 'POST', body: JSON.stringify({ asset: state.asset }) }); state.signal = r.data; renderSignal(); renderKPIs(); }
async function refreshAll() { await Promise.all([loadStatus(), loadSodex(), loadNews(), loadFlows()]); }

$('#run-agent').addEventListener('click', runAgent);
$('#refresh-all').addEventListener('click', refreshAll);
$('#asset-select').addEventListener('change', async (e) => { state.asset = e.target.value; await loadFlows(); await runAgent(); });
document.querySelectorAll('[data-refresh]').forEach(btn => btn.addEventListener('click', async () => { if (btn.dataset.refresh === 'sodex') await loadSodex(); if (btn.dataset.refresh === 'news') await loadNews(); }));
$('#order-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.currentTarget).entries());
  body.rationale = state.signal?.rationale?.join(' ') || 'manual paper order';
  const r = await api('/api/order', { method: 'POST', body: JSON.stringify(body) });
  $('#terminal-log').textContent += `\n$ submit ${body.mode} ${body.side} ${body.symbol}\n${JSON.stringify(r, null, 2)}\n`;
  $('#terminal-log').scrollTop = $('#terminal-log').scrollHeight;
});
window.addEventListener('scroll', setActiveNav);
window.addEventListener('resize', () => { renderTickers(); renderFlows(); });
await refreshAll();
await runAgent();
