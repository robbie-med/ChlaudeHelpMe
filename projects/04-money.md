# Project 4 — Personal Money Dashboard

**Time:** a weekend. **Setup:** a SimpleFIN Bridge subscription (~$1.50/month) and Claude Desktop. **Goal:** a real personal tool you keep using, that Claude Desktop can query in plain English any time you ask.

This is the "0 to 60" finish line. By the end you'll have:

1. A **background sync daemon** that pulls fresh transactions from your bank every few hours, all local, all yours.
2. A **local SQLite database** with deduped, categorized transactions you control with a simple `rules.yaml`.
3. An **MCP server** that exposes that database to Claude Desktop, so you can open the GUI and ask *"how much did I spend on coffee in March?"* and get a real answer from your real data.

It also introduces a security pattern worth learning for the rest of your life: how to collaborate with Claude on handling a secret *without ever showing Claude the secret*.

## What you'll need

- macOS or Linux.
- Python 3.10+.
- A **SimpleFIN Bridge** account at [bridge.simplefin.org](https://bridge.simplefin.org). It's the only sane option for personal use — Plaid isn't realistically available to individuals. Cost: about $1.50/month. After you link your bank, SimpleFIN gives you a one-time **setup token** (a long base64 string).
- **Claude Desktop** installed ([claude.ai/download](https://claude.ai/download)). The terminal `claude` CLI is great for building this, but the MCP integration we wire up at the end lights up inside the Desktop app.

## The safety hack (read this before you do anything else)

Your SimpleFIN setup token is the equivalent of bank-account read access. We will let Claude write the code that handles it — but we will **not** let Claude read it.

The pattern is:

1. You write the setup token to a file on disk, by hand: `~/simplefin-setup-token.txt`.
2. You tell Claude: *"There is a setup token at that path. Do not read it. Write a script that reads it, calls SimpleFIN's claim endpoint to convert it to an access URL, writes the URL to `~/.config/finance-sync/.env` with chmod 600, and then shreds the original file."*
3. You run the script. The token gets consumed by SimpleFIN's one-shot claim endpoint, the access URL lands in `.env`, and the original file is shredded (`shred -u` on Linux, `rm -P` on macOS).
4. From that point on, Claude can read `~/.config/finance-sync/.env` if it needs to test sync — but you tell it not to, and the production code just reads via env vars, not by `cat`-ing the file.

The trick is that Claude is perfectly capable of writing a secret-handling pipeline without seeing the secret. You hand it the *shape* of the work and the *path*; the bytes never enter the conversation. This is a habit worth keeping. You'll use it for API keys, app passwords, signing keys — anything you don't want Claude to memorize or accidentally print.

## Setup walkthrough

1. **Sign up at SimpleFIN Bridge**, link your bank(s), and copy the setup token they give you.

2. **Write the token to a file on disk, by hand:**
   ```bash
   mkdir -p ~/.config/finance-sync
   # Open the file in your editor and paste the token. Don't paste it in chat.
   nano ~/simplefin-setup-token.txt   # or vim, or TextEdit, whatever
   chmod 600 ~/simplefin-setup-token.txt
   ```

3. **Make the project folder:**
   ```bash
   mkdir -p ~/projects/money && cd ~/projects/money
   git init
   ```

4. **Start Claude Code** and paste the prompt below. The very first thing Claude will do is generate `bootstrap_secret.py` — the safety-hack script. **Read it before you run it.** It should:
   - Read `~/simplefin-setup-token.txt`.
   - POST to the URL from the token (SimpleFIN's claim flow).
   - Receive an access URL in the response.
   - Write `SIMPLEFIN_ACCESS_URL=<url>` to `~/.config/finance-sync/.env` with `chmod 600`.
   - Shred (`shred -u` / `rm -P`) the original token file.

5. **Run it:**
   ```bash
   python3 bootstrap_secret.py
   ```
   Verify: `cat ~/.config/finance-sync/.env` should have a single `SIMPLEFIN_ACCESS_URL=...` line. The original token file should be gone. From now on, Claude operates on the access URL, not the token.

6. **Let Claude finish the rest** — the sync code, the SQLite schema, the categorizer with `rules.yaml`, and the MCP server. Walk through commits as it goes.

7. **First sync:**
   ```bash
   finance sync --dry-run    # see what would land in the DB
   finance sync              # actually write
   finance summary           # human-readable monthly view
   ```

8. **Schedule the background sync** every 6 hours. macOS: `launchd` plist. Linux: `systemd --user` timer. Claude will write the file and the one-line command to enable it. Logs go to `~/.local/state/finance-sync/`.

9. **Wire the MCP server into Claude Desktop.** Claude will print the exact JSON snippet to add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `~/.config/Claude/claude_desktop_config.json` (Linux). Restart Claude Desktop. Open a new conversation and ask:

   > How much did I spend on groceries in the last three months?

   Claude Desktop will call the MCP server you just built. The server reads your local SQLite. You get the answer. None of your transactions leave your computer except as part of the question/answer you initiated.

## The prompt

---

```
Help me build a personal money dashboard. I'm doing this in four phases —
build them in order, commit after each, and ask me to verify before moving on.

Phase 0 — Secret bootstrap (SAFETY-CRITICAL, READ CAREFULLY).

There is a SimpleFIN setup token at ~/simplefin-setup-token.txt. DO NOT
READ THAT FILE. Do not cat it, do not include its contents in any tool
call, do not print it.

Write bootstrap_secret.py that:
- Reads the token from that file path.
- POSTs to the URL contained in the token (SimpleFIN claim flow:
  base64-decode the token to get a URL, POST to that URL with no body,
  the response body is the access URL).
- Writes SIMPLEFIN_ACCESS_URL=<url> to ~/.config/finance-sync/.env with
  permissions 0600 (create the parent dir if needed).
- Shreds the original token file: `shred -u` on Linux, `rm -P` on macOS;
  fall back to overwriting with random bytes + unlink if neither exists.
- Prints "Bootstrapped." and exits 0 on success. Prints a clear error and
  exits nonzero on any failure, WITHOUT leaking the token to stdout/stderr.

Stop after Phase 0 and let me run the script and verify. Don't proceed
until I confirm.

Phase 1 — Sync.

Build a `finance` CLI that pulls transactions from SimpleFIN and stores
them in SQLite at ~/.local/share/finance/finance.db.

SimpleFIN access URL is read from ~/.config/finance-sync/.env. Use HTTP
basic auth (the URL itself is of the form https://USER:PASS@host/path —
split it).

Schema (keep it minimal, no ORM):
  accounts(id TEXT PRIMARY KEY, name, currency, institution)
  transactions(
    id TEXT PRIMARY KEY,         -- SimpleFIN transaction id
    account_id TEXT,
    posted INTEGER,              -- unix seconds
    pending INTEGER,             -- 0 or 1
    amount REAL,                 -- signed; negative is debit
    description TEXT,            -- raw
    category TEXT,               -- assigned by rules.yaml later
    hash TEXT                    -- sha256 of (account_id|posted|amount|description) for safety dedup
  )
  sync_runs(started_at INTEGER, finished_at INTEGER, ok INTEGER, error TEXT)

CLI:
  finance sync              Pull last 90 days, insert new transactions
                            (idempotent on transactions.id; also de-dupe by hash).
  finance sync --dry-run    Print counts of would-insert / would-skip.
  finance accounts          List accounts and balances.
  finance recent [-n 50]    Print most recent transactions.

Hard requirements:
- Idempotent: running sync twice in a row never duplicates rows.
- Pending -> posted transitions update the existing row, don't insert.
- Never print the access URL or the hostname's credentials to logs.
- All HTTP timeouts default to 30s.
- Use only: httpx, click, python-dotenv. Stdlib for sqlite3.

Stop after Phase 1 and let me run `finance sync` against real data.

Phase 2 — Categorization.

Add `rules.yaml` in the project folder, gitignored by default (it may
contain merchant names). Format:

  rules:
    - match: "STARBUCKS|BLUE BOTTLE"
      category: "Coffee"
    - match: "WHOLE FOODS|TRADER JOE'S"
      category: "Groceries"
    - match: "^UBER\\b"
      category: "Transport"
  default: "Uncategorized"

Each rule's `match` is a case-insensitive regex against the transaction
description. First match wins. Add:

  finance categorize         Apply rules to all transactions, update the
                             `category` column. Idempotent.
  finance categorize --dry-run

Also write a starter rules.yaml seeded with ~15 common US merchant patterns.

Phase 3 — MCP server for Claude Desktop.

Build an MCP server (`finance-mcp`) using the official MCP Python SDK,
stdio transport. Read-only access to the same SQLite DB.

Tools to expose:
  summarize_spending(start_date, end_date, group_by)
      group_by in ("category", "month", "merchant"). Returns a list of
      {key, total, count}.
  search_transactions(query, limit=50)
      Description regex match, plus optional date range.
  list_categories()
      Distinct categories with counts.
  recent_transactions(n=20)
      Most recent N transactions.

The MCP server must NEVER expose write tools. The schema and queries
are read-only. Parameters use parameterized SQL.

In the README, include the exact JSON snippet to drop into
claude_desktop_config.json for both macOS and Linux paths. Include the
"restart Claude Desktop" instruction.

Project layout:
  money/
    pyproject.toml
    .env.example                (SIMPLEFIN_ACCESS_URL=)
    .gitignore                  (.venv, .env, rules.yaml, *.db)
    bootstrap_secret.py
    rules.yaml.example          (committed; the real rules.yaml is gitignored)
    src/finance/
      __init__.py
      cli.py
      sync.py
      db.py
      categorize.py
      mcp_server.py
    scripts/
      com.user.finance-sync.plist     (macOS, generated only when I ask)
      finance-sync.service             (Linux)
      finance-sync.timer
    README.md

README sections, in order:
  1. What this is (1 paragraph)
  2. The safety hack (link to the project doc; one paragraph)
  3. Phase-by-phase setup (numbered, mirrors what we just built)
  4. Scheduling background sync (launchd / systemd, with the exact `launchctl
     load` / `systemctl --user enable --now` commands)
  5. Connecting Claude Desktop (the JSON snippet, the restart step, a few
     example questions to try)
  6. Troubleshooting

Code quality bar: small, readable, no unnecessary abstractions. No Pydantic.
No "models" layer. Dict-based row results are fine. Tests only for
categorize() and the dedup logic.

When you're ready, start with Phase 0 and STOP for my confirmation.
```

---

## When something goes wrong

- **`bootstrap_secret.py` says the claim failed** — usually one of two things. (1) The token already got claimed (they're one-shot). Go back to bridge.simplefin.org and re-issue. (2) Your network/proxy is intercepting TLS. Try from a normal connection.
- **Sync inserts zero rows but you know there are transactions** — check `finance sync --dry-run` output. SimpleFIN only returns recent activity by default; ask Claude to add a `--since YYYY-MM-DD` flag.
- **Claude Desktop doesn't see the MCP server** — restart it (fully quit, then reopen). Check the JSON syntax — a stray comma will silently disable everything. The Desktop app has a "Developer" → "MCP" log if you turn it on; that's the fastest way to see why a server isn't loading.
- **Claude Desktop sees the server but gives nonsense answers** — your `category` column is mostly `Uncategorized`. Edit `rules.yaml`, run `finance categorize`, ask again.

## Tips

- **`rules.yaml` is the file you'll edit most.** Treat it like a personal config. Tune it once a week for a month and your categorization will be excellent. Don't let Claude "improve" it without asking — it'll over-engineer.
- **The MCP integration is the moment everything pays off.** It's the difference between a script you forget and a tool that's *there*, in your normal Claude conversations, whenever you have a money question. That's why we did all this.
- **Back up the DB.** It's small (`~/.local/share/finance/finance.db`). Throw `cp finance.db finance-$(date +%F).db` in a weekly cron job. Or ask Claude.
- **Apply the safety hack to other secrets.** Anywhere you have an API key, an OAuth refresh token, an app password — you can use the same pattern. Write the secret to disk by hand, let Claude write the consumer/shredder, never paste it in chat.

**Previous:** [Project 3 — Morning Briefing](./03-briefing.md)

---

You finished the four projects. Real things you built and use. Time to invent your own. Open the project folder for whatever you have in mind, run `claude`, and tell it what you want. You already know the loop.
