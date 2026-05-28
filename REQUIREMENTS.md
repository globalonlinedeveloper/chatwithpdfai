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
| AI / LLM | TBD (OpenAI or Anthropic) | User has API key |
| File storage | TBD (Hostinger disk or S3) | TBD |
| Vector search | TBD (pgvector, Pinecone, Qdrant) | TBD |

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
The actual chat-with-PDF product. No auth gating yet — anyone can use it freely while we build.

| Feature | Status | Notes |
| --- | --- | --- |
| PDF upload | ⬜ Planned | Storage location TBD (Hostinger disk vs S3) |
| PDF text extraction | ⬜ Planned | `pdf-parse` or similar; OCR for scanned via Tesseract or cloud OCR |
| Chunking + embeddings | ⬜ Planned | Need vector store choice |
| AI chat (single PDF) | ⬜ Planned | RAG pipeline → LLM call → cited response |
| Multi-PDF chat | ⬜ Planned | After single-PDF works |
| Citation linking (click answer → see source page) | ⬜ Planned | Crucial for the "cited answers" promise |
| Chat history persistence | ⬜ Planned | Likely a `conversations` + `messages` table |
| Library / "my docs" view | ⬜ Planned | List of uploaded PDFs |
| Document viewer | ⬜ Planned | `document.html` exists as mockup |

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

---

## Open questions

- Which LLM provider? (User has OpenAI or Anthropic API key.)
- Vector store choice: pgvector (extend MariaDB? not natively supported) vs Pinecone vs Qdrant vs in-memory for MVP?
- File storage: Hostinger disk (7TB available, simple) vs S3 (durable, costs money)?
- Free tier behavior: how many free uploads/queries before paywall?
- Multi-PDF chat: max docs per conversation?
- Embedding strategy: per-page chunks vs semantic chunks?

---

## Maintenance notes for this document

- Update the **Status** column of every table whenever a feature ships
- Move items between phases as priorities shift (record the date in **Decisions made**)
- Add new **Open questions** as they come up; mark them resolved by moving the answer to **Decisions made**
- Don't include credentials, IPs, or anything from `.cowork-private/` here — this file IS in the repo
