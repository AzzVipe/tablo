const jsonServer = require("json-server");
const path = require("path");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
router.db._.id = "id";
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

const SEARCHABLE_FIELDS = {
	tasks: ["title", "note"],
	projects: ["title"],
	users: ["name", "email"],
	organizations: ["name"],
	history: ["field", "from", "to"],
};

const POPULATE_CONFIG = {
	users: [{ field: "organization", from: "organizations", multi: false }],
	tasks: [
		{ field: "project", from: "projects", multi: false },
		{ field: "assignedTo", from: "users", multi: true },
		{ field: "createdBy", from: "users", multi: false },
	],
	projects: [
		{ field: "organization", from: "organizations", multi: false },
		{ field: "assignedTo", from: "users", multi: true },
		{ field: "createdBy", from: "users", multi: false },
	],
	organizations: [{ field: "createdBy", from: "users", multi: false }],
	notes: [{ field: "createdBy", from: "users", multi: false }],
	history: [{ field: "createdBy", from: "users", multi: false }],
};

const FIELD_MAP = {
	assignedTo: { from: "users", label: "name" },
	createdBy: { from: "users", label: "name" },
	ownerId: { from: "users", label: "name" },
	project: { from: "projects", label: "title" },
	organization: { from: "organizations", label: "name" },
};

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

function generateId(collection) {
	const prefix = collection.replace(/s$/, "");
	return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function getCollection(req) {
	return req.path.replace("/", "").split("/")[0];
}

function getNestedValue(obj, path) {
	return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function populate(results, collection, db) {
	const config = POPULATE_CONFIG[collection];
	if (!config) return results;
	return results.map((item) => {
		const populated = { ...item };
		for (const { field, from, multi, as } of config) {
			const key = as ?? field;
			if (multi) {
				populated[key] = (item[field] ?? [])
					.map((id) => db[from].find((r) => r.id === id))
					.filter(Boolean);
			} else {
				populated[key] =
					db[from].find((r) => r.id === item[field]) ?? item[field];
			}
		}
		return populated;
	});
}

function applyFilters(results, filterParam) {
	if (typeof filterParam === "string" && filterParam.includes("|")) {
		filterParam = filterParam.split("|");
	}
	const filters = Array.isArray(filterParam) ? filterParam : [filterParam];
	for (const f of filters) {
		if (!f) continue;
		const match = f.match(/^([\w.]+)(!?=)\(?([^)]+)\)?$/);
		if (!match) continue;
		const field = match[1];
		const operator = match[2];
		const values = match[3].split(",").map((v) => v.trim());
		results = results.filter((item) => {
			const itemVal = getNestedValue(item, field);
			let matches;
			if (Array.isArray(itemVal)) {
				matches = itemVal.some((v) => values.includes(String(v)));
			} else if (itemVal && typeof itemVal === "object") {
				matches = values.includes(String(itemVal.id));
			} else {
				matches = values.includes(String(itemVal));
			}
			return operator === "!=" ? !matches : matches;
		});
	}
	return results;
}

function applyContains(results, query) {
	Object.keys(query).forEach((key) => {
		if (!["page", "pageSize", "sort", "filter", "searchToken"].includes(key)) {
			results = results.filter(
				(item) => String(item[key]) === String(query[key])
			);
		}
	});
	return results;
}

function applySort(results, sortParam) {
	if (!sortParam) return results;
	const desc = sortParam.startsWith("-");
	const field = desc ? sortParam.slice(1) : sortParam;
	return [...results].sort((a, b) => {
		if (a[field] < b[field]) return desc ? 1 : -1;
		if (a[field] > b[field]) return desc ? -1 : 1;
		return 0;
	});
}

function applySearch(results, collection, searchToken) {
	if (!searchToken) return results;
	const fields = SEARCHABLE_FIELDS[collection] ?? [];
	if (!fields.length) return results;
	const token = searchToken.toLowerCase();
	return results.filter((item) =>
		fields.some((f) =>
			item[f] ? String(item[f]).toLowerCase().includes(token) : false
		)
	);
}

function paginate(results, query) {
	const page = parseInt(query.page) || 1;
	const pageSize = parseInt(query.pageSize) || 20;
	const total = results.length;
	const paginated = results.slice((page - 1) * pageSize, page * pageSize);
	return { paginated, total, page, pageSize };
}

function respond(res, collection, results, query, db) {
	if (db) results = populate(results, collection, db);
	const { paginated, total, page, pageSize } = paginate(results, query);
	return res.json({
		[collection]: paginated,
		metadata: { count: total, page, pageSize },
	});
}

function getRequestUser(req, db) {
	const userId = req.headers["x-user-id"];
	if (!userId) return null;
	return db.users.find((u) => u.id === userId)?.id ?? null;
}

// -------------------------------------------------------
// Main middleware
// -------------------------------------------------------

server.use((req, res, next) => {
	const db = router.db.getState();
	const collection = getCollection(req);

	// ---- 1. Search ----
	if (req.method === "GET" && req.path.endsWith("/search")) {
		if (!db[collection]) return next();
		let results = db[collection];
		results = applySearch(results, collection, req.query.searchToken);
		results = applySort(results, req.query.sort);
		return respond(res, collection, results, req.query, db);
	}

	// ---- 2. Custom filter ----
	if (req.method === "GET" && req.query.filter) {
		if (!db[collection]) return next();
		let results = db[collection];
		results = applyFilters(results, req.query.filter);
		results = applySort(results, req.query.sort);
		return respond(res, collection, results, req.query, db);
	}

	// ---- 3. Array-contains ----
	const containsKey = Object.keys(req.query).find((k) =>
		k.endsWith("_contains")
	);
	if (containsKey && req.method === "GET") {
		if (!db[collection]) return next();
		const field = containsKey.replace("_contains", "");
		const value = req.query[containsKey];
		delete req.query[containsKey];
		let results = db[collection].filter(
			(item) => Array.isArray(item[field]) && item[field].includes(value)
		);
		results = applyContains(results, req.query);
		results = applySort(results, req.query.sort);
		return respond(res, collection, results, req.query, db);
	}

	// ---- 4. Unique field values ----
	if (req.method === "GET" && req.path.includes("/fields/")) {
		const field = req.path.split("/fields/")[1];
		if (FIELD_MAP[field]) {
			const { from, label } = FIELD_MAP[field];
			const options = db[from].reduce((acc, r) => {
				acc[r.id] = r[label];
				return acc;
			}, {});
			return res.json(options);
		}
		if (db[collection]) {
			const values = [
				...new Set(
					db[collection]
						.flatMap((item) =>
							Array.isArray(item[field]) ? item[field] : [item[field]]
						)
						.filter(Boolean)
				),
			];
			return res.json(
				values.reduce((acc, v) => {
					acc[v] = v;
					return acc;
				}, {})
			);
		}
	}

	next();
});

// -------------------------------------------------------
// History — intercept PATCH to record field-level changes
// -------------------------------------------------------
server.use((req, res, next) => {
	if (req.method !== "PATCH") return next();

	const db = router.db.getState();
	const collection = getCollection(req);

	// Only track history for main collections, not notes/history itself
	const TRACKED_COLLECTIONS = ["tasks", "projects", "users", "organizations"];
	if (!TRACKED_COLLECTIONS.includes(collection)) return next();

	const idMatch = req.path.match(/^\/[\w]+\/([\w_]+)$/);
	if (!idMatch) return next();

	const recordId = idMatch[1];
	const oldRecord = db[collection]?.find((r) => r.id === recordId);
	if (!oldRecord) return next();

	// Fields to never track in history
	const SKIP_FIELDS = ["updatedAt", "update_logs", "createdAt", "createdBy"];

	const createdBy = getRequestUser(req, db);
	const createdAt = new Date().toISOString();
	const changes = req.body;

	const entries = [];

	for (const [field, newValue] of Object.entries(changes)) {
		if (SKIP_FIELDS.includes(field)) continue;

		const oldValue = oldRecord[field] ?? null;

		// Skip if value hasn't actually changed
		if (JSON.stringify(oldValue) === JSON.stringify(newValue)) continue;

		entries.push({
			id: generateId("history"),
			recordId,
			recordType: collection,
			field,
			from: oldValue,
			to: newValue,
			createdBy,
			createdAt,
		});
	}

	if (entries.length > 0) {
		if (!db.history) db.history = [];
		entries.forEach((e) => db.history.push(e));
		router.db.setState(db);
	}

	next();
});

// -------------------------------------------------------
// Auto-generate prefixed IDs for all non-notes POST requests
// -------------------------------------------------------
server.use((req, _res, next) => {
	if (req.method === "POST") {
		const collection = getCollection(req);

		// Auto-generate id
		if (!req.body.id) {
			req.body.id = generateId(collection);
		}

		// Auto-set createdAt
		if (!req.body.createdAt) {
			req.body.createdAt = new Date().toISOString();
		}

		// Auto-set createdBy from header
		if (!req.body.createdBy) {
			req.body.createdBy = req.headers["x-user-id"] ?? null;
		}
	}

	next();
});

// -------------------------------------------------------
// Sort for requests that fall through to json-server
// -------------------------------------------------------
server.use((req, _res, next) => {
	if (req.query.sort) {
		const desc = req.query.sort.startsWith("-");
		const field = desc ? req.query.sort.slice(1) : req.query.sort;
		req.query._sort = field;
		req.query._order = desc ? "desc" : "asc";
		delete req.query.sort;
	}
	next();
});

// -------------------------------------------------------
// Response shape for passthrough responses
// -------------------------------------------------------
router.render = (req, res) => {
	const data = res.locals.data;
	const collection = getCollection(req);
	const db = router.db.getState();

	if (!Array.isArray(data)) {
		return res.json(populate([data], collection, db)[0]);
	}

	// Use original dataset count if available
	const total = Number(res.getHeader("X-Total-Count")) || data.length;

	const page = parseInt(req.query._page || req.query.page) || 1;

	const pageSize =
		parseInt(req.query._limit || req.query.pageSize) || data.length;

	res.json({
		[collection]: populate(data, collection, db),
		metadata: {
			count: total,
			page,
			pageSize,
		},
	});
};

server.use(router);

const PORT = 3001;
server.listen(PORT, () => {
	console.log(`\n  Demo API running at http://localhost:${PORT}`);
	console.log(`  Endpoints: /users /projects /tasks /notes /organizations`);
	console.log(`  Search:    GET /tasks/search?searchToken=foo\n`);
});
