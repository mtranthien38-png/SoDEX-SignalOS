import crypto from 'node:crypto';

export const SODEX_CHAIN_IDS = Object.freeze({
  mainnet: 286623,
  testnet: 138565
});

export const SODEX_DOMAIN_NAMES = Object.freeze({
  spot: 'spot',
  perps: 'futures'
});

export const ZERO_VERIFYING_CONTRACT = '0x0000000000000000000000000000000000000000';

export function compactJson(value) {
  return JSON.stringify(value);
}

export function buildSodexTypedData({ network = 'testnet', market = 'perps', payloadHash, nonce }) {
  const normalizedNetwork = network === 'mainnet' ? 'mainnet' : 'testnet';
  const normalizedMarket = market === 'spot' ? 'spot' : 'perps';
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      ExchangeAction: [
        { name: 'payloadHash', type: 'bytes32' },
        { name: 'nonce', type: 'uint64' }
      ]
    },
    domain: {
      name: SODEX_DOMAIN_NAMES[normalizedMarket],
      version: '1',
      chainId: SODEX_CHAIN_IDS[normalizedNetwork],
      verifyingContract: ZERO_VERIFYING_CONTRACT
    },
    primaryType: 'ExchangeAction',
    message: { payloadHash, nonce }
  };
}

export function pseudoPayloadHash(payload) {
  // Deterministic preview only. SoDEX requires Keccak256(JSON.stringify(payload)) for live signing.
  return `0x${crypto.createHash('sha256').update(compactJson(payload)).digest('hex')}`;
}

async function getEthers() {
  try {
    return await import('ethers');
  } catch {
    return null;
  }
}

export function normalizePrivateKey(value = '') {
  const key = String(value).trim();
  if (!key) return '';
  return key.startsWith('0x') ? key : `0x${key}`;
}

export async function deriveAddress(privateKey) {
  const ethers = await getEthers();
  if (!ethers || !privateKey) return null;
  const wallet = new ethers.Wallet(normalizePrivateKey(privateKey));
  return wallet.address;
}

export async function keccakPayloadHash(payload) {
  const ethers = await getEthers();
  if (!ethers) return null;
  return ethers.keccak256(ethers.toUtf8Bytes(compactJson(payload)));
}

export async function signSodexAction({ cfg, market = 'perps', actionType = 'newOrder', params = {}, nonce = Date.now() }) {
  const ethers = await getEthers();
  if (!ethers) {
    return { ok: false, error: 'Missing dependency: run npm install to install ethers before live signing.' };
  }
  const privateKey = normalizePrivateKey(cfg.apiPrivateKey || '');
  if (!privateKey) return { ok: false, error: 'SODEX_API_PRIVATE_KEY is missing.' };
  const payload = { type: actionType, params };
  const payloadHash = await keccakPayloadHash(payload);
  const typedData = buildSodexTypedData({ network: cfg.network, market, payloadHash, nonce });
  const wallet = new ethers.Wallet(privateKey);
  const { EIP712Domain, ...typesWithoutDomain } = typedData.types;
  const rawSignature = await wallet.signTypedData(typedData.domain, typesWithoutDomain, typedData.message);
  return {
    ok: true,
    signerAddress: wallet.address,
    payloadHash,
    compactPayload: compactJson(payload),
    nonce,
    typedData,
    signature: `0x01${rawSignature.slice(2)}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-Key': cfg.apiKeyName,
      'X-API-Sign': `0x01${rawSignature.slice(2)}`,
      'X-API-Nonce': String(nonce)
    },
    body: params
  };
}

export async function buildSigningPreview({ cfg, market = 'perps', actionType = 'newOrder', params = {} }) {
  const nonce = Date.now();
  const payload = { type: actionType, params };
  const livePayloadHash = await keccakPayloadHash(payload);
  const payloadHashPreview = livePayloadHash || pseudoPayloadHash(payload);
  const signerAddress = cfg.apiPrivateKey ? await deriveAddress(cfg.apiPrivateKey).catch(() => null) : null;
  const publicKeyMatches = signerAddress && cfg.apiPublicKey
    ? signerAddress.toLowerCase() === String(cfg.apiPublicKey).toLowerCase()
    : null;
  return {
    liveReady: Boolean(livePayloadHash && cfg.apiPrivateKey && cfg.apiKeyName && cfg.accountId),
    reason: livePayloadHash
      ? 'Keccak256 + EIP-712 typed-data path is available. Keep live order execution disabled until you intentionally enable it.'
      : 'Preview only. Install dependencies with npm install to enable ethers-based Keccak256 and EIP-712 signing.',
    signerAddress,
    configuredPublicKey: cfg.apiPublicKey || '',
    publicKeyMatches,
    docsRules: [
      'Public market-data endpoints are unsigned.',
      'Signed REST writes require X-API-Key, X-API-Sign and X-API-Nonce.',
      'X-API-Key is the API key name, not an EVM address or secret.',
      'Use domain name spot for spot actions and futures for perps actions.',
      'Use chainId 286623 on mainnet and 138565 on testnet.',
      'Use Keccak256(JSON.stringify({ type, params })) as payloadHash.',
      'Prepend 0x01 to the 65-byte EIP-712 signature.',
      'Manage nonces monotonically per signing address.'
    ],
    headersShape: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-Key': cfg.apiKeyName || '<api-key-name>',
      'X-API-Sign': '0x01<65-byte-eip712-signature>',
      'X-API-Nonce': nonce
    },
    typedDataPreview: buildSodexTypedData({ network: cfg.network, market, payloadHash: payloadHashPreview, nonce }),
    payload
  };
}
