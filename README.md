# n8n-nodes-claix

Community node for [n8n](https://n8n.io) that integrates [Claix](https://www.claix.dev) document extraction without configuring generic HTTP Request nodes.

Aligned with the public [OpenAPI spec](https://www.claix.dev/openapi.yaml) and [API documentation](https://www.claix.dev/documentation).

## Installation

In n8n, open **Settings → Community nodes → Install**, then enter:

```
n8n-nodes-claix
```

Or link locally during development:

```bash
cd n8n-nodes-claix
npm install
npm run build
npm link
# In your n8n custom nodes directory:
npm link n8n-nodes-claix
```

## Credentials

Create a **Claix API** credential with your secret API key from the Claix dashboard.

Requests use the recommended header from the documentation:

```
x-api-key: <TU_API_KEY>
```

(`Authorization: Bearer <TU_API_KEY>` is also supported by the API, but this node sends `x-api-key`.)

## Operations (Resource: Documento)

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Extraer PDF a JSON | POST | `https://www.claix.dev/api/pdf-json` |
| Extraer documento a JSON | POST | `https://www.claix.dev/api/doc-json` |
| Extraer Excel a JSON | POST | `https://www.claix.dev/api/excel-json` |

All operations send `multipart/form-data` with:

- `file` — binary document (PDF, .docx/.txt/.md/.rtf, or .xlsx/.csv)
- `schema_id` — UUID of your Claix schema

### Parameters

- **Schema ID** — UUID of your Claix schema (required)
- **Input Binary Field** — binary property name on the incoming item (default: `data`)

## Publish to npm

### 1. Install dependencies and build

```bash
cd n8n-nodes-claix
npm install
npm run build
npm pack --dry-run   # must list dist/credentials/ and dist/nodes/
```

### 2. Publish (recommended: Granular Access Token)

npm often rejects `npm publish --otp=...` even with 2FA enabled, because the CLI session token is not elevated for publishing. The most reliable method:

1. Open [npmjs.com → Access Tokens](https://www.npmjs.com/settings/~your-user/tokens) → **Generate New Token** → **Granular Access Token**.
2. Permissions: **Read and Write**.
3. Enable **Bypass 2FA** (only for publish automation).
4. Packages: **All packages** (first publish) or scope to `n8n-nodes-claix`.
5. Copy the token (`npm_...`).

Then in PowerShell:

```powershell
cd n8n-nodes-claix
npm logout
npm config set //registry.npmjs.org/:_authToken npm_PEGAR_TU_TOKEN_AQUI
npm publish --access public
```

After publishing, remove the token from the global config:

```powershell
npm config delete //registry.npmjs.org/:_authToken
```

### 3. Alternative: interactive 2FA (6-digit code)

Only works if 2FA mode is **Authorization and publishing** (not “authorization only”):

1. [npmjs.com → Account](https://www.npmjs.com/) → enable 2FA → mode **Authorization and publishing**.
2. `npm logout` then `npm login` (complete 2FA in browser).
3. Publish with the **6-digit** code from your authenticator app (not backup codes):

```powershell
npm publish --access public --otp=123456
```

### Troubleshooting `403 Forbidden`

| Cause | Fix |
|-------|-----|
| OTP has 8+ digits | Use 6-digit TOTP from Google Authenticator / Authy |
| Session token without publish elevation | Use Granular Access Token (section 2) |
| 2FA mode “authorization only” | Change to “authorization and publishing” on npmjs.com |
| `--ignore-scripts` | Never use it — publishes empty package without `dist/` |

Do **not** share OTP codes or tokens in chat or commit them to git.

## Development

```bash
npm install
npm run build
npm run dev   # hot reload against local n8n
npm run lint
```

Built with [@n8n/node-cli](https://www.npmjs.com/package/@n8n/node-cli) following the [n8n community nodes guide](https://docs.n8n.io/integrations/community-nodes/building-community-nodes/).

## License

MIT
