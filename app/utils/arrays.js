/**
 * arrays.js
 * Utilities for comparing arrays of primitives or objects.
 * the original and updated record, and in Notes for tracking
 * added/deleted chips and attachments.
 */

export const arraysEqual = (a, b) => {
	if (a === b) return true;

	if (a.length !== b.length) {
		return false;
	}

	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			return false;
		}
	}

	return true;
};

/**
 * Compares two arrays and returns the items that were added, deleted,
 * or updated between them.
 *
 * For object arrays, comparison is done by deep JSON equality.
 * If `fields` is provided, only those fields are compared per object —
 * useful for comparing relation arrays by ID only (e.g. `["id"]`).
 *
 * @param {Array} oldArray - The original array (before changes)
 * @param {Array} newArray - The updated array (after changes)
 * @param {string[]} [fields=[]] - Optional subset of fields to compare on objects
 * @returns {{ added: Array, deleted: Array, updated: Array }}
 *
 * @example
 * // Primitives
 * compareArrays(["a", "b"], ["b", "c"])
 * // → { added: ["c"], deleted: ["a"], updated: [] }
 *
 * // Objects compared by id only
 * compareArrays(
 *   [{ id: "user_1", name: "Alice" }],
 *   [{ id: "user_2", name: "Bob" }],
 *   ["id"]
 * )
 * // → { added: [{ id: "user_2" }], deleted: [{ id: "user_1" }], updated: [...] }
 */
export const compareArrays = (oldArray, newArray, fields = []) => {
	if (!Array.isArray(oldArray)) oldArray = [];
	if (!Array.isArray(newArray)) newArray = [];

	const added = [];
	const deleted = [];
	const updated = [];

	const validFields =
		Array.isArray(fields) && fields.every((f) => typeof f === "string")
			? fields
			: [];

	// Normalize an item for comparison — either pick selected fields or deep clone
	const normalize = (item) => {
		if (item === null || item === undefined) return item;
		if (typeof item !== "object") return item;
		if (validFields.length > 0) {
			const filtered = {};
			for (const key of validFields) filtered[key] = item?.[key];
			return filtered;
		}
		try {
			return JSON.parse(JSON.stringify(item));
		} catch {
			return item;
		}
	};

	const isEqual = (a, b) => {
		try {
			return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
		} catch {
			return a === b;
		}
	};

	const oldCopy = [...oldArray];
	const newCopy = [...newArray];

	// Find items in newArray that exist in oldArray — mark as matched
	for (let i = 0; i < newCopy.length; i++) {
		const matchIndex = oldCopy.findIndex((oldItem) =>
			isEqual(oldItem, newCopy[i])
		);
		if (matchIndex !== -1) {
			oldCopy.splice(matchIndex, 1);
			newCopy[i] = null;
		}
	}

	// Remaining in newCopy → added
	for (const item of newCopy) if (item !== null) added.push(item);
	// Remaining in oldCopy → deleted
	for (const item of oldCopy) deleted.push(item);

	// Positional updates — items at same index that changed value
	const minLen = Math.min(oldArray.length, newArray.length);
	for (let i = 0; i < minLen; i++) {
		if (!isEqual(oldArray[i], newArray[i])) {
			updated.push({ oldItem: oldArray[i], newItem: newArray[i] });
		}
	}

	return { added, deleted, updated };
};
