function clamp(n, min = 0, max = 100) { return Math.max(min, Math.min(max, n)); }
function toNum(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }

export function buildSignal({ asset = 'BTC', currencies = [], news = [], etfs = [], etfHistory = [], tickers = [] }) {
  const upper = asset.toUpperCase();
  const currency = currencies.find(x => x.symbol?.toUpperCase?.() === upper) || currencies[0] || {};
  const ticker = tickers.find(x => String(x.symbol).toUpperCase().includes(upper)) || tickers[0] || {};
  const positiveNews = news.filter(x => /positive|bull|buy|growth/i.test(`${x.sentiment} ${x.title}`)).length;
  const negativeNews = news.filter(x => /negative|bear|sell|risk|outflow/i.test(`${x.sentiment} ${x.title}`)).length;
  const latestFlow = etfHistory.at?.(-1)?.netInflow || etfs.reduce((sum, x) => sum + toNum(x.netInflow), 0);
  const flowScore = clamp(50 + Math.sign(latestFlow) * Math.min(28, Math.abs(latestFlow) / 8_000_000));
  const priceChange = toNum(ticker.change24h || currency.change24h);
  const momentumScore = clamp(50 + priceChange * 6);
  const newsScore = clamp(50 + positiveNews * 9 - negativeNews * 11);
  const liquidityScore = clamp(40 + Math.log10(Math.max(1, toNum(ticker.volume24h))) * 6);
  const score = Math.round(flowScore * 0.34 + momentumScore * 0.26 + newsScore * 0.24 + liquidityScore * 0.16);
  const action = score >= 68 ? 'ACCUMULATE' : score <= 42 ? 'DE-RISK' : 'WATCH';
  const confidence = score >= 75 || score <= 30 ? 'high' : score >= 60 || score <= 45 ? 'medium' : 'low';
  const side = action === 'ACCUMULATE' ? 'buy' : action === 'DE-RISK' ? 'sell' : 'hold';

  return {
    asset: upper,
    action,
    side,
    score,
    confidence,
    timestamp: new Date().toISOString(),
    components: { flowScore: Math.round(flowScore), momentumScore: Math.round(momentumScore), newsScore: Math.round(newsScore), liquidityScore: Math.round(liquidityScore) },
    metrics: { latestFlow, priceChange, volume24h: ticker.volume24h || 0, last: ticker.last || currency.price || 0 },
    rationale: [
      `ETF/flow pressure contributes ${Math.round(flowScore)}/100 based on latest net flow.`,
      `SoDEX momentum contributes ${Math.round(momentumScore)}/100 from 24h change of ${priceChange.toFixed(2)}%.`,
      `News radar contributes ${Math.round(newsScore)}/100 from ${positiveNews} positive and ${negativeNews} negative items.`,
      `Liquidity contributes ${Math.round(liquidityScore)}/100 from available market volume.`
    ],
    suggestedOrder: side === 'hold' ? null : {
      symbol: `v${upper}_vUSDC`,
      side,
      orderType: 'market',
      quantity: upper === 'BTC' ? '0.002' : upper === 'ETH' ? '0.05' : '1',
      price: ticker.last || currency.price || 0,
      risk: 'Paper trade; cap size at <2% portfolio NAV for demo.'
    }
  };
}
