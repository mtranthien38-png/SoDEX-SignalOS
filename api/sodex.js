const fallbackTickers = [
  { symbol: 'WLD-USD', last: '1.42', change24h: '2.14', volume24h: '1283200', bid: '1.41', ask: '1.43' },
  { symbol: 'LTC-USD', last: '86.18', change24h: '-0.42', volume24h: '928400', bid: '86.12', ask: '86.22' },
  { symbol: 'BTC-USD', last: '108240', change24h: '1.12', volume24h: '26846415', bid: '108230', ask: '108250' },
  { symbol: 'ETH-USD', last: '3890', change24h: '0.84', volume24h: '12146320', bid: '3888', ask: '3892' }
];
function json(res,p){ res.setHeader('content-type','application/json; charset=utf-8'); res.setHeader('cache-control','no-store'); res.statusCode=200; res.end(JSON.stringify(p,null,2)); }
function norm(x){ return { symbol: x.symbol||x.instID||x.name||x.pair||'UNKNOWN', last: String(x.last||x.lastPrice||x.price||x.close||'0'), change24h: String(x.change24h||x.priceChangePercent||x.changePercent||x.change||'0'), volume24h: String(x.volume24h||x.volume||x.quoteVolume||x.vol||'0'), bid: String(x.bid||x.bestBid||'0'), ask: String(x.ask||x.bestAsk||'0') }; }
function unwrap(p){ if(Array.isArray(p)) return p; if(Array.isArray(p&&p.data)) return p.data; if(Array.isArray(p&&p.data&&p.data.list)) return p.data.list; if(Array.isArray(p&&p.result)) return p.result; return []; }
async function get(url){ const c = new AbortController(); const t=setTimeout(()=>c.abort(),7000); try{ const r=await fetch(url,{signal:c.signal}); const text=await r.text(); if(!r.ok) throw new Error('HTTP '+r.status); return JSON.parse(text||'[]'); } finally{ clearTimeout(t); } }
module.exports = async function handler(req,res){
  try{
    const u = new URL(req.url, 'https://local.app');
    const market = u.searchParams.get('market') === 'spot' ? 'spot' : 'perps';
    const network = (process.env.SODEX_NETWORK || 'testnet').toLowerCase() === 'mainnet' ? 'mainnet' : 'testnet';
    const base = network === 'mainnet' ? `https://mainnet-gw.sodex.dev/api/v1/${market}` : `https://testnet-gw.sodex.dev/api/v1/${market}`;
    const paths = ['/markets/tickers24hr','/markets/tickers'];
    for(const path of paths){
      try{ const data=await get(base+path); const list=unwrap(data); if(list.length) return json(res,{ok:true,source:base+path,network,data:list.map(norm)}); }catch(e){}
    }
    return json(res,{ok:true,fallback:true,source:'mock:sodex',data:fallbackTickers});
  }catch(e){ return json(res,{ok:true,fallback:true,source:'mock:sodex',error:String(e.message||e),data:fallbackTickers}); }
};
