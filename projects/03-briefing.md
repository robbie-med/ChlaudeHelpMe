# Project 3 — Morning Briefing

**Time:** an evening. **Setup:** a `.env` file. **Goal:** your first integration with the outside world.

One command, one screen of useful information: today's weather, top headlines, and (optionally) the count of unread emails in your inbox. Runs whenever you want it — manually, or on a schedule so it's waiting when you sit down with coffee.

This is where you meet `.env` files, app-specific passwords, and "graceful degradation" — fancy words for *the script keeps working even if one section can't reach the internet.*

## What you'll need

- The basics from Project 1 and 2.
- Optional: an email account that supports IMAP and **app-specific passwords** (Gmail, iCloud, Fastmail all do). If you don't want to wire up email, skip the email section — the script works without it.
- No paid API keys. Weather (Open-Meteo) and news (Hacker News) are both free and require no signup.

## Setup walkthrough

1. **Make the project folder:**
   ```bash
   mkdir -p ~/projects/briefing && cd ~/projects/briefing
   git init
   ```
2. **Create an empty `.env`** (you'll fill it in when Claude asks):
   ```bash
   touch .env
   chmod 600 .env
   echo ".env" > .gitignore
   ```
3. **Start Claude Code** and paste the prompt below.
4. **First run:**
   ```bash
   briefing
   ```
   You should see weather and HN headlines immediately. If you didn't set email config, the email section will say `(unavailable: not configured)` and the rest will still print. That's the design.
5. **Schedule it to run in the background** (ask Claude after the basics work). Pick one:
   - macOS: a `launchd` plist that runs at 7am, writing the markdown to `~/.local/state/briefing/today.md`.
   - Linux: a `systemd --user` timer doing the same.
   - Either OS: a one-line `crontab` entry.

   Claude will write the file and tell you the command to enable it. Once it's running, you can open Claude Desktop and ask *"read `~/.local/state/briefing/today.md` and summarize"* — your briefing is now part of any conversation, without you running anything by hand.

## Adding email (optional)

Most email providers don't let you log in with your normal password from a script. You need an **app-specific password**: a separate, revocable password meant for programs. Search "<your provider> app password" — there's a settings page in every major mail provider. Generate one, paste it into `.env` as `IMAP_PASS`, and you're done. If the script ever leaks somewhere it shouldn't, you revoke that one password — not your real one.

## The prompt

---

```
Build a `briefing` CLI that prints a one-screen morning summary. Single
Python project, minimal dependencies.

Sections, in order, each independent (failure in one doesn't break the rest):
1. Date and weather. Use Open-Meteo (no key required). Read LAT and LON from
   .env. If missing, prompt me in the README to add them.
2. Top 10 Hacker News stories from the last 24 hours with score > 100. Use
   the public Firebase API at https://hacker-news.firebaseio.com/v0/. No key.
3. Email (optional). If IMAP_HOST, IMAP_USER, IMAP_PASS are set in .env,
   connect read-only and print the count of unread messages plus the latest
   5 unread subject lines. Use stdlib imaplib. NEVER mark anything as read.
   If any of the three IMAP vars is missing, print "(email: not configured)"
   and move on.

Output:
- Markdown to stdout by default, formatted with `rich` so it looks nice in
  the terminal but renders as plain markdown when piped.
- `briefing --out PATH` writes the markdown to a file instead.
- `briefing --json` prints the same data as JSON (handy if I want to script on it).

CLI:
  briefing              Print to stdout
  briefing --out PATH   Write markdown to file
  briefing --json       Emit JSON
  briefing config show  Print resolved config with secrets redacted

Hard requirements:
- All secrets read from `.env` in the current folder, via `python-dotenv`.
- Network calls have a 10-second timeout. If something times out, that
  section says "(unavailable: timeout)" and the rest still runs.
- Cache HN and weather responses for 10 minutes (in a temp file) so I can
  run `briefing` repeatedly without hammering the APIs.
- No "scheduling" code in the Python itself. Scheduling is the OS's job.

Project layout:
  briefing/
    pyproject.toml
    .env.example     (LAT, LON, IMAP_HOST, IMAP_USER, IMAP_PASS — all with placeholder values)
    .gitignore       (.venv, .env, __pycache__, cache files)
    src/briefing/
      cli.py
      weather.py
      news.py
      mail.py
      config.py
      cache.py
    README.md

In the README, include a section "Scheduling it" with three short subsections:
launchd, systemd --user, cron. Don't write the schedule files in this round —
just describe them, with the exact command to enable each. I'll ask for the
files when I'm ready.

Dependencies: httpx, rich, python-dotenv, click. Nothing else.

Before you start, summarize in three sentences. Then build it.
```

---

## When something goes wrong

- **Weather section says "no location set"** — open `.env` and add `LAT=...` and `LON=...`. Google "lat lon <your city>" — Wikipedia usually has it.
- **Email section says "AUTHENTICATIONFAILED"** — you're using your real password instead of an app-specific one. Generate one from your provider's account settings page.
- **The script is slow** — a flaky API. The cache means the second run will be instant. If one section is consistently slow, ask Claude to drop its timeout.

## Tips

- Run it manually for a few days before you schedule it. You'll catch the small annoyances — wrong city, too many HN stories, whatever — and fix them while the code is still fresh in your head.
- The `--json` flag is the secret weapon. Once you have it, you can pipe to `jq`, post to a webhook, or feed it back to Claude for a longer prose summary.
- If you want a longer "what's in my day" summary, open Claude Code in the folder and ask: *"run `briefing --json`, then read it and write a one-paragraph human summary I can put in my journal."*

**Previous:** [Project 2 — Notes Search & Q&A](./02-notes.md) · **Next:** [Project 4 — Money Dashboard →](./04-money.md)
