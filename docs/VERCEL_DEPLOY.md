# Deploy SoDEX SignalOS on Vercel

SoDEX SignalOS is Vercel-ready with static files in `public/` and API serverless functions in `api/`.

## Required environment variables

Set these in Vercel Project Settings > Environment Variables:

```env
NODE_ENV=production
MOCK_MODE=false
SOSOVALUE_API_KEY=your_sosovalue_key
SODEX_NETWORK=testnet
SODEX_API_KEY_NAME=SODEX_API_KEY
SODEX_API_PUBLIC_KEY=your_sodex_public_key
SODEX_API_PRIVATE_KEY=your_sodex_private_key
SODEX_LIVE_TRADING=false
```

Keep `SODEX_LIVE_TRADING=false` for judging/demo safety. Use testnet before any mainnet execution.

## Vercel settings

- Framework Preset: Other
- Build Command: `npm run build`
- Output Directory: leave empty
- Install Command: `npm install`

## Health checks after deploy

Open these URLs after deployment:

- `/api/status`
- `/api/sodex?resource=tickers&market=perps`
- `/api/sosovalue?resource=currencies`
- `/api/sodex-signing-check`

The UI should show SoDEX healthy and SoSoValue healthy once the API key is valid.
