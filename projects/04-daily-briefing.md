# Project 4 — Daily Briefing Generator

One command, one screen of useful information: weather, today's calendar, unread email count with subject highlights, top headlines, and a "what was open in my editor yesterday" reminder. Runs locally each morning and prints to your terminal — or to a markdown file you read with coffee.

## What you'll need

- macOS or Linux.
- Python 3.11+.
- For weather: a free [OpenWeatherMap](https://openweathermap.org/api) or [Open-Meteo](https://open-meteo.com) key (Open-Meteo is keyless, recommended).
- For calendar: a CalDAV URL (iCloud, Google, Fastmail all support this) OR a local `.ics` file path.
- For email: an IMAP-enabled mailbox (Gmail, iCloud, Fastmail, etc.). An app-specific password, not your main password.
- Optional: a news source preference (Hacker News by default, no key needed).

## Setup walkthrough

1. **Make the project folder:**
   ```bash
   mkdir -p ~/projects/daily-briefing && cd ~/projects/daily-briefing
   git init
   ```
2. **Create the secrets file:**
   ```bash
   mkdir -p ~/.config/briefing
   touch ~/.config/briefing/.env && chmod 600 ~/.config/briefing/.env
   ```
   Inside it:
   ```
   LOCATION=Brooklyn,NY
   CALDAV_URL=https://caldav.icloud.com/...
   CALDAV_USER=you@icloud.com
   CALDAV_PASS=app-specific-password
   IMAP_HOST=imap.fastmail.com
   IMAP_USER=you@example.com
   IMAP_PASS=app-specific-password
   ANTHROPIC_API_KEY=sk-ant-xxxx   # optional, used for the prose summary
   ```
3. **Open Claude Code** in the project folder and paste the prompt.
4. **First run** with `briefing --dry-run` so nothing tries to send mail or notifications by accident.
5. **Schedule it** to run at 7am: Claude generates a launchd plist (macOS) or a systemd timer (Linux). Output goes to `~/.local/state/briefing/today.md` and optionally to a macOS notification or your terminal at next login.

## The prompt

---

```
Build a Daily Briefing CLI that produces a one-screen morning summary, fully local.

Sections, in order:
1. Date, day, weather (today + tomorrow forecast)
2. Calendar: today's events, with travel-time hints if location is in event
3. Email: unread count + 5 highest-priority subject lines (priority by sender VIP list + keyword rules)
4. News: top 10 Hacker News stories with score > 200 from last 24h (configurable feed)
5. Yesterday at a glance: from a simple "wins.md" or "log.md" the user maintains, the most recent entry
6. One-paragraph prose summary (uses Claude API if ANTHROPIC_API_KEY is set, otherwise concatenates section headers)

Data sources:
- Weather: Open-Meteo (no key) by default; OpenWeatherMap if OWM_KEY present
- Calendar: CalDAV (icalendar + caldav libs) OR a local .ics path
- Email: IMAP (imaplib + email stdlib); read-only, never marks as read
- News: HN Firebase API (no key)

CLI:
briefing                    # print to stdout
briefing --md PATH          # write markdown to file
briefing --notify           # macOS osascript notification / linux notify-send with the summary
briefing --dry-run          # skip network, use cached fixtures
briefing config show        # print resolved config (secrets redacted)

Hard requirements:
- All secrets from ~/.config/briefing/.env, never from the project folder
- Email module is read-only; uses IMAP IDLE only if --watch is passed
- VIP list and keyword rules live in ~/.config/briefing/rules.yaml
- Caches API responses for 10 minutes to make repeated runs cheap
- Output is plain markdown that renders nicely in terminal (use rich) and in any markdown viewer
- Failures in any single section degrade gracefully — that section says "(unavailable: <reason>)" and the rest still prints

Project layout:
daily-briefing/
  README.md
  pyproject.toml
  .env.example
  briefing/
    cli.py
    weather.py
    calendar_.py
    mail.py
    news.py
    summarize.py
    cache.py
    config.py
  scripts/
    com.user.briefing.plist
    briefing.service
    briefing.timer
  tests/

Code quality:
- Typed Python, Pydantic config
- Minimal deps: httpx, caldav, icalendar, imapclient, rich, pyyaml, pydantic, anthropic optional
- Tests with recorded fixtures (no live network in tests)
- Clear README with examples for both macOS scheduling and Linux

Before writing code, ask me 5 clarifying questions about my calendar source, my email provider, my VIP list, and what time of day I want this to run.
```

---

## Tips

- Use **app-specific passwords**, not your real password. Every major provider has them — search "app password <provider>".
- Run it manually for a week and tweak `rules.yaml` before turning on the scheduler. The rule tuning is where most of the value lives.
- If you want it pinned somewhere visible all day, pipe the markdown into your favorite note-taking app's "today" file.
