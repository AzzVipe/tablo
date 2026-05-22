# Tablo

A config-driven table framework built on Nuxt 3. Every column, filter,
permission, and side drawer tab is declared in a JSON file. The table UI,
add/edit modals, search, sort, pagination, and drawer are all generated
automatically from that config.

No login required, starts as
> `superadmin` by default.

---

![pwdman Hero](docs/screenshots/table.png)

---

## What this is

Most data management UIs end up with the same structure repeated per entity - a
table component, an add modal, an edit modal, filters, a side drawer. Tablo
solves this by making that structure driven by a single JSON config file per
entity. The components are written once and reused everywhere.

The framework was built and used in production across 20+ real applications.
This repository is a cleaned-up, open-source version with a demo data layer
powered by `json-server`.

---

## What it does

- Renders a full paginated, sortable, filterable table from a JSON config
- Generates Add and Edit modals from the same config - no separate form
  components
- Side drawer with Notes, Chips, and History tabs per record
- Role-based field-level access control - read, write, insert, delete per role
- Saved views - save the current sort + filter + column state as a named view,
  shareable via URL
- Inline cell editing with a debounced update queue
- Column reordering via drag and drop
- Multi-select bulk update and delete
- Server-generated audit history on every field change
- Client-side page cache with AbortController to cancel stale requests
- Full-text search per entity

---

![pwdman Hero](docs/screenshots/table-notes.png)

---

## Getting started

### Prerequisites

- Node.js 18+
- npm

### 1. Clone and install

```bash
git clone https://github.com/AzzVipe/tablo.git
cd tablo
npm install --legacy-peer-deps
```

### 2. Start the demo API

The demo runs against a local `json-server` instance. No real backend needed.

```bash
cd json-server
npm install
node server.js
```

You should see:

```
Demo API running at http://localhost:3001
Endpoints: /users /projects /tasks /notes /organizations
```

### 3. Set up environment

```bash
cp .env.example .env
```

The `.env.example` is pre-filled for demo mode - no changes needed.

### 4. Run the app

```bash
npm run dev
```

Open `http://localhost:3000` - you land directly on the Tasks table as
`superadmin` with no login screen.

---

## Testing different roles

Open `composables/useAuth.js` and change the `role` in `DEMO_USER`:

```js
const DEMO_USER = {
  id: "user_1",
  name: "Azmat Ali",
  role: "team", // try: superadmin, admin, team
  ...
}
```

Switch to `team` and the Users and Organizations pages disappear from the
sidebar, write permissions are removed from the table, and the Add button hides
- all driven by the config, no code changes.

---

## Project structure

```
tablo/
├── assets/css/
│   └── main.css              # Design tokens + global styles (CSS variables)
├── components/
│   ├── Form/                 # Input components (text, date, dropdowns, relation)
│   ├── Table/
│   │   ├── Actions/          # Toolbar: filter, sort, hide, table state, bulk actions
│   │   ├── Cells/            # Cell renderers: date, people, multi-value, toggle
│   │   ├── Modals/           # Add and Edit modals
│   │   └── Wrapper.vue       # Main table orchestrator - reads config, renders everything
│   ├── SideDrawer/
│   │   └── Tabs/             # Notes, Chips, History tab components
│   └── Ui/
│       ├── Logo.vue          # Tablo brand logo component
│       └── Sidebar.vue       # Navigation sidebar
├── composables/
│   ├── api/                  # Split API layer: fetch, crud, notes, helpers
│   ├── useAPIResource.js     # Exports all API functions as one composable
│   ├── useApiStore.js        # Generic store factory (deprecated, kept for reference)
│   ├── useAuth.js            # Demo auth - hardcoded current user
│   └── useUpdateQueue.js     # Debounced update queue for inline cell edits
├── json-server/
│   ├── server.js             # Demo API with custom middleware for filters, search, populate
│   └── db.json               # Demo data (tasks, projects, users, organizations, notes)
├── pages/                    # One folder per entity (tasks, projects, users, organizations)
├── stores/                   # One Pinia store per entity
├── table_configs/            # JSON config per entity - this is where everything starts
│   ├── pages.json            # Sidebar navigation and role-based page visibility
│   ├── task.json
│   ├── project.json
│   ├── user.json
│   └── organization.json
└── utils/                    # Pure utility functions
    ├── guards.js             # isNullOrUndefined, isNullOrUndefinedOrEmpty
    ├── path.js               # getPathFromHeader, getValueByPath, setValueByPath
    ├── formatters.js         # formatDate, formatSize
    ├── colors.js             # getOptionColor, getPipelineColor
    ├── arrays.js             # compareArrays
    ├── permissions.js        # setTableRules, findFieldPermissions
    ├── buildMatchString.js   # Converts filter objects to API match string
    └── tableState.js         # TableState serialization and URL helpers
```

---

## Table config reference

Every entity has a JSON file in `table_configs/` with three sections: `config`
(columns), `tab_headers` (side drawer tabs), and `roles` (permissions).

### Column fields (`config`)

```json
{
	"name": "Priority",
	"type": "select",
	"path": "priority",
	"is_visible": true,
	"is_add": true,
	"is_update": true,
	"sort": false,
	"filter": true,
	"update_many": true,
	"required": false,
	"component": "TableCellsMultiValue",
	"display_type": "stage",
	"options": [
		{
			"name": "Low",
			"value": "Low",
			"class": "bg-green-700 text-green-100",
			"icon": "ic:round-arrow-downward"
		},
		{
			"name": "Medium",
			"value": "Medium",
			"class": "bg-orange-700 text-orange-100",
			"icon": "ic:round-horizontal-rule"
		},
		{
			"name": "High",
			"value": "High",
			"class": "bg-red-700 text-red-100",
			"icon": "ic:round-priority-high"
		}
	]
}
```

| Key                  | Type    | Description                                                           |
| -------------------- | ------- | --------------------------------------------------------------------- |
| `name`               | string  | Column header label and form field label                              |
| `type`               | string  | Field type - see type system below                                    |
| `path`               | string  | Dot-notation path on the record (e.g. `"createdBy.name"`)             |
| `is_visible`         | boolean | Whether the column appears in the table                               |
| `is_add`             | boolean | Whether the field appears in the Add modal                            |
| `is_update`          | boolean | Whether the field appears in the Edit modal                           |
| `sort`               | boolean | Whether the column header is clickable to sort                        |
| `filter`             | boolean | Whether the field appears in the Filter dropdown                      |
| `update_many`        | boolean | Whether the field can be bulk-updated across selected rows            |
| `required`           | boolean | Marks the field as required in forms                                  |
| `searchable`         | boolean | Whether this field is included in full-text search                    |
| `component`          | string  | Vue component name used to render the cell                            |
| `display_type`       | string  | Display variant for `TableCellsMultiValue`: `stage`, `assign`, `chip` |
| `options`            | array   | Dropdown options - each has `name`, `value`, `class`, `icon`          |
| `image_field`        | string  | Path to an avatar/image field shown alongside the value               |
| `date_format`        | string  | Format string for date display (e.g. `"MMM DD YYYY"`)                 |
| `highlight_due_date` | boolean | Colors the date red when past due                                     |
| `default_value`      | string  | Default value for Add modal (e.g. `"now + 7d"` for dates)             |
| `refresh_on_update`  | boolean | Re-fetches the record from API after updating this field              |

### Field types

| Type             | Description                                            | Form component                  |
| ---------------- | ------------------------------------------------------ | ------------------------------- |
| `text`           | Plain text input                                       | `<input type="text">`           |
| `textarea`       | Multi-line text                                        | `<textarea>`                    |
| `number`         | Numeric input                                          | `<input type="number">`         |
| `date`           | Date picker                                            | `Form/DatePicker.vue`           |
| `select`         | Single value from a predefined options list            | `Form/SingleSelectDropdown.vue` |
| `multi-select`   | Multiple values from a predefined options list         | `Form/MultiSelectDropdown.vue`  |
| `relation`       | Single record from another entity (fetched from store) | `Form/AssignDropdown.vue`       |
| `multi-relation` | Multiple records from another entity                   | `Form/MultiAssignDropdown.vue`  |

### Relation fields

When `type` is `relation` or `multi-relation`, add these keys:

```json
{
	"type": "multi-relation",
	"path": "assignedTo",
	"get_from": "userStore",
	"get_from_value": "id",
	"get_from_field": "name",
	"get_from_image": "avatar",
	"unique_values": "assignedTo"
}
```

| Key              | Description                                                             |
| ---------------- | ----------------------------------------------------------------------- |
| `get_from`       | The Pinia store key to fetch options from (e.g. `"userStore"`)          |
| `get_from_value` | Field on the related record to use as the stored value (usually `"id"`) |
| `get_from_field` | Field on the related record to display as the label (e.g. `"name"`)     |
| `get_from_image` | Field on the related record to use as an avatar image                   |
| `unique_values`  | API field name used to fetch unique filter values from the server       |

### Side drawer tabs (`tab_headers`)

```json
{
	"tab_headers": {
		"notes": {
			"type": "notes",
			"header": {
				"name": "Notes",
				"path": "notes",
				"is_visible": true,
				"is_update": true,
				"attachment": true
			}
		},
		"chips": {
			"type": "chips",
			"header": {
				"name": "Tags",
				"path": "chips",
				"is_visible": true,
				"is_update": true
			}
		},
		"history": {
			"type": "history",
			"header": {
				"name": "History",
				"path": "history",
				"is_visible": true,
				"is_update": false
			}
		}
	}
}
```

Available tab types: `notes`, `chips`, `history`. Adding a new tab type means
creating a `SideDrawer/Tabs/YourTab.vue` component and adding a `v-else-if` case
in `SideDrawer/Tabs/index.vue`.

The `is_visible` and `is_update` on the tab header are used by the permission
system to show/hide the tab per role.

### Roles (`roles`)

```json
{
	"roles": [
		{
			"name": "superadmin",
			"read": true,
			"write": true,
			"insert": true,
			"delete": true,
			"search": true
		},
		{
			"name": "admin",
			"read": true,
			"write": true,
			"insert": true,
			"delete": true,
			"search": true
		},
		{
			"name": "team",
			"read": true,
			"write": false,
			"insert": false,
			"delete": false,
			"search": true
		}
	]
}
```

Permissions apply at the table level. The `setTableRules` utility runs at mount
and stamps the current user's role permissions onto every header object - so
components read `header.permissions.write` directly without re-checking the role
on each render.

---

## Pages config (`table_configs/pages.json`)

Controls which pages appear in the sidebar and which roles can see them.

```json
{
	"config": [
		{
			"name": "Tasks",
			"to": "/tasks",
			"value": "tasks",
			"icon": "ic:round-task"
		},
		{
			"name": "Projects",
			"to": "/projects",
			"value": "projects",
			"icon": "ic:round-folder-open"
		},
		{
			"name": "Organizations",
			"to": "/organizations",
			"value": "organizations",
			"icon": "ic:round-home-work"
		},
		{
			"name": "Users",
			"to": "/users",
			"value": "users",
			"icon": "ic:round-person"
		}
	],
	"roles": [
		{ "name": "superadmin", "visible": true },
		{ "name": "admin", "visible": true },
		{
			"name": "team",
			"visible": true,
			"pages": { "organizations": false, "users": false }
		}
	]
}
```

Setting `"organizations": false` for a role removes it from the sidebar for that
role entirely.

---

## How the API layer works

The `composables/api/` directory contains four files:

- `helpers.js` - shared utilities: context validation, request lifecycle
  (`__performRequest`), cache key creation, sort serialization
- `fetch.js` - read operations: `__fetchData`, `__searchData`, `__findRecords`,
  `__findById`, `__findByField`, `__fetchUniqueFieldValues`, `__refreshRecord`
- `crud.js` - write operations: `__addRecord`, `__updateRecord`,
  `__deleteRecord`, `__updateRecordsMany`, `__deleteRecordsMany`
- `notes.js` - notes and attachments: `__fetchNotes`, `__addNote`,
  `__updateNote`, `__deleteNote`

All functions are exported through `useAPIResource()` and called from Pinia
store actions. Each store passes `this` as the context, which gives the
functions access to the store's state and API path.

`__performRequest` handles the full request lifecycle - aborting in-flight
requests when a new one starts, tracking `isFetching`, and preventing stale
responses from overwriting fresh data using a `Symbol`-based request ID.

---

## Theming

All colors are CSS custom properties in `assets/css/main.css`, structured in two
layers:

**Primitive tokens** - the actual color values:

```css
:root {
	--stone-950: #0c0a09;
	--stone-900: #1c1917;
	--orange-focus: #ea580c;
}
```

**Semantic tokens** - mapped to primitives by purpose:

```css
:root {
	--page-bg: var(--stone-900);
	--card-bg: var(--stone-750);
	--text-title: var(--orange-focus);
	--input-bg: var(--stone-750);
}
```

To change the theme, update the primitive values. Every semantic token,
component class, and `@nuxt/ui` override updates automatically. `@nuxt/ui`
components are themed separately in `app.config.ts` using the same CSS
variables.

---

![pwdman Hero](docs/screenshots/table-add.png)

---

## Demo server

The demo API is a custom `json-server` instance with middleware for:

- **Filtering** - `?filter=priority=High` or `?filter=priority=(Low,High)` or
  `?filter=priority!=Low`
- **Search** - `GET /tasks/search?searchToken=wireframe`
- **Relation populate** - every GET response populates relation fields (e.g.
  `assignedTo` returns full user objects, not just IDs)
- **Unique field values** - `GET /tasks/fields/assignedTo` returns a
  `{ id: name }` map for filter dropdowns
- **Auto-generated prefixed IDs** - new records get IDs like
  `task_1716912345_ab3f2`
- **Server-generated history** - every PATCH request writes a history entry
  comparing old vs new field values

Connecting to a real backend is a one-line change in `composables/useAPI.js` -
update `DEMO_BASE` to your server URL.

---

## Adding a new table

Run the scaffold script from the project root:

```bash
node scripts/create-table.js
# Enter the table name when prompted: invoice
```

This creates:

- `pages/invoices/index.vue`
- `pages/invoices/[id].vue`
- `stores/invoice.js`
- `composables/useInvoice.js`
- `components/SideDrawer/Invoice.vue`
- `table_configs/invoice.json`

Then edit `table_configs/invoice.json` to define your columns and add the page
to `table_configs/pages.json`.

---

## Tech stack

- **Nuxt 3** with Vue 3 Composition API
- **Pinia** - state management with client-side page cache
- **@nuxt/ui** - dropdowns, modals, popovers, tabs
- **Tailwind CSS** - utility styling
- **vuedraggable** - column reordering
- **v-calendar** - date picker
- **json-server** - demo API layer

---

## License

MIT License - see [LICENSE](LICENSE) for details.
