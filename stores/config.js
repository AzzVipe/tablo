import { defineStore } from "pinia";

const STORAGE_KEY = "user-table-config";

export const useStore = defineStore("userConfig", {
	state: () => ({
		columnWidths: {},

		loaded: false,
	}),

	actions: {
		// -------------------------
		// LOAD CONFIG
		// -------------------------

		async fetchUserConfig(force = false) {
			if (this.loaded && !force) {
				return;
			}

			try {
				if (process.server) {
					return;
				}

				const raw = localStorage.getItem(STORAGE_KEY);

				if (!raw) {
					this.columnWidths = {};
					this.loaded = true;
					return;
				}

				const parsed = JSON.parse(raw);

				this.columnWidths = parsed?.columnWidths || {};

				this.loaded = true;
			} catch (err) {
				console.error("[userConfig] Failed to load config:", err);

				this.columnWidths = {};
			}
		},

		// -------------------------
		// SAVE TO LOCALSTORAGE
		// -------------------------

		persistConfig() {
			if (process.server) {
				return;
			}

			try {
				localStorage.setItem(
					STORAGE_KEY,
					JSON.stringify({
						columnWidths: this.columnWidths,
					})
				);
			} catch (err) {
				console.error("[userConfig] Failed to persist config:", err);
			}
		},

		// -------------------------
		// UPDATE WIDTH
		// -------------------------

		saveTableColumnWidth(tableName, updatedColumns) {
			if (!tableName) {
				return;
			}

			if (typeof updatedColumns !== "object") {
				return;
			}

			this.columnWidths = {
				...this.columnWidths,

				[tableName]: {
					...(this.columnWidths?.[tableName] || {}),

					...updatedColumns,
				},
			};

			this.loaded = true;

			this.persistConfig();
		},

		// -------------------------
		// GET WIDTH
		// -------------------------

		getColumnWidth(tableName, columnName) {
			return this.columnWidths?.[tableName]?.[columnName] ?? null;
		},

		// -------------------------
		// RESET
		// -------------------------

		resetConfig() {
			this.columnWidths = {};

			this.loaded = false;

			if (process.client) {
				localStorage.removeItem(STORAGE_KEY);
			}
		},
	},
});
