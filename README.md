# ChlaudeHelpMe — A Starter Kit for Claude Code on Mac & Linux

> 🌐 **Looking for the prettier version?** This same content is rendered as a polished static website at the repo root (`index.html`, `beginners.html`, `projects/*.html`). Once GitHub Pages is enabled, share `https://YOUR-USERNAME.github.io/ChlaudeHelpMe/`. The README below is the GitHub-friendly mirror.

This repo is a friendly on-ramp for using **Claude Code** — Anthropic's command-line coding assistant — on your own computer. It contains:

1. A step-by-step **setup guide** (this README) for macOS and Linux.
2. Seven **copy-paste project prompts** that turn Claude Code into a genuinely useful personal tool.
3. A separate **[BEGINNERS.md](./BEGINNERS.md)** that explains terminals, folders, env files, API keys, and "how do I actually iterate on a project?" in plain English.
4. A **static website** version of everything above — `index.html` at the repo root, designed for sharing as a link via GitHub Pages.

If you've never used a terminal before, **start with [BEGINNERS.md](./BEGINNERS.md)** and come back here.

---

## What is Claude Code?

Claude Code is a CLI (command-line) tool. You open a terminal, `cd` into a folder, run `claude`, and then talk to Claude in plain English. Claude can read your files, run commands, write code, run tests, and iterate with you. It is interactive — like pair programming with someone who never gets tired.

You do **not** need to be a programmer to use it. You do need to be willing to read what it tells you and answer its questions.

---

## Part 1 — Install Claude Code

### macOS

You have two reasonable options. **Pick one.**

#### Option A — Homebrew (recommended if you already use it)

1. Open the **Terminal** app (press `Cmd+Space`, type "Terminal", hit Enter).
2. If you don't have Homebrew, install it from [brew.sh](https://brew.sh) by pasting the command on that page.
3. Install Claude Code:
   ```bash
   brew install --cask claude-code
   ```
4. Verify it's installed:
   ```bash
   claude --version
   ```

#### Option B — Official installer script

1. Open Terminal.
2. Paste:
   ```bash
   curl -fsSL https://claude.ai/install.sh | bash
   ```
3. Close and reopen Terminal so your shell picks up the new command.
4. Verify:
   ```bash
   claude --version
   ```

### Linux

The official installer works on most major distros (Ubuntu, Debian, Fedora, Arch, etc.).

1. Open a terminal.
2. Paste:
   ```bash
   curl -fsSL https://claude.ai/install.sh | bash
   ```
3. The script will tell you if it added something to your `PATH`. If it did, run:
   ```bash
   source ~/.bashrc      # or ~/.zshrc if you use zsh
   ```
4. Verify:
   ```bash
   claude --version
   ```

#### If `claude` isn't found

The installer puts the binary in `~/.local/bin` or similar. Make sure that directory is on your `PATH`. The simplest fix:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

---

## Part 2 — Sign in

The first time you run `claude`, it will prompt you to authenticate. You have two choices:

- **Claude.ai account (subscription)** — log in with your Anthropic account in the browser window that pops up. Easiest. If you have Claude Pro or Max, this is what you want.
- **API key (pay-as-you-go)** — get a key from [console.anthropic.com](https://console.anthropic.com), then run `claude` and paste the key when prompted. This bills usage to your Anthropic account.

> **What's an API key?** A long random string that proves you're allowed to use the service. Treat it like a password. See [BEGINNERS.md](./BEGINNERS.md) for the full explanation.

---

## Part 3 — Your first session

1. Make a folder for your project (you can put it anywhere):
   ```bash
   mkdir -p ~/projects/hello-claude
   cd ~/projects/hello-claude
   ```
2. Start Claude Code:
   ```bash
   claude
   ```
3. You'll see a prompt. Try:
   > Make a simple "Hello, world" Python script and run it.

4. Claude will ask for permission before running commands or editing files. Read each prompt before approving. Default to **"yes for this command only"** while you're learning.

That's it. You've used Claude Code.

---

## Part 4 — Day-to-day usage

A few habits that pay off:

- **One folder per project.** Don't run `claude` in your home directory. Make a folder for each tool/idea and `cd` into it.
- **Use git from day one.** Even for tiny projects: `git init` so you can undo Claude's changes with `git diff` and `git restore`. [BEGINNERS.md](./BEGINNERS.md) has a 60-second git primer.
- **Iterate in small steps.** "Build me a finance app" is a worse prompt than "Set up the database schema first; we'll add the import script after."
- **Read the diffs.** When Claude proposes changes, skim them. You'll learn fast and catch mistakes early.
- **Slash commands.** Inside Claude Code, type `/help` to see built-in commands like `/clear`, `/model`, `/cost`, and more.

---

## Part 5 — Seven copy-paste projects

Each link below opens a markdown file with **(a)** a setup walkthrough and **(b)** a long, carefully written prompt you can paste straight into Claude Code. These are designed to produce real, useful tools — not toys.

| # | Project | What it does |
|---|---------|--------------|
| 1 | [Personal Finance Helper](./projects/01-finance-helper.md) | Pulls your bank transactions locally, categorizes them, lets Claude answer "where did my money go this month?" |
| 2 | [Smart Downloads Organizer](./projects/02-downloads-organizer.md) | Watches your Downloads folder and auto-sorts files by type, date, and inferred purpose. |
| 3 | [Personal Knowledge Base](./projects/03-knowledge-base.md) | Index your markdown notes (or Apple Notes / Obsidian / Bear export) and ask Claude questions across all of them. |
| 4 | [Daily Briefing Generator](./projects/04-daily-briefing.md) | A single command that gives you weather, calendar, news, and email summary — printed to your terminal each morning. |
| 5 | [Meal Planner & Grocery List](./projects/05-meal-planner.md) | Knows what's in your pantry, plans a week of meals, generates a deduplicated grocery list. |
| 6 | [Photo Library Deduplicator](./projects/06-photo-dedupe.md) | Safely finds duplicate and near-duplicate photos, lets you review before deleting. |
| 7 | [Habit & Mood Tracker CLI](./projects/07-habit-tracker.md) | A tiny terminal app that logs daily habits and mood into SQLite, draws charts, gives you a weekly review. |

> **How to use these:** Open the file, follow the setup section, then copy the prompt block and paste it into a fresh Claude Code session inside the project folder. Claude will build the tool with you.

---

## Part 6 — When something goes wrong

- **`claude: command not found`** — the install directory isn't on your `PATH`. See the Linux troubleshooting note above.
- **Claude is "stuck" or context feels stale** — type `/clear` to start a clean conversation in the same folder.
- **You don't like a change Claude made** — `git diff` shows what changed; `git restore <file>` undoes it.
- **Costs feel high** — type `/cost` mid-session to see usage. Use `/model` to switch to a cheaper model for simple tasks.
- **You're lost** — paste the error message into Claude and ask "what does this mean and how do I fix it?" It's good at this.

---

## Part 7 — Sharing the website

The repo root contains a fully static website (HTML/CSS/JS only — no build step). To share it as a link:

**Option A — GitHub Pages (free, recommended):**

1. Push this repo to GitHub.
2. In the repo settings → Pages, set the source to "Deploy from a branch", pick your branch, and leave the folder as `/ (root)`.
3. GitHub gives you a URL like `https://YOUR-USERNAME.github.io/ChlaudeHelpMe/` — share that. (The `.nojekyll` file at the root keeps GitHub from mangling the site.)

**Option B — Local preview:**

```bash
python3 -m http.server 8000
# open http://localhost:8000 in your browser
```

**Option C — Anywhere else:** the repo works on Netlify, Vercel, Cloudflare Pages, or any static host. Just point it at the repo root; no build command needed.

---

## Part 8 — Where to go next

- **[BEGINNERS.md](./BEGINNERS.md)** — terminals, paths, env files, API keys, and a project workflow that works for non-coders.
- **Official docs** — [docs.claude.com/claude-code](https://docs.claude.com/en/docs/claude-code) (settings, hooks, MCP, sub-agents).
- **Pick a project above** and just start. You learn this stuff by doing it, not by reading about it.

Happy building.
