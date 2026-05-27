import { config, redact } from '../src/core/env.js';
import { sodexClient } from '../src/clients/sodex.js';
import { deriveAddress } from '../src/clients/sodexSigning.js';

export default async function handler() {
  const cfg = config().sodex;
  const client = sodexClient(cfg);
  const preview = await client.signingPreview({ market: 'perps', symbolID: 1, side: 'buy', orderType: 'market', quantity: '0.001' });
  const derived = cfg.apiPrivateKey ? await deriveAddress(cfg.apiPrivateKey).catch(error => ({ error: error.message })) : null;
  const derivedAddress = typeof derived === 'string' ? derived : '';
  return {
    ok: true,
    network: cfg.network,
    apiKeyName: cfg.apiKeyName || '',
    apiPublicKey: cfg.apiPublicKey || '',
    apiPrivateKeyConfigured: Boolean(cfg.apiPrivateKey),
    apiPrivateKeyRedacted: redact(cfg.apiPrivateKey),
    derivedAddress,
    publicKeyMatches: derivedAddress && cfg.apiPublicKey ? derivedAddress.toLowerCase() === cfg.apiPublicKey.toLowerCase() : null,
    liveTrading: cfg.liveTrading,
    signingPreview: preview
  };
}
