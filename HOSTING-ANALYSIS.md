# Hostinger Plan Analysis — chatwithpdfai.com

> Captured 2026-05-28 via SSH inspection of the live server.
> Refreshed when plan changes or hardware moves; otherwise this is a one-time architectural review.

---

## 1. What you actually have

### Your plan's resource allocation
| Resource | Amount | Sufficient for PDF AI SaaS? |
| --- | --- | --- |
| Disk | **50 GB** | ✅ ~10K PDFs (5MB avg) before tight |
| RAM | **3 GB (3,072 MB)** | ⚠ Tight for concurrent PDF processing |
| CPU | **2 vCPU cores** (Xeon Silver 4214 @ 2.20 GHz) | ⚠ Embedding + chunking compete for cycles |
| Inodes | **600,000** | ✅ Lots of headroom (currently 43% used by shared pool) |
| Max processes | **120** | ✅ Currently using 8 next-server workers |
| Bandwidth | Unlimited | ✅ |
| Websites | Up to 50 addons | ✅ (you already host 4 domains here) |
| MySQL DBs | Unlimited (typical for Premium) | ✅ |
| Database size | Soft-capped (~3 GB per DB on Premium typically) | ✅ Current DB = 0.23 MB |
| SSL | Free Let's Encrypt | ✅ |
| Email accounts | 100 (typical Premium) | ✅ |
| SMTP volume | **~100 emails/hour, ~500/day** (typical Hostinger limit) | ⚠ Will be a bottleneck above ~500 paid users |
| Backups | Daily, retained ~30 days (USA Boston) | ✅ |
| Node.js versions | 18.x, 20.x, 22.x, 24.x | ✅ |
| Auto-deploy from Git | ✅ Native | ✅ |

### The underlying server (shared)
The physical machine has serious horsepower (you only get a slice):
- 48 CPU cores total
- 250 GB RAM total
- 7 TB disk total (60% used across all users)
- Current load average: 16.5 (this server is busy)

### What's pre-installed (we get these for free)
✅ `curl`, `wget`, `git`, `python3`, `nano`, `vim`
✅ All Node.js versions (18 → 24)
✅ ImageMagick (as `alt-ImageMagick` package)
✅ PHP 5.6 → 8.3 (irrelevant for us but available)
✅ MariaDB CLI client

### What's missing (will affect implementation)
❌ `tesseract` — OCR not pre-installed (use `tesseract.js` npm pkg or cloud OCR)
❌ `ffmpeg` — image/audio processing not available
❌ `crontab` command — **no system-level cron** (must use hPanel cron or node-cron in-process)
❌ `netstat` / `ss` — limited network introspection
❌ Cannot bind privileged ports (<1024); LiteSpeed handles the public 80/443

### Other domains on this account (shared resource pool)
- chatwithpdfai.com (this product)
- pdfcraftai.com
- rajasekarselvam.com
- testdatamaker.com

> ⚠ **Important:** all four sites share the 50 GB disk, 3 GB RAM, 2 CPU, and 120-process budget. Heavy traffic to any one site eats from the others' budget.

---

## 2. PDF AI SaaS workload — sizing per user action

Approximate resource cost per typical user interaction:

| Action | Disk | RAM (peak) | CPU time | LLM cost | Our credit charge |
| --- | --- | --- | --- | --- | --- |
| Upload 50-page PDF (5 MB) | +5 MB | ~80 MB | ~2 sec | ₹0 | 1 credit (covers infra) |
| Text extract + chunk + embed | +0.3 MB (embeddings) | ~150 MB | ~10 sec | ~₹0.04 (OpenAI embed) | included above |
| OCR a scanned page (Tesseract.js) | 0 | ~200 MB | ~3 sec/page | ₹0 | +1 credit per scanned page |
| OCR via vision LLM (Gemini Pro) | 0 | ~50 MB | ~0.5 sec | ~₹0.25/page | +2 credits per page |
| Single-PDF chat query | 0 | ~50 MB | ~0.2 sec | ~₹0.17 (Gemini Flash, 5K in / 500 out) | 1 credit |
| Multi-PDF chat (3 docs) | 0 | ~100 MB | ~0.5 sec | ~₹0.50 (Gemini Pro for reasoning) | 3 credits |

**Implication:** each PDF in storage is essentially "free" (5 MB). Each chat query costs us ~₹0.17 in LLM cost. At ~₹3-8/credit, gross margin per query is **70-90%** — exactly what you want.

---

## 3. Bottlenecks you'll hit (and at what scale)

| Bottleneck | Trigger | Fix |
| --- | --- | --- |
| **Disk full** | ~8,000 PDFs stored (40 GB used, leave 10 GB headroom) | Move PDFs to Cloudflare R2 (~$0.015/GB/month, 10GB free egress) — costs ~₹120/month for 1 TB |
| **RAM saturation** | 5+ concurrent PDF uploads being processed | Background job queue (process one at a time); upgrade plan; OR offload extraction to a worker process |
| **CPU contention** | 3+ concurrent embedding jobs | Same fix: queue + serialize; or use OpenAI's batch embedding API (cheaper + offloads CPU) |
| **120 process cap** | ~50 concurrent users hitting site at peak | Upgrade plan (Business gets 240, Cloud gets 400+) |
| **MySQL slow on vector search** | ~50K embeddings (1M+ rows including metadata) | Add `VECTOR INDEX USING HNSW`; if still slow → external vector DB (Pinecone free tier = 100K vectors) |
| **SMTP rate limit** | >500 emails/day (e.g., 500 paid signups in a day → welcome+receipt+verify) | External email: **Resend** (₹0/3000 emails first 100/day; ₹1700/mo for 100K), **Postmark**, **Amazon SES** (~₹8/1000) |
| **No background cron at SSH level** | Need to send digest emails, expire sessions, cleanup orphan PDFs | hPanel cron jobs (limited) OR `node-cron` in the running Next.js process |
| **Single region (USA NC)** | Latency to Indian users ~250 ms | Front with Cloudflare (free) for static assets; LLM latency dominates anyway, so OK for MVP |
| **Shared CPU = unpredictable** | Neighbors run heavy stuff; your queries get slow | Move heavy compute (PDF extract, embed) to background queue; serve cached results synchronously |

---

## 4. Upgrade decision matrix

> **Rule of thumb:** Stay on this plan until your first ₹5,000/mo in revenue. Then upgrade only when one specific limit becomes a real problem.

### Hostinger plan tiers (approx. monthly prices, INR)

| Plan | Disk | RAM | CPU | Processes | Approx. price/mo | When to move |
| --- | --- | --- | --- | --- | --- | --- |
| **Premium Web** (current) | 50 GB | 3 GB | 2 | 120 | ~₹250 | — you're here |
| **Business Web** | 200 GB | 6 GB | 4 | 240 | ~₹450 | First 1K paid users (~₹50K MRR) |
| **Cloud Startup** | 200 GB | 3 GB | 2 | dedicated | ~₹800 | When neighbor noise becomes a real problem |
| **Cloud Professional** | 250 GB | 6 GB | 4 | dedicated | ~₹1700 | ~5K paid users (~₹250K MRR) |
| **VPS (KVM 2 or higher)** | 100 GB SSD | 8 GB | 4 dedicated | unlimited | ~₹1500-3000 | Need root access — install Tesseract, custom services, etc. |

**Margin math:** at ~70% margin, each ₹100 of MRR yields ₹70 profit. Premium plan = ~₹250/mo overhead = ~₹360 MRR breakeven on hosting alone. Trivial.

### Specific upgrade triggers (write these down — set monitoring later)

| If you see this... | Do this | Cost delta |
| --- | --- | --- |
| Disk usage > 40 GB | Move PDFs to Cloudflare R2 | +~₹120/mo per 1 TB |
| Avg RAM > 2.5 GB consistently | Upgrade to Business Web | +~₹200/mo |
| Frequent 503 errors during peak | Upgrade to Cloud Startup | +~₹550/mo |
| >500 emails/day | Switch to Resend or Amazon SES | +~₹1700/mo or pay-as-you-go |
| 50K+ embeddings, vector queries > 500 ms | Move embeddings to Pinecone | Free until 100K vectors |
| Need Tesseract / custom binaries | Move to VPS plan | +~₹1500-3000/mo |
| MRR > ₹200K | Move app to Cloud Professional + DB to managed (PlanetScale/Neon) | +~₹2000-5000/mo |

---

## 5. Margin maximizers (do these now, free or near-free)

These directly increase per-query profit without spending more on infra:

| Tactic | Margin impact | Effort |
| --- | --- | --- |
| **Smart LLM router** (cheapest capable model per query) | +30-50% | Built into `lib/llm/router.js` plan |
| **Cache LLM responses** (same PDF + same query → cached answer) | +20-40% on repeat queries | 1 day of code; Redis-style cache in MySQL or Memcached |
| **Display credit cost preview** before sending | +5-10% (reduces accidental expensive queries) | UI work |
| **Charge more for vision queries** | Protects margin on scanned PDFs | Tier in credit pricing |
| **Use Cloudflare in front** of the site | -50% bandwidth from origin, faster TTFB globally | Free Cloudflare plan; ~1 hour setup |
| **Aggressive HTML/asset caching** (already in .htaccess equivalent) | Lower CPU/RAM, more concurrent users on same plan | Done |
| **Batch embeddings** (OpenAI batch API = 50% cheaper) | -50% on embedding cost | Use for bulk re-embedding; not for real-time uploads |
| **Refund unused credits at 30 days** | +interest/float (you hold the money) | Built into credit_packs model |
| **Bill in INR, hold INR**, no FX fees | +2-3% per transaction | Razorpay default |
| **Bundle bigger packs at lower per-credit price** | Encourages bigger purchases, more upfront cash | Your pricing already does this |

---

## 6. Clean implementation principles (low-overhead architecture)

Decisions for keeping margin high while staying simple:

1. **Everything that can be free, stays free** — Hostinger SMTP (until volume), MariaDB vectors (until 100K), Hostinger disk (until 40 GB), Let's Encrypt SSL, native Git deploy. No SaaS bill until forced.
2. **External services only when justified by revenue** — Resend, Cloudflare R2, Pinecone, etc. only added when their cost is <5% of the revenue they unlock.
3. **No background workers as separate processes (initially)** — use Next.js API routes + `node-cron` in-process. Avoids needing PM2 / systemd / VPS until proven necessary.
4. **One server for now** — don't split frontend/backend until traffic justifies it. Next.js on Hostinger does both.
5. **Cache aggressively** — same question on same PDF? Serve from cache. ~30-50% of queries should hit cache once you have repeat users.
6. **Async heavy work** — uploads, embedding, OCR run in background; user sees "Processing…" then notified when done. Prevents user-facing 30-second waits.
7. **Hard limits at the API layer** — no unauthenticated uploads, file size cap (50 MB), max pages per PDF (500), rate limit per user. Prevents abuse from eating your margin.

---

## 7. 6-month scaling outlook

| Month | Users | Resource concern | Action |
| --- | --- | --- | --- |
| Launch | 0-100 | None | Stay on Premium |
| Month 2 | 100-500 | Maybe SMTP volume | Watch email send rate; switch to Resend if >300/day |
| Month 3 | 500-2K | Disk growth | Track disk weekly; move PDFs to R2 at ~40 GB |
| Month 4 | 2K-5K | RAM pressure | Upgrade to Business Web (+₹200/mo) |
| Month 5 | 5K-10K | Vector search slow | Add HNSW index, consider Pinecone migration |
| Month 6 | 10K+ | Multi-region latency | Cloudflare R2 + CDN; consider Mumbai region VPS |

**Total infrastructure cost trajectory:**
- Month 1: ₹250 (just Hostinger Premium)
- Month 3: ~₹500 (Premium + Resend free tier + R2 starter)
- Month 6: ~₹3000-5000 (Business or Cloud + Resend + R2 + Pinecone)
- At 10K users with average ₹999 spend over 12 months → ~₹10M revenue → infra is <0.5% of revenue. Healthy.

---

## 8. Anti-recommendations (things people will tell you to do, but don't)

| Suggestion | Why skip (for now) |
| --- | --- |
| Move to AWS/GCP from day one | 5-10× cost for no benefit at your scale; complexity tax |
| Kubernetes | Same. You don't have 10 microservices. |
| Separate read replica DB | Premature; your reads are fine |
| Multi-region from day one | Indian users are well-served from USA NC for MVP; LLM latency dominates anyway |
| Pay for premium Pinecone | MariaDB vectors are free and work fine until 100K+ embeddings |
| Buy a dedicated SMTP service before measuring | Hostinger SMTP works for first 500/day; pay only when needed |
| Replace Hostinger with VPS "for control" | Only when you actually need root (Tesseract binary, custom services) |

---

## 9. Monitoring (set up before you need to react)

Before you hit any of the upgrade triggers, you need to be measuring. Cheap/free options:

| Metric | Tool | Cost |
| --- | --- | --- |
| Uptime monitoring | UptimeRobot (free tier) | ₹0 |
| Disk + RAM trend | Cron job → log to MySQL + admin dashboard | ₹0 |
| LLM cost per user / per query | `llm_usage` table queries | ₹0 |
| Error tracking | Sentry free tier (5K errors/mo) | ₹0 |
| Database slow query log | MariaDB's built-in slow query log | ₹0 |
| Email send count | Track in `emails_sent` table | ₹0 |

Set these up alongside Phase 1 builds — adding monitoring later means you're flying blind during the riskiest period (first 1000 users).
