# agent_notion Visual Enhancement — Design Spec
**Date:** 2026-04-21
**Project:** PlanifyPH Etsy Automation (n8n, Docker, localhost:5678)

## Overview

Enhance the existing `agent_notion` workflow (ID: `R3YjdoDu19ZLGYNV`) to produce visually rich, themed Notion templates. Every generated product gets a cover photo, themed colors, callout blocks, emoji icons, and enriched databases. A new `calendar` layout type is added.

## Goals

- Templates look polished and sellable out of the box
- Visual theme auto-detected from product name keywords — no manual configuration
- All enhancements generated fully via Notion API; no manual steps required after workflow runs
- New `calendar` layout type creates a date-enabled database

## Theme System

### Theme Detection

Detected at runtime from `product_name` keywords (case-insensitive substring match). First match wins; default is Warm if none match.

| Theme | Trigger Keywords | Heading Color | Callout Color | Icon |
|---|---|---|---|---|
| `warm` | home, lifestyle, family, recipe, routine, habit, cook, meal, cozy, daily | `brown` | `orange_background` | 🌸 |
| `professional` | finance, budget, business, project, work, productivity, tracker, office | `blue` | `blue_background` | 📊 |
| `aesthetic` | planner, journal, study, digital, goal, aesthetic, mood, vision | `purple` | `purple_background` | ✨ |
| `earthy` | garden, plant, nature, wellness, health, organic, herb, floral | `green` | `green_background` | 🌿 |

Default (no match): `warm`

### Unsplash Photo Strategy

Photos are selected from a curated pool of reliable Unsplash photo IDs, grouped by theme. The photo for a given product is selected by taking `hash(product_name) % pool_size` so it is deterministic per product but varies across products.

**Photo pools (6 IDs each — all IDs must be verified working before implementation):**

```
warm:         1493119508027, 1507003211169, 1476514974600, 1512453015560, 1544716278, 1556909114
professional: 1484480974693, 1507238691740, 1460925895969, 1568992823564, 1553484771, 1498075702
aesthetic:    1499750310107, 1452421819408, 1519682577737, 1517971055, 1558618047, 1495745646
earthy:       1416879595882, 1463936579959, 1464822634775, 1472214103674, 1444492695851, 1425082628738
```

Photo selection: `photoIndex = simpleHash(product_name) % 6` where `simpleHash` sums char codes.
Unsplash URL format: `https://images.unsplash.com/photo-{id}?w=1200&q=80`

**Note:** During implementation, verify each photo ID loads correctly before finalising the pool.

## Layout Type → Emoji Icon

| layout_type | Icon |
|---|---|
| `cover` | 🌸 (warm) / 📋 (professional) / ✨ (aesthetic) / 🌿 (earthy) — matches theme |
| `divider` | 📌 |
| `planner` | 📋 |
| `reference` | 🔖 |
| `tracker` | 📊 |
| `journal` | 📖 |
| `calendar` | 📅 |

## Root Product Page

Created via `POST /v1/pages` with additions:

```json
{
  "cover": { "type": "external", "external": { "url": "<unsplash-url>" } },
  "icon": { "type": "emoji", "emoji": "<theme-icon>" },
  "parent": { "page_id": "<root_page_id>" },
  "properties": { "title": { "title": [{ "type": "text", "text": { "content": "<product_name>" } }] } }
}
```

After page creation, append blocks via `PATCH /v1/blocks/{id}/children`:

1. **Welcome callout block** — icon `✨`, background = theme callout color, text = `"Welcome to [product_name]. Use this as your all-in-one hub. Feel free to customise!"`
2. **Table of contents block** — `{ "type": "table_of_contents", "table_of_contents": { "color": "default" } }`
3. **Divider block**

## Per-Page Enhancements by layout_type

### cover
**Page creation:** cover photo + icon = `theme_icon` (the theme-level icon: 🌸 warm / 📊 professional / ✨ aesthetic / 🌿 earthy)
```json
{
  "cover": { "type": "external", "external": { "url": "<unsplash-url>" } },
  "icon": { "type": "emoji", "emoji": "<theme_icon>" }
}
```
**Blocks appended:**
1. `heading_1` — name, color = theme heading color
2. `callout` — purpose text, icon `💡`, background = theme callout color
3. `image` block — external Unsplash URL (same photo pool, next index)
4. `bulleted_list_item` × N — one per content_element

### divider
**Page creation:** cover photo + icon (📌)
**Blocks:**
1. `heading_2` — name, color = theme heading color
2. `callout` — purpose text, icon `📌`, theme background
3. `image` block — Unsplash photo
4. `divider`
5. `bulleted_list_item` × N

### planner
**Page creation:** cover photo + icon (📋)
**Blocks:**
1. `heading_2` — name, color = theme heading color
2. `callout` — purpose text, icon `📋`, theme background
3. `to_do` × N — one per content_element, `checked: false`, color = theme heading color

### reference
**Page creation:** cover photo + icon (🔖)
**Blocks:**
1. `heading_2` — name, color = theme heading color
2. `callout` — purpose text, icon `🔖`, theme background
3. `table` — `table_width: 2`, `has_column_header: true`, `has_row_header: false`
   - Row 1 (header): `["Item", "Notes"]`
   - Rows 2…N: `[content_element, ""]`

### tracker
**Database creation** (`POST /v1/databases`):
```json
{
  "parent": { "page_id": "<product_page_id>" },
  "icon": { "type": "emoji", "emoji": "📊" },
  "cover": { "type": "external", "external": { "url": "<unsplash-url>" } },
  "title": [{ "type": "text", "text": { "content": "<page_name>" } }],
  "is_inline": true,
  "properties": {
    "Name": { "title": {} },
    "Status": { "select": { "options": [
      { "name": "Not Started", "color": "gray" },
      { "name": "In Progress", "color": "blue" },
      { "name": "Done", "color": "green" }
    ]}},
    "Priority": { "select": { "options": [
      { "name": "High", "color": "red" },
      { "name": "Medium", "color": "yellow" },
      { "name": "Low", "color": "green" }
    ]}},
    "Date": { "date": {} },
    "<content_element_1>": { "rich_text": {} },
    "<content_element_N>": { "rich_text": {} }
  }
}
```
All items in `content_elements` become individual `rich_text` properties (truncated to 100 chars each, consistent with existing behavior). If `content_elements` is empty, only Name/Status/Priority/Date are created.

```json
```

### journal
**Page creation:** cover photo + icon (📖)
**Blocks:**
1. `heading_2` — name, color = theme heading color
2. `quote` — purpose text (replaces plain paragraph)
3. `toggle` × N — one per content_element, color = theme heading color

### calendar ⭐ NEW
**Database creation** (`POST /v1/databases`):
```json
{
  "parent": { "page_id": "<product_page_id>" },
  "icon": { "type": "emoji", "emoji": "📅" },
  "cover": { "type": "external", "external": { "url": "<unsplash-url>" } },
  "title": [{ "type": "text", "text": { "content": "<page_name>" } }],
  "is_inline": true,
  "properties": {
    "Task": { "title": {} },
    "Date": { "date": {} },
    "Status": { "select": { "options": [
      { "name": "Not Started", "color": "gray" },
      { "name": "In Progress", "color": "blue" },
      { "name": "Done", "color": "green" }
    ]}},
    "Notes": { "rich_text": {} }
  }
}
```
User can switch to Calendar view in Notion UI by clicking `+ Add a view → Calendar` — the Date property populates it automatically.

## Workflow Changes to agent_notion

### New node: Detect Theme
**Type:** Code, placed immediately after Set Config, before the existing Root ID Set node.

Inputs: `product_name`, `root_page_id`, `notion_token`, `pages_json_raw`
Logic: keyword match on `product_name.toLowerCase()` → sets `theme` string and derived `theme_color`, `callout_bg`, `theme_icon`, `photo_url`
Output: all Set Config fields + `theme`, `theme_color`, `callout_bg`, `theme_icon`, `photo_url`

### Modified: Create Product Page
Add `cover` and `icon` fields to the POST body.

### New node: Add Root Blocks
**Type:** HTTP Request (PATCH), after Create Product Page, before Prepare Loop Items
Appends welcome callout + table_of_contents + divider to the product root page.

### Modified: Prepare Loop Items
Pass `theme`, `theme_color`, `callout_bg`, `theme_icon`, `photo_url` into each page item so Build Page Body can use them.

### Modified: Route Layout Type (Switch)
Add 4th output: `calendar` → Build Calendar DB

### Modified: Build Page Body
Full rewrite using theme data per layout_type (cover, divider, planner, reference, journal). Adds cover + icon to each page creation body. Replaces plain paragraphs with callout blocks. Adds image blocks for cover/divider.

### Modified: Build Tracker DB
Add `Status`, `Priority`, `Date` select/date properties alongside content_element text properties. Add `cover` and `icon` to database creation body.

### New nodes: Build Calendar DB + Create Calendar DB
Mirrors Build Tracker DB / Create Tracker DB pattern. Routes from Switch `calendar` output → loops back to Loop Pages.

## Error Handling

All new HTTP Request nodes (Add Root Blocks, Create Calendar DB) use `onError: continueRegularOutput` — consistent with existing pattern.

## Constraints

- Notion API heading colors: `gray`, `brown`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`, `red` — no hex values
- Notion API callout backgrounds: `gray_background`, `brown_background`, `orange_background`, `yellow_background`, `green_background`, `blue_background`, `purple_background`, `pink_background`, `red_background`
- Unsplash photo IDs must be verified working before hardcoding in pool
- `is_inline: true` on all databases (consistent with existing tracker)
- 100 block max per PATCH request — each page is well under this limit
- All Telegram/HTTP tokens hardcoded (no `$env` in URL fields)
- Spread operators not supported in n8n Code nodes — use `.concat()` and `Object.assign()`
