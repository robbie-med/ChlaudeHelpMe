# Project 5 — Meal Planner & Grocery List

A meal planner that knows what's already in your pantry. Plan a week of meals, get a deduplicated grocery list, export to Apple Reminders, Todoist, or a printable markdown file. Optional Claude pass to suggest meals that minimize waste and reuse ingredients across days.

## What you'll need

- macOS or Linux.
- Python 3.11+.
- A starter recipe library (Claude will seed you with ~20 weeknight recipes; you'll edit from there).
- Optional: Anthropic API key for the "suggest a week's plan" feature. The deterministic planner works without it.

## Setup walkthrough

1. **Make the project folder:**
   ```bash
   mkdir -p ~/projects/meal-planner && cd ~/projects/meal-planner
   git init
   ```
2. **(Optional) Create `.env`:**
   ```
   ANTHROPIC_API_KEY=sk-ant-xxxx
   HOUSEHOLD_SIZE=2
   ```
3. **Open Claude Code**, paste the prompt below.
4. **Edit your pantry** — Claude creates `pantry.yaml` with a starter list. Update it once; thereafter the tool prompts you to mark items used/restocked after each shop.
5. **Plan a week:**
   ```bash
   meals plan --days 7
   meals grocery
   ```
6. **Export** to Reminders/Todoist/markdown:
   ```bash
   meals grocery --export reminders
   meals grocery --export markdown > shopping.md
   ```

## The prompt

---

```
Build a Meal Planner & Grocery List tool, local-first.

Goals:
- Plan N days of meals from a personal recipe library
- Maintain a pantry inventory (YAML, human-editable)
- Generate a deduplicated, aisle-grouped grocery list
- Export grocery list to Apple Reminders (macOS), Todoist, or markdown
- Optional Claude-powered planner that minimizes waste and reuses ingredients

Data model:
- recipes/*.yaml — each file is one recipe with: title, servings, time, tags, ingredients (qty + unit + item), steps
- pantry.yaml — { item: { qty, unit, expires (optional) } }
- preferences.yaml — diet (omnivore/veg/vegan), allergies, disliked ingredients, cuisine weights
- plans/<YYYY-MM-DD>.yaml — a generated weekly plan (which recipe each day)

CLI:
meals recipes list
meals recipes add < file.yaml
meals pantry show
meals pantry use "olive oil" 50ml
meals pantry restock < shopping_list.yaml
meals plan --days 7 [--ai]    # --ai uses Claude; default is rule-based
meals grocery                 # prints aisle-grouped list for current plan
meals grocery --export {reminders,todoist,markdown}

Planner logic (rule-based, default):
- Prefer recipes that share staple ingredients across the week (reduce waste)
- Cap repeats: same recipe not more than once per 14 days
- Respect preferences.yaml (diet, allergies, dislikes)
- Score recipes by (pantry coverage * 2) + freshness-of-expiring-pantry-items + variety

Planner logic (AI, optional):
- Sends preferences.yaml, pantry.yaml summary (counts only, no quantities), and the recipe titles + tags to Claude
- Asks for a 7-day plan honoring constraints
- Validates the response against the local recipe list before accepting

Grocery list:
- Sum quantities across all chosen recipes
- Subtract pantry stock
- Group by aisle (configurable aisles.yaml: produce, dairy, pantry, frozen, meat, household)
- Round up to sensible purchase units (3 onions, not 2.4)

Hard requirements:
- pantry.yaml is the source of truth; never modified without an explicit `meals pantry` command
- All recipes are local files; no internet recipe fetching by default
- Apple Reminders export uses `osascript`; Todoist export uses TODOIST_TOKEN from env
- All commands have --dry-run

Project layout:
meal-planner/
  README.md
  pyproject.toml
  .env.example
  data/
    recipes/
    pantry.yaml
    preferences.yaml
    aisles.yaml
    plans/
  meals/
    cli.py
    recipes.py
    pantry.py
    planner.py
    ai_planner.py
    grocery.py
    exporters/
      reminders.py
      todoist.py
      markdown.py
  tests/

Code quality:
- Typed Python, Pydantic models
- Minimal deps (pyyaml, pydantic, rich, httpx, anthropic optional)
- Seed the project with ~20 simple weeknight recipes
- Tests covering planner, dedup math, and pantry math

Before writing code, ask me 5 clarifying questions about household size, dietary preferences, my grocery store's aisle ordering, and how I currently keep a shopping list.
```

---

## Tips

- The pantry will go stale unless you actually update it. Pair `meals pantry use` with `meals pantry restock` after every cook night and every shop.
- The AI planner is fun, but the rule-based one is what you'll actually use long-term — keep it tunable.
- Add new recipes by asking Claude in-folder: *"Add a recipe for the sheet-pan miso salmon I had at dinner last night."*
