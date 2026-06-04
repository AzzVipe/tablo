/**
 * colors.js
 * Utilities for resolving dynamic colors for table cell options and
 * pipeline stage indicators.
 *
 */

/**
 * Returns an inline style object with background and text colors for a
 * dropdown option based on the header's `stages` and `colors` config arrays.
 * Falls back to an empty object if no color config exists.
 *
 * Used when options have colors defined by position (index in stages array)
 * rather than by a `class` string on the option itself.
 *
 * @param {Object} option - The option object being rendered (must have a `name` property)
 * @param {Object} header - The table config header object
 * @param {string[]} [header.stages] - Array of stage names
 * @param {Array<{bg: string, text: string}>} [header.colors] - Array of color objects per stage
 * @returns {{ backgroundColor?: string, color?: string }} - Inline style object
 *
 * @example
 * getOptionColor(
 *   { name: "Active" },
 *   { stages: ["Planning", "Active"], colors: [{ bg: "#ddd", text: "#333" }, { bg: "#0f0", text: "#fff" }] }
 * )
 * // → { backgroundColor: "#0f0", color: "#fff" }
 *
 * getOptionColor({ name: "Unknown" }, { stages: [], colors: [] })
 * // → {}
 */
export const getOptionColor = (option, header) => {
	if (!header?.stages || !header?.colors) return {};

	const index = header.stages.indexOf(option.name);

	if (index !== -1 && header.colors[index]) {
		return {
			backgroundColor: header.colors[index].bg,
			color: header.colors[index].text,
		};
	}

	return {};
};

/**
 * Returns a color object for a pipeline stage cell based on whether the
 * selected stage is before or after the current active stage.
 *
 * Used to render the pipeline progress indicator in Table/Cells/Pipeline.vue.
 *
 * @param {Array<{bg: string, text: string}>} colors - Array of color objects per stage
 * @param {number} currentStage - The index of the currently active stage
 * @param {number} selectedStage - The index of the stage being rendered
 * @returns {{ bg: string, text: string }} - Color object
 *
 * @example
 * // Stage is ahead of current → greyed out
 * getPipelineColor(colors, 2, 4) // → { bg: "#F3F4F6", text: "#6B7280" }
 *
 * // No colors defined → default green
 * getPipelineColor(null, 2, 1)   // → { bg: "#059669", text: "#ffffff" }
 *
 * // Stage is at or before current → use color from array (wraps with modulo)
 * getPipelineColor(colors, 2, 1) // → colors[1 % colors.length]
 */
export const getPipelineColor = (colors, currentStage, selectedStage) => {
	if (selectedStage > currentStage) return { bg: "#F3F4F6", text: "#6B7280" };
	if (!colors) return { bg: "#059669", text: "#ffffff" };

	return colors[selectedStage % colors.length];
};
