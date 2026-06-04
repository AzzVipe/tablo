/**
 * buildMatchString.js
 * Converts an array of active filter objects into a pipe-separated match string
 * that the API and server.js filter parser understand.
 *
 * Each filter becomes a segment like:
 *   priority=High
 *   priority=(Low,High)
 *   priority!=Low
 *   dueDate>=2026-01-01|dueDate<=2026-12-31  ← date range expands to two segments
 *
 * @param {Array} filters - Array of filter objects from the Filter component
 * @returns {string|null} - Pipe-separated match string or null if nothing to filter
 */

/**
 * Resolves the API field path from a filter's selectHeader.
 * Priority: filter_path → assign_data_path → pipeline path → standard path
 *
 * @param {Object} header - The selectHeader from a filter object
 * @returns {string}
 */
const resolveFilterPath = (header) => {
	if (!header) return "";
	if (header.filter_path) return header.filter_path;
	if (header.assign_data_path) return header.assign_data_path;

	const basePath = getPathFromHeader(header);
	if (header.type === "pipeline") return `${basePath}.currentStage`;
	return basePath;
};

/**
 * Formats a single filter operand into a string the server can parse.
 * Arrays with multiple values are wrapped in parentheses: (Low,High)
 * Null values are serialized as the string "null".
 *
 * @param {*} operand
 * @returns {string}
 */
const formatOperand = (operand) => {
	if (operand === null || operand === undefined) return "null";

	if (Array.isArray(operand)) {
		if (operand.length === 0) return "null";
		if (operand.length === 1) {
			return operand[0] === null ? "null" : String(operand[0]);
		}
		return `(${operand
			.map((v) => (v === null ? "null" : String(v)))
			.join(",")})`;
	}

	return String(operand);
};

/**
 * Builds the full pipe-separated match string from a filters array.
 *
 * @param {Array} filters
 * @returns {string|null}
 */
const buildMatchString = (filters) => {
	if (!Array.isArray(filters) || filters.length === 0) return null;

	const segments = [];

	for (const item of filters) {
		// Guard — skip malformed filter objects
		if (!item?.selectHeader || !item?.operator) continue;

		const { selectHeader, operator, operand } = item;
		const path = resolveFilterPath(selectHeader);

		if (!path) continue;

		// Date range expands to two segments: field>=start|field<=end
		if (operator === "range" && selectHeader.type === "date") {
			if (Array.isArray(operand) && operand.length >= 2) {
				const start = formatDate(operand[0], "YYYY-MM-DD");
				const end = formatDate(operand[1], "YYYY-MM-DD");
				if (start && start !== "Empty") segments.push(`${path}>=${start}`);
				if (end && end !== "Empty") segments.push(`${path}<=${end}`);
			}
			continue;
		}

		const formatted = formatOperand(operand);
		segments.push(`${path}${operator}${formatted}`);
	}

	return segments.length > 0 ? segments.join("|") : null;
};

export default buildMatchString;
