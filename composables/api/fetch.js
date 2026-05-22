import {
	__assertFetchContext,
	__assertBaseContext,
	__performRequest,
	__serializeSort,
	__createCacheKey,
	__calculatePages,
	__findRecordLocal,
} from "./helpers";

/**
 * Fetch paginated records.
 */
export async function __fetchData(
	context,
	match = {},
	sort = null,
	page = context.currentPage
) {
	__assertFetchContext(context);

	const currentPage = page ?? context.currentPage;
	const cacheKey = __createCacheKey(match, sort);
	const cachedPage = context.pageCache?.[currentPage];

	if (
		cachedPage?.key === cacheKey &&
		cachedPage?.metadata?.count === context.recordsDataLength
	) {
		context.recordsData = cachedPage.data || [];

		context.currentPage = currentPage;

		return cachedPage.data;
	}

	return await __performRequest(context, async (controller) => {
		const { crud } = useApi();

		const response = await crud({
			apiPath: context.apiPath,

			method: "GET",

			query: {
				page: currentPage,
				pageSize: context.pageStep,
				sort: __serializeSort(sort),
				filter: match,
			},

			signal: controller.signal,
		});

		context.recordsData = response?.[context.field] || [];

		context.recordsDataLength =
			response?.metadata?.count ?? response?.[context.field]?.length ?? 0;
		context.currentPage = currentPage;

		__calculatePages(context);

		context.pageCache[currentPage] = {
			key: cacheKey,
			data: [...context.recordsData],
			metadata: response.metadata,
		};

		return context.recordsData;
	});
}

/**
 * Search paginated records.
 */
export async function __searchData(
	context,
	searchToken = "",
	sort = null,
	page = context.currentPage
) {
	__assertFetchContext(context);

	return await __performRequest(context, async (controller) => {
		const { crud } = useApi();

		const response = await crud({
			apiPath: `${context.apiPath}/search`,

			method: "GET",

			query: {
				page: page,
				pageSize: context.pageStep,
				sort: __serializeSort(sort),
				searchToken,
			},

			signal: controller.signal,
		});

		context.recordsData = response?.[context.field] || [];

		context.recordsDataLength =
			response?.metadata?.count ?? response?.[context.field]?.length ?? 0;

		__calculatePages(context);

		return context.recordsData;
	});
}

// Find records from the API
export async function __findRecords(
	context,
	match,
	sort,
	options = { metadata: false }
) {
	__assertFetchContext(context);

	const query = { filter: match, page: 1, pageSize: context.pageStep };

	if (sort) {
		query.sort = __serializeSort(sort);
	}

	try {
		const { crud } = useApi();

		const response = await crud({
			apiPath: context.apiPath,
			method: "GET",
			query,
		});

		if (options.metadata) {
			return {
				metadata: response.metadata,
				data: response[context.field],
			};
		}

		return response[context.field];
	} catch (err) {
		console.error("Failed to find records:", err);
		throw err;
	}
}

// Find a record by its ID from the API
export async function __findById(context, id) {
	try {
		__assertBaseContext(context);

		const record = __findRecordLocal(context, "id", id);

		if (record) return record;

		// Otherwise fetch from API
		const { crud } = useApi();

		return await crud({
			apiPath: `${context.apiPath}/${id}`,
			method: "GET",
		});
	} catch (err) {
		console.error("[useAPIResource] Failed to find by id:", err);

		throw err;
	}
}

export async function __findByField(context, path, value) {
	try {
		if (!path || value === undefined || value === null) {
			return null;
		}

		const localRecord = context.recordsData?.find(
			(item) => getValueByPath(item, path) === value
		);

		if (localRecord) {
			return localRecord;
		}

		const { crud } = useApi();

		return await crud({
			apiPath: context.apiPath,
			method: "GET",
			query: {
				filter: {
					[path]: value,
				},
			},
		});
	} catch (err) {
		console.error("Failed to find by path:", err);

		throw err;
	}
}

/**
 * Fetch unique values for field filters.
 */
export async function __fetchUniqueFieldValues(context, field) {
	try {
		if (!field) {
			return [];
		}

		context.uniqueFieldCache ??= {};

		if (context.uniqueFieldCache[field]) {
			return context.uniqueFieldCache[field];
		}

		const { crud } = useApi();

		const response = await crud({
			apiPath: `${context.apiPath}/fields/${field}`,
			method: "GET",
		});

		context.uniqueFieldCache[field] = response;

		return response;
	} catch (err) {
		console.error("[useAPIResource] Failed to fetch unique values:", err);

		throw err;
	}
}

// Refresh the values a record by its id from the API
export async function __refreshRecord(context, id) {
	try {
		__assertBaseContext(context);

		const { crud } = useApi();

		const data = await crud({
			apiPath: `${context.apiPath}/${id}`,
			method: "GET",
		});

		const index = context.recordsData.findIndex((item) => item.id === id);

		if (index >= 0) {
			context.recordsData[index] = {
				...context.recordsData[index],
				...data,
			};
		}
	} catch (err) {
		console.error("[useAPIResource] Failed to refresh record:", err);

		throw err;
	}
}
