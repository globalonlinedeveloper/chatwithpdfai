# CHATWITHPDFAI.COM

Marketing site, app shell, blog, help center, and legal pages for **chatwithpdfai.com**.

100% static — pure HTML + CSS + in-browser React (via Babel `text/babel`). No build step.

## Live site
https://chatwithpdfai.com

## Deploy
Push to `main` → GitHub Actions → FTP to Hostinger. See **[DEPLOYMENT.md](DEPLOYMENT.md)** for full setup.

```bash
git add .
git commit -m "your message"
git push
```

## Local preview
Any static server works. Quick option:

```bash
# Python (already installed almost everywhere)
python3 -m http.server 8000
# then open http://localhost:8000/landing.html
```

## Structure
- `landing.html` — main entry (the bare `index.html` redirects here)
- `auth/`, `blog/`, `help/`, `legal/`, `customers/`, `emails/` — section pages
- `app/` — the in-product UI shells
- `landing/`, `futures/`, `use-cases/` — React component partials
- `.htaccess` — Apache config (HTTPS, clean URLs, caching)
- `.github/workflows/deploy.yml` — auto-deploy pipeline
