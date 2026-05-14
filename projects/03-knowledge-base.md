# Project 3 — Personal Knowledge Base

A local search-and-Q&A layer over your markdown notes. Point it at an Obsidian vault, a Bear/Apple Notes export, or a plain folder of `.md` files. Ask things like *"what was that idea I had about pricing in February?"* and get an answer with citations to the exact note and line.

## What you'll need

- macOS or Linux.
- Python 3.11+.
- A folder of markdown notes (or any plain-text format — Claude will adapt).
- Optional: an Anthropic API key, if you want answers to flow through the Claude API rather than be queried interactively in Claude Code.

## Setup walkthrough

1. **Pick a notes folder.** Examples:
   - Obsidian vault: `~/Obsidian/MyVault`
   - Bear export: File → Export Notes → Markdown → `~/Documents/BearExport`
   - Apple Notes: use [Exporter](https://falcon.name/apps/exporter/) to dump as markdown.
2. **Make the project folder:**
   ```bash
   mkdir -p ~/projects/knowledge-base && cd ~/projects/knowledge-base
   git init
   ```
3. **Create `.env`** with the path to your notes:
   ```
   NOTES_PATH=/Users/you/Obsidian/MyVault
   ANTHROPIC_API_KEY=sk-ant-xxxx   # optional
   ```
   `chmod 600 .env` and add it to `.gitignore`.
4. **Start Claude Code** and paste the prompt below.
5. **Build the first index:**
   ```bash
   kb index
   ```
6. **Ask questions** either from the CLI (`kb ask "what did I write about Stoicism?"`) or by opening Claude Code in this folder — Claude can read the index directly.

## The prompt

---

```
Build a local Personal Knowledge Base over a folder of markdown notes.

Goals:
- Index a notes folder into SQLite with full-text search (FTS5)
- Support hybrid lexical + embedding search (embeddings optional, lexical mandatory)
- Expose results as both a CLI and an MCP server (so Claude Code/Desktop can use it as a tool)
- Citations always include the note path and line range
- Re-indexing is incremental (only changed files)

Architecture:
notes folder -> watcher -> chunker -> SQLite FTS5 (+ optional sqlite-vec embeddings) -> CLI / MCP server

Chunking:
- Default: split by markdown headings, then by ~500-token windows with 50-token overlap
- Preserve front-matter as queryable metadata
- Preserve the exact line range each chunk came from

CLI:
kb index                    # full or incremental index
kb watch                    # incremental on file changes
kb search "query" [-n 10]   # raw search, returns chunks with paths and line ranges
kb ask "question"           # asks Claude (if API key present) with retrieved chunks; otherwise prints the chunks for human review
kb stats                    # how many notes, words, last indexed when

MCP server:
- A stdio MCP server exposing tools: search_notes(query, k), get_note(path, line_start, line_end), list_recent_notes(n)
- Wire instructions for Claude Code (claude mcp add) included in README

Hard requirements:
- Never modifies the notes folder (read-only)
- Stores index at ~/.local/share/kb/index.sqlite by default; configurable via env
- Front-matter dates (created/modified) used as filters: kb search --since 2024-01-01
- Handles symlinks safely (does not loop)
- Respects a .kbignore file (gitignore syntax) in the notes folder
- If Anthropic key is missing, `kb ask` degrades gracefully to printing top chunks

Project layout:
knowledge-base/
  README.md
  pyproject.toml
  .env.example
  .gitignore
  kb/
    __init__.py
    cli.py
    indexer.py
    chunker.py
    search.py
    embeddings.py        # optional, sqlite-vec
    mcp_server.py
  tests/
  sample_notes/          # for tests

Code quality:
- Typed Python, Pydantic config
- SQLite via stdlib sqlite3 (not an ORM)
- Minimal dependencies (markdown-it-py, pyyaml, watchdog, anthropic, sqlite-vec optional)
- Unit tests for chunker, incremental index, FTS query, citation accuracy
- README explains both the CLI workflow and the MCP server registration (claude mcp add ...)

Before writing code, ask me 5 clarifying questions about my notes format, my taxonomy/front-matter conventions, and whether I want embeddings enabled by default.
```

---

## Tips

- The MCP server is the real superpower: once registered, you can open Claude Code anywhere and ask about your notes without `cd`-ing into the project.
- Keep `kb watch` running in a `tmux` or background process; the index stays fresh.
- For really large vaults, start with lexical only — embeddings can be added later without re-chunking.
