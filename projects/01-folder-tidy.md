# Project 1 — Folder Tidy

**Time:** 15 minutes. **Setup:** none. **Goal:** your first real Claude Code session, end-to-end.

This is the smallest possible useful project: a single Python script that sorts a messy folder (your Downloads, your Desktop, anywhere) into subfolders by file type. You point it at a folder, it tells you what it *would* do, you approve, it moves the files. Nothing fancy. The point is to feel the loop: ask → Claude reads/writes → you skim the diff → you run it → you fix one thing → done.

If you finish this in fifteen minutes and feel "huh, that worked," you're ready for the next one.

## What you'll need

- Claude Code installed and signed in (see the main [README](../README.md)).
- Python 3 (already on Mac and most Linux). Check: `python3 --version`.
- A messy folder. We'll use `~/Downloads` as the example.

## Setup walkthrough

1. **Make a project folder and step into it:**
   ```bash
   mkdir -p ~/projects/folder-tidy && cd ~/projects/folder-tidy
   git init
   ```
2. **Start Claude Code:**
   ```bash
   claude
   ```
3. **Paste the prompt below as your first message.** Claude will write `tidy.py` and a tiny README.
4. **Try it on a copy first.** Make a throwaway folder so you can't break anything you care about:
   ```bash
   mkdir -p ~/tidy-test
   cp ~/Downloads/* ~/tidy-test/ 2>/dev/null
   python3 tidy.py ~/tidy-test --dry-run
   ```
   Read the output. If it looks right, drop `--dry-run` and run it again.
5. **Commit when it works:**
   ```bash
   git add . && git commit -m "first working tidy"
   ```

That's the whole loop. Repeat for the next four projects, and for everything else you build.

## The prompt

Copy this and paste it into Claude Code.

---

```
I want a single Python script called tidy.py that sorts files in a folder into
subfolders by type. Keep it small — one file, standard library only, no
dependencies to install.

Usage:
  python3 tidy.py <folder>            # actually move files
  python3 tidy.py <folder> --dry-run  # print what would move, change nothing

Behavior:
- Group by file extension into these subfolders, created on demand:
    Images/   (.jpg .jpeg .png .gif .heic .webp)
    Videos/   (.mp4 .mov .mkv .webm)
    Audio/    (.mp3 .m4a .wav .flac)
    Docs/     (.pdf .docx .xlsx .pptx .txt .md .csv)
    Archives/ (.zip .tar .gz .7z .dmg)
    Code/     (.py .js .ts .html .css .json .sh)
    Other/    (everything else)
- Only touch files in the top level of the folder. Don't recurse.
- Skip hidden files (leading dot) and skip the subfolders you created.
- If the destination already has a file with the same name, append " (1)",
  " (2)", etc.

Then write a short README.md with: what it does, how to run it, and the
dry-run warning ("always dry-run first").

Before you write anything, tell me in two sentences what you're about to do.
Then write the files. Don't ask me a long list of questions — keep it tight.
```

---

## When something goes wrong

- **`python3: command not found`** — install Python from [python.org](https://python.org) or your package manager. Then close and reopen the terminal.
- **Claude moved files you didn't want moved** — that's why we ran `--dry-run` first. If it happened anyway: `git diff` won't help (git doesn't track your Downloads), but you can ask Claude to write an `undo.py` that reverses the last run. Better: keep dry-run as your default for a while.
- **A file refused to move** — likely permissions or it's open in another app. Ask Claude what the error means.

## Tips

- Don't add features yet. Resist the urge to "make it also rename screenshots" or "and also organize by date." Future projects do that. The point of this one is to feel the whole loop, fast.
- Get comfortable hitting `/clear` after this. Each new project starts fresh.

**Next:** [Project 2 — Notes Search & Q&A →](./02-notes.md)
