function json(res,p){ res.setHeader('content-type','application/json; charset=utf-8'); res.setHeader('cache-control','no-store'); res.statusCode=200; res.end(JSON.stringify(p,null,2)); }
function news(){ return [
  { title:'BTC market structure stays constructive as liquidity improves', source:'SoSoValue', sentiment:'positive', publishedAt:new Date().toISOString(), url:'https://sosovalue.com' },
  { title:'ETF flows remain a key driver for crypto beta', source:'SoSoValue', sentiment:'neutral', publishedAt:new Date(Date.now()-3600e3).toISOString(), url:'https://sosovalue.com' },
  { title:'On-chain execution demand grows across perpetual markets', source:'SoSoValue', sentiment:'positive', publishedAt:new Date(Date.now()-7200e3).toISOString(), url:'https://sosovalue.com' }
]; }
function etfs(symbol){ return [{ticker:`${symbol}A`,symbol,netInflow:240421665,aum:17300000000},{ticker:`${symbol}B`,symbol,netInflow:91820000,aum:8600000000},{ticker:`${symbol}C`,symbol,netInflow:-22400000,aum:4100000000}]; }
function history(){ return Array.from({length:14},(_,i)=>({date:new Date(Date.now()-(13-i)*86400e3).toISOString().slice(0,10),netInflow:Math.round((Math.sin(i/2)*80000000)+150000000+i*3000000),totalAssets:25000000000+i*120000000})); }
function unwrap(p){ if(Array.isArray(p)) return p; if(Array.isArray(p&&p.data)) return p.data; if(Array.isArray(p&&p.data&&p.data.list)) return p.data.list; if(Array.isArray(p&&p.result)) return p.result; return []; }
function normNews(x){ const ml=(x.multilanguageContent&&x.multilanguageContent[0])||(x.multiLanguageContent&&x.multiLanguageContent[0])||{}; return {title:x.title||ml.title||x.name||'Untitled market update',source:x.source||x.sourceName||'SoSoValue',sentiment:x.sentiment||x.sentimentLabel||'neutral',publishedAt:x.publishedAt||x.publishTime||x.createTime||new Date().toISOString(),url:x.url||x.sourceLink||x.link||'https://sosovalue.com'}; }
async function get(url,key){ const c=new AbortController(); const t=setTimeout(()=>c.abort(),7000); try{ const r=await fetch(url,{signal:c.signal,headers:{accept:'application/json',Authorization:`Bearer ${key}`,'x-api-key':key}}); const text=await r.text(); if(!r.ok) throw new Error('HTTP '+r.status); return JSON.parse(text||'{}'); } finally{ clearTimeout(t); } }
module.exports = async function handler(req,res){
  try{
    const u=new URL(req.url,'https://local.app'); const resource=u.searchParams.get('resource')||'news'; const symbol=u.searchParams.get('symbol')||'BTC';
    const fallback = resource==='news'?news():resource==='etfs'?etfs(symbol):resource==='etf-history'?history():[];
    const key=process.env.SOSOVALUE_API_KEY;
    if(!key) return json(res,{ok:true,fallback:true,source:'mock:sosovalue',data:fallback});
    const map={news:'/news/featured',etfs:'/etfs','etf-history':'/etfs/summary-history',currencies:'/currencies'};
    const qs=(resource==='etfs'||resource==='etf-history')?`?symbol=${encodeURIComponent(symbol)}&country_code=US`:'';
    const url='https://openapi.sosovalue.com/openapi/v1'+(map[resource]||map.news)+qs;
    try{ const data=await get(url,key); const list=unwrap(data); if(list.length) return json(res,{ok:true,source:url,data:resource==='news'?list.map(normNews):list}); }catch(e){}
    return json(res,{ok:true,fallback:true,source:'mock:sosovalue',data:fallback});
  }catch(e){ return json(res,{ok:true,fallback:true,source:'mock:sosovalue',error:String(e.message||e),data:news()}); }
};
