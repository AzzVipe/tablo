/**
 * path.js
 * Utilities for resolving dot-notation paths from header config objects
 * and reading/writing values at those paths on record data objects.
 *
 */

/**
 * Resolves the dot-notation path string from a header config object.
 * Headers can define their path in three ways:
 *   1. `path` — explicit full path (e.g. "project.title")
 *   2. `parent` + `field` — nested path (e.g. parent="address", field="city" → "address.city")
 *   3. `field` alone — flat path (e.g. "title")
 *
 * @param {Object} header - A table config header object
 * @returns {string} - The resolved dot-notation path
 *
 * @example
 * getPathFromHeader({ path: "project.title" })           // "project.title"
 * getPathFromHeader({ parent: "address", field: "city" }) // "address.city"
 * getPathFromHeader({ field: "title" })                   // "title"
 * getPathFromHeader(null)                                 // ""
 */
export const getPathFromHeader = (header) => {
	if (!header) return "";
	if (header.path) return header.path;
	if (header.parent) return `${header.parent}.${header.field}`;

	return header.field;
};

/**
 * Reads a value from a nested object using a dot-notation path string.
 * Returns undefined if any segment in the path is missing.
 *
 * @param {Object} data - The record object to read from
 * @param {string} path - Dot-notation path (e.g. "project.title")
 * @returns {*} - The value at the path, or undefined if not found
 *
 * @example
 * getValueByPath({ project: { title: "Tablo" } }, "project.title") // "Tablo"
 * getValueByPath({ title: "Hello" }, "title")                       // "Hello"
 * getValueByPath({ a: 1 }, "b.c")                                   // undefined
 */
export const getValueByPath = (data, path) => {
	if (!path) return undefined;

	return path
		.split(".")
		.reduce(
			(acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
			data
		);
};

/**
 * Writes a value to a nested object at the given dot-notation path.
 * Creates intermediate objects if they don't exist.
 * Mutates the data object directly.
 *
 * @param {Object} data - The record object to write to
 * @param {string} path - Dot-notation path (e.g. "address.city")
 * @param {*} value - The value to set
 *
 * @example
 * const record = { address: {} }
 * setValueByPath(record, "address.city", "Mumbai")
 * // record → { address: { city: "Mumbai" } }
 *
 * setValueByPath(record, "title", "Hello")
 * // record → { title: "Hello", address: { city: "Mumbai" } }
 */
export const setValueByPath = (data, path, value) => {
	if (!path) return;

	const keys = path.split(".");
	const lastKey = keys.pop();
	const lastObj = keys.reduce((acc, key) => {
		if (acc[key] === undefined || acc[key] === null) {
			acc[key] = {};
		}
		return acc[key];
	}, data);

	lastObj[lastKey] = value;
};
