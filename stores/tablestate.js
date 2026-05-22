import { defineStore } from "pinia";

export const useStore = defineStore("tableState", {
	state: () => ({
		viewsMap: new Map(), // key: collection, value: views array
		viewsFetchedMap: new Map(), // key: collection, value: boolean
		loadingState: null,
	}),

	actions: {
		// Reset all cached data or a specific collection
		resetCache(collection = null) {
			if (collection) {
				this.viewsMap.delete(collection);
				this.viewsFetchedMap.delete(collection);
			} else {
				this.viewsMap.clear();
				this.viewsFetchedMap.clear();
			}

			this.loadingState = null;
		},

		// Save a new view and update the specific collection in viewsMap
		async tableState(collection, viewData) {
			const { crud } = useApi();

			this.loadingState = "adding";

			try {
				const response = await crud({
					method: "POST",
					apiPath: `/views`,
					body: viewData,
				});

				if (!response || typeof response !== "object") {
					console.error("Invalid API Response:", response);
					return;
				}

				// Get existing views array for the collection (or initialize)
				const existingViews = this.viewsMap.get(collection) || [];

				// Add the new view to the array
				existingViews.push(response);

				// Update the map
				this.viewsMap.set(collection, existingViews);

				return response;
			} catch (error) {
				console.error("API Error:", error);
			} finally {
				this.loadingState = null;
			}
		},

		// Update a view (backend only, optional: update local cache manually if needed)
		async updateView(viewId, updatedData) {
			const { crud } = useApi();

			this.loadingState = "updating";

			try {
				const response = await crud({
					method: "PUT",
					apiPath: `/views/${viewId}`,
					body: updatedData,
				});

				return response;
			} catch (error) {
				console.error("API Error:", error);
			} finally {
				this.loadingState = null;
			}
		},

		// Delete a view by viewId and remove it from the collection in viewsMap
		async deleteView(collection, viewId) {
			const { crud } = useApi();

			this.loadingState = "deleting";

			try {
				await crud({
					method: "DELETE",
					apiPath: `/views/${viewId}`,
				});

				const existingViews = this.viewsMap.get(collection) || [];

				// Remove the deleted view from the array
				const updatedViews = existingViews.filter(
					(view) => view.pid !== viewId
				);

				// Update the map
				this.viewsMap.set(collection, updatedViews);
			} catch (error) {
				console.error("API Error:", error);
			} finally {
				this.loadingState = null;
			}
		},

		// Fetch a single view (useful for view details page, etc.)
		async fetchView(viewId) {
			const { crud } = useApi();

			this.loadingState = "fetching";

			try {
				const response = await crud({
					method: "GET",
					apiPath: `/views/${viewId}`,
				});

				return response;
			} catch (error) {
				console.error("API Error:", error);
			} finally {
				this.loadingState = null;
			}
		},

		// List views for a specific collection, with per-collection caching
		async listViews(collection = "", forceRefresh = false) {
			const { crud } = useApi();

			// If fetched already and no force refresh, return cached data
			if (this.viewsFetchedMap.get(collection) && !forceRefresh) {
				return this.viewsMap.get(collection);
			}

			this.loadingState = "fetching";

			try {
				const filter = collection ? `filter=collection=${collection}` : "";

				const response = await crud({
					method: "GET",
					apiPath: `/views?${filter}`,
				});

				if (!response || !response?.views || response?.views.length === 0) {
					this.viewsMap.set(collection, []);
					this.viewsFetchedMap.set(collection, true);
					return [];
				}

				this.viewsMap.set(collection, response?.views);
				this.viewsFetchedMap.set(collection, true);

				return response?.views;
			} catch (error) {
				console.error("API Error:", error);
			} finally {
				this.loadingState = null;
			}
		},

		async getDefaultView(path) {
			return null;
		},

		async setDefaultView(path, viewId = null) {
			const { crud } = useApi();

			try {
				const response = await crud({
					method: "PATCH",
					apiPath: `/views/defaultViews`,
					body: {
						viewId,
						collection: path,
					},
				});

				return response;
			} catch (error) {
				console.error("API Error:", error);
			}
		},
	},
});
