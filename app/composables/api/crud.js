import {
	__assertBaseContext,
	__calculatePages,
	__deleteRecordsFromStore,
} from "./helpers";

// Add a record to the store and make an API call
export async function __addRecord(context, data) {
	context.isAdding = true;

	try {
		const { crud } = useApi();
		const toast = useToast();

		const response = await crud({
			apiPath: context.customAddPath ?? context.apiPath,
			method: "POST",
			body: data,
		});

		if (!context.recordsData || !Array.isArray(context.recordsData)) {
			context.recordsData = [];
			context.recordsData.push(response);
			context.recordsDataLength = 1;
		} else {
			context.recordsData.unshift(response);
			context.recordsDataLength += 1;
		}

		__calculatePages(context);

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
export async function __updateRecord(
	context,
	id,
	changes,
	options = { showToast: false }
) {
	try {
		if (!options.ignoreAssert) __assertBaseContext(context);

		const { crud } = useApi();
		const toast = useToast();

		const res = await crud({
			apiPath: `${context.apiPath}/${id}`,
			method: "PATCH",
			body: changes,
		});

		if (!Array.isArray(context.recordsData)) return res;

		const index = context.recordsData.findIndex((element) => id === element.id);

		if (index === -1) return res;

		if (!isNullOrUndefinedOrEmpty(res)) {
			context.recordsData[index] = {
				...context.recordsData[index],
				...res,
			};
		} else {
			for (const key in changes) {
				context.recordsData[index][key] = changes[key];
			}
		}

		if (options.showToast) {
			toast.add({
				title: "Record updated successfully.",
				icon: "ic:baseline-check-circle",
			});
		}

		return res;
	} catch (err) {
		console.error("[useAPIResource] Failed to update record:", err);
		if (options.showToast) {
			toast.add({
				title: "Failed to update record",
				icon: "ic:sharp-report",
				color: "red",
			});
		}

		throw err; // rethrow to maintain error behavior
	}
}

// Delete a single record from the store and make an API call
export async function __deleteRecord(
	context,
	id,
	options = { showToast: false }
) {
	try {
		const toast = useToast();

		if (!options.ignoreAssert) __assertBaseContext(context);

		if (isNullOrUndefinedOrEmpty(id)) {
			toast.add({
				title: "Invalid id",
				icon: "ic:sharp-report",
				color: "red",
			});

			return;
		}

		const { crud } = useApi();

		await crud({
			apiPath: `${context.apiPath}/${id}`,
			method: "DELETE",
		});

		// Delete the record locally
		__deleteRecordsFromStore(context, { id: { $in: [id] } });
		context.recordsDataLength -= 1;
		__calculatePages(context);

		if (options.showToast)
			toast.add({
				title: "Table deleted successfully",
				icon: "ic:baseline-check-circle",
			});
	} catch (err) {
		console.error("[useAPIResource] Failed to delete record:", err);

		if (options.showToast)
			toast.add({
				title: "Failed to delete record",
				icon: "ic:sharp-report",
				color: "red",
			});
		throw err;
	}
}

// Update multiple records at once
export async function __updateRecordsMany(context, changes) {
	try {
		__assertBaseContext(context);

		context.isFetching = true;

		const updatedRecords = await Promise.all(
			context.selectedRecords.map((id) =>
				context.updateRecord(id, changes, { ignoreAssert: true })
			)
		);

		context.selectedRecords = [];

		toast.add({
			title: "Table updated successfully.",
			icon: "ic:baseline-check-circle",
		});

		return updatedRecords; // added safely
	} catch (err) {
		console.error("[useAPIResource] Failed to update records:", err);
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
export async function __deleteRecordsMany(context) {
	try {
		__assertBaseContext(context);

		if (context.selectedRecords.length <= 0)
			return toast.add({
				title: "No records selected",
				icon: "ic:sharp-report",
				color: "red",
			});

		await Promise.all(
			context.selectedRecords.map((id) =>
				context.deleteRecord(id, { ignoreAssert: true })
			)
		);

		toast.add({
			title: "Table deleted successfully",
			icon: "ic:baseline-check-circle",
		});
	} catch (err) {
		console.error("[useAPIResource] Failed to delete records:", err);

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
