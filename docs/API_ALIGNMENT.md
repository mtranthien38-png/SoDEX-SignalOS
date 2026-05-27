# API alignment notes

## SoSoValue

The app keeps the SoSoValue API key on the server and never exposes it in the browser. The adapter is deliberately defensive because SoSoValue response envelopes can vary by resource. It normalizes currencies, market/news items, ETFs, and ETF-history-like time series into one signal engine input.

Configured variables:

```bash
SOSOVALUE_API_KEY=...
SOSOVALUE_BASE_URL=https://openapi.sosovalue.com/openapi/v1
```

Routes used by the app:

- `GET /api/sosovalue?resource=currencies`
- `GET /api/sosovalue?resource=news`
- `GET /api/sosovalue?resource=etfs&symbol=BTC`
- `GET /api/sosovalue?resource=etf-history&symbol=BTC`

If the live endpoint or API key fails, the UI clearly marks fallback mode and keeps a full demo available for judging.

## SoDEX

The SoDEX integration follows the official API docs structure:

- Mainnet REST: `https://mainnet-gw.sodex.dev/api/v1/spot` and `https://mainnet-gw.sodex.dev/api/v1/perps`
- Testnet REST: `https://testnet-gw.sodex.dev/api/v1/spot` and `https://testnet-gw.sodex.dev/api/v1/perps`
- Public market-data endpoints are unsigned.
- Signed writes require `X-API-Key`, `X-API-Sign`, and `X-API-Nonce`.
- `X-API-Key` is the API key name, not an EVM address, public key, private key, or bearer token.
- Trading action domain name is `spot` for spot and `futures` for perps.
- Chain ID is `286623` on mainnet and `138565` on testnet.
- SoDEX signatures are EIP-712 typed signatures with `0x01` prepended to the 65-byte signature.
- Nonces must be unique and managed per signing address.

The project therefore uses paper trading by default and exposes `/api/sodex-docs` to show the exact signing shape expected before a live adapter is audited.

Configured variables:

```bash
SODEX_NETWORK=testnet
SODEX_API_KEY_NAME=api-key-01
SODEX_ACCOUNT_ID=...
SODEX_USER_ADDRESS=0x...
SODEX_LIVE_TRADING=false
```

Routes used by the app:

- `GET /api/sodex?market=perps&resource=tickers`
- `GET /api/sodex?market=spot&resource=symbols`
- `GET /api/sodex?resource=state`
- `GET /api/sodex-docs?market=perps`
- `POST /api/order` for guarded paper/live order preview
