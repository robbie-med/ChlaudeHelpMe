# BEGINNERS.md — The "I've Never Done This Before" Guide

This guide assumes you've never seriously used a terminal, don't know what an env file is, and have never touched git. By the end, you'll know enough to confidently iterate on Claude Code projects on your own computer.

Read in order. Each section builds on the last. Skim if you already know the topic.

---

## 1. The Terminal (a.k.a. "the command line")

The Terminal is a window where you type commands and the computer runs them. It's not magic — it's the same computer, just without buttons.

- **macOS:** open the **Terminal** app (`Cmd+Space`, type "Terminal").
- **Linux:** open whatever terminal app your distro ships (GNOME Terminal, Konsole, etc.).

You'll see something like:

```
yourname@yourcomputer ~ %
```

The `~` is your **home folder** (e.g. `/Users/yourname` on Mac, `/home/yourname` on Linux). The `%` (or `$`) is the **prompt** — the computer is waiting for you to type a command.

### The 6 commands you need

| Command | What it does | Example |
|---------|--------------|---------|
| `pwd` | "Print working directory" — where am I? | `pwd` |
| `ls` | List files in the current folder | `ls` |
| `cd` | Change directory (move into a folder) | `cd Documents` |
| `cd ..` | Go up one folder | `cd ..` |
| `mkdir` | Make a new folder | `mkdir projects` |
| `clear` | Clear the screen | `clear` |

That's it. Everything else you can ask Claude.

> **Tip:** drag a folder from Finder/Files into the terminal window — it pastes the path. Useful when paths get long.

---

## 2. File paths

A **path** is the address of a file or folder. Two flavors:

- **Absolute** — starts at the root. `/Users/jane/projects/finance/app.py`
- **Relative** — starts where you are. If you're in `/Users/jane/projects/`, then `finance/app.py` refers to the same file.

Special shortcuts:

- `~` means your home folder. `~/Documents` = `/Users/jane/Documents`.
- `.` means "current folder."
- `..` means "parent folder."

If something says "save the file to `~/.config/myapp/.env`", that means: in your home folder, there's a hidden folder called `.config`, inside it a folder called `myapp`, inside that a hidden file called `.env`. (Files starting with `.` are hidden by default — `ls -a` shows them.)

---

## 3. What is a project, structurally?

A **project** is just a folder with related files inside it. That's it. Convention:

```
~/projects/
  finance-helper/        ← one project
    README.md
    .env                 ← your secrets (never share)
    .gitignore           ← tells git what to ignore
    app.py
    requirements.txt
  meal-planner/          ← another project
    ...
```

**Rules of thumb:**

- One folder per project. Don't mix two tools in one folder.
- Keep projects under `~/projects/` so you can find them.
- The folder name should be lowercase with dashes: `meal-planner`, not `Meal Planner` (spaces in paths are annoying).

---

## 4. What is an environment variable?

An **environment variable** is a named value the operating system makes available to programs that run. Think of it like a sticky note the OS hands to every program.

Common ones:

- `HOME` — your home folder path
- `PATH` — list of folders where the OS looks for commands
- `OPENAI_API_KEY` — many apps look for keys here

You can see them all with `env` in your terminal. You can set one for a single command like:

```bash
ANTHROPIC_API_KEY=sk-ant-xxxx claude
```

…or for the whole session by adding it to your shell config (`~/.zshrc` on Mac, `~/.bashrc` on Linux).

But the cleanest approach is a **.env file**.

---

## 5. What is a .env file?

A `.env` file is a plain text file that stores secrets and config values for one specific project. It usually lives in the project's root folder. Example:

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
SIMPLEFIN_ACCESS_URL=https://bridge.simplefin.org/...
DATABASE_PATH=./finance.sqlite
```

**Rules:**

1. **One key per line**, format is `NAME=value`. No spaces around `=`.
2. **Never put it in git** (see git section below). Add `.env` to a `.gitignore` file.
3. **Lock the permissions** so other users on the computer can't read it:
   ```bash
   chmod 600 .env
   ```
4. Always ship a **`.env.example`** alongside it — same keys, fake values — so future-you (or anyone else) knows what to fill in.

Programs load `.env` files with a library (e.g. `python-dotenv` in Python, `dotenv` in Node). The library reads the file and makes the values available as environment variables to the program.

---

## 6. What is an API key?

An **API key** is a long random string that identifies you to a service (like Anthropic's API, or your bank-data provider). It's a password your code uses instead of you typing one each time.

### Where do you get one?

- **Anthropic / Claude API:** [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key.
- **Other services:** each has its own dashboard. The pattern is always: sign in → developer/API section → create key.

### How do you keep it safe?

1. **Never paste it in chat, screenshots, or commit messages.**
2. **Never put it in a file that gets uploaded to GitHub.** Use `.env` (and gitignore `.env`).
3. **If you leak one, rotate it immediately** — delete the key in the dashboard and create a new one. Assume the old one is compromised.
4. **Set spending limits** in the provider's dashboard if they offer them. This caps the damage if a key leaks.

### How does it get used?

Your code reads it from the env (e.g. `os.environ["ANTHROPIC_API_KEY"]` in Python), and sends it as an HTTP header when calling the service. You shouldn't have to think about this — libraries handle it.

---

## 7. Git (the 60-second version)

**Git** is the "undo button for your project." Every Claude Code project should use it from day one.

### Setup once

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

### Per-project

Inside your project folder:

```bash
git init                  # turn this folder into a git repo
echo ".env" > .gitignore  # never track secrets
git add .                 # stage all current files
git commit -m "initial"   # snapshot them
```

### Daily

After Claude makes changes you like:

```bash
git add .
git commit -m "added grocery list export"
```

If you want to throw away changes that aren't committed yet:

```bash
git restore .             # everything back to last commit
```

If you want to see what changed:

```bash
git diff                  # unstaged changes
git log --oneline         # commit history
```

That's 95% of git for personal projects. You don't need GitHub unless you want to back up to the cloud or share.

---

## 8. How to iterate on a Claude Code project

This is the part most beginners get wrong: they ask Claude to "build the whole app" in one prompt, get a wall of code, can't debug it, and give up.

**Better workflow:**

1. **Write a short README first** describing what you want. (Or use one of the [project prompts](./projects/) in this repo.)
2. **Open Claude Code in the project folder.** `cd ~/projects/my-thing && claude`
3. **First message:** "Read the README. Ask me 5 clarifying questions before writing any code." Claude will surface assumptions you didn't realize you had.
4. **Build in vertical slices.** One feature, end-to-end, before moving on. Don't build the whole database schema, then the whole UI — build one feature all the way through, then the next.
5. **Commit after every working slice.** `git add . && git commit -m "what changed"`. This is your undo button.
6. **When something breaks, paste the full error** into Claude and ask "what does this mean?" Don't paraphrase the error — copy it verbatim.
7. **When you're confused, ask Claude to explain.** "Explain this file like I've never coded before."
8. **When the conversation gets long, use `/clear`** and start fresh in the same folder. Claude can re-read the files.

### Anti-patterns to avoid

- **"Just fix it" loops.** If Claude's fix didn't work twice, stop. Step back, read the code together, ask "what's actually happening here?"
- **Editing files manually without telling Claude.** It'll keep operating on a stale mental model. Either let Claude make all edits, or tell it "I edited X by hand, please re-read."
- **No commits.** If you never commit, you can't undo. Commit early and often, even with bad messages.
- **Pasting secrets into the chat.** Put them in `.env`. Tell Claude "read the API key from `.env`," not "here's my API key: …"

---

## 9. A starter folder layout

For your overall machine:

```
~/projects/                  ← all your Claude Code projects
  finance-helper/
  meal-planner/
  knowledge-base/
~/.config/                   ← per-app config (some projects put secrets here)
  finance-sync/
    .env
```

And inside a typical project:

```
my-project/
  README.md                  ← what this project is
  .env                       ← secrets, gitignored
  .env.example               ← template, safe to commit
  .gitignore                 ← list of things git should ignore
  src/                       ← the code
  tests/                     ← the tests
  data/                      ← local data (often gitignored)
```

Claude will set this up for you if you ask. The point is: there's a place for everything, and "where does this go?" is never a guess.

---

## 10. When you get stuck

In rough order:

1. **Read the error message.** Out loud if you have to. The answer is usually in it.
2. **Paste the error into Claude.** Verbatim. Ask "what does this mean?"
3. **Check your `.env`** — typos in env vars are responsible for an alarming share of "it doesn't work."
4. **Look at recent commits** — `git log --oneline`. What did you change since it last worked?
5. **`git restore .`** to nuke uncommitted changes if you're hopelessly tangled.
6. **`/clear` in Claude Code** and start the conversation fresh.
7. **Walk away for 10 minutes.** Genuinely. Half the time the answer arrives in the shower.

---

## 11. Glossary

| Term | Plain English |
|------|---------------|
| **CLI** | Command-line interface. A program you talk to by typing. |
| **Shell** | The program that reads your terminal input (`bash`, `zsh`, etc.). |
| **PATH** | List of folders where the shell looks for commands. |
| **Dependency** | A library your code uses. Listed in `requirements.txt` (Python) or `package.json` (Node). |
| **Virtual environment** | A sandboxed Python install for one project, so projects don't conflict. Made with `python -m venv .venv`. |
| **Repo / repository** | A folder tracked by git. |
| **Commit** | A snapshot of the project at a point in time. |
| **Branch** | A parallel line of development. You probably won't need branches for personal projects. |
| **MCP** | Model Context Protocol — a way to give Claude Code new tools (like access to a database or calendar). Optional, advanced. |

---

You now know more than 80% of people who claim to "use the terminal." Go [pick a project](./README.md#part-5--four-projects-zero-to-sixty) and build something. Start with [Project 1 — Folder Tidy](./projects/01-folder-tidy.md); it takes fifteen minutes and you'll learn the loop.
