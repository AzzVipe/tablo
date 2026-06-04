import * as tableStateStore from "~/stores/tablestate";

// Helper
const parseIfNumber = (v) => {
	const num = Number(v);
	return !isNaN(num) && v.trim() !== "" ? num : v;
};

/**
 * Adds a table state configuration to the database and updates the local state.
 *
 * @param {Object} tableConfig - The configuration object for the table.
 * @param {String} tableStateName - The name of the table state to be added.
 * @param {Function} clearTableStateName - A callback function to clear the table state name input.
 */
export const addTableState = async (
	tableConfig,
	tableStateName,
	clearTableStateName
) => {
	if (
		isNullOrUndefinedOrEmpty(tableConfig) ||
		isNullOrUndefinedOrEmpty(tableStateName) ||
		isNullOrUndefinedOrEmpty(clearTableStateName)
	)
		return;

	const { tableState, activeTableState } = tableConfig.currentRecord();

	const { tableTdVisible } = tableConfig.hideComposable();
	const { grouped } = tableConfig.groupComposable();
	const { currentUser } = useAuth();

	const store = tableConfig.store();
	const viewStore = useTableStateStore();

	if (isNullOrUndefinedOrEmpty(store) || isNullOrUndefinedOrEmpty(currentUser))
		return;

	const collection = store.apiPath.slice(1);

	let temp = {
		name: tableStateName,
		collection,
		hide: JSON.parse(JSON.stringify(tableTdVisible?.value)),
		sort: tableState?.value?.sort || {},
		group: JSON.parse(JSON.stringify(grouped?.value)),
		filters: [],
		match: [{ value: tableState?.value?.match }],
	};

	const view = await viewStore.tableState(collection, temp);

	if (!view) return;

	activeTableState.value = view;
	tableState.value = JSON.parse(JSON.stringify(view));

	if (Array.isArray(view.match) && view.match.length > 0) {
		tableState.value.filters = prepareFilterFromMatch(
			view?.match?.[0]?.value,
			tableConfig.headers
		);

		tableState.value.match = view?.match?.[0]?.value;
	} else if (view.match) {
		tableState.value.filters = prepareFilterFromMatch(
			view?.match,
			tableConfig.headers
		);
	}

	clearTableStateName();
};

/**
 * Applies a table state configuration to the table and navigates to the updated query.
 *
 * @param {Object} tableConfig - The configuration object for the table.
 * @param {Object} item - The table state item to be applied.
 * @param {Function} toggleDropdown - A callback to toggle the dropdown visibility.
 */
export async function applyTableState(tableConfig, item, toggleDropdown) {
	if (isNullOrUndefinedOrEmpty(item) || isNullOrUndefinedOrEmpty(tableConfig))
		return;

	const { tableState, activeTableState } = tableConfig.currentRecord();
	const { tableTdVisible } = tableConfig.hideComposable();
	const { currentPage } = usePages();

	if (isNullOrUndefinedOrEmpty(tableState)) return;

	const store = tableConfig.store();

	if (isNullOrUndefinedOrEmpty(store)) return;

	store.currentPage = 1;
	activeTableState.value = item;
	tableState.value = JSON.parse(JSON.stringify(item)); // This is neccessary or item will be referenced to tableState

	// Handle array and string match values properly
	if (Array.isArray(item?.match) && item.match.length > 0) {
		const matchValue = item.match?.[0]?.value ?? null;

		if (matchValue) {
			tableState.value.filters = prepareFilterFromMatch(
				matchValue,
				tableConfig?.headers
			);
			tableState.value.match = matchValue;
		} else {
			tableState.value.filters = [];
			tableState.value.match = null;
		}
	} else if (item.match) {
		tableState.value.filters = prepareFilterFromMatch(
			item.match,
			tableConfig?.headers
		);
	} else {
		tableState.value.filters = [];
		tableState.value.match = null;
	}

	// Fetch data with updated match and sort
	store.fetchData(tableState.value.match, tableState.value.sort);

	// Construct the query with `tablestate`
	const query = {
		page: 1,
		tablestate: JSON.stringify({
			id: tableState.value.id,
			sort: tableState.value.sort || {},
			match: tableState.value.match || "",
		}),
	};

	navigateTo({
		path: currentPage.value,
		query: query,
	});

	// Apply column visibility settings
	if (item.hide) {
		tableTdVisible.value = JSON.parse(JSON.stringify(item.hide));
	}

	if (toggleDropdown) toggleDropdown();
}

/**
 * Clears the current table state and resets the table configuration to default.
 *
 * @param {Object} tableConfig - The configuration object for the table.
 * @param {Function} toggleDropdown - A callback to toggle the dropdown visibility.
 */
export const clearTableState = async (tableConfig, toggleDropdown) => {
	if (
		isNullOrUndefinedOrEmpty(tableConfig) ||
		isNullOrUndefinedOrEmpty(toggleDropdown)
	)
		return;

	const { tableState, activeTableState } = tableConfig.currentRecord();
	const { currentPage } = usePages();

	if (
		isNullOrUndefinedOrEmpty(tableState) ||
		isNullOrUndefinedOrEmpty(activeTableState) ||
		isNullOrUndefinedOrEmpty(currentPage)
	)
		return;

	const store = tableConfig.store();
	if (isNullOrUndefinedOrEmpty(store)) return;

	store.currentPage = 1;

	tableState.value = {
		name: null,
		filter: null,
		sort: tableConfig.defaultSort,
		hide: null,
		group: null,
	};

	activeTableState.value = null;

	const { tdInit } = tableConfig.hideComposable();

	tdInit(tableConfig.headers, tableConfig.tab_headers);
	store.fetchData(tableState.value.match, tableState.value.sort);

	const query = filterTableState(tableState.value, 1);

	navigateTo({
		path: currentPage.value,
		query,
	});

	toggleDropdown();
};

/**
 * Handles filter updates for the table based on the provided filters.
 *
 * @param {Array} filters - The filters to be applied.
 * @param {Object} tableConfig - The configuration object for the table.
 * @param {Function} handler - A callback function to handle data updates.
 */
export const filterHandler = async (filters, tableConfig, handler) => {
	if (
		isNullOrUndefinedOrEmpty(tableConfig) ||
		isNullOrUndefinedOrEmpty(handler)
	)
		return;

	const { tableState, activeTableState } = tableConfig.currentRecord();

	let matchPipeline = [];

	activeTableState.value = null;

	if (!isNullOrUndefinedOrEmpty(filters)) {
		matchPipeline = await buildMatchString(filters);

		if (matchPipeline) {
			tableState.value = {
				name: null,
				filters: filters,
				match: matchPipeline,
				sort: tableState.value.sort,
				hide: tableState.value.hide,
				group: tableState.value.group,
			};

			handler(1);

			return;
		}
	}

	const sort = isNullOrUndefinedOrEmpty(tableState.value.sort)
		? tableConfig.defaultSort
		: tableState.value.sort;

	tableState.value = {
		name: null,
		filters: null,
		match: null,
		sort: sort,
		hide: null,
		group: null,
	};

	handler(1);
};

/**
 * Removes sensitive fields from table state and prepares it for query parameters.
 *
 * @param {Object} tablestate - The table state object.
 * @param {Number} page - The current page number.
 * @param {Object} extraParams - Additional query parameters.
 * @returns {Object} - The filtered table state query object.
 */
export const filterTableState = (tablestate, page, extraParams = {}) => {
	if (!tablestate || typeof page !== "number") return {};

	const tablestateData = ["id", "sort", "match"].reduce((acc, key) => {
		const value = tablestate[key];
		if (!isNullOrUndefinedOrEmpty(value)) acc[key] = value;
		return acc;
	}, {});

	const query = { page, ...extraParams };

	if (Object.keys(tablestateData).length) {
		query.tablestate = JSON.stringify(tablestateData);
	}

	return query;
};

/**
 * Extracts filters from a match array based on table headers.
 *
 * @param {Array} match - The array of match conditions.
 * @param {Array} headers - The table headers.
 * @returns {Array} - The filters extracted from the match conditions.
 */
export const prepareFilterFromMatch = (match, headers) => {
	if (!match || !headers?.length) return [];

	const matchParts = match.split ? match?.split("|") : [];
	const filters = [];

	const grouped = {};

	for (const part of matchParts) {
		// Match keys like: field=val, field!=val, field>=val, etc.
		const match = part.match(/^([^<>=!]+)([<>!]?=|[<>])\(?([^)]+)\)?$/);
		if (!match) continue;

		const [, rawKey, operator, rawValue] = match;
		const key = rawKey.trim();
		const values = rawValue.includes(",")
			? rawValue.split(",").map((v) => parseIfNumber(v.trim()))
			: [parseIfNumber(rawValue.trim())];

		if (!grouped[key]) grouped[key] = [];
		grouped[key].push({ operator, values });
	}

	// ✅ process after grouping
	for (const [key, ops] of Object.entries(grouped)) {
		const header = headers.find((h) => {
			let path = h.filter_path || getPathFromHeader(h);
			if (h.type === "pipeline") path = `${path}.currentStage`;
			return path === key;
		});

		if (header) {
			// detect range case
			const gte = ops.find((o) => o.operator === ">=");
			const lte = ops.find((o) => o.operator === "<=");

			if (gte && lte) {
				filters.push({
					selectHeaderPath: key,
					selectHeader: header,
					operator: "range",
					operand: [gte.values[0], lte.values[0]],
				});
			} else {
				// normal push
				for (const op of ops) {
					filters.push({
						selectHeaderPath: key,
						selectHeader: header,
						operator: op.operator,
						operand: op.values.length === 1 ? op.values[0] : op.values,
					});
				}
			}
		}
	}

	return filters;
};

/**
 * Handles sorting updates for the table and updates the table state configuration.
 *
 * @param {Object} sort - The sorting configuration to apply.
 * @param {Object} tableConfig - The configuration object for the table.
 * @param {Function} handler - A callback function to trigger data fetching or updates.
 */
export const sortHandler = async (sort, tableConfig, handler) => {
	if (
		isNullOrUndefinedOrEmpty(sort) ||
		isNullOrUndefinedOrEmpty(tableConfig) ||
		isNullOrUndefinedOrEmpty(handler)
	)
		return;

	const { tableState, activeTableState } = tableConfig.currentRecord();

	tableState.value = {
		name: null,
		sort: sort,
		filters: tableState.value.filters,
		match: tableState.value.match,
		hide: tableState.value.hide,
		group: tableState.value.group,
	};

	activeTableState.value = null;

	handler(1);
};
