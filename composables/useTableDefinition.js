export function useTableDefinition(config = {}) {
	const table = reactive({
		read: config.read ?? false,
		write: config.write ?? false,

		tableName: config.tableName || {
			singular: "Record",
			plural: "Records",
		},

		headers: structuredClone(config.headers || []),
		tab_headers: structuredClone(config.tab_headers || {}),

		rowMap: config.rowMap || new Map(),
		groupMap: config.groupMap || new Map(),

		store: config.store,

		currentRecord: config.currentRecord,
		groupComposable: config.groupComposable,
		hideComposable: config.hideComposable,

		drawerComponent: config.drawerComponent,

		// runtime state
		userRole: null,
		defaultSort: config.defaultSort || null,
		primaryHeader: null,

		allHeaders: buildAllHeaders(config.headers || [], config.tab_headers || []),

		// --------------------------------
		// METHODS
		// --------------------------------

		setUserRole(role) {
			this.userRole = role;
		},

		setDefaultSort(field, direction = 1) {
			this.defaultSort = {
				[field]: direction,
			};
		},
	});

	validateTable(table);

	return table;
}

const buildAllHeaders = (headers, tabHeaders) => {
	for (const tab in tabHeaders) {
		const tabData = tabHeaders[tab];

		tabData?.headers?.forEach((item) => {
			if (item.is_visible === true && item.table_view === true) {
				headers.push(item);
			}
		});

		if (
			tabData?.header?.is_visible === true &&
			tabData?.header?.table_view === true
		) {
			headers.push(tabData.header);
		}
	}

	return headers;
};

function validateTable(table) {
	if (!table) {
		throw new Error("[useTableDefinition] Table required");
	}

	if (typeof table.store !== "function") {
		throw new Error("[useTableDefinition] store must be function");
	}

	if (typeof table.currentRecord !== "function") {
		throw new Error("[useTableDefinition] currentRecord must be function");
	}

	if (!Array.isArray(table.headers)) {
		throw new Error("[useTableDefinition] headers must be array");
	}

	if (!table.tableName?.singular || !table.tableName?.plural) {
		throw new Error("[useTableDefinition] invalid tableName");
	}
}
