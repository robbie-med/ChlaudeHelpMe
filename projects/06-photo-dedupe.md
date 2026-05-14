# Project 6 — Photo Library Deduplicator

Safely find duplicate and near-duplicate photos (same shot taken three times, screenshots of the same thing, HEIC vs JPG of the same image). Review side-by-side previews. Move dupes to a "Review" folder — **never** delete directly. Recover anything you didn't mean to move with one command.

## What you'll need

- macOS or Linux.
- Python 3.11+ with Pillow available.
- A photo folder. Options:
  - Apple Photos: File → Export → Export Originals to a folder (don't dedupe on the live library).
  - A flat `~/Pictures` or any export folder.
- Plenty of free disk space — moved-not-deleted dupes still take room until you empty the Review folder.

## Setup walkthrough

1. **Make a working copy of your photos.** Don't run this on the only copy of your photos. Either run on an export, or have a Time Machine / `rsync` backup.
2. **Make the project folder:**
   ```bash
   mkdir -p ~/projects/photo-dedupe && cd ~/projects/photo-dedupe
   git init
   ```
3. **Start Claude Code** and paste the prompt below.
4. **First scan (read-only):**
   ```bash
   dedupe scan ~/Pictures/Export --dry-run
   ```
5. **Review proposals** in the generated `report.html` — it shows side-by-side previews and a "keep this one" radio per group.
6. **Apply** only after you've reviewed:
   ```bash
   dedupe apply report.html
   ```
   Files move to `~/.local/share/photo-dedupe/review/`. They're not deleted.
7. **Empty the review folder** manually after a week of "yep, those were all dupes." Or `dedupe restore` if you change your mind.

## The prompt

---

```
Build a safe, local Photo Library Deduplicator.

Hard safety contract (non-negotiable):
- Never deletes files directly
- Moves identified duplicates to ~/.local/share/photo-dedupe/review/<run-id>/
- Every move is logged in moves.jsonl with original and new path
- `dedupe restore <run-id>` returns everything to its origin
- Dry-run is the default; --apply must be explicit
- A scan against a folder is purely read-only until --apply

Detection layers:
1. Exact byte match (sha256)
2. Same content, different format (decode + perceptual hash; e.g. HEIC vs JPG of same scene)
3. Near-duplicate (perceptual hash within configurable Hamming distance, default 4)
4. Burst detection (same camera, same second, within phash distance)

For each duplicate group, the tool picks a "keep" candidate using:
- Largest file
- Highest resolution
- Earliest creation date
- Preferred format order (RAW > HEIC > JPG > PNG > others)

CLI:
dedupe scan <folder> [--phash-distance N] [--exclude PATTERN]
dedupe report                            # opens report.html
dedupe apply <report.html>               # moves non-kept files to review folder
dedupe restore <run-id>                  # reverses a run
dedupe runs list                         # show recent runs and stats
dedupe runs purge <run-id>               # permanently delete a run's review folder (irreversible)

Report (HTML):
- Static HTML file, no server needed
- Each duplicate group on its own card with thumbnails
- Radio button to pick "keep" (defaults to algorithm's choice)
- "Skip this group" option
- Saves user choices back to report.html on Save

Hard requirements:
- Honors a .dedupeignore in the scanned folder
- Skips files smaller than 50KB (avatars, icons, etc.) by default; configurable
- Never traverses into iCloud "offloaded" placeholders (macOS attr io.com.apple.icloud.itemSize == 0)
- Logs everything (level info+) to ~/.local/state/photo-dedupe/log/
- Thumbnails generated to ~/.local/share/photo-dedupe/thumbs/ and reused across runs

Project layout:
photo-dedupe/
  README.md
  pyproject.toml
  .env.example
  dedupe/
    cli.py
    scanner.py
    hashing.py
    grouping.py
    chooser.py
    mover.py
    report.py
    restore.py
  templates/
    report.html.j2
  tests/

Code quality:
- Typed Python, Pydantic models
- Minimal deps: Pillow, imagehash, pillow-heif, jinja2, rich, click/typer
- Tests for every safety-critical path (move/restore/dedup math)
- README opens with the safety contract in bold

Before writing code, ask me 5 clarifying questions about my photo library location, format mix, whether I shoot RAW, and how aggressive a near-dupe threshold I want.
```

---

## Tips

- The first time you run it, **don't apply.** Just scan and read `report.html`. You'll learn the tool's quirks before any file moves.
- Resist the temptation to dial up the phash distance aggressively. 4 is conservative for a reason.
- After a successful run sits in the Review folder for two weeks with no regrets, you can `dedupe runs purge` it to reclaim disk.
