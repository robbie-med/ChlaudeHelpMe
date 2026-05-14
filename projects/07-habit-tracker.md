# Project 7 — Habit & Mood Tracker CLI

A small, beautiful terminal app for daily habits and mood. Log a check-in in ten seconds. SQLite under the hood, so your data is yours. Weekly review prints streaks, charts, and a one-paragraph reflection (optionally written by Claude from your week's data — pattern-spotting, not therapy).

## What you'll need

- macOS or Linux.
- Python 3.11+.
- A terminal that supports 256 colors (basically all modern ones).
- Optional: Anthropic API key, only for the AI-written weekly reflection.

## Setup walkthrough

1. **Make the project folder:**
   ```bash
   mkdir -p ~/projects/habit-tracker && cd ~/projects/habit-tracker
   git init
   ```
2. **Create the data folder** (this is where your tracker lives, separate from code):
   ```bash
   mkdir -p ~/.local/share/habit
   ```
3. **(Optional) `.env` for AI reflections:**
   ```
   ANTHROPIC_API_KEY=sk-ant-xxxx
   ```
4. **Open Claude Code**, paste the prompt below.
5. **Initial setup**:
   ```bash
   habit init           # interactive: define your habits
   habit checkin         # interactive daily log
   ```
6. **Add it to your shell startup** so it nudges you once a day (Claude provides a snippet for `~/.zshrc` or `~/.bashrc`).
7. **Review weekly**:
   ```bash
   habit week
   habit chart sleep --last 30
   ```

## The prompt

---

```
Build a Habit & Mood Tracker CLI — small, fast, beautiful in the terminal.

Goals:
- Daily check-in takes < 15 seconds
- Stores everything in SQLite at ~/.local/share/habit/habit.sqlite
- Tracks habits (boolean / numeric / scale 1-5) AND mood + free-text journal
- Streaks, weekly summary, ASCII charts
- Optional AI reflection at end of week (Claude API; only sends aggregated, anonymized data)
- Works offline; AI is purely additive

Habit types:
- boolean: "Did I X today?" (meditate, lift weights)
- numeric: "How many?" (glasses of water, pages read)
- scale: 1-5 (sleep quality, energy)

CLI (built with Textual or Rich + Click; prefer Click + Rich for simplicity):
habit init                        # interactive setup: define habits
habit checkin [--date YYYY-MM-DD] # interactive logging
habit show today
habit show week
habit streak [habit]
habit chart <habit> [--last N]    # sparkline / bar chart in terminal
habit journal add "free text"
habit journal show --last 7
habit week                        # full weekly review: streaks, mood trend, journal recap
habit week --ai                   # plus a 1-paragraph reflection from Claude
habit export --format {csv,json,markdown}
habit import <file>

Database schema:
- habits(id, name, type, unit, target, created_at, archived)
- entries(id, habit_id, date, value, note)
- moods(id, date, score, note)
- journal(id, date, body)

Hard requirements:
- Single SQLite file, durable (WAL mode)
- Migrations folder; first version is migration 001
- Backup command: `habit backup` writes a timestamped copy to ~/.local/share/habit/backups/
- AI reflection (when enabled) is sent ONLY aggregated counts and 1-5 scale averages plus the journal text the user wrote; no raw entries beyond that
- AI prompt explicitly instructs Claude: "describe patterns; do not diagnose, do not advise medically"
- Every destructive action confirms (delete habit, drop entries)
- Output uses Rich for color but degrades gracefully when piped (TTY check)

Project layout:
habit-tracker/
  README.md
  pyproject.toml
  .env.example
  habit/
    cli.py
    db.py
    migrations/
      001_initial.sql
    models.py
    checkin.py
    summary.py
    charts.py
    ai_reflection.py
    backup.py
  tests/

Code quality:
- Typed Python, Pydantic models
- Minimal deps: click, rich, pydantic, anthropic optional
- Tests cover streak math, week-boundary edge cases, migrations, and backup
- README screenshot of a terminal session (use a code block, don't generate images)

Before writing code, ask me 5 clarifying questions about which habits I want to track, my week-start day, whether I want a morning or evening check-in, and whether the AI reflection should be on by default.
```

---

## Tips

- The biggest predictor of habit-tracker success is *speed of check-in*. Resist the urge to add ten fields.
- The journal is where the value compounds. Even a one-sentence entry per day becomes priceless after six months.
- `habit backup` weekly. Cron it or just remember after `habit week`. Your SQLite file is your data — back it up.
