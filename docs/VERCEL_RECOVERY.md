# PlantDoc AI — Vercel recovery

## Deployment
- Vercel framework: Vite with output dist.
- Existing React frontend is built by npm run build.
- Node Vercel Function api/plant/[action].ts delegates to the real existing Express router.
- Existing endpoints: POST /api/plant/analyze (multipart image), POST /api/plant/chat (JSON message, history), POST /api/plant/voice (multipart audio).
- Public AI features need OPENAI_API_KEY, configured as an encrypted/sensitive Vercel environment variable in Project Settings. Do not place it in git or browser JS.
- No key means UI loads but AI routes return HTTP 503. No fake AI answers or leaked secrets.
- FormData uploads should fit below Vercel request-body limits (4 MB cap in multer).
- A best-effort per-instance burst limit does not enforce a persistent cross-instance budget. Enable Vercel Firewall rate limiting and provider-side spending limits for public deployments.

## Health / tests
- npm ci, npm run build, npm run lint, audit dependencies.
- Preview: verify HTML and static assets, JSON POST to chat returns 503 if no key.
- With an encrypted key added: test chat, image, and voice with small synthetic fixtures.
- Security: do not store keys in files or frontend. Avoid exposing usage to anonymous traffic without firewall/budget limits.

## Scope
Recovery only; original frontend design and original AI prompts unchanged.
Legacy api/chat.ts removed because it duplicated logic and accepted unbounded raw history; frontend uses /api/plant/chat.
