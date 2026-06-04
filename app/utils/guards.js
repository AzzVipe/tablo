/**
 * guards.js
 * Type guard utilities for checking null, undefined, and empty values.
 * Used throughout the codebase before accessing object properties or
 * making API calls to prevent runtime errors.
 */

/**
 * Returns true if the value is strictly null or undefined.
 * Use this when an empty string, array, or object is still considered valid.
 *
 * @param {*} value
 * @returns {boolean}
 *
 * @example
 * isNullOrUndefined(null)      // true
 * isNullOrUndefined(undefined) // true
 * isNullOrUndefined("")        // false
 * isNullOrUndefined([])        // false
 */
export const isNullOrUndefined = (value) => {
	return value === undefined || value === null;
};

/**
 * Returns true if the value is null, undefined, an empty string,
 * an empty array, or an empty object.
 * Use this when any "blank" state should be treated as missing.
 *
 * @param {*} value
 * @returns {boolean}
 *
 * @example
 * isNullOrUndefinedOrEmpty(null)        // true
 * isNullOrUndefinedOrEmpty("")          // true
 * isNullOrUndefinedOrEmpty([])          // true
 * isNullOrUndefinedOrEmpty({})          // true
 * isNullOrUndefinedOrEmpty(new Date())  // false — dates are never empty
 * isNullOrUndefinedOrEmpty("hello")     // false
 */
export const isNullOrUndefinedOrEmpty = (value) => {
	if (value === undefined || value === null || value === "") return true;

	// Date objects are never considered empty
	if (value instanceof Date) return false;

	// Empty plain object
	if (typeof value === "object" && !Array.isArray(value)) {
		return Object.keys(value).length === 0;
	}

	// Empty array
	if (Array.isArray(value)) return value.length === 0;

	return false;
};
