# agent_notion Visual Enhancement — Design Spec
**Date:** 2026-04-21
**Project:** PlanifyPH Etsy Automation (n8n, Docker, localhost:5678)

## Overview

Enhance the existing `agent_notion` workflow (ID: `R3YjdoDu19ZLGYNV`) to produce visually rich, themed Notion templates. Every generated product gets a cover photo, themed colors, callout blocks, emoji icons, and enriched databases. A new `calendar` layout type is added.

## Goals

- Templates look polished and sellable out of the box
- Visual theme auto-detected from product name keywords — zero manual configuration
- All enhancements generated fully via Notion API; no manual Notion steps required after the workflow runs
- New `calendar` layout type creates a date-enabled inline database

---

## Theme System

Themes are fully defined below as a JavaScript constant. The **Detect Theme** code node copies this object verbatim — no interpretation needed during implementation.

### THEMES Constant (copy into Detect Theme node)

```javascript
var THEMES = {
  warm: {
    name: 'warm',
    vibe: 'Cozy, domestic, soft, feminine — lifestyle & home templates',
    root_icon: '🌸',
    heading_color: 'brown',
    callout_bg: 'orange_background',
    callout_icon: '✨',
    quote_color: 'orange',
    todo_color: 'brown',
    toggle_color: 'orange',
    layout_icons: {
      cover: '🌸', divider: '📌', planner: '📋',
      reference: '🔖', tracker: '📊', journal: '📖', calendar: '📅'
    },
    photos: [
      '1493119508027-2b584f234d6c',
      '1499750310107-5fef28a66643',
      '1544716278-ca5e3f4abd8c',
      '1507003211169-0a1dd7228f2d',
      '1476514974600-76f26ac5c397',
      '1484480974693-6ca0a78fb36b'
    ]
  },
  professional: {
    name: 'professional',
    vibe: 'Clean, structured, corporate, minimal — business & finance templates',
    root_icon: '📊',
    heading_color: 'blue',
    callout_bg: 'blue_background',
    callout_icon: 'ℹ️',
    quote_color: 'blue',
    todo_color: 'blue',
    toggle_color: 'blue',
    layout_icons: {
      cover: '📊', divider: '📌', planner: '📋',
      reference: '🔖', tracker: '📈', journal: '📝', calendar: '📅'
    },
    photos: [
      '1484480974693-6ca0a78fb36b',
      '1507238691740-187a5b1d37b8',
      '1460925895969-a703b049a8d4',
      '1454165804606-c3d57bc86b40',
      '1553484771-047a44edb9e3',
      '1568992823564-f8c4c4a1bb8d'
    ]
  },
  aesthetic: {
    name: 'aesthetic',
    vibe: 'Trendy, minimal, pastel, Instagram — goal & vision templates',
    root_icon: '✨',
    heading_color: 'purple',
    callout_bg: 'purple_background',
    callout_icon: '💫',
    quote_color: 'purple',
    todo_color: 'purple',
    toggle_color: 'purple',
    layout_icons: {
      cover: '✨', divider: '🎯', planner: '📓',
      reference: '📚', tracker: '💜', journal: '🪞', calendar: '🗓️'
    },
    photos: [
      '1499750310107-5fef28a66643',
      '1452421819408-8a07068dcc35',
      '1519682577737-a3db75d7c94a',
      '1517971055-4f69d9e56a97',
      '1558618047-b0ef98c7c9d3',
      '1495745646-a23f8fc3c462'
    ]
  },
  earthy: {
    name: 'earthy',
    vibe: 'Botanical, organic, calm, wellness — garden & nature templates',
    root_icon: '🌿',
    heading_color: 'green',
    callout_bg: 'green_background',
    callout_icon: '🌱',
    quote_color: 'green',
    todo_color: 'green',
    toggle_color: 'green',
    layout_icons: {
      cover: '🌿', divider: '🌾', planner: '📋',
      reference: '📖', tracker: '🌱', journal: '🍃', calendar: '🌸'
    },
    photos: [
      '1416879595882-3373a0480b5b',
      '1463936579959-8b2eb26df5de',
      '1464822634775-98b3ee71d2bf',
      '1472214103674-56be90e31e6d',
      '1506905925346-21bda4d32df4',
      '1444492695851-6b6e082a32f5'
    ]
  }
};
```

**Notion API valid heading colors:** `gray` `brown` `orange` `yellow` `green` `blue` `purple` `pink` `red`
**Notion API valid callout backgrounds:** `gray_background` `brown_background` `orange_background` `yellow_background` `green_background` `blue_background` `purple_background` `pink_background` `red_background`

---

### Keyword Detection (copy into Detect Theme node)

```javascript
var KEYWORD_RULES = [
  { theme: 'earthy',       keywords: ['garden','plant','nature','wellness','health','organic','herb','floral','botanical','green'] },
  { theme: 'professional', keywords: ['finance','budget','business','project','work','productivity','office','invoice','expense','report'] },
  { theme: 'aesthetic',    keywords: ['planner','journal','study','digital','goal','aesthetic','mood','vision','gratitude','affirmation'] },
  { theme: 'warm',         keywords: ['home','lifestyle','family','recipe','routine','habit','cook','meal','cozy','daily','self'] }
];
// earthy checked first to avoid "wellness planner" matching aesthetic before earthy
// warm is the default fallback

var nameLower = product_name.toLowerCase();
var detected = 'warm';
for (var i = 0; i < KEYWORD_RULES.length; i++) {
  var rule = KEYWORD_RULES[i];
  for (var j = 0; j < rule.keywords.length; j++) {
    if (nameLower.indexOf(rule.keywords[j]) !== -1) {
      detected = rule.theme;
      break;
    }
  }
  if (detected !== 'warm') break;
}
var theme = THEMES[detected];
```

### Photo Selection (copy into Detect Theme node)

```javascript
// Deterministic: same product always gets same photo, varies across products
var nameChars = product_name.split('');
var charSum = 0;
for (var k = 0; k < nameChars.length; k++) { charSum += nameChars[k].charCodeAt(0); }
var photoIndex = charSum % theme.photos.length;
var photoUrl = 'https://images.unsplash.com/photo-' + theme.photos[photoIndex] + '?w=1200&q=80';

// Secondary photo (for pages inside the product — next index, wraps around)
var photoIndexB = (charSum + 1) % theme.photos.length;
var photoUrlB = 'https://images.unsplash.com/photo-' + theme.photos[photoIndexB] + '?w=1200&q=80';
```

### Detect Theme Node — Full Output

```javascript
return [{
  json: {
    product_name: product_name,
    pages_json_raw: $json.pages_json_raw,
    root_page_id: $json.root_page_id,
    notion_token: $json.notion_token,
    theme: theme.name,
    root_icon: theme.root_icon,
    heading_color: theme.heading_color,
    callout_bg: theme.callout_bg,
    callout_icon: theme.callout_icon,
    quote_color: theme.quote_color,
    todo_color: theme.todo_color,
    toggle_color: theme.toggle_color,
    layout_icons: theme.layout_icons,
    photo_url: photoUrl,
    photo_url_b: photoUrlB
  }
}];
```

---

## Unsplash Photo Verification

All photo IDs must be tested before implementation by opening each URL in a browser:
`https://images.unsplash.com/photo-{id}?w=400&q=80`

If a photo returns 404, replace it with any working Unsplash photo ID of the same vibe.

**Known-good IDs (used in session mockups — confirmed loading):**
- `1493119508027-2b584f234d6c` — woman with laptop, warm light ✓
- `1499750310107-5fef28a66643` — notebook & coffee ✓
- `1544716278-ca5e3f4abd8c` — book & coffee ✓
- `1484480974693-6ca0a78fb36b` — planning diary ✓
- `1507238691740-187a5b1d37b8` — clean workspace ✓
- `1416879595882-3373a0480b5b` — garden / flowers ✓
- `1506905925346-21bda4d32df4` — mountain landscape ✓

---

## Root Product Page

Created via `POST /v1/pages`:

```json
{
  "cover": { "type": "external", "external": { "url": "{{photo_url}}" } },
  "icon":  { "type": "emoji", "emoji": "{{root_icon}}" },
  "parent": { "page_id": "{{root_page_id}}" },
  "properties": { "title": { "title": [{ "type": "text", "text": { "content": "{{product_name}}" } }] } }
}
```

After page creation, **PATCH** `/v1/blocks/{productPageId}/children` with:

```json
[
  {
    "type": "callout",
    "callout": {
      "rich_text": [{ "type": "text", "text": { "content": "Welcome to {{product_name}}. Use this as your all-in-one hub. Feel free to customise!" } }],
      "icon": { "type": "emoji", "emoji": "{{callout_icon}}" },
      "color": "{{callout_bg}}"
    }
  },
  { "type": "table_of_contents", "table_of_contents": { "color": "default" } },
  { "type": "divider", "divider": {} }
]
```

---

## Per-Page Block Definitions by layout_type

All page creation bodies include:
```json
"cover": { "type": "external", "external": { "url": "{{photo_url_b}}" } },
"icon":  { "type": "emoji", "emoji": "{{layout_icons[layout_type]}}" }
```

### cover
**Blocks (PATCH after page creation):**
1. `heading_1` — `{ "content": name, "color": heading_color }`
2. `callout` — purpose, icon = `callout_icon`, color = `callout_bg`
3. `image` — `{ "type": "external", "external": { "url": photo_url_b } }`
4. `bulleted_list_item` × N — one per content_element

### divider
**Blocks:**
1. `heading_2` — name, color = `heading_color`
2. `callout` — purpose, icon = `callout_icon`, color = `callout_bg`
3. `image` — Unsplash photo_url_b
4. `divider`
5. `bulleted_list_item` × N

### planner
**Blocks:**
1. `heading_2` — name, color = `heading_color`
2. `callout` — purpose, icon = `callout_icon`, color = `callout_bg`
3. `to_do` × N — content_element text, `checked: false`, color = `todo_color`

### reference
**Blocks:**
1. `heading_2` — name, color = `heading_color`
2. `callout` — purpose, icon = `callout_icon`, color = `callout_bg`
3. `table` — `table_width: 2`, `has_column_header: true`, `has_row_header: false`
   - Row 1: `["Item", "Notes"]`
   - Rows 2…N: `[content_element, ""]`

### journal
**Blocks:**
1. `heading_2` — name, color = `heading_color`
2. `quote` — purpose text, color = `quote_color`
3. `toggle` × N — content_element text, color = `toggle_color`

### tracker
**Database creation** (`POST /v1/databases`):

```json
{
  "parent": { "page_id": "{{product_page_id}}" },
  "icon":   { "type": "emoji", "emoji": "{{layout_icons.tracker}}" },
  "cover":  { "type": "external", "external": { "url": "{{photo_url_b}}" } },
  "title":  [{ "type": "text", "text": { "content": "{{page_name}}" } }],
  "is_inline": true,
  "properties": {
    "Name":     { "title": {} },
    "Status":   { "select": { "options": [
      { "name": "Not Started", "color": "gray" },
      { "name": "In Progress", "color": "blue" },
      { "name": "Done",        "color": "green" }
    ]}},
    "Priority": { "select": { "options": [
      { "name": "High",   "color": "red" },
      { "name": "Medium", "color": "yellow" },
      { "name": "Low",    "color": "green" }
    ]}},
    "Date": { "date": {} },
    "«each content_element»": { "rich_text": {} }
  }
}
```

Rules:
- Each `content_element` string becomes one `rich_text` property, key truncated to 100 chars
- If `content_elements` is empty, only Name / Status / Priority / Date are created
- Same pattern applies to calendar database (see below)

### calendar ⭐ NEW
**Database creation** (`POST /v1/databases`):

```json
{
  "parent": { "page_id": "{{product_page_id}}" },
  "icon":   { "type": "emoji", "emoji": "{{layout_icons.calendar}}" },
  "cover":  { "type": "external", "external": { "url": "{{photo_url_b}}" } },
  "title":  [{ "type": "text", "text": { "content": "{{page_name}}" } }],
  "is_inline": true,
  "properties": {
    "Task":   { "title": {} },
    "Date":   { "date": {} },
    "Status": { "select": { "options": [
      { "name": "Not Started", "color": "gray" },
      { "name": "In Progress", "color": "blue" },
      { "name": "Done",        "color": "green" }
    ]}},
    "Notes":  { "rich_text": {} }
  }
}
```

To enable calendar view: user opens the database in Notion → clicks `+ Add a view` → selects `Calendar` → picks `Date` property. Takes 10 seconds, no API involvement.

---

## Workflow Changes to agent_notion

### Node map — what changes

| Node | Change |
|---|---|
| `Set Config` | Unchanged |
| **`Detect Theme`** | **NEW** — Code node inserted after Set Config, before Root ID Set. Contains THEMES constant, keyword detection, photo selection. Outputs all Set Config fields + theme properties. |
| `Root ID Set?` | Unchanged — now reads from Detect Theme output |
| `Parse pages_json` | Unchanged |
| `Parse OK?` | Unchanged |
| **`Create Product Page`** | **Modified** — POST body adds `cover` and `icon` using `photo_url` and `root_icon` |
| **`Add Root Blocks`** | **NEW** — HTTP PATCH after Create Product Page, before Prepare Loop Items. Appends welcome callout + TOC + divider to product root page. `onError: continueRegularOutput`. |
| **`Prepare Loop Items`** | **Modified** — include `heading_color`, `callout_bg`, `callout_icon`, `quote_color`, `todo_color`, `toggle_color`, `layout_icons`, `photo_url`, `photo_url_b` in each page item |
| **`Route Layout Type`** | **Modified** — add `calendar` as 4th named output (alongside existing tracker, page, fallback) |
| **`Build Page Body`** | **Rewritten** — all 5 page types (cover/divider/planner/reference/journal) now use theme colors, callout blocks, icons, image blocks. Page creation body adds cover + icon. |
| **`Build Tracker DB`** | **Modified** — add Status/Priority/Date properties + cover + icon to database body |
| **`Build Calendar DB`** | **NEW** — Code node, same pattern as Build Tracker DB. Routes: Switch calendar output → Build Calendar DB → Create Calendar DB → Loop Pages. |
| **`Create Calendar DB`** | **NEW** — HTTP POST to `/v1/databases`, same pattern as Create Tracker DB. `onError: continueRegularOutput`. |

### Connections added

```
Detect Theme         → Root ID Set?         (replaces Set Config → Root ID Set?)
Create Product Page  → Add Root Blocks       (new)
Add Root Blocks      → Prepare Loop Items    (replaces Create Product Page → Prepare Loop Items)
Switch [calendar]    → Build Calendar DB     (new output)
Build Calendar DB    → Create Calendar DB    (new)
Create Calendar DB   → Loop Pages            (loops back, same as tracker/page paths)
```

---

## Error Handling

All new HTTP Request nodes use `onError: continueRegularOutput` — consistent with existing pattern. Failures are counted in the done summary as unprocessed pages.

---

## Constraints

- n8n Code nodes: no spread operator — use `.concat()` and `Object.assign()`
- Notion API heading/callout colors: only the named values listed in THEMES above — no hex
- `is_inline: true` on all databases
- 100 blocks max per PATCH — well under limit for all layout types
- All tokens hardcoded (no `$env` in URL/header fields)
- `quote` block in journal: Notion API format is `{ "type": "quote", "quote": { "rich_text": [...], "color": "{{quote_color}}" } }`
- `toggle` block color field goes on the toggle object: `{ "type": "toggle", "toggle": { "rich_text": [...], "color": "{{toggle_color}}", "children": [] } }`
- `to_do` color field: `{ "type": "to_do", "to_do": { "rich_text": [...], "checked": false, "color": "{{todo_color}}" } }`
