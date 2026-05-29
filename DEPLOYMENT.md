# CHATWITHPDFAI.COM — Hostinger Node.js Auto-Deploy

How the auto-deploy works once it's wired up:

```
You: git push origin main
        │
        ▼
GitHub repo updated
        │
        ▼ (webhook fires)
Hostinger pulls latest code
        │
        ▼
npm install + npm start
        │
        ▼
https://chatwithpdfai.com live
```

No FTP, no GitHub Actions, no secrets. One push = one deploy.

---

## One-time Hostinger setup

In hPanel's Node.js repository import flow (which you're already in):

1. Click the **refresh icon** next to the repo search box. The "Unsupported framework" error should clear now that `package.json` is in the repo.
2. Make sure `chatwithpdfai` is selected, click **Continue**.
3. On the next screen Hostinger usually asks for:
   - **Branch**: `main`
   - **Node version**: `18` or `20` (whichever is offered, both work)
   - **Application root**: `/` (project root)
   - **Application URL**: `chatwithpdfai.com`
   - **Startup file**: `server.js`
   - **Run script**: `npm start` (or leave default)
4. Click **Deploy** / **Create application**. Hostinger will:
   - clone the repo
   - run `npm install`
   - start the Express server
   - bind it to your domain via its internal reverse proxy

5. After the first deploy succeeds, look for the **Auto Deploy** toggle in the app settings — turn it **ON**. Hostinger then installs the GitHub webhook automatically; every push to `main` triggers a redeploy.

6. (Optional) In the same panel: enable **Auto Restart on Crash**.

---

## How to verify

| Check | Where |
| --- | --- |
| Build succeeded | Hostinger app dashboard → "Logs" or "Deployment status" |
| Server is running | Look for `CHATWITHPDFAI.COM listening on :3000` in app logs |
| Site loads | https://chatwithpdfai.com in a private window |
| Auto-deploy works | Push any small change, watch Hostinger redeploy in 30–60s |

---

## Common issues

| Symptom | Fix |
| --- | --- |
| `Cannot find module 'express'` in logs | npm install didn't run — trigger a manual rebuild in Hostinger |
| 502 Bad Gateway | App crashed or port mismatch. Hostinger sets `process.env.PORT` automatically; `server.js` already reads it. Check logs. |
| Domain shows Hostinger placeholder | Application URL not bound to `chatwithpdfai.com` in app settings |
| Push doesn't redeploy | Auto Deploy is OFF, or the webhook was rejected by GitHub. In repo Settings → Webhooks, the Hostinger webhook should show recent deliveries with green checks |
| Old version still showing | Hostinger may cache aggressively — wait 1–2 min, then hard-refresh |

---

## Daily workflow
```bash
git add .
git commit -m "change"
git push
```
Watch the Hostinger app dashboard → Deployments tab. Green checkmark = live.

---

## Local development
```bash
npm install
npm start
# http://localhost:3000 → landing.html
```

---

## Repo
https://github.com/localuser3792921-blip/chatwithpdfai
