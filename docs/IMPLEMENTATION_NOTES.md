# Implementation notes

## References used

- SoDEX official API overview: REST endpoints are split into spot and perps for mainnet/testnet. The docs also specify API-key terminology, nonce rules, and EIP-712 signing requirements.
- SoSoValue API pattern: server-side calls use the `openapi.sosovalue.com/openapi/v1` base and endpoints commonly used in Wave projects: currencies, featured news, ETFs, and ETF summary history.

## Judging criteria mapping

1. User value: a single operator can monitor, explain, and act on market opportunities.
2. Functionality: health checks, normalized data cards, charting, signal score, and order simulation.
3. Logic workflow: data ingestion → normalization → scoring → rationale → guarded execution.
4. Data/API integration: all API calls go through server routes, not browser secrets.
5. UX: responsive, high-contrast, trading-desk inspired UI.

## Live-trading boundary

Trading actions on SoDEX require typed signatures and robust nonce management. The repository therefore ships with a paper engine and a live-trading guard. This is intentional: the demo is safe for judges while leaving a clean adapter seam for audited signing code.
