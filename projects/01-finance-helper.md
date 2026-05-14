# Project 1 — Personal Finance Helper

A fully local personal-finance system. Pulls transactions from your bank (via SimpleFIN or Plaid), stores them in SQLite, categorizes them, and lets Claude answer questions like "where did my money actually go in March?" — without sending any of it to a third party beyond your chosen data provider.

## What you'll need

- macOS or Linux. (The original prompt targets macOS + launchd; on Linux ask Claude to substitute `systemd --user` units or cron — it will.)
- Python 3.12+. Install via [python.org](https://python.org) or `brew install python@3.12` (Mac) / your package manager (Linux).
- A **SimpleFIN Bridge** subscription (~$1.50/month, recommended) or a Plaid developer account (free tier exists, more setup).
- About 30 minutes for the first run.

## Setup walkthrough

1. **Make the project folder and step into it:**
   ```bash
   mkdir -p ~/projects/finance-helper && cd ~/projects/finance-helper
   git init
   ```
2. **Sign up for SimpleFIN Bridge** at [bridge.simplefin.org](https://bridge.simplefin.org). After linking your bank you'll get an **Access URL** that looks like `https://username:password@bridge.simplefin.org/simplefin`. Keep it — you'll paste it into `.env` later.
3. **Make a secrets folder** (the prompt expects this path):
   ```bash
   mkdir -p ~/.config/finance-sync
   touch ~/.config/finance-sync/.env
   chmod 600 ~/.config/finance-sync/.env
   ```
   Open that `.env` in a text editor and add:
   ```
   SIMPLEFIN_ACCESS_URL=paste-your-url-here
   ```
4. **Start Claude Code in the project folder:**
   ```bash
   claude
   ```
5. **Paste the prompt below** as your first message. Claude will ask clarifying questions, then build the code, the schema, the launchd plist, and tests.
6. **First sync:** once Claude says it's ready, run `finance-sync dry-run` to verify the pipeline, then `finance-sync sync` for real.
7. **Ask questions:** with the database populated, open Claude Code again in the folder and ask things like "summarize spending by category last month" or "find subscriptions I forgot about." Claude can query the SQLite db directly.

## The prompt

Copy everything between the lines and paste it into Claude Code.

---

```
Build a local-first personal finance ingestion and analysis system for macOS.

Core goals:
- Fully local operation
- Read-only bank access
- Scheduled automated transaction sync
- SQLite database backend
- Claude-compatible analysis layer
- Secure secret handling
- Robust logging and deduplication
- Production-quality code and documentation

Architecture:
Bank -> SimpleFIN or Plaid -> local Python sync service -> SQLite DB -> local analysis/API layer -> Claude Desktop or Claude API tools

Technical requirements:

Environment:
- macOS (on Linux, substitute systemd --user units for launchd)
- Python 3.12+
- Use uv or venv
- SQLite database
- launchd preferred over cron
- Use dotenv/env file for secrets
- File permissions hardened appropriately

Security requirements:
- Secrets stored only in local .env file
- Never print secrets to logs
- Read-only financial access only
- No credential storage beyond API tokens
- Validate TLS
- Use parameterized SQL queries
- Ensure idempotent transaction ingestion
- Support encrypted local backups if feasible
- Claude must never directly access bank credentials

Data sources:
1. SimpleFIN Bridge (default, preferred)
2. Plaid (optional)

Database schema (SQLite):
- institutions, accounts, transactions, categories, sync_state, ingestion_logs
- transactions table includes: transaction_id, posted_date, pending flag, merchant/raw description, normalized merchant, amount, currency, category, account_id, source system, imported_at, hash/dedup fields

Behavior:
- Deduplicate transactions safely
- Handle pending -> posted transitions
- Preserve raw transaction text and source metadata
- Robust error handling with retry/backoff
- Structured logs
- Dry-run mode
- Unit tests

Scheduling:
- launchd plist running every 6 hours
- Installation instructions, logging paths

Secrets:
- Store in ~/.config/finance-sync/.env
- chmod 600
- Example keys: SIMPLEFIN_ACCESS_URL, PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ACCESS_TOKEN

Project structure:
finance-sync/
  README.md
  pyproject.toml
  .env.example
  finance_sync/
    sync.py
    plaid_client.py
    simplefin_client.py
    db.py
    models.py
    categorizer.py
    logging_config.py
  launchd/
    com.user.financesync.plist
  tests/

CLI:
finance-sync sync
finance-sync dry-run
finance-sync export-csv
finance-sync monthly-summary

Claude integration:
Build a lightweight local API layer (or MCP-compatible interface) allowing Claude to:
- query summaries
- inspect categorized transactions
- answer budgeting questions
- generate reports
Claude must only receive sanitized transaction data, never credentials.

Code quality:
- Typed Python with Pydantic models
- Minimal dependencies
- Clean architecture
- Defensive programming

Deliverables:
- Complete runnable codebase
- README with setup instructions
- launchd installation instructions
- SQLite schema migration setup
- Example .env
- Example queries
- Unit tests
- Security notes
- Troubleshooting section

Before writing any code, ask me 5 clarifying questions about my bank, my categorization preferences, and how I plan to schedule syncs.
```

---

## Tips

- Run `finance-sync dry-run` after every code change before letting it write to your real database.
- Commit after each working slice: `git add . && git commit -m "schema + simplefin client"`.
- If categorization is wrong, ask Claude to add a `rules.yaml` file you can edit by hand — it's easier than retraining anything.
