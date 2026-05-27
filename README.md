# SoDEX SignalOS — Wave 2

## Product name

**SoDEX SignalOS** — an operating system for turning SoSoValue intelligence into safer SoDEX execution workflows.

SoDEX SignalOS is a polished one-person on-chain finance operating system for the SoSoValue + SoDEX WaveHack. It combines SoSoValue market/news/ETF intelligence with SoDEX spot/perps market data, signal reasoning, risk guardrails and a guarded paper-execution terminal.

## What it shows judges

- **SoSoValue integration**: currencies, featured news, ETF list, ETF summary-history with cache and graceful fallback.
- **SoDEX integration**: testnet/mainnet spot and perps market data using official `mainnet-gw.sodex.dev` / `testnet-gw.sodex.dev` endpoints.
- **Agent workflow**: converts market, ETF and news signals into a transparent score, rationale, and paper order.
- **Safety by design**: no API keys in browser, live trading is disabled unless `SODEX_LIVE_TRADING=true`; the UI clearly labels paper mode.
- **Deployable static + server API**: dependency-free Node 20 project, easy to deploy or demo locally.

## Quick start

```bash
cp .env.example .env
# Add SOSOVALUE_API_KEY and SoDEX settings
npm start
# open http://localhost:8787
```

## Required environment variables

| Variable | Purpose |
| --- | --- |
| `SOSOVALUE_API_KEY` | Server-side SoSoValue API bearer/header key. |
| `SOSOVALUE_BASE_URL` | Defaults to `https://openapi.sosovalue.com/openapi/v1`. |
| `SODEX_NETWORK` | `testnet` or `mainnet`. |
| `SODEX_SPOT_BASE_URL` | Spot REST base URL. |
| `SODEX_PERPS_BASE_URL` | Perps REST base URL. |
| `SODEX_API_KEY_NAME` | SoDEX API key *name* used for signing workflows. |
| `SODEX_ACCOUNT_ID` | Optional SoDEX account ID. |
| `SODEX_USER_ADDRESS` | Wallet address used to query state where supported. |
| `SODEX_LIVE_TRADING` | Must stay `false` for safe demo / paper mode. |

## API routes

- `GET /api/status` — environment and API health summary.
- `GET /api/sosovalue?resource=currencies|news|etfs|etf-history&symbol=BTC`.
- `GET /api/sodex?market=spot|perps&resource=tickers|symbols|mark-prices|state`.
- `POST /api/signal` — combined SoSoValue + SoDEX alpha score.
- `POST /api/order` — validates input and paper-executes by default; live trading guard blocks accidental real orders.
- `GET /api/demo-proof` — compact Wave 2 judging checklist for demos.

## Safety note

SoDEX docs specify that `X-API-Key` carries the API key **name**, not a secret or public key, and trading actions require typed signatures. This project keeps private keys out of the repository and defaults to paper execution.


## Wave 2 positioning

This build is designed around the Wave 2 message: SoSoValue is the brain, SoDEX is the hands. The product converts intelligence into a safer execution workflow: research signals, market validation, clear rationale, and guarded paper orders.

## Exact API-doc alignment added

This build now includes `docs/API_ALIGNMENT.md` and `/api/sodex-docs` so judges can see that the SoDEX integration follows the official docs: spot/perps endpoints, API-key-name header, EIP-712 typed-data domain, chain IDs, nonce rule, and `0x01` signature prefix. Live trading remains blocked until real key storage, keccak256 hashing, signature generation, and nonce management are audited.
