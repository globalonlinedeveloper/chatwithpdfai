# CHATWITHPDFAI.COM — Product Requirements

> **Living document.** Updated every time we ship or defer something. Last updated 2026-05-28.
>
> This is the single source of truth for what the product is, what's built, and what's next.

---

## Vision

A **pay-per-document** AI chat product for PDFs. Drop a PDF, ask anything, get cited answers in seconds. No subscription, credits never expire. Built India-first (Razorpay, INR pricing), expanding globally later.

**Tagline:** "Read every PDF at light speed."

### Core promises to the user
- Cited answers (every claim traces back to source pages)
- OCR for bad scans (works on photos, scans, handwritten docs)
- Multi-PDF chat (compare contracts, cross-reference research)
- 70+ languages
- Pay-per-document credit packs — no subscription, credits never expire
- 30-day refund on unused credits
- SOC 2 / HIPAA-aligned / GDPR-compliant posture (claimed in copy, must back up before scale)

---

## Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | Static HTML + in-browser React (via Babel `text/babel`) | Already built as 91-page mockup; preserved as-is in `/public` |
| Server framework | Next.js 14.2.5 (App Router) | Required by Hostinger's Node.js hosting; wraps the static site |
| Hosting | Hostinger Premium Web (Node.js plan) | Per user's existing setup |
| Database | MariaDB 11.8.6 (Hostinger shared MySQL) | `u692382124_chatwithpdfai` on `127.0.0.1:3306` |
| Repo | GitHub (public): `localuser3792921-blip/chatwithpdfai` | Auto-deploy on push to `main` |
| Email | Hostinger SMTP via Nodemailer | `support@chatwithpdfai.com` mailbox |
| Payment | **Razorpay** (deferred) | India-first, UPI/netbanking native, INR |
| Auth | Custom bcrypt + session cookies (deferred) | No third-party dependency |
| AI / LLM | **Smart router across OpenAI + Anthropic + Gemini** | Routes per request to cheapest capable model; max profit margin |
| Embedding model | OpenAI `text-embedding-3-small` (1536-dim, $0.02/M tokens) | Cheapest mainstream; good quality |
| Vector store | **MariaDB 11.8 native `VECTOR` type + `VEC_DISTANCE_COSINE`** | No external service; confirmed working on Hostinger MariaDB 11.8.6 |
| File storage | **Hostinger disk** (7 TB available with current plan) | PDF binaries on disk; metadata + embeddings in MySQL |
| OCR | Tesseract first-pass, vision LLM (Gemini Pro) fallback | Free local OCR for clean scans; LLM for hard cases |

---

## Current state — what's actually shipped

| Component | Status | Notes |
| --- | --- | --- |
| Static marketing/help/blog/legal pages (117 HTML files) | ✅ Live | All in `/public`, served by Next.js |
| GitHub repo + auto-deploy webhook | ✅ Live | `git push main` → live in ~60s |
| Hostinger Node.js app | ✅ Live | https://chatwithpdfai.com |
| HTTPS + security headers | ✅ Live | HSTS, X-Frame-Options, etc. |
| Clean URLs (`/pricing` → `/pricing.html`) | ✅ Live | Via `next.config.js` rewrites |
| `contact_submissions` table + `/api/contact` | ✅ Live | Honeypot, rate-limit 5/10min/IP, email notify |
| `waitlist_signups` table + `/api/waitlist` | ✅ Live | Idempotent on duplicate email |
| Contact form on `contact.html` | ✅ Wired | Posts to `/api/contact`, shows success/error |
| MySQL connection pool (`lib/db.js`) | ✅ | Shared across all API routes |
| SMTP sender (`lib/email.js`) | ✅ | Nodemailer via Hostinger SMTP |
| Input validation (`lib/validate.js`) | ✅ | Email, topic, IP extraction |
| Env vars in hPanel | ✅ | Persistent across deploys |
| `users` + `sessions` tables (schema only) | ✅ Created | Idle until auth phase resumes |
| SSH key auth from Claude sandbox | ✅ | `~/.cowork-private/hostinger_id_ed25519` |
| Operational docs (`.cowork-private/OPERATIONS.md`) | ✅ | Server paths, gotchas, credentials reference |

---

## Roadmap

Phases are ordered by user's directive: **product features first, auth + payment last.**

### 🟦 Phase 1 — Product MVP (build now)
The actual chat-with-PDF product. Build behind a feature flag so we can test without exposing publicly until auth+payment land.

| Feature | Status | Notes |
| --- | --- | --- |
| PDF upload endpoint | ⬜ Planned | Multipart POST → save to `~/domains/chatwithpdfai.com/uploads/<user_id>/<uuid>.pdf`; row in `pdf_documents` |
| PDF text extraction | ⬜ Planned | `pdf-parse` library; populate `pdf_pages.text` per page |
| OCR fallback for scanned pages | ⬜ Planned | Tesseract first; if confidence low → Gemini Pro Vision call |
| Per-page embeddings | ⬜ Planned | OpenAI `text-embedding-3-small`; store as `VECTOR(1536)` in `pdf_pages.embedding` |
| `lib/llm/router.js` smart routing | ⬜ Planned | Multi-provider with cost-based selection; see Architecture section |
| `llm_usage` cost tracking | ⬜ Planned | Every LLM call logged with provider/model/tokens/cost |
| AI chat (single PDF) | ⬜ Planned | RAG: top-k vector search → LLM call → cited response |
| Multi-PDF chat | ⬜ Planned | After single-PDF; combines pages from multiple `pdf_documents` |
| Citation linking | ⬜ Planned | Click answer → jump to source page in PDF viewer |
| Chat history persistence | ⬜ Planned | `chat_conversations` + `chat_messages` tables |
| Library / "my docs" view | ⬜ Planned | `library.html` mockup exists |
| Document viewer | ⬜ Planned | `document.html` mockup exists |
| Credit-cost preview before send | ⬜ Planned | UI shows "this query will use ~X credits" before user hits send |

### 🟨 Phase 2 — Operational features
Email templates, admin tools, monitoring.

| Feature | Status | Notes |
| --- | --- | --- |
| Welcome email template | ⬜ Planned | `emails/welcome.html` mockup exists |
| Receipt email template | ⬜ Planned | `emails/receipt.html` mockup exists |
| Digest email template | ⬜ Planned | `emails/digest.html` mockup exists |
| Deletion confirmation email | ⬜ Planned | `emails/deletion.html` mockup exists |
| Admin view for contact submissions | ⬜ Planned | Internal-only dashboard |
| Basic analytics (`analytics.html` mockup exists) | ⬜ Planned | Aggregate usage stats |

### 🟧 Phase 3 — Auth (deferred per user request 2026-05-28)
| Feature | Status | Notes |
| --- | --- | --- |
| `users` + `sessions` schema | ✅ Created | Idle, ready when implementation resumes |
| Signup + email verification | ⬜ Deferred | bcryptjs + nodemailer flow |
| Signin + session cookie | ⬜ Deferred | HTTP-only, secure cookies |
| Signout | ⬜ Deferred | Invalidate session token |
| Forgot password + reset | ⬜ Deferred | Token email + reset form |
| Account page | ⬜ Deferred | `account.html` mockup exists |
| Navigation reflects signed-in state | ⬜ Deferred | Server-side session check |

### 🟥 Phase 4 — Payment (deferred per user request 2026-05-28)
**Provider:** Razorpay (test mode → live mode)
**Currency:** INR only (India-first; international later)
**Model:** One-time credit pack purchases (not subscriptions)

| Tier | INR Price | Credits | Per-document |
| --- | --- | --- | --- |
| Reader | ₹399 | 50 | ₹7.98 |
| Practice | ₹999 | 200 | ₹4.99 |
| Chamber | ₹2,999 | 700 | ₹4.28 |
| Enterprise | ₹9,999 | 2,500 | ₹3.99 |

(Prices subject to user confirmation when Phase 4 starts.)

| Feature | Status | Notes |
| --- | --- | --- |
| `credit_packs` + `purchases` + `user_credits` schema | ⬜ Deferred | Designed, not created |
| Razorpay Orders API integration | ⬜ Deferred | Server creates order, returns `order_id` |
| Razorpay Checkout.js modal on pricing.html | ⬜ Deferred | Frontend |
| Signature verification on payment success | ⬜ Deferred | HMAC SHA256 |
| Webhook handler (`payment.captured`, refunds) | ⬜ Deferred | Idempotent processing |
| Receipt email after successful purchase | ⬜ Deferred | Uses `emails/receipt.html` |
| Credit balance display on `account.html` | ⬜ Deferred | After auth lands |
| Refund flow (30-day no-questions-asked) | ⬜ Deferred | Likely manual via Razorpay dashboard initially |

### 🟪 Phase 5 — Growth + scale
Stuff that matters after launch.

| Feature | Status | Notes |
| --- | --- | --- |
| SSO / SAML for Chamber tier | ⬜ Planned | `help/sso.html` mockup exists |
| Team accounts + shared credit pool | ⬜ Planned | Practice/Chamber tiers per copy |
| API for developers | ⬜ Planned | `docs.html`, `help/api-quickstart.html` exist |
| Browser extension | ⬜ Planned | `browser-extension.html` mockup exists |
| Public API rate limiting | ⬜ Planned | Per-key quotas |
| Audit logs | ⬜ Planned | Required for SOC 2 claim |
| Internationalization beyond India | ⬜ Planned | Multi-currency, Stripe for non-IN |

---

## Non-functional requirements

| Concern | Requirement | Current status |
| --- | --- | --- |
| Performance | First contentful paint < 1.5s | OK (static HTML, no SSR rendering work) |
| Uptime | 99.9% (Hostinger Premium SLA) | Inherited from hosting provider |
| Backups | Daily, ≥30 days retention | Hostinger handles (Boston, USA) |
| HTTPS | Forced via `next.config.js` headers + Hostinger | ✅ |
| Security headers | HSTS, XFO, XCTO, Referrer-Policy, Permissions-Policy | ✅ |
| Rate limiting | Per-IP on all public POST endpoints | ✅ (contact API only so far) |
| Logging | Application errors → console.log on server (not externalized yet) | Basic |
| Monitoring | None yet | ⬜ Add: uptime monitor, error tracking (Sentry?) |
| GDPR | Privacy policy + DPA + deletion flow | Pages exist; deletion flow not wired |

---

## Decisions made (with rationale)

| Date | Decision | Why |
| --- | --- | --- |
| 2026-05-28 | Static HTML wrapped in Next.js, not full React rewrite | Preserves 117-page design without rewriting; Hostinger Node.js requires a recognized framework |
| 2026-05-28 | MariaDB on Hostinger shared, not external DB | Free with hosting, low-latency from app, sufficient until traffic justifies move |
| 2026-05-28 | Razorpay over Stripe | India-only launch; better UPI/netbanking; INR native |
| 2026-05-28 | Custom bcrypt+sessions, not Auth0/Clerk | No third-party fee, no vendor lock-in, full control of user data |
| 2026-05-28 | Email-only checkout *rejected* — require signup first | Cleaner data model long-term; can't migrate anonymous purchases later cleanly |
| 2026-05-28 | One-time credit packs, not subscriptions | Matches existing copy ("no subscription, credits never expire") |
| 2026-05-28 | Auth + payment deferred to last | Build the actual product first; gate it with auth+payment at launch |
| 2026-05-28 | hPanel Environment Variables, not `.env` files on server | Hostinger wipes `.env` files on every deploy |
| 2026-05-28 | `outputFileTracingIncludes` in `next.config.js` for server deps | Hostinger prunes `node_modules` after build; explicit trace keeps mysql2/nodemailer/etc. |
| 2026-05-28 | Public GitHub repo | User chose; means no auth needed for Hostinger to pull on deploy |
| 2026-05-28 | LLM = smart router across OpenAI + Anthropic + Gemini | Maximize profit by routing each query to cheapest capable provider; user explicitly asked for "always maintain maximum profits percentage" |
| 2026-05-28 | Embedding = OpenAI `text-embedding-3-small` | Cheapest mainstream model with good quality; ~₹0.04 per 50-page PDF |
| 2026-05-28 | Vector store = MariaDB 11.8 native `VECTOR` type | No external service needed; confirmed `VEC_DISTANCE_*` functions work on Hostinger's 11.8.6 |
| 2026-05-28 | File storage = Hostinger disk (PDFs); MySQL (metadata + embeddings) | PDF binaries are too large for MySQL BLOB; Hostinger 7TB disk is free with plan |
| 2026-05-28 | OCR = Tesseract first-pass, Gemini Pro Vision fallback | Free OCR for clean scans; LLM for hard cases (keeps margin) |
| 2026-05-28 | Embedding chunking = per-page (one embedding per page) | Simpler implementation; trivial citation; long pages split with shared page_number |
| 2026-05-28 | **No free tier** — every action costs credits | User explicit: "No free, we need to maintain maximum profits percentage" |
| 2026-05-28 | Multi-PDF chat: charge credits proportional to LLM tokens consumed | User explicit: "based on LLM provider only we need to charge credits accordingly" |
| 2026-05-28 | Target gross margin = 70% on LLM costs | User pays ~3.3× our raw provider cost in credits |

---

## Open questions

(none right now — all major architecture decisions resolved 2026-05-28; see **Decisions made** below)

---

## Architecture — LLM Smart Router

**Goal:** route every LLM call to the cheapest provider+model that can handle the task, while maintaining maximum profit margin on credits.

### Routing decision tree

```
Request enters → classify by:
  1. Has images / scanned pages?     →  needs vision model
  2. Single PDF or multi-PDF?         →  multi-PDF needs longer context window
  3. Estimated input tokens?          →  must fit in chosen model's context
  4. User's plan tier?                →  premium tiers can opt into higher-quality
  ↓
Pick cheapest model satisfying all constraints
  ↓
Call provider; if rate-limited / errors → fallback to next-cheapest
  ↓
Record actual cost in `llm_usage` table → deduct credits with markup
```

### Provider/model cost matrix (per 1M tokens; approx, verify before launch)

| Provider | Model | Vision | Input $/M | Output $/M | Use case |
| --- | --- | --- | --- | --- | --- |
| Google | `gemini-2.5-flash` | ✅ | ~$0.075 | ~$0.30 | **Default for text + vision** — cheapest capable |
| Anthropic | `claude-haiku-4-5` | ✅ | ~$0.25 | ~$1.25 | Fallback when Gemini rate-limited |
| OpenAI | `gpt-4o-mini` | ✅ | ~$0.15 | ~$0.60 | Fallback #2 |
| Google | `gemini-2.5-pro` | ✅ | ~$1.25 | ~$5 | Complex multi-doc reasoning |
| Anthropic | `claude-sonnet-4-6` | ✅ | ~$3 | ~$15 | Premium tier; long-form analysis |
| OpenAI | `gpt-4o` | ✅ | ~$2.50 | ~$10 | Premium fallback |

### Credit pricing model

- Track actual provider cost per query in `llm_usage` table (provider, model, input_tokens, output_tokens, cost_inr)
- Set **target gross margin = 70%** (i.e., user pays ~3.3× our cost in credits)
- Convert cost → credits at fixed rate: 1 credit = ₹2 of LLM spend at our cost (so 1 credit ≈ ₹6.66 retail = our ₹3.99–₹7.98 per-document range)
- Multi-PDF queries cost more credits proportional to combined token count
- Vision/OCR queries cost more credits (vision tokens are pricier)
- Display "this query will cost X credits" before sending to user

### `lib/llm/router.js` responsibility

1. Accept `{ task: 'chat'|'embed'|'ocr', pdfs: [...], messages: [...], userTier: 'free|paid' }`
2. Classify task constraints (vision needed? token estimate? multi-doc?)
3. Pick provider+model
4. Call provider SDK
5. Log to `llm_usage`
6. Return response + computed credit cost
7. On error → exponential backoff → fallback provider

---

## Embedding strategy

**Decided:** **Per-page** embeddings.

- One embedding per PDF page → simple, easy to cite ("answer from page 5")
- Stored in MariaDB as `VECTOR(1536)` column on a `pdf_pages` table
- Retrieval: `ORDER BY VEC_DISTANCE_COSINE(embedding, query_embedding) LIMIT 5`
- If a page has too much text for one embedding (>8K tokens), the page is split into 2-3 chunks but all chunks share the same `page_number` for clean citation

### Storage layout

```sql
pdf_documents     (id, user_id, original_filename, disk_path, page_count, status, created_at)
pdf_pages         (id, document_id, page_number, text, embedding VECTOR(1536), created_at, INDEX vec_idx USING HNSW)
chat_conversations (id, user_id, primary_document_id, title, created_at)
chat_messages     (id, conversation_id, role, content, cited_page_ids JSON, credits_used, llm_provider, llm_model, created_at)
llm_usage         (id, user_id, conversation_id, provider, model, input_tokens, output_tokens, cost_inr, credits_charged, created_at)
```

### File storage layout (Hostinger disk)

```
~/domains/chatwithpdfai.com/uploads/
  └── <user_id>/
      └── <document_uuid>.pdf
```

- Path stored in `pdf_documents.disk_path`
- Permissions: 600 (user-read only)
- Daily backup via Hostinger (already covered by hosting plan)

---

## Maintenance notes for this document

- Update the **Status** column of every table whenever a feature ships
- Move items between phases as priorities shift (record the date in **Decisions made**)
- Add new **Open questions** as they come up; mark them resolved by moving the answer to **Decisions made**
- Don't include credentials, IPs, or anything from `.cowork-private/` here — this file IS in the repo
