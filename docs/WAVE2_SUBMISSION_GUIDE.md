# Wave 2 Submission Guide

## 60-second demo flow

1. Open the dashboard and show the health panel.
2. Explain the business: a solo on-chain finance operator can monitor markets, publish research, run alerts and prepare guarded orders.
3. Refresh SoDEX market tape and SoSoValue news / ETF flow.
4. Run Alpha Agent.
5. Show the reasoning trace and component scores.
6. Submit the suggested paper order and point out that live trading is blocked unless an audited EIP-712 signing adapter is added.

## Judging checklist

| Wave 2 criterion | Where it appears |
| --- | --- |
| User value & practical impact | Dashboard + pitch cards + demo-proof route |
| Functionality & working demo | API routes, charts, signal agent, execution terminal |
| Logic workflow & product design | Reasoning trace and `src/engine/signal.js` |
| Data / API integration | `src/clients/sosovalue.js`, `src/clients/sodex.js`, `/api/status` |
| UX & clarity | Dark trading UI, status labels, fallback labels, order guard |

## API safety statement

SoDEX live trading requires typed signatures, key-name headers, signature headers and nonce management. This project therefore demonstrates the full order-preparation workflow in paper mode by default and keeps all credentials server-side.
