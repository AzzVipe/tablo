// composables/useApi.js
// DEMO VERSION — points to json-server, no auth token required

export function useApi() {
	// In demo mode we skip the session token check entirely.
	// All requests go directly to the local json-server instance.
	const DEMO_BASE = "http://localhost:3001";
	const { currentUser } = useAuth();

	const crud = async ({
		apiPath,
		method = "GET",
		query = {},
		body = null,
		signal,
	}) => {
		const queryParams = query && typeof query === "object" ? query : {};
		const cleanQueryParams = {};

		Object.entries(queryParams).forEach(([key, value]) => {
			if (value === null || value === undefined) {
				if (key === "sort" || key === "filter") {
					cleanQueryParams[key] = "";
				}
			} else {
				cleanQueryParams[key] = value;
			}
		});

		// Build URL against json-server base
		const url = new URL(apiPath, DEMO_BASE);

		if (Object.keys(cleanQueryParams).length > 0) {
			Object.entries(cleanQueryParams).forEach(([key, value]) => {
				if (value !== null && value !== undefined) {
					if (typeof value === "object") {
						Object.entries(value).forEach(([operator, operand]) => {
							if (operand !== undefined && operand !== null) {
								url.searchParams.append(`${key}[${operator}]`, operand);
							}
						});
					} else {
						url.searchParams.append(key, value);
					}
				}
			});
		}

		const options = {
			method,
			headers: {
				"Content-Type": "application/json",
				...(currentUser.value?.id && { "x-user-id": currentUser.value.id }),
			},
			signal,
		};

		if (["POST", "PATCH"].includes(method) && body) {
			options.body = JSON.stringify(body);
		}

		try {
			return await $fetch(url.toString(), options);
		} catch (error) {
			if (error?.cause?.name === "AbortError") {
				throw createError({ statusCode: 499, message: "Request Aborted" });
			}
			throw createError({
				statusCode: error.statusCode || 500,
				message:
					error.response?._data?.message ||
					error.statusMessage ||
					"Failed to process request",
				data: error.response?._data || null,
			});
		}
	};

	// Simplified request() — used for things like CSV export
	// In demo mode these are no-ops that return empty
	const request = async ({
		apiPath,
		method = "GET",
		query = null,
		body = null,
	}) => {
		const url = new URL(apiPath, DEMO_BASE);

		if (query && typeof query === "object") {
			Object.entries(query).forEach(([key, value]) => {
				if (value !== null && value !== undefined) {
					url.searchParams.append(key, value);
				}
			});
		}

		const options = {
			method,
			headers: {
				"Content-Type": "application/json",
				...(currentUser.value?.id && { "x-user-id": currentUser.value.id }),
			},
		};

		if (["POST", "PATCH"].includes(method) && body) {
			options.body = JSON.stringify(body);
		}

		try {
			return await $fetch(url.toString(), options);
		} catch (error) {
			throw createError({
				statusCode: error.response?.status || 500,
				message: error.message || "Server error.",
			});
		}
	};

	// In demo mode getAuthUser returns the hardcoded demo user
	// (auth.js composable handles this — this is just a fallback)
	const getAuthUser = async () => {
		return {
			id: "user_1",
			name: "Azmat Ali",
			email: "azmat@example.com",
			role: "superadmin",
			organizationId: "org_1",
			avatar: "https://i.pravatar.cc/150?u=azmat@example.com",
		};
	};

	const logout = async () => {
		return { message: "Logged out" };
	};

	return { crud, request, getAuthUser, logout };
}
