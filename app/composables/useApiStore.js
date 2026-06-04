export const useAPIStores = () => {
	const toast = useToast();
	const { crud } = useApi();

	// Delete records from the store without making API calls
	function __deleteRecordsFromStore(context, filter) {
		const recordsToDelete = context.recordsData.filter((record) => {
			return Object.keys(filter).every((key) => {
				if (filter[key] && filter[key]["$in"]) {
					return filter[key]["$in"].includes(record[key]);
				}
				return record[key] === filter[key];
			});
		});

		if (recordsToDelete.length > 0) {
			context.recordsData = context.recordsData.filter(
				(record) => !recordsToDelete.includes(record)
			);
		}
	}

	// -------------------- Data Fetching and Initialization --------------------

	// Fetch data from the API with pagination, filters, and sorting
	async function __fetchData(context, match = {}, sort = null) {
		return new Promise(async (resolve, reject) => {
			try {
				// Cancel previous request if still running
				if (context.currentController) {
					context.currentController?.abort();
				}

				context.currentController = new AbortController();
				context.isFetching = true;

				if (
					context.pageCache[context.currentPage] &&
					JSON.stringify(context.pageCache[context.currentPage].match) ===
						JSON.stringify(match) &&
					JSON.stringify(context.pageCache[context.currentPage].sort) ===
						JSON.stringify(sort) &&
					context.pageCache[context.currentPage]?.metadata?.count ===
						context.recordsDataLength
				) {
					// Use cached data
					console.log("Using cached data for page:", context.currentPage);

					context.recordsData = context.pageCache[context.currentPage].data;

					return resolve(context.recordsData);
				}

				const query = {
					page: context.currentPage,
					pageSize: context.pageStep,
					sort: sort
						? Object.entries(sort)
								.map(([key, value]) => (value === 1 ? key : `-${key}`))
								.join(",")
						: null,
					filter: match,
				};

				const response = await crud({
					apiPath: context.apiPath,
					method: "GET",
					query,
					signal: context.currentController?.signal, // 👈 pass abort signal
				});

				context.recordsData = response[context.field];
				context.recordsDataLength = response?.metadata?.count
					? response?.metadata?.count
					: response[context.field]?.length;

				__calculateNoOfPages(context);

				context.pageCache[context.currentPage] = {
					sort: sort,
					match: match,
					data: context.recordsData,
					metadata: response.metadata,
				};

				resolve(context.recordsData);
			} catch (err) {
				console.error("Failed to fetch data:", err);
				reject(err);
			} finally {
				setTimeout(() => {
					context.isFetching = false;
					context.currentController = null;
				}, 1);
			}
		});
	}

	// Search data from the API with pagination, and sorting
	async function __searchData(context, searchToken = "", sort = null) {
		return new Promise(async (resolve, reject) => {
			try {
				// Cancel previous request if still running
				if (context.currentController) {
					context.currentController?.abort();
				}

				context.currentController = new AbortController();
				context.isFetching = true;

				const query = {
					page: context.currentPage,
					pageSize: context.pageStep,
					sort: sort
						? Object.entries(sort)
								.map(([key, value]) => (value === 1 ? key : `-${key}`))
								.join(",")
						: null,
					searchToken,
				};

				const response = await crud({
					apiPath: `${context.apiPath}/search`,
					method: "GET",
					query,
					signal: context.currentController?.signal, // 👈 pass abort signal
				});

				context.recordsData = response[context.field];
				context.recordsDataLength = response?.metadata?.count
					? response?.metadata?.count
					: response[context.field]?.length;

				__calculateNoOfPages(context);

				resolve(context.recordsData);
			} catch (err) {
				console.error("Failed to fetch data:", err);
				reject(err);
			} finally {
				setTimeout(() => {
					context.isFetching = false;
					context.currentController = null;
				}, 1);
			}
		});
	}

	// Fetch data for a specific page with caching
	async function __getPage(context, match = {}, sort = null) {
		return new Promise((resolve, reject) => {
			try {
				__fetchData(context, match, sort)
					.then(() => {
						resolve(context.recordsData);
					})
					.catch((err) => {
						console.error("Error fetching records:", err);
						reject(err);
					});
			} catch (err) {
				reject(err);
			}
		});
	}

	// Search data from the API with pagination, and sorting
	async function __fetchUniqueFieldValues(context, field) {
		return new Promise(async (resolve, reject) => {
			try {
				if (context.pageCache[field]) {
					console.log("using cache for", field);
					return resolve(context.pageCache[field]);
				}

				const response = await crud({
					apiPath: `${context.apiPath}/fields/${field}`,
					method: "GET",
				});

				context.pageCache[field] = response;

				resolve(response);
			} catch (err) {
				console.error("Failed to fetch unique values:", err);
				reject(err);
			}
		});
	}

	// Initialize records data with pagination, filtering, and sorting (handles cache)
	async function __initRecordsData(context, match, sort, page) {
		return new Promise((resolve, reject) => {
			try {
				context.currentPage = page;

				__fetchData(context, match, sort)
					.then(() => {
						resolve(context.recordsData);
					})
					.catch((err) => {
						console.error("Error fetching records:", err);
						reject(err);
					});
			} catch (err) {
				err;
			}
		});
	}

	// Find a record by its ID from the API
	async function __findById(context, id) {
		const record = __findRecordLocal(context, "id", id);

		if (record) return record;

		// Otherwise fetch from API
		return await crud({
			apiPath: `${context.apiPath}/${id}`,
			method: "GET",
		});
	}

	// Find a record by a specific field value
	async function __findByField(context, field, value) {
		return new Promise((resolve, reject) => {
			try {
				let res = null;

				if (!field || !value) return resolve(null); // Return early if no field or value is provided

				if (context.recordsData) {
					// Check if the record exists in the local store (recordsData)
					res = context.recordsData.find((item) => item[field] === value);
					if (res) return resolve(res); // Return the record if found locally
				}

				// If the record isn't in the local store, make an API call to fetch it

				crud({
					apiPath: context.apiPath,
					method: "GET",
					query: {
						[field]: value, // Find by the specified field value
					},
				})
					.then((data) => {
						resolve(data); // Return the fetched record
					})
					.catch((err) => {
						console.error("Failed to find record by field:", err);
						reject(err); // Reject if the API call fails
					});
			} catch (err) {
				reject(err); // Reject if any other error occurs
			}
		});
	}

	// Find records from the API
	async function __findRecords(
		context,
		match,
		sort,
		options = { metadata: false }
	) {
		const query = { filter: match, page: 1, pageSize: context.pageStep };

		if (sort) query.sort = sort;

		try {
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

	// Refresh the values a record by its id from the API
	async function __refreshRecord(context, id) {
		const data = await crud({
			apiPath: `${context.apiPath}/${id}`,
			method: "GET",
		});

		const index = context.recordsData.findIndex((item) => item.id === id);

		if (index >= 0) {
			context.recordsData[index] = { ...context.recordsData[index], ...data };
		}
	}

	// Set the records count based on the filter
	async function __setRecordsCount(context, pipeline) {
		return new Promise((resolve, reject) => {
			try {
				if (!pipeline) {
					pipeline = [];
				}

				pipeline.push({ $count: "total" });

				crud({
					apiPath: context.apiPath,
					method: "GET",
					query: pipeline,
				})
					.then((result) => {
						if (result && result.length > 0) {
							context.recordsDataLength = result[0].total;
							__calculateNoOfPages(context);
						} else {
							context.recordsDataLength = 0;
							context.totalPages = context.currentPage = 1;
						}
						resolve(result);
					})
					.catch((err) => reject(err));
			} catch (err) {
				reject(err);
			}
		});
	}

	// -------------------- CRUD Operations --------------------

	// Add a record to the store and make an API call
	async function __addRecord(context, data) {
		context.isAdding = true;
		const { currentUser } = useAuth();

		try {
			const response = await crud({
				apiPath: context.customAddPath ?? context.apiPath,
				method: "POST",
				body: {
					...data,
					createdBy: {
						id: currentUser.value.id,
						name: currentUser.value.name,
					},
					createdAt: new Date().toISOString(),
				},
			});

			if (!context.recordsData || !Array.isArray(context.recordsData)) {
				context.recordsData = [response];
				context.recordsDataLength = 1;
			} else {
				context.recordsData.unshift(response);
				context.recordsDataLength += 1;
			}

			__calculateNoOfPages(context);

			toast.add({
				title: "Record added successfully",
				icon: "ic:baseline-check-circle",
			});

			return response;
		} catch (err) {
			console.error("Failed to add record:", err);

			toast.add({
				title: "Failed to add record",
				icon: "ic:sharp-report",
				color: "red",
			});
			throw err;
		} finally {
			context.isAdding = false;
		}
	}

	// Update a record in the store and make an API call
	async function __updateRecord(
		context,
		id,
		changes,
		options = { showToast: false }
	) {
		try {
			const res = await crud({
				apiPath: `${context.apiPath}/${id}`,
				method: "PATCH",
				body: changes,
			});

			if (!Array.isArray(context.recordsData) && context.addFieldCallback) {
				context.addFieldCallback(changes, res);

				return res;
			} else if (!Array.isArray(context.recordsData)) return res;

			const index = context.recordsData.findIndex(
				(element) => id === element.id
			);

			if (index === -1) return res;

			if (!isNullOrUndefinedOrEmpty(res)) {
				context.recordsData[index] = res;
			} else {
				for (const key in changes) {
					context.recordsData[index][key] = changes[key];
				}
			}

			if (context?.addFieldCallback)
				context.addFieldCallback(changes, context.recordsData[index]);

			return res;
		} catch (err) {
			console.error(err);

			toast.add({
				title: "Failed to add field",
				icon: "ic:sharp-report",
				color: "red",
			});

			throw err; // rethrow to maintain error behavior
		} finally {
			if (options?.showToast) {
				toast.add({
					title: "Record updated successfully.",
					icon: "ic:baseline-check-circle",
				});
			}
		}
	}

	// Update multiple records at once
	async function __updateRecordsMany(context, changes) {
		try {
			context.isFetching = true;

			const updatedRecords = await Promise.all(
				context.selectedRecords.map((id) => context.updateRecord(id, changes))
			);

			context.selectedRecords = [];

			toast.add({
				title: "Table updated successfully.",
				icon: "ic:baseline-check-circle",
			});

			return updatedRecords; // added safely
		} catch (err) {
			console.error("Failed to update records:", err);
			toast.add({
				title: "Failed to update records",
				icon: "ic:sharp-report",
				color: "red",
			});
			throw err;
		} finally {
			context.isFetching = false;
		}
	}

	// Delete a single record from the store and make an API call
	async function __deleteRecord(context, id, showToast = true) {
		try {
			if (isNullOrUndefinedOrEmpty(id)) {
				return toast.add({
					title: "Invalid id",
					icon: "ic:sharp-report",
					color: "red",
				});
			}

			await crud({
				apiPath: `${context.apiPath}/${id}`,
				method: "DELETE",
			});

			// Delete the record locally
			__deleteRecordsFromStore(context, { id: { $in: [id] } });
			context.recordsDataLength -= 1;
			__calculateNoOfPages(context);

			if (showToast)
				toast.add({
					title: "Table deleted successfully",
					icon: "ic:baseline-check-circle",
				});
		} catch (err) {
			console.error("Failed to delete record:", err);
			if (showToast)
				toast.add({
					title: "Failed to delete records",
					icon: "ic:sharp-report",
					color: "red",
				});
			throw err;
		}
	}

	// Delete a single record from the store and make an API call
	async function __deleteRecordsMany(context) {
		try {
			if (context.selectedRecords.length <= 0)
				return toast.add({
					title: "No records selected",
					icon: "ic:sharp-report",
					color: "red",
				});

			context.selectedRecords?.forEach((id) =>
				__deleteRecord(context, id, false)
			);

			toast.add({
				title: "Table deleted successfully",
				icon: "ic:baseline-check-circle",
			});
		} catch (err) {
			console.error("Failed to delete records:", err);
			toast.add({
				title: "Failed to delete records",
				icon: "ic:sharp-report",
				color: "red",
			});
			throw err;
		} finally {
			context.selectedRecords = [];
		}
	}

	// -------------------- Notes CRUD --------------------
	async function __fetchNotes(context, recordid) {
		const { crud } = useApi();
		const res = await crud({
			apiPath: `/notes`,
			query: { recordId: recordid },
		});
		const notes = res?.notes ?? [];
		context.notes.set(recordid, notes);
		return notes;
	}

	async function __addNote(context, recordid, noteObj) {
		const { crud } = useApi();
		const { currentUser } = useAuth();
		const res = await crud({
			method: "POST",
			apiPath: `/notes`,
			body: {
				content: noteObj.content,
				recordId: recordid,
				recordType: context.field,
				createdBy: currentUser.value.id,
				createdAt: new Date().toISOString(),
			},
		});
		const existing = context.notes.get(recordid) ?? [];
		context.notes.set(recordid, [res, ...existing]);
		return res;
	}

	async function __updateNote(context, recordid, updatedNote) {
		const { crud } = useApi();
		const res = await crud({
			method: "PATCH",
			apiPath: `/notes/${updatedNote.id}`,
			body: { content: updatedNote.content },
		});
		const existing = context.notes.get(recordid) ?? [];
		context.notes.set(
			recordid,
			existing.map((n) => (n.id === updatedNote.id ? { ...n, ...res } : n))
		);
	}

	async function __deleteNote(context, recordid, noteid) {
		const { crud } = useApi();
		await crud({ method: "DELETE", apiPath: `/notes/${noteid}` });
		const existing = context.notes.get(recordid) ?? [];
		context.notes.set(
			recordid,
			existing.filter((n) => n.id !== noteid)
		);
	}

	// -------------------- Attachments(NOTES) --------------------
	async function __fetchAttachments(context, noteId, force) {
		return context.attachments.get(noteId) ?? [];
	}

	async function __deleteAttachment(context, noteId, fileId) {
		if (context.attachments.has(noteId)) {
			const updated = context.attachments
				.get(noteId)
				.filter((f) => f.name !== fileId);
			context.attachments.set(noteId, updated);
		}
	}

	// -------------------- Utility Functions --------------------

	function __findRecordLocal(context, path, value) {
		try {
			if (context.recordsData?.length <= 0) return null;

			return context.recordsData?.find(
				(rec) => getValueByPath(rec, path) === value
			);
		} catch (err) {
			console.log(err);
		}
	}

	// Reset filter fields and restore records data
	async function __resetFilterFields(context) {
		return new Promise((resolve, reject) => {
			try {
				context.isFetching = true;
				context.recordsData = context.recordsDataBackup;
				context.isFetching = false;
				resolve();
			} catch (err) {
				reject(err);
			}
		});
	}

	// Assign callback function to update related records
	async function __assignCallback(header, assign_toid, globalStore) {
		return new Promise((resolve, reject) => {
			try {
				let store;
				if (globalStore[header.get_from]) {
					store = globalStore[header.get_from].store();
					store
						.findById(header.assigned_value)
						.then((record) => {
							if (record && record[header.assign_to_field]) {
								record[header.assign_to_field].push(assign_toid);
							} else if (record && !record[header.assign_to_field]) {
								record[header.assign_to_field] = [assign_toid];
							}
							store
								.updateRecord(record)
								.then(() => resolve())
								.catch((err) => reject(err));
						})
						.catch((err) => reject(err));
				} else {
					resolve();
				}
			} catch (err) {
				reject(err);
			}
		});
	}

	// -------------------- Local Store Management --------------------

	// Calculate the total number of pages
	function __calculateNoOfPages(context) {
		try {
			context.totalPages = Math.ceil(
				context.recordsDataLength / context.pageStep
			);
			if (context.currentPage > context.totalPages) {
				context.currentPage = context.totalPages;
			}
		} catch (err) {
			console.error(err);
		}
	}

	return {
		// -------------------- Data Fetching and Initialization --------------------
		__fetchData,
		__searchData,
		__getPage,
		__fetchUniqueFieldValues,
		__initRecordsData,
		__findById,
		__findByField,
		__findRecords,
		__refreshRecord,
		__setRecordsCount,

		// -------------------- CRUD Operations --------------------
		__addRecord,
		__updateRecord,
		__updateRecordsMany,
		__deleteRecord,
		__deleteRecordsMany,

		// -------------------- Notes CRUD -------------------
		__fetchNotes,
		__addNote,
		__updateNote,
		__deleteNote,

		// -------------------- Attachments(Notes) -------------------
		__fetchAttachments,
		__deleteAttachment,

		// -------------------- Utility Functions --------------------
		__assignCallback,
		__resetFilterFields,

		// -------------------- Local Store Management --------------------
		__calculateNoOfPages,
	};
};
