import { config } from '../src/core/env.js';

export default async function handler() {
  const cfg = config();
  return {
    ok: true,
    wave2: {
      practicalImpact: 'One-person crypto research, alerting, paper trading and client reporting workflow.',
      functionality: ['SoSoValue data adapter', 'SoDEX market adapter', 'alpha signal engine', 'guarded order terminal', 'health checks', 'fallback demo mode'],
      logicWorkflow: 'SoSoValue market/news/ETF inputs -> normalized evidence -> weighted signal -> SoDEX market validation -> paper order preview.',
      dataApiIntegration: {
        sosovalue: 'Server-side key only; supports currencies, news, ETFs, ETF history with cache/fallback.',
        sodex: `Uses ${cfg.sodex.network} spot/perps REST endpoints; live order is blocked until audited EIP-712 signer is wired.`
      },
      uxClarity: 'Dashboard exposes data source, fallback mode, signal components, rationale, and paper/live guard.'
    }
  };
}
