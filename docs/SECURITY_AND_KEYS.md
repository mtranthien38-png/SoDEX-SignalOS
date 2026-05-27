# Security and key handling

Your screenshots include a SoDEX API-key private key. Treat it as compromised because it has been pasted into a chat/screenshot workflow.

Recommended action before live testing:

1. Revoke the exposed SoDEX API key in SoDEX.
2. Create a fresh SoDEX API key pair.
3. Store the new private key only in `.env` or your deployment secret manager.
4. Never commit `.env`, screenshots, terminal dumps, or private keys.
5. Keep `SODEX_LIVE_TRADING=false` for Wave 2 judging unless you intentionally want real testnet execution.

This project never stores real keys in the zip. Use `.env.example` as a template and paste secrets locally only.

## SoDEX mapping

- `SODEX_API_KEY_NAME`: the name shown in the SoDEX dashboard, e.g. `SODEX_API_KEY`.
- `SODEX_API_PUBLIC_KEY`: the EVM address registered for that API key.
- `SODEX_API_PRIVATE_KEY`: the local signing key matching the registered public key.
- `SODEX_USER_ADDRESS`: your master/user wallet address for account-state reads.
- `SODEX_ACCOUNT_ID`: numeric account ID returned by the SoDEX account-state endpoint.

Use `/api/sodex-signing-check` after filling `.env` to verify that the private key derives to the configured public key.
