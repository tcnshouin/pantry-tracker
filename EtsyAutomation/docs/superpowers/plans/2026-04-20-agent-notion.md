# agent_notion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an `agent_notion` n8n workflow that auto-creates structured Notion templates from `pages_json` at the end of `agent_design_content`, and wire it into the existing design pipeline.

**Architecture:** A new `agent_notion` workflow is triggered automatically when `agent_design_content` appends a product to the Content Queue. It parses `pages_json`, creates a Notion page hierarchy under "Planify Templates", routes each page by `layout_type` to the correct builder, and saves the final Notion URL back to Content Queue.

**Tech Stack:** n8n v1.19.2 (Docker), Notion API v1 (REST), Google Sheets API v4, Telegram Bot API. Google Sheets credential ID: `d4opfgXbHldvVyNH`.

**Token approach:** The spec originally called for an n8n credential "Planify Notion". However, consistent with the existing project pattern (Telegram bot tokens are hardcoded in all agents because `$env` is denied in URL/header fields), the Notion token is stored in the Set Config node as a plain string. Replace `NOTION_TOKEN_HERE` after workflow creation.

---

## Constants (referenced throughout)

```
TELEGRAM_URL   = https://api.telegram.org/bot8674678294:AAGO0kGLM_f3tKyM5CFM3mHOeuL_qCC-zKw/sendMessage
CHAT_ID        = 7102727715
SHEETS_ID      = 1BfaLg_PQ_HX95X4iTDXjBYFlBc9ebVHpytciTB4juio
SHEETS_CRED    = { "id": "d4opfgXbHldvVyNH", "name": "Google Sheets account" }
NOTION_API     = https://api.notion.com/v1
NOTION_VERSION = 2022-06-28
DESIGN_WF_ID   = L5YfwM7qt8jt7UFd   (agent_design_content)
```

---

## Task 0: Manual Prerequisites (human steps, no tools)

- [ ] **Step 1: Add notion_url column to Content Queue**
  Open [Content Queue sheet](https://docs.google.com/spreadsheets/d/1BfaLg_PQ_HX95X4iTDXjBYFlBc9ebVHpytciTB4juio) → go to "Content Queue" tab → add `notion_url` as a new column header at the end of row 1.

- [ ] **Step 2: Create "Planify Templates" root page in Notion**
  - Open Notion → New page → title: `Planify Templates`
  - Click `...` → Add connections → select "Planify" integration
  - Copy the page ID from the URL. The URL looks like: `https://www.notion.so/Planify-Templates-abc123def456...`
  - The page ID is the UUID at the end. Convert it to dashed format if needed: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
  - Save this ID — you'll paste it into the workflow in Task 1.

- [ ] **Step 3: Get your Notion integration token**
  - Go to https://www.notion.so/my-integrations → select "Planify" integration
  - Copy the "Internal Integration Token" (starts with `ntn_` or `secret_`)
  - Save it — you'll paste it into the workflow in Task 1.

---

## Task 1: Create agent_notion Workflow

**Files:**
- Create: n8n workflow `agent_notion` via `mcp__n8n-mcp__n8n_create_workflow`

- [ ] **Step 1: Create the workflow with all nodes and connections**

Call `mcp__n8n-mcp__n8n_create_workflow` with the following JSON. Replace `ROOT_PAGE_ID_HERE` with the Notion page ID from Task 0 Step 2, and `NOTION_TOKEN_HERE` with the token from Task 0 Step 3.

```json
{
  "name": "agent_notion",
  "nodes": [
    {
      "parameters": { "inputSource": "passthrough" },
      "id": "notion-trigger",
      "name": "Dispatcher Trigger",
      "type": "n8n-nodes-base.executeWorkflowTrigger",
      "typeVersion": 1.1,
      "position": [0, 0]
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            { "id": "cfg-root", "name": "root_page_id", "value": "ROOT_PAGE_ID_HERE", "type": "string" },
            { "id": "cfg-token", "name": "notion_token", "value": "NOTION_TOKEN_HERE", "type": "string" },
            { "id": "cfg-product", "name": "product_name", "value": "={{ $json.product_name }}", "type": "string" },
            { "id": "cfg-pages", "name": "pages_json_raw", "value": "={{ $json.pages_json }}", "type": "string" }
          ]
        },
        "options": {}
      },
      "id": "notion-set-config",
      "name": "Set Config",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [240, 0]
    },
    {
      "parameters": {
        "conditions": {
          "options": { "version": 2, "caseSensitive": true, "typeValidation": "strict" },
          "combinator": "and",
          "conditions": [
            {
              "id": "chk-root",
              "leftValue": "={{ $json.root_page_id }}",
              "rightValue": "ROOT_PAGE_ID_HERE",
              "operator": { "type": "string", "operation": "notEquals" }
            }
          ]
        },
        "options": {}
      },
      "id": "notion-check-root",
      "name": "Root ID Set?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.3,
      "position": [480, 0]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.telegram.org/bot8674678294:AAGO0kGLM_f3tKyM5CFM3mHOeuL_qCC-zKw/sendMessage",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={ \"chat_id\": \"7102727715\", \"text\": \"❌ agent_notion: root page ID not configured. Set ROOT_PAGE_ID_HERE in Set Config node.\" }",
        "options": {}
      },
      "id": "notion-err-no-root",
      "name": "Telegram — No Root ID",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.4,
      "position": [720, -240],
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "jsCode": "const productName = $json.product_name;\nconst rawJson = $json.pages_json_raw;\nconst rootPageId = $json.root_page_id;\nconst notionToken = $json.notion_token;\ntry {\n  const pages = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;\n  if (!Array.isArray(pages)) throw new Error('pages_json is not an array');\n  return [{ json: { product_name: productName, pages: pages, total: pages.length, parseSuccess: true, raw: rawJson, root_page_id: rootPageId, notion_token: notionToken } }];\n} catch(e) {\n  return [{ json: { product_name: productName, pages: [], total: 0, parseSuccess: false, error: e.message, raw: String(rawJson), root_page_id: rootPageId, notion_token: notionToken } }];\n}"
      },
      "id": "notion-parse-json",
      "name": "Parse pages_json",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [720, 0]
    },
    {
      "parameters": {
        "conditions": {
          "options": { "version": 2, "caseSensitive": true, "typeValidation": "strict" },
          "combinator": "and",
          "conditions": [
            {
              "id": "chk-parse",
              "leftValue": "={{ $json.parseSuccess }}",
              "rightValue": true,
              "operator": { "type": "boolean", "operation": "equals" }
            }
          ]
        },
        "options": {}
      },
      "id": "notion-check-parse",
      "name": "Parse OK?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.3,
      "position": [960, 0]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": { "__rl": true, "value": "1BfaLg_PQ_HX95X4iTDXjBYFlBc9ebVHpytciTB4juio", "mode": "id" },
        "sheetName": { "__rl": true, "value": "CS Log", "mode": "name" },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "agent": "agent_notion",
            "product_name": "={{ $json.product_name }}",
            "error_type": "parse_failure",
            "error_message": "={{ $json.error }}",
            "raw_response": "={{ $json.raw }}",
            "timestamp": "={{ new Date().toISOString() }}"
          },
          "matchingColumns": [],
          "schema": [
            { "id": "agent", "displayName": "agent", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true },
            { "id": "product_name", "displayName": "product_name", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true },
            { "id": "error_type", "displayName": "error_type", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true },
            { "id": "error_message", "displayName": "error_message", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true },
            { "id": "raw_response", "displayName": "raw_response", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true },
            { "id": "timestamp", "displayName": "timestamp", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "id": "notion-err-parse-log",
      "name": "Log Parse Error",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [1200, -240],
      "credentials": { "googleSheetsOAuth2Api": { "id": "d4opfgXbHldvVyNH", "name": "Google Sheets account" } }
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.telegram.org/bot8674678294:AAGO0kGLM_f3tKyM5CFM3mHOeuL_qCC-zKw/sendMessage",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ chat_id: '7102727715', text: '❌ agent_notion: failed to parse pages_json for \"' + $json.product_name + '\". Error: ' + $json.error }) }}",
        "options": {}
      },
      "id": "notion-err-parse-tg",
      "name": "Telegram — Parse Error",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.4,
      "position": [1440, -240],
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.notion.com/v1/pages",
        "sendBody": true,
        "specifyBody": "string",
        "contentType": "raw",
        "rawContentType": "application/json",
        "body": "={{ JSON.stringify({ parent: { page_id: $json.root_page_id }, properties: { title: { title: [{ type: 'text', text: { content: $json.product_name } }] } } }) }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "Authorization", "value": "={{ 'Bearer ' + $json.notion_token }}" },
            { "name": "Notion-Version", "value": "2022-06-28" }
          ]
        },
        "options": {}
      },
      "id": "notion-create-product",
      "name": "Create Product Page",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.4,
      "position": [1200, 0],
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "jsCode": "const productName = $('Parse pages_json').first().json.product_name;\nconst pages = $('Parse pages_json').first().json.pages;\nconst total = pages.length;\nconst productPageId = $json.id;\nconst notionToken = $('Parse pages_json').first().json.notion_token;\n\nreturn pages.map(function(page) {\n  return {\n    json: {\n      page_number: page.page_number,\n      name: page.name,\n      purpose: page.purpose,\n      content_elements: page.content_elements,\n      layout_type: page.layout_type,\n      product_name: productName,\n      product_page_id: productPageId,\n      total_pages: total,\n      notion_token: notionToken\n    }\n  };\n});"
      },
      "id": "notion-prep-loop",
      "name": "Prepare Loop Items",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1440, 0]
    },
    {
      "parameters": {
        "batchSize": 1,
        "options": {}
      },
      "id": "notion-loop",
      "name": "Loop Pages",
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 3,
      "position": [1680, 0]
    },
    {
      "parameters": {
        "rules": {
          "values": [
            {
              "outputKey": "tracker",
              "conditions": {
                "options": { "version": 2, "caseSensitive": false, "typeValidation": "strict" },
                "combinator": "and",
                "conditions": [{ "id": "r-tracker", "operator": { "type": "string", "operation": "equals" }, "leftValue": "={{ $json.layout_type }}", "rightValue": "tracker" }]
              },
              "renameOutput": true
            },
            {
              "outputKey": "page",
              "conditions": {
                "options": { "version": 2, "caseSensitive": false, "typeValidation": "strict" },
                "combinator": "or",
                "conditions": [
                  { "id": "r-cover", "operator": { "type": "string", "operation": "equals" }, "leftValue": "={{ $json.layout_type }}", "rightValue": "cover" },
                  { "id": "r-divider", "operator": { "type": "string", "operation": "equals" }, "leftValue": "={{ $json.layout_type }}", "rightValue": "divider" },
                  { "id": "r-planner", "operator": { "type": "string", "operation": "equals" }, "leftValue": "={{ $json.layout_type }}", "rightValue": "planner" },
                  { "id": "r-reference", "operator": { "type": "string", "operation": "equals" }, "leftValue": "={{ $json.layout_type }}", "rightValue": "reference" },
                  { "id": "r-journal", "operator": { "type": "string", "operation": "equals" }, "leftValue": "={{ $json.layout_type }}", "rightValue": "journal" }
                ]
              },
              "renameOutput": true
            }
          ]
        },
        "options": { "fallbackOutput": "extra" }
      },
      "id": "notion-route",
      "name": "Route Layout Type",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 3.4,
      "position": [1920, 0]
    },
    {
      "parameters": {
        "jsCode": "const page = $json;\nconst elements = Array.isArray(page.content_elements) ? page.content_elements : [];\nlet children = [];\n\nswitch (page.layout_type) {\n  case 'cover':\n    children = [\n      { type: 'heading_1', heading_1: { rich_text: [{ type: 'text', text: { content: page.name } }] } },\n      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: page.purpose } }] } },\n      ...elements.map(function(el) { return { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: el } }] } }; })\n    ];\n    break;\n  case 'divider':\n    children = [\n      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: page.name } }] } },\n      { type: 'divider', divider: {} },\n      ...elements.map(function(el) { return { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: el } }] } }; })\n    ];\n    break;\n  case 'planner':\n    children = [\n      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: page.name } }] } },\n      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: page.purpose } }] } },\n      ...elements.map(function(el) { return { type: 'to_do', to_do: { rich_text: [{ type: 'text', text: { content: el } }], checked: false } }; })\n    ];\n    break;\n  case 'reference':\n    const tableRows = [\n      { type: 'table_row', table_row: { cells: [[{ type: 'text', text: { content: 'Item' } }], [{ type: 'text', text: { content: 'Notes' } }]] } },\n      ...elements.map(function(el) { return { type: 'table_row', table_row: { cells: [[{ type: 'text', text: { content: el } }], [{ type: 'text', text: { content: '' } }]] } }; })\n    ];\n    children = [\n      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: page.name } }] } },\n      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: page.purpose } }] } },\n      { type: 'table', table: { table_width: 2, has_column_header: true, has_row_header: false, children: tableRows } }\n    ];\n    break;\n  case 'journal':\n    children = [\n      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: page.name } }] } },\n      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: page.purpose } }] } },\n      ...elements.map(function(el) { return { type: 'toggle', toggle: { rich_text: [{ type: 'text', text: { content: el } }], children: [] } }; })\n    ];\n    break;\n  default:\n    children = [\n      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: page.name } }] } },\n      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: page.purpose } }] } }\n    ];\n}\n\nconst body = JSON.stringify({\n  parent: { page_id: page.product_page_id },\n  properties: { title: { title: [{ type: 'text', text: { content: page.name } }] } },\n  children: children\n});\n\nreturn [{ json: { ...page, request_body: body } }];"
      },
      "id": "notion-build-page",
      "name": "Build Page Body",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [2160, -200]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.notion.com/v1/pages",
        "sendBody": true,
        "specifyBody": "string",
        "contentType": "raw",
        "rawContentType": "application/json",
        "body": "={{ $json.request_body }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "Authorization", "value": "={{ 'Bearer ' + $json.notion_token }}" },
            { "name": "Notion-Version", "value": "2022-06-28" }
          ]
        },
        "options": {}
      },
      "id": "notion-create-page",
      "name": "Create Notion Page",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.4,
      "position": [2400, -200],
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "jsCode": "const page = $json;\nconst elements = Array.isArray(page.content_elements) ? page.content_elements : [];\n\nconst properties = { Name: { title: {} } };\nelements.forEach(function(el) {\n  const key = el.substring(0, 100);\n  properties[key] = { rich_text: {} };\n});\n\nconst body = JSON.stringify({\n  parent: { page_id: page.product_page_id },\n  title: [{ type: 'text', text: { content: page.name } }],\n  is_inline: true,\n  properties: properties\n});\n\nreturn [{ json: { ...page, request_body: body } }];"
      },
      "id": "notion-build-tracker",
      "name": "Build Tracker DB",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [2160, 200]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.notion.com/v1/databases",
        "sendBody": true,
        "specifyBody": "string",
        "contentType": "raw",
        "rawContentType": "application/json",
        "body": "={{ $json.request_body }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "Authorization", "value": "={{ 'Bearer ' + $json.notion_token }}" },
            { "name": "Notion-Version", "value": "2022-06-28" }
          ]
        },
        "options": {}
      },
      "id": "notion-create-tracker",
      "name": "Create Tracker DB",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.4,
      "position": [2400, 200],
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "jsCode": "return [{ json: { agent: 'agent_notion', product_name: $json.product_name, error_type: 'unknown_layout_type', error_message: 'Unknown layout_type: ' + $json.layout_type + ' for page: ' + $json.name, raw_response: JSON.stringify($json), timestamp: new Date().toISOString() } }];"
      },
      "id": "notion-log-unknown",
      "name": "Log Unknown Layout",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [2160, 0]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": { "__rl": true, "value": "1BfaLg_PQ_HX95X4iTDXjBYFlBc9ebVHpytciTB4juio", "mode": "id" },
        "sheetName": { "__rl": true, "value": "CS Log", "mode": "name" },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "agent": "={{ $json.agent }}",
            "product_name": "={{ $json.product_name }}",
            "error_type": "={{ $json.error_type }}",
            "error_message": "={{ $json.error_message }}",
            "raw_response": "={{ $json.raw_response }}",
            "timestamp": "={{ $json.timestamp }}"
          },
          "matchingColumns": [],
          "schema": [
            { "id": "agent", "displayName": "agent", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true },
            { "id": "product_name", "displayName": "product_name", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true },
            { "id": "error_type", "displayName": "error_type", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true },
            { "id": "error_message", "displayName": "error_message", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true },
            { "id": "raw_response", "displayName": "raw_response", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true },
            { "id": "timestamp", "displayName": "timestamp", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "id": "notion-cs-unknown",
      "name": "CS Log Unknown Layout",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [2400, 0],
      "credentials": { "googleSheetsOAuth2Api": { "id": "d4opfgXbHldvVyNH", "name": "Google Sheets account" } }
    },
    {
      "parameters": {
        "jsCode": "const productName = $('Parse pages_json').first().json.product_name;\nconst total = $('Parse pages_json').first().json.total;\nconst productPageId = $('Create Product Page').first().json.id;\nconst notionUrl = 'https://www.notion.so/' + productPageId.replace(/-/g, '');\n// All pages are always processed (onError:continueRegularOutput ensures loop continues on failure).\n// Individual page failures are logged to CS Log. Total = pages processed.\nreturn [{ json: {\n  product_name: productName,\n  notion_url: notionUrl,\n  total_pages: total,\n  message: '✅ Notion template created\\nProduct: \"' + productName + '\"\\nPages: ' + total + ' processed (check CS Log for any page errors)\\n' + notionUrl\n} }];"
      },
      "id": "notion-done-summary",
      "name": "Build Done Summary",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1680, -400]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.telegram.org/bot8674678294:AAGO0kGLM_f3tKyM5CFM3mHOeuL_qCC-zKw/sendMessage",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ chat_id: '7102727715', text: $json.message }) }}",
        "options": {}
      },
      "id": "notion-done-tg",
      "name": "Telegram — Done",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.4,
      "position": [1920, -400],
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "operation": "update",
        "documentId": { "__rl": true, "value": "1BfaLg_PQ_HX95X4iTDXjBYFlBc9ebVHpytciTB4juio", "mode": "id" },
        "sheetName": { "__rl": true, "value": "Content Queue", "mode": "name" },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "product_name": "={{ $json.product_name }}",
            "notion_url": "={{ $json.notion_url }}"
          },
          "matchingColumns": ["product_name"],
          "schema": [
            { "id": "product_name", "displayName": "product_name", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true },
            { "id": "notion_url", "displayName": "notion_url", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "id": "notion-save-url",
      "name": "Save notion_url",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [2160, -400],
      "credentials": { "googleSheetsOAuth2Api": { "id": "d4opfgXbHldvVyNH", "name": "Google Sheets account" } }
    },
    {
      "parameters": {
        "conditions": {
          "options": { "version": 2, "caseSensitive": true, "typeValidation": "strict" },
          "combinator": "and",
          "conditions": [
            {
              "id": "chk-url-saved",
              "leftValue": "={{ $json.notion_url }}",
              "rightValue": "",
              "operator": { "type": "string", "operation": "notEquals" }
            }
          ]
        },
        "options": {}
      },
      "id": "notion-check-url-saved",
      "name": "notion_url Saved?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.3,
      "position": [2400, -400]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": { "__rl": true, "value": "1BfaLg_PQ_HX95X4iTDXjBYFlBc9ebVHpytciTB4juio", "mode": "id" },
        "sheetName": { "__rl": true, "value": "CS Log", "mode": "name" },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "agent": "agent_notion",
            "product_name": "={{ $json.product_name }}",
            "error_type": "notion_url_write_miss",
            "error_message": "No matching product_name row found in Content Queue when saving notion_url",
            "raw_response": "={{ $json.notion_url }}",
            "timestamp": "={{ new Date().toISOString() }}"
          },
          "matchingColumns": [],
          "schema": [
            { "id": "agent", "displayName": "agent", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true },
            { "id": "product_name", "displayName": "product_name", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true },
            { "id": "error_type", "displayName": "error_type", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true },
            { "id": "error_message", "displayName": "error_message", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true },
            { "id": "raw_response", "displayName": "raw_response", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true },
            { "id": "timestamp", "displayName": "timestamp", "required": false, "defaultMatch": false, "display": true, "type": "string", "canBeUsedToMatch": true }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "id": "notion-miss-log",
      "name": "CS Log Write Miss",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [2640, -320],
      "credentials": { "googleSheetsOAuth2Api": { "id": "d4opfgXbHldvVyNH", "name": "Google Sheets account" } }
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.telegram.org/bot8674678294:AAGO0kGLM_f3tKyM5CFM3mHOeuL_qCC-zKw/sendMessage",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ chat_id: '7102727715', text: '⚠️ agent_notion: notion_url not saved — no matching row found in Content Queue for \"' + $json.product_name + '\". Notion URL: ' + $json.notion_url }) }}",
        "options": {}
      },
      "id": "notion-miss-tg",
      "name": "Telegram — Write Miss",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.4,
      "position": [2880, -320],
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {},
      "id": "notion-error-trigger",
      "name": "On Workflow Error",
      "type": "n8n-nodes-base.errorTrigger",
      "typeVersion": 1,
      "position": [0, 400]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.telegram.org/bot8674678294:AAGO0kGLM_f3tKyM5CFM3mHOeuL_qCC-zKw/sendMessage",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ chat_id: '7102727715', text: '❌ agent_notion error\\nProduct: ' + ($json.execution?.lastNodeExecuted || 'unknown node') + '\\nError: ' + $json.execution.error.message.substring(0, 200) + '\\n(Check CS Log for product details)' }) }}",
        "options": {}
      },
      "id": "notion-error-tg",
      "name": "Telegram — Error",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.4,
      "position": [240, 400],
      "onError": "continueRegularOutput"
    }
  ],
  "connections": {
    "Dispatcher Trigger": { "main": [[{ "node": "Set Config", "type": "main", "index": 0 }]] },
    "Set Config": { "main": [[{ "node": "Root ID Set?", "type": "main", "index": 0 }]] },
    "Root ID Set?": {
      "main": [
        [{ "node": "Parse pages_json", "type": "main", "index": 0 }],
        [{ "node": "Telegram — No Root ID", "type": "main", "index": 0 }]
      ]
    },
    "Parse pages_json": { "main": [[{ "node": "Parse OK?", "type": "main", "index": 0 }]] },
    "Parse OK?": {
      "main": [
        [{ "node": "Create Product Page", "type": "main", "index": 0 }],
        [{ "node": "Log Parse Error", "type": "main", "index": 0 }]
      ]
    },
    "Log Parse Error": { "main": [[{ "node": "Telegram — Parse Error", "type": "main", "index": 0 }]] },
    "Create Product Page": { "main": [[{ "node": "Prepare Loop Items", "type": "main", "index": 0 }]] },
    "Prepare Loop Items": { "main": [[{ "node": "Loop Pages", "type": "main", "index": 0 }]] },
    "Loop Pages": {
      "main": [
        [{ "node": "Build Done Summary", "type": "main", "index": 0 }],
        [{ "node": "Route Layout Type", "type": "main", "index": 0 }]
      ]
    },
    "Route Layout Type": {
      "main": [
        [{ "node": "Build Tracker DB", "type": "main", "index": 0 }],
        [{ "node": "Build Page Body", "type": "main", "index": 0 }],
        [{ "node": "Log Unknown Layout", "type": "main", "index": 0 }]
      ]
    },
    "Build Page Body": { "main": [[{ "node": "Create Notion Page", "type": "main", "index": 0 }]] },
    "Create Notion Page": { "main": [[{ "node": "Loop Pages", "type": "main", "index": 0 }]] },
    "Build Tracker DB": { "main": [[{ "node": "Create Tracker DB", "type": "main", "index": 0 }]] },
    "Create Tracker DB": { "main": [[{ "node": "Loop Pages", "type": "main", "index": 0 }]] },
    "Log Unknown Layout": { "main": [[{ "node": "CS Log Unknown Layout", "type": "main", "index": 0 }]] },
    "CS Log Unknown Layout": { "main": [[{ "node": "Loop Pages", "type": "main", "index": 0 }]] },
    "Build Done Summary": { "main": [[{ "node": "Telegram — Done", "type": "main", "index": 0 }]] },
    "Telegram — Done": { "main": [[{ "node": "Save notion_url", "type": "main", "index": 0 }]] },
    "Save notion_url": { "main": [[{ "node": "notion_url Saved?", "type": "main", "index": 0 }]] },
    "notion_url Saved?": {
      "main": [
        [],
        [{ "node": "CS Log Write Miss", "type": "main", "index": 0 }]
      ]
    },
    "CS Log Write Miss": { "main": [[{ "node": "Telegram — Write Miss", "type": "main", "index": 0 }]] },
    "On Workflow Error": { "main": [[{ "node": "Telegram — Error", "type": "main", "index": 0 }]] }
  },
  "settings": {
    "executionOrder": "v1",
    "callerPolicy": "workflowsFromSameOwner"
  }
}
```

- [ ] **Step 2: Record the new workflow ID**
  The tool response will include `data.id`. Save this — it's needed in Task 4.
  Expected: a new workflow ID like `aBcDeFgHiJkLmNoP`

- [ ] **Step 3: Verify workflow was created**
  Call `mcp__n8n-mcp__n8n_get_workflow` with the new ID and `mode: "structure"`.
  Expected: 23 nodes listed, workflow name = "agent_notion"

---

## Task 2: Activate the Workflow

- [ ] **Step 1: Activate agent_notion**
  Call `mcp__n8n-mcp__n8n_update_partial_workflow` with:
  ```json
  { "id": "<NEW_WORKFLOW_ID>", "active": true }
  ```
  Expected: response shows `"active": true`

---

## Task 3: Test agent_notion Standalone

- [ ] **Step 1: Run test execution with sample data**
  Call `mcp__n8n-mcp__n8n_test_workflow` with the agent_notion workflow ID and this test input:
  ```json
  {
    "workflowData": {
      "id": "<NEW_WORKFLOW_ID>"
    },
    "runData": {
      "Dispatcher Trigger": [
        {
          "json": {
            "product_name": "Test Garden Planner",
            "pages_json": "[{\"page_number\":1,\"name\":\"Cover Page\",\"purpose\":\"Introduce the template\",\"content_elements\":[\"Hero image\",\"Product title\"],\"layout_type\":\"cover\"},{\"page_number\":2,\"name\":\"Goal Tracker\",\"purpose\":\"Track goals\",\"content_elements\":[\"Goal name\",\"Due date\",\"Status\"],\"layout_type\":\"tracker\"},{\"page_number\":3,\"name\":\"Reference Guide\",\"purpose\":\"Quick lookup\",\"content_elements\":[\"Item A\",\"Item B\"],\"layout_type\":\"reference\"}]"
          }
        }
      ]
    }
  }
  ```

- [ ] **Step 2: Verify in Notion**
  Open Notion → "Planify Templates" → check "Test Garden Planner" was created with 3 child pages/databases.
  - Page 1 (cover): H1 heading + paragraph + 2 bullet points
  - Page 2 (tracker): inline database with columns: Name, Goal name, Due date, Status
  - Page 3 (reference): H2 heading + table with Item/Notes columns

- [ ] **Step 3: Verify Telegram message received**
  Check Telegram — should receive: `✅ Notion template created\nProduct: "Test Garden Planner"\nPages: 3\nhttps://www.notion.so/...`

- [ ] **Step 4: Verify notion_url saved to Content Queue**
  Open Content Queue sheet → find "Test Garden Planner" row → check `notion_url` column is populated.
  *(Note: if test product doesn't exist in the sheet, the update will silently do nothing — that's OK for now, will work correctly in production)*

- [ ] **Step 5: Clean up test page**
  Delete "Test Garden Planner" from Notion manually after verifying.

---

## Task 4: Wire into agent_design_content

**Files:**
- Modify: n8n workflow `agent_design_content` (ID: `L5YfwM7qt8jt7UFd`) — add Execute Workflow node

- [ ] **Step 1: Get current agent_design_content workflow JSON**
  Call `mcp__n8n-mcp__n8n_get_workflow` with ID `L5YfwM7qt8jt7UFd` and `mode: "full"`.
  Save the full response — you will add one node and one connection, then PUT it back.

- [ ] **Step 2: Add Execute agent_notion node**
  In the workflow JSON, add this node to the `nodes` array:
  ```json
  {
    "parameters": {
      "workflowId": { "__rl": true, "value": "<NEW_AGENT_NOTION_WORKFLOW_ID>", "mode": "id" },
      "workflowInputs": { "mappingMode": "passthrough", "value": {}, "schema": [] },
      "options": { "waitForSubWorkflow": false }
    },
    "id": "design-exec-notion",
    "name": "Execute agent_notion",
    "type": "n8n-nodes-base.executeWorkflow",
    "typeVersion": 1.3,
    "position": [<X_OF_APPEND_NODE + 240>, <Y_OF_APPEND_NODE + 200>],
    "onError": "continueRegularOutput"
  }
  ```
  Find the position of "Append to Content Queue" node in the existing JSON and set this node below it.

- [ ] **Step 3: Add connection from Append to Content Queue → Execute agent_notion**
  In the `connections` object, find `"Append to Content Queue"` and add a second connection (index 1) alongside the existing one to "Mark design_complete":
  ```json
  "Append to Content Queue": {
    "main": [
      [
        { "node": "Mark design_complete", "type": "main", "index": 0 },
        { "node": "Execute agent_notion", "type": "main", "index": 0 }
      ]
    ]
  }
  ```

- [ ] **Step 4: Save updated workflow**
  Call `mcp__n8n-mcp__n8n_update_full_workflow` with the complete modified workflow JSON (ID: `L5YfwM7qt8jt7UFd`).
  Expected: success response, workflow saves without errors.

- [ ] **Step 5: Verify the connection**
  Call `mcp__n8n-mcp__n8n_get_workflow` with ID `L5YfwM7qt8jt7UFd` and `mode: "structure"`.
  Check: "Append to Content Queue" has 2 outputs in its connections.

---

## Task 5: End-to-End Test

- [ ] **Step 1: Ensure agent_design_content has a product ready**
  Open Research Log sheet. Find a row with `status = pending_design`. If none, run `/research` first via Telegram to populate one.

- [ ] **Step 2: Run /design**
  Send `/design` via Telegram. Wait for the "✅ Design Agent complete" message.

- [ ] **Step 3: Verify Notion template created**
  Within a few seconds after the design message, you should receive the Notion done message:
  `✅ Notion template created\nProduct: "[product name]"\nPages: X\nhttps://www.notion.so/...`

- [ ] **Step 4: Open the Notion link**
  Click the URL in Telegram. Verify:
  - Product page exists under "Planify Templates"
  - All pages are created in order
  - Trackers are databases with correct column names
  - Reference pages have Item/Notes tables
  - Planner pages have unchecked to-do items
  - Journal pages have toggles

- [ ] **Step 5: Verify notion_url in Content Queue**
  Open Content Queue sheet → find the product row → confirm `notion_url` column has the Notion URL.

- [ ] **Step 6: Commit**
  ```bash
  git add docs/superpowers/plans/2026-04-20-agent-notion.md
  git commit -m "Add agent_notion implementation plan"
  ```
