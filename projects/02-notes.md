# Project 2 — Notes Search & Q&A

**Time:** about an hour. **Setup:** none beyond Project 1. **Goal:** your first multi-file project, with persistence.

A small command-line tool that indexes a folder of text and markdown notes into a SQLite database, then lets you search them. After it works, you'll open Claude Code in the project folder and ask things like *"what did I write about pricing in March?"* — Claude reads the search results and answers, using your existing Claude Code login. **No separate API key required.**

This project teaches you what an actual program looks like: a few files in a folder, a virtual environment, a CLI with subcommands, and a database file that holds your data between runs.

## What you'll need

- A folder of notes — `.md` and `.txt` files. Don't have one? Make a few right now:
  ```bash
  mkdir -p ~/notes
  printf "# Coffee\nI like a single origin Ethiopian.\n" > ~/notes/coffee.md
  printf "# Books\nReread East of Eden.\n" > ~/notes/books.md
  ```
- Python 3.10+. Check: `python3 --version`.

## Setup walkthrough

1. **Make and enter the project folder:**
   ```bash
   mkdir -p ~/projects/notes && cd ~/projects/notes
   git init
   ```
2. **Start Claude Code** and paste the prompt below. Claude will set up a virtual environment, write the code, and walk you through the first index.
3. **Point it at your notes:**
   ```bash
   notes index ~/notes
   notes search "coffee"
   ```
4. **Ask questions about your notes from inside Claude Code.** Still in the project folder, start a fresh session (`/clear` or restart `claude`) and ask:
   > Use the `notes` CLI in this folder to answer: what have I written about books?

   Claude will run `notes search "books"`, read the results, and answer in plain English.

## The prompt

---

```
Build a small command-line tool called `notes` that indexes markdown and text
files into SQLite full-text search, and lets me search them.

Keep it simple. Use only:
- Python 3.10+ (standard library sqlite3, FTS5 is included)
- `click` for the CLI
- `watchdog` only if --watch is implemented

Project layout:
  notes/
    pyproject.toml      (use a venv: python3 -m venv .venv && pip install -e .)
    src/notes/
      __init__.py
      cli.py
      index.py
      search.py
    README.md
    .gitignore          (ignore .venv, *.db)

CLI:
  notes index <folder>      Walk the folder, index every .md and .txt file.
                            Incremental by default: only re-index files whose
                            mtime is newer than what we have.
  notes search "query"      Print top 10 hits. Each hit is: path, then the
                            first matching line with a few words of context.
  notes show <path>         Print a note's content.
  notes stats               Number of notes, total words, when last indexed.

Storage:
- One SQLite file at ~/.local/share/notes/notes.db (configurable via $NOTES_DB).
- An FTS5 virtual table with columns: path, body. Rebuild as needed.
- A small `files` table to track (path, mtime, size) for incremental indexing.

Hard requirements:
- Read-only with respect to the notes folder. Never write to it.
- Follow symlinks but don't loop (track visited inodes).
- Skip files larger than 1 MB by default. Skip dotfiles.
- If FTS5 isn't available, print a clear error and exit — don't try to fall
  back to LIKE queries.

README should explain:
- How to install (cd into folder, make venv, pip install -e .)
- The four commands above with an example
- How to ask Claude questions about your notes by running `claude` in this
  folder and pointing it at `notes search`

Don't add a config file, don't add embeddings, don't add an MCP server. We'll
do those in a later project if I ask. Build the smallest thing that works.

Before you start, tell me in three sentences what you're about to build.
Then make a TODO list and work through it. Commit after each file.
```

---

## When something goes wrong

- **`notes: command not found`** — you didn't activate the venv, or the install didn't pick up the entry point. Try `source .venv/bin/activate` and re-run. Or just run `python3 -m notes.cli ...`.
- **`no such module: fts5`** — your Python's SQLite was built without FTS5. On macOS this is rare; on Linux, install `sqlite3` via your package manager. Ask Claude to confirm with a one-liner.
- **Search returns nothing** — did you index? Run `notes stats`. If it says zero notes, the path you passed to `index` was wrong.

## Tips

- The "ask Claude in the folder" trick is genuinely the point. Once the CLI works, your prompt becomes *"use the `notes` tool to answer..."* and Claude does the rest. This is the pattern for every project from here on.
- Run `notes index` again after you add notes. Or ask Claude to add a `notes watch` mode if you want it automatic.
- Don't add embeddings yet. Lexical search is fast and explainable; you'll know when you need more.

**Previous:** [Project 1 — Folder Tidy](./01-folder-tidy.md) · **Next:** [Project 3 — Morning Briefing →](./03-briefing.md)
