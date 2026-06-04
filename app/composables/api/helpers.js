/**
 * Validate required store context.
 */
export function __assertBaseContext(context) {
	if (!context) {
		throw new Error("[useAPIResource] context required");
	}

	if (!context.apiPath) {
		throw new Error("[useAPIResource] apiPath required");
	}
}

export function __assertFetchContext(context) {
	__assertBaseContext(context);

	if (!context.field) {
		throw new Error("[useAPIResource] field required");
	}
}

/**
 * Serialize sort object into API format.
 *
 * Example:
 * { createdAt: -1 }
 * -> "-createdAt"
 */
export function __serializeSort(sort) {
	if (!sort) {
		return null;
	}

	return Object.entries(sort)
		.map(([key, value]) => (value === 1 ? key : `-${key}`))
		.join(",");
}

/**
 * Create cache key from
 * match + sort state.
 *
 * NOTE:
 * Depends on object key order.
 */
export function __createCacheKey(match, sort) {
	return JSON.stringify({
		match,
		sort,
	});
}

/**
 * Prevent stale request cleanup.
 */
export function __clearController(context, controller) {
	if (context.currentController === controller) {
		context.currentController = null;
	}
}

/**
 * Shared request lifecycle handler.
 */
export async function __performRequest(context, callback) {
	__assertBaseContext(context);

	if (context.currentController) {
		context.currentController.abort();
	}

	const controller = new AbortController();
	const requestId = Symbol("request");

	context.activeRequest = requestId;
	context.currentController = controller;
	context.isFetching = true;

	try {
		const response = await callback(controller);
		if (controller.signal.aborted) {
			return;
		}

		return response;
	} catch (err) {
		if (err?.name === "AbortError") {
			return;
		}
		console.error(err);

		throw err;
	} finally {
		__clearController(context, controller);
		await nextTick();

		// Prevent stale request cleanup
		if (context.activeRequest === requestId) {
			context.isFetching = false;
		}
	}
}

// Delete records from the store without making API calls
export function __deleteRecordsFromStore(context, filter) {
	if (!filter || typeof filter !== "object") {
		return;
	}

	const recordsToDelete = new Set(
		context.recordsData.filter((record) => {
			return Object.keys(filter).every((key) => {
				if (filter[key]?.["$in"]) {
					return filter[key]["$in"].includes(record[key]);
				}

				return record[key] === filter[key];
			});
		})
	);

	context.recordsData = context.recordsData.filter(
		(record) => !recordsToDelete.has(record)
	);
}

export function __findRecordLocal(context, path, value) {
	try {
		if (context.recordsData?.length <= 0) return null;

		return context.recordsData?.find(
			(rec) => getValueByPath(rec, path) === value
		);
	} catch (err) {
		console.error("[useAPIResource] Failed local lookup:", err);

		return null;
	}
}

// Calculate the total number of pages
export function __calculatePages(context) {
	try {
		const pageStep = Math.max(1, context.pageStep || 1);

		context.totalPages = Math.max(
			1,
			Math.ceil(context.recordsDataLength / pageStep)
		);

		if (context.currentPage > context.totalPages) {
			context.currentPage = context.totalPages;
		}
	} catch (err) {
		console.error(err);
	}
}
