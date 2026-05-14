# Project 2 — Smart Downloads Organizer

Tame your `~/Downloads` folder. A background service watches for new files, sorts them by type and inferred purpose, and routes ambiguous ones past Claude for a one-line classification. Nothing leaves your machine except the filename and a short description — never file contents — and only when you opt in.

## What you'll need

- macOS or Linux.
- Python 3.11+.
- Optional: an Anthropic API key (only needed if you want Claude to classify ambiguous files). Without it, the tool falls back to extension-based rules.

## Setup walkthrough

1. **Make and enter the project folder:**
   ```bash
   mkdir -p ~/projects/downloads-organizer && cd ~/projects/downloads-organizer
   git init
   ```
2. **Create the secrets file** (only if you want AI classification):
   ```bash
   touch .env && chmod 600 .env
   ```
   Inside `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-xxxx
   ```
   Add `.env` to `.gitignore`.
3. **Start Claude Code** in the folder and paste the prompt below.
4. **Edit `rules.yaml`** that Claude creates — this is the source of truth for "PDFs go here, screenshots go there." Override anything you disagree with by hand.
5. **Test it once** by running `organize --dry-run` and dropping a few files in `~/Downloads`. Confirm nothing got moved that shouldn't.
6. **Install it as a background service** using the launchd plist (macOS) or systemd user unit (Linux) Claude generates. Ask Claude to walk you through `launchctl load` / `systemctl --user enable`.

## The prompt

---

```
Build a local "Smart Downloads Organizer" — a Python service that watches ~/Downloads and sorts files into a tidy structure.

Goals:
- Local-first, safe by default (dry-run mode mandatory before first real move)
- Predictable rule-based sorting, with optional AI classification for ambiguous files
- Logged moves, reversible via an "undo last run" command
- Never deletes files; only moves them
- Honors a user-editable rules.yaml

Target structure (configurable):
~/Documents/Inbox/
  PDFs/
  Images/Screenshots/
  Images/Photos/
  Code/
  Installers/
  Archives/
  Media/
  Receipts/
  Misc/<YYYY-MM>/

Behavior:
- Watches ~/Downloads with watchdog (filesystem events)
- Applies rules from rules.yaml first (extension, filename regex, mime type, source app via xattr if available)
- If no rule matches, optionally calls the Claude API with ONLY the filename + size + mime type (never the contents) and asks for a single-category classification
- Atomic moves; if destination exists, append " (1)", " (2)", etc.
- Maintains ~/.local/state/downloads-organizer/history.jsonl recording every move with timestamp + original/new path
- `organize undo` reverses the most recent run

CLI:
organize watch              # daemon mode
organize once               # single pass over Downloads
organize --dry-run          # show what would happen
organize undo               # reverse last run
organize rules show         # print resolved rules
organize stats              # what moved where, last 30 days

Project layout:
downloads-organizer/
  README.md
  pyproject.toml
  .env.example
  .gitignore
  rules.yaml                # default rules, user-editable
  organizer/
    __init__.py
    cli.py
    watcher.py
    rules.py
    classifier.py           # optional Claude call
    mover.py
    history.py
  scripts/
    com.user.downloads-organizer.plist   # launchd
    downloads-organizer.service          # systemd --user
  tests/

Hard requirements:
- Default config NEVER touches files older than 1 hour (gives user time to grab a fresh download)
- Default config NEVER touches files currently held open (check with lsof or fuser)
- Symlinks are not followed
- Hidden files (leading dot) are ignored
- If Anthropic key is missing, classifier falls back to "Misc/<YYYY-MM>/" silently
- API calls send filename + size + mime only — never file bytes
- All moves logged before they happen

Code quality:
- Typed Python, Pydantic for config
- Minimal dependencies (watchdog, pyyaml, pydantic, python-magic, anthropic optional)
- Unit tests covering rule matching, the "file in use" guard, undo, and dedup-rename
- A README with installation, service setup for both macOS and Linux, and a recovery section

Before writing code, ask me 5 clarifying questions about my folder preferences, whether I want the AI classifier on by default, and what file types I most care about.
```

---

## Tips

- The very first run, **always use `--dry-run`** and read the output carefully.
- Keep `rules.yaml` in git. It's the most valuable file in this project.
- If a move ever surprises you, `organize undo` reverses it. The history log is your friend.
