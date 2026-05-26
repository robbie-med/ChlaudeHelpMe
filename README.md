# ChlaudeHelpMe — A Starter Kit for Claude Code

> 🌐 **Prettier version:** the same content is rendered as a static website at the repo root (`index.html`, `beginners.html`, `projects/*.html`). With GitHub Pages enabled, share [chlaudehelpme.robbiemed.org](https://chlaudehelpme.robbiemed.org). The README below is the GitHub-friendly mirror.

A friendly on-ramp to **Claude Code** — Anthropic's command-line coding assistant — on Mac or Linux. Zero to sixty in four projects. No prior coding experience required, but a willingness to read what the computer tells you is non-negotiable.

The four projects build on each other:

1. **Folder Tidy** (15 min) — your first one-shot script. No APIs, no secrets, no database. Just feel the loop.
2. **Notes Search & Q&A** (1 hr) — a proper multi-file tool with a SQLite index. Ask Claude questions about your notes without paying for a separate API key.
3. **Morning Briefing** (an evening) — your first integration with the outside world. `.env` files, scheduled background runs, graceful failure.
4. **Personal Money Dashboard** (a weekend) — the finish line. Bank transactions via SimpleFIN, background sync daemon, MCP server that plugs into Claude Desktop so any conversation can answer *"where did my money go in March?"*.

If you've never used a terminal before, **start with [BEGINNERS.md](./BEGINNERS.md)** and come back here.

---

## What is Claude Code?

A CLI tool. You open a terminal, `cd` into a folder, run `claude`, and talk in plain English. Claude reads files, runs commands, writes code, runs tests, and iterates with you — like pair programming with someone who never gets tired and doesn't judge your bash.

You do **not** need to be a programmer to use it. You do need to read each permission prompt before approving, and answer Claude's questions honestly when it asks.

---

## Part 1 — Install Claude Code

### macOS

Two reasonable options. Pick one.

**Homebrew (recommended if you already use it):**

1. Open **Terminal** (`Cmd+Space`, type "Terminal").
2. If you don't have Homebrew, install it from [brew.sh](https://brew.sh).
3. Install Claude Code:
   ```bash
   brew install --cask claude-code
   ```
4. Verify:
   ```bash
   claude --version
   ```

**Official installer:**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Close and reopen Terminal, then `claude --version`.

### Linux

The installer works on Ubuntu, Debian, Fedora, Arch, and most other major distros.

```bash
curl -fsSL https://claude.ai/install.sh | bash
source ~/.bashrc      # or ~/.zshrc if you use zsh
claude --version
```

If `claude` isn't found, the binary is probably in `~/.local/bin`. Add that to PATH:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

---

## Part 2 — Sign in

The first time you run `claude`, it prompts you to authenticate. Two choices:

- **Claude.ai account (subscription)** — log in via the browser window that pops up. Easiest. If you have Claude Pro or Max, this is what you want.
- **API key (pay-as-you-go)** — get one from [console.anthropic.com](https://console.anthropic.com) and paste it when prompted. Bills usage to your Anthropic account.

> **What's an API key?** A long random string that proves you're allowed to use the service. Treat it like a password. See [BEGINNERS.md](./BEGINNERS.md#6-what-is-an-api-key) for the full explanation.

---

## Part 3 — Your first session

```bash
mkdir -p ~/projects/hello-claude
cd ~/projects/hello-claude
claude
```

Try:

> Make a simple "Hello, world" Python script and run it.

Claude asks for permission before running commands or editing files. **Read each prompt before approving.** Default to *"yes for this command only"* while you're learning.

That's it. You've used Claude Code.

---

## Part 4 — Day-to-day habits

- **One folder per project.** Don't run `claude` in your home directory.
- **Use git from day one.** `git init` even for tiny projects, so you can undo Claude's changes with `git diff` and `git restore`.
- **Iterate in small steps.** "Build me a finance app" is a worse prompt than "Set up the database schema first; we'll add the import script after."
- **Read the diffs.** When Claude proposes changes, skim them. You learn fast and catch mistakes early.
- **Slash commands.** Inside Claude Code, `/help` lists built-ins like `/clear`, `/model`, `/cost`.

---

## Part 5 — Four projects, zero to sixty

Each link opens a markdown file with (a) a setup walkthrough and (b) a carefully written prompt you paste into Claude Code. These produce real tools — not toys.

| # | Project | Time | What it does |
|---|---------|------|--------------|
| 1 | [Folder Tidy](./projects/01-folder-tidy.md) | 15 min | One Python script that sorts a messy folder by file type. Your first real loop. |
| 2 | [Notes Search & Q&A](./projects/02-notes.md) | ~1 hr | Index a folder of markdown/text notes into SQLite FTS5. Ask Claude questions in the same folder — no separate API key. |
| 3 | [Morning Briefing](./projects/03-briefing.md) | An evening | Weather + headlines + (optional) email. `.env` files, scheduled background runs, graceful degradation. |
| 4 | [Personal Money Dashboard](./projects/04-money.md) | A weekend | SimpleFIN sync daemon + SQLite + MCP server. Ask Claude Desktop where your money went. Includes the **secret-handling safety hack**. |

**How to use these:** open the file, follow the setup, copy the prompt block, paste it into a fresh Claude Code session inside the project folder. Claude builds the tool with you.

---

## Part 6 — When something goes wrong

- **`claude: command not found`** — install dir isn't on `PATH`. See the Linux troubleshooting note above.
- **Conversation feels stale** — `/clear` starts fresh in the same folder.
- **You don't like a change Claude made** — `git diff` shows what changed; `git restore <file>` undoes it.
- **Costs feel high** — `/cost` mid-session for usage; `/model` to switch to a cheaper model for simple tasks.
- **You're lost** — paste the error message into Claude and ask "what does this mean and how do I fix it?" It's good at this.

---

## Part 7 — Sharing the website

The repo root is a static website (HTML/CSS/JS only — no build step). To share it as a link:

**GitHub Pages:** push the repo, then in *Settings → Pages* set the source to "Deploy from a branch", pick your branch, leave the folder as `/ (root)`. GitHub gives you a URL. The `.nojekyll` file at the root keeps Pages from mangling things.

**Local preview:**

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Any static host works (Netlify, Vercel, Cloudflare Pages). No build command.

---

## Part 8 — Where to go next

- **[BEGINNERS.md](./BEGINNERS.md)** — terminals, paths, env files, API keys, and a workflow for non-coders.
- **Official docs** — [docs.claude.com/claude-code](https://docs.claude.com/en/docs/claude-code) (settings, hooks, MCP, sub-agents).
- **Pick a project above** and just start. You learn this by doing it.

Happy building.
