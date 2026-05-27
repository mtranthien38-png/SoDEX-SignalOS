import { fetchJson } from '../core/http.js';
import { mockCurrencies, mockNews, mockEtfs, mockEtfHistory } from '../core/mock.js';

const endpointMap = {
  currencies: '/currencies',
  news: '/news/featured',
  hotNews: '/news/hot',
  etfs: '/etfs',
  etfHistory: '/etfs/summary-history'
};

function headers(key) {
  const h = { accept: 'application/json' };
  if (key) {
    h.Authorization = `Bearer ${key}`;
    h['x-api-key'] = key;
  }
  return h;
}

function unwrap(payload) {
  const data = payload?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload)) return payload;
  return data || payload;
}

export function normalizeNews(item) {
  const ml = item?.multilanguageContent?.[0] || item?.multiLanguageContent?.[0] || {};
  return {
    title: item.title || ml.title || item.name || 'Untitled market update',
    source: item.source || item.sourceName || 'SoSoValue',
    sentiment: item.sentiment || item.sentimentLabel || 'neutral',
    publishedAt: item.publishedAt || item.publishTime || item.createTime || new Date().toISOString(),
    url: item.url || item.sourceLink || item.link || 'https://sosovalue.com'
  };
}

export function normalizeCurrency(item) {
  return {
    symbol: item.symbol || item.currencySymbol || item.baseCurrency || item.name || 'N/A',
    name: item.name || item.fullName || item.symbol || 'Unknown asset',
    price: Number(item.price || item.currentPrice || item.close || 0),
    change24h: Number(item.change24h || item.priceChangePercentage24h || item.changePercent || 0),
    sector: item.sector || item.category || 'crypto'
  };
}

export function normalizeEtf(item) {
  return {
    ticker: item.ticker || item.symbol || item.instName || 'ETF',
    symbol: item.assetSymbol || item.currencySymbol || item.symbol || 'BTC',
    netInflow: Number(item.netInflow || item.netFlow || item.dailyNetInflow || 0),
    aum: Number(item.aum || item.totalAssets || item.netAssets || 0)
  };
}

export function sosovalueClient(cfg) {
  const base = cfg.baseUrl.replace(/\/$/, '');
  const live = Boolean(cfg.key) && !cfg.mockMode;

  async function get(resource, params = {}) {
    const fallbackByResource = {
      currencies: mockCurrencies,
      news: mockNews,
      hotNews: mockNews,
      etfs: mockEtfs,
      etfHistory: mockEtfHistory
    };
    if (!endpointMap[resource]) throw new Error(`Unknown SoSoValue resource: ${resource}`);
    if (!live) return { ok: false, fallback: true, data: fallbackByResource[resource], source: 'mock:sosovalue' };

    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== '') query.set(key, value);
    const url = `${base}${endpointMap[resource]}${query.size ? `?${query}` : ''}`;
    const result = await fetchJson(url, {
      headers: headers(cfg.key),
      ttlMs: resource === 'news' ? 5 * 60_000 : 30 * 60_000,
      fallback: fallbackByResource[resource]
    });
    return result;
  }

  return {
    async currencies() {
      const result = await get('currencies');
      result.data = Array.isArray(result.data) ? result.data.map(normalizeCurrency) : unwrap(result.data).map?.(normalizeCurrency) || mockCurrencies;
      return result;
    },
    async news() {
      let result = await get('news');
      const list = unwrap(result.data);
      if (!Array.isArray(list) || list.length === 0) result = await get('hotNews');
      const finalList = unwrap(result.data);
      result.data = Array.isArray(finalList) ? finalList.map(normalizeNews) : mockNews;
      return result;
    },
    async etfs(symbol = 'BTC') {
      const result = await get('etfs', { symbol, country_code: 'US' });
      const list = unwrap(result.data);
      result.data = Array.isArray(list) ? list.map(normalizeEtf) : mockEtfs.filter(x => x.symbol === symbol);
      return result;
    },
    async etfHistory(symbol = 'BTC') {
      const result = await get('etfHistory', { symbol, country_code: 'US' });
      const list = unwrap(result.data);
      result.data = Array.isArray(list) ? list.map((x, i) => ({
        date: x.date || x.time || x.timestamp || new Date(Date.now() - (13 - i) * 86400e3).toISOString().slice(0, 10),
        netInflow: Number(x.netInflow || x.net_flow || x.totalNetInflow || x.value || 0),
        totalAssets: Number(x.totalAssets || x.aum || x.total_assets || 0)
      })) : mockEtfHistory;
      return result;
    }
  };
}
