# CHATWITHPDFAI.COM

Marketing site, app shell, blog, help center, and legal pages for **chatwithpdfai.com**.

Static HTML + in-browser React (via Babel `text/babel`) served by a thin Express layer on **Hostinger Node.js hosting**.

## Live
https://chatwithpdfai.com

## Stack
- 91 static HTML pages, 16 in-browser JSX modules, 4 CSS files
- Express server (`server.js`) — clean URLs, HTTPS redirect, caching, security headers
- Hostinger auto-pulls from GitHub on every push to `main`

## Deploy workflow
```bash
git add .
git commit -m "your message"
git push
```
Hostinger detects the push via webhook, pulls the latest code, runs `npm install` + `npm start`. Live in ~60 seconds.

## Local preview
```bash
npm install
npm start
# open http://localhost:3000
```

## File map
| Path | Purpose |
| --- | --- |
| `server.js` | Express entry — required by Hostinger Node.js |
| `package.json` | Node deps + start script |
| `landing.html` | Marketing home (root `/` redirects here) |
| `auth/`, `blog/`, `h