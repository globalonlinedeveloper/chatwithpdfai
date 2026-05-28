# CHATWITHPDFAI.COM — Deployment Guide

End-to-end automation: **every `git push` to `main` deploys the site to Hostinger.** No manual upload, no SSH, no clicking. This guide walks you through the one-time setup (~10 minutes total).

---

## Architecture in one picture

```
You edit files locally
         │
         ▼
    git push main
         │
         ▼
   GitHub Actions runs (deploy.yml)
         │
         ▼
   FTP sync to Hostinger /public_html/
         │
         ▼
   https://chatwithpdfai.com (live)
```

Only files that **changed** are uploaded (incremental sync). A full first deploy takes ~2–3 minutes; subsequent deploys take 10–30 seconds.

---

## Part 1 — Create the GitHub repository (3 min)

1. Go to https://github.com/new
2. Repository name: `chatwithpdfai` (or anything you like — name doesn't matter)
3. Visibility: **Private** is recommended
4. **Do NOT** check "Add a README", "Add .gitignore", or "Add license" — the project already has them
5. Click **Create repository**
6. On the next page, copy the URL shown under "…or push an existing repository from the command line". It looks like:
   ```
   https://github.com/YOUR-USERNAME/chatwithpdfai.git
   ```

---

## Part 2 — Push your code to GitHub (2 min)

Open a terminal in this project folder (`AICHATWITHPDF.COM`) and run:

```bash
git init
git add .
git commit -m "Initial commit: full site + deploy pipeline"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/chatwithpdfai.git
git push -u origin main
```

> First time using Git on this machine? You'll be asked to set your name and email:
> ```bash
> git config --global user.name  "Your Name"
> git config --global user.email "rajasekarjavaee@gmail.com"
> ```

After `git push`, refresh the GitHub page — all your files should be there.

---

## Part 3 — Grab your Hostinger FTP credentials (2 min)

1. Log in to **hPanel** → https://hpanel.hostinger.com
2. Open your **chatwithpdfai.com** website
3. Sidebar → **Files** → **FTP Accounts**
4. You'll see a row like:

   | Field          | Example value                          |
   | -------------- | -------------------------------------- |
   | FTP hostname   | `ftp.chatwithpdfai.com` or `82.180.x.x` |
   | FTP username   | `u123456789.chatwithpdfai`             |
   | FTP password   | (click "Change FTP password" if forgotten) |
   | FTP port       | `21`                                   |

5. **Set/reset the FTP password now** if you don't have it — you won't be able to see the old one.

> Hostinger shared hosting uses **FTP, not SFTP**. That's fine — the workflow is configured for FTP.

---

## Part 4 — Add the credentials to GitHub as Secrets (3 min)

1. Open your repo on GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add these **five** secrets one by one:

   | Secret name      | Value                                              |
   | ---------------- | -------------------------------------------------- |
   | `FTP_SERVER`     | the FTP hostname from Hostinger (e.g. `ftp.chatwithpdfai.com`) |
   | `FTP_USERNAME`   | the FTP username (e.g. `u123456789.chatwithpdfai`) |
   | `FTP_PASSWORD`   | the FTP password you set in Hostinger             |
   | `FTP_PORT`       | `21`                                               |
   | `FTP_REMOTE_DIR` | `/public_html/`  ← keep the leading and trailing slash |

3. After saving, the secrets page should show five items. The values stay encrypted — GitHub won't show them again.

---

## Part 5 — Trigger the first deploy (1 min)

You have two ways:

**Option A — Push any change:**
```bash
echo "" >> README.md
git add README.md
git commit -m "trigger first deploy"
git push
```

**Option B — Run the workflow manually:**
1. GitHub repo → **Actions** tab
2. Click **Deploy to Hostinger** in the left sidebar
3. Click **Run workflow** → **Run workflow** (green button)

Watch the run progress on the Actions tab. When you see a green check ✅, open https://chatwithpdfai.com — your site is live.

---

## Daily workflow from now on

```bash
# edit some files…
git add .
git commit -m "describe your change"
git push
```

That's it. The workflow auto-runs, your site updates in under a minute.

---

## How to confirm the deploy worked

1. **GitHub Actions tab** — green checkmark on the latest run
2. **Open the site** in a private/incognito window (avoids browser cache)
3. If something looks stale, hard-refresh with `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac) — HTML is cached for 5 minutes per the `.htaccess` rules

---

## Common issues & fixes

| Symptom | Fix |
| ------- | --- |
| Workflow fails on "Sync to Hostinger via FTP" with `530 Login authentication failed` | FTP password is wrong — reset it in hPanel and update the `FTP_PASSWORD` secret on GitHub |
| Workflow fails with `ENOTFOUND` | `FTP_SERVER` is wrong. Use the exact hostname shown in hPanel → FTP Accounts |
| Files upload but site shows old version | HTML is cached for 5 min — hard-refresh, or wait 5 min |
| 500 Internal Server Error after deploy | Open `.htaccess` — a syntax error in it can break the whole site. Revert the last commit: `git revert HEAD && git push` |
| Want to do a full clean re-upload | In `.github/workflows/deploy.yml`, change `dangerous-clean-slate: false` to `true`, push once, then change it back |

---

## Optional — Add a `staging` environment later

Duplicate `deploy.yml` to `deploy-staging.yml`, change the trigger branch to `staging`, point `FTP_REMOTE_DIR` to `/public_html/staging/`. Then `git push origin staging` deploys to a staging subdirectory.

---

## What's in this repo

| File / folder | Purpose |
| ------------- | ------- |
| `*.html`      | All site pages (landing, pricing, blog, legal, auth, etc.) |
| `*.jsx`       | React components loaded via in-browser Babel — no build step |
| `*.css`       | Stylesheets (`a11y.css`, `print.css`, `prose.css`) |
| `.htaccess`   | Apache config: HTTPS, clean URLs, gzip, caching, security headers |
| `.gitignore`  | Files Git should ignore |
| `.gitattributes` | Forces LF line endings (prevents Windows/Linux issues on Hostinger) |
| `.github/workflows/deploy.yml` | The auto-deploy pipeline |
| `DEPLOYMENT.md` | This file |

---

## Need help?

- GitHub Actions logs: repo → **Actions** tab → click the failing run
- Hostinger support chat: hPanel → bottom-right chat bubble
- The FTP-Deploy-Action docs: https://github.com/SamKirkland/FTP-Deploy-Action
