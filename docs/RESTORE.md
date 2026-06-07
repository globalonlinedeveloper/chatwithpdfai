# Database restore runbook

How to restore a `chatwithpdfai.com` MariaDB snapshot produced by the free
`db-backup` GitHub Action (`.github/workflows/db-backup.yml`). Credentials/infra
live in `.cowork-private/credentials.env` and `.cowork-private/OPERATIONS.md`.

> ⚠️ **Restore with the `mysql` CLI only — NEVER phpMyAdmin.** `pdf_pages` has a
> native `VECTOR(1536)` column; phpMyAdmin cannot parse it and will corrupt the
> import (this is what broke a past restore). Always restore on the Hostinger
> box over SSH.

> ⚠️ **Restoring overwrites live data.** Treat it as break-glass: restore into a
> scratch database FIRST and inspect, then go over production only if you mean it.

---

## 1. Get a backup file

Backups are GitHub Actions artifacts (90-day retention).

1. GitHub → repo → **Actions** → **DB backup (mysqldump → artifact)** → pick a run.
2. Download the **`db-backup-<timestamp>`** artifact (a zip).
3. Unzip → `chatwithpdfai_<timestamp>.sql.gz` + `chatwithpdfai_<timestamp>.sql.gz.sha256`.

Verify integrity before trusting it:

```bash
sha256sum -c chatwithpdfai_<timestamp>.sql.gz.sha256      # checksum matches
gzip -t  chatwithpdfai_<timestamp>.sql.gz && echo "gzip OK"  # archive intact
zcat     chatwithpdfai_<timestamp>.sql.gz | tail -3 | grep -q "Dump completed" && echo "complete dump"
```

Peek without restoring:

```bash
zcat chatwithpdfai_<timestamp>.sql.gz | grep -c 'CREATE TABLE'   # expect ~23 tables
```

---

## 2. Restore (safe path — staging copy first)

The DB only listens on `127.0.0.1`, so the restore runs **on the Hostinger box**.
SSH details are in `credentials.env` (`SSH_IP`, `SSH_Port`, `SSH_Username`).

```bash
# from a machine with SSH access:
scp -P <SSH_Port> chatwithpdfai_<timestamp>.sql.gz <SSH_Username>@<SSH_IP>:/tmp/restore.sql.gz
ssh -p <SSH_Port> <SSH_Username>@<SSH_IP>
```

On the server, read DB creds from the running app's environ (same source the
backup uses — no password typed or stored):

```bash
PID=$(ps -fu "$(id -u)" | grep 'next-server (v14.2.5)' | grep -v grep | head -1 | awk '{print $2}')
ENVF=/proc/$PID/environ
U=$(tr '\0' '\n' < "$ENVF" | grep '^DB_USER='     | head -1 | cut -d= -f2-)
P=$(tr '\0' '\n' < "$ENVF" | grep '^DB_PASSWORD=' | head -1 | cut -d= -f2-)
D=$(tr '\0' '\n' < "$ENVF" | grep '^DB_NAME='     | head -1 | cut -d= -f2-)

# Restore into a scratch DB and eyeball it (NON-destructive to prod):
MYSQL_PWD="$P" mysql -h 127.0.0.1 -u "$U" -e "CREATE DATABASE IF NOT EXISTS restore_check;"
zcat /tmp/restore.sql.gz | MYSQL_PWD="$P" mysql -h 127.0.0.1 -u "$U" restore_check
MYSQL_PWD="$P" mysql -h 127.0.0.1 -u "$U" restore_check -e "SHOW TABLES; SELECT COUNT(*) FROM users;"
# when satisfied:
MYSQL_PWD="$P" mysql -h 127.0.0.1 -u "$U" -e "DROP DATABASE restore_check;"
```

---

## 3. Restore over production (destructive — only when you mean it)

```bash
# 1) safety-dump CURRENT prod first, so you can undo:
MYSQL_PWD="$P" mysqldump --single-transaction --quick --no-tablespaces --routines --triggers --events \
  -h 127.0.0.1 -u "$U" "$D" | gzip -c > /tmp/pre-restore-$(date -u +%Y%m%d-%H%M%S).sql.gz

# 2) restore the snapshot over prod (mysqldump includes DROP TABLE IF EXISTS per table):
zcat /tmp/restore.sql.gz | MYSQL_PWD="$P" mysql -h 127.0.0.1 -u "$U" "$D"
```

Then recycle the app so it reconnects cleanly, and verify:

```bash
touch ~/domains/chatwithpdfai.com/nodejs/tmp/restart.txt
curl -s https://chatwithpdfai.com/api/health    # expect {"ok":true,"db":true,...}
```

---

## 4. Single-table restore

```bash
# extract one table's section from the dump and apply it alone:
zcat chatwithpdfai_<timestamp>.sql.gz \
  | sed -n '/-- Table structure for table `papers`/,/-- Table structure for table `/p' > papers.sql
MYSQL_PWD="$P" mysql -h 127.0.0.1 -u "$U" "$D" < papers.sql
```

---

## Notes

- **Cadence:** daily 02:00 UTC (~07:30 IST) + manual via Actions → Run workflow. Retention 90 days. Up to 3 SSH retries per run (tolerates a flaky GitHub runner).
- **Secrets:** only SSH access is stored in GitHub (`HOSTINGER_SSH_*`); the DB
  password is read live from `/proc/<pid>/environ`, never stored.
- **Cost:** zero — GitHub Actions minutes + artifact storage on the free tier.
- **Why server-side:** MariaDB binds to `127.0.0.1` only; there is no public DB
  port, so both backup and restore run on the Hostinger host over SSH.
