export const mockCurrencies = [
  { symbol: 'BTC', name: 'Bitcoin', price: 108240, change24h: 1.84, sector: 'store-of-value' },
  { symbol: 'ETH', name: 'Ethereum', price: 4680, change24h: 2.27, sector: 'smart-contracts' },
  { symbol: 'SOL', name: 'Solana', price: 214.6, change24h: -0.72, sector: 'high-beta' },
  { symbol: 'SOSO', name: 'SoSoValue', price: 0.37, change24h: 4.12, sector: 'valuechain' }
];

export const mockNews = [
  { title: 'US spot BTC ETF flow turns positive for the third session', source: 'SoSoValue demo', sentiment: 'positive', publishedAt: new Date().toISOString(), url: 'https://sosovalue.com' },
  { title: 'Macro desk watches liquidity into digital asset beta', source: 'SoSoValue demo', sentiment: 'neutral', publishedAt: new Date(Date.now() - 3600e3).toISOString(), url: 'https://sosovalue.com' },
  { title: 'ValueChain builders ship agentic execution workflows', source: 'SoDEX demo', sentiment: 'positive', publishedAt: new Date(Date.now() - 7200e3).toISOString(), url: 'https://sodex.com' }
];

export const mockEtfs = [
  { ticker: 'IBIT', symbol: 'BTC', netInflow: 182_000_000, aum: 28_400_000_000 },
  { ticker: 'FBTC', symbol: 'BTC', netInflow: 74_000_000, aum: 13_100_000_000 },
  { ticker: 'ETHA', symbol: 'ETH', netInflow: 42_000_000, aum: 6_700_000_000 }
];

export const mockEtfHistory = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 86400e3).toISOString().slice(0, 10),
  netInflow: Math.round((Math.sin(i / 1.9) * 80 + 120 + i * 6) * 1_000_000),
  totalAssets: Math.round((72 + i * 0.9) * 1_000_000_000)
}));

export const mockTickers = [
  { symbol: 'vBTC_vUSDC', last: '108240', change24h: '1.84', volume24h: '92400000', bid: '108231', ask: '108252' },
  { symbol: 'vETH_vUSDC', last: '4680', change24h: '2.27', volume24h: '46800000', bid: '4678', ask: '4683' },
  { symbol: 'vSOL_vUSDC', last: '214.6', change24h: '-0.72', volume24h: '11800000', bid: '214.4', ask: '214.9' },
  { symbol: 'vSOSO_vUSDC', last: '0.37', change24h: '4.12', volume24h: '740000', bid: '0.369', ask: '0.371' }
];
