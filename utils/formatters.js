/**
 * formatters.js
 * Display formatting utilities for dates and file sizes.
 * Used in table cells, side drawer, and notes components.
 */

/**
 * Formats a date value into a human-readable string using a format template.
 * Returns "Empty" for null, undefined, or invalid dates.
 *
 * Supported format tokens:
 *   MMMM — full month name (e.g. "January")
 *   MMM  — short month name (e.g. "Jan")
 *   MM   — zero-padded month number (e.g. "01")
 *   DD   — zero-padded day (e.g. "05")
 *   YYYY — four-digit year (e.g. "2026")
 *   HH   — 24-hour hours (e.g. "14")
 *   hh   — 12-hour hours (e.g. "02")
 *   mm   — minutes (e.g. "30")
 *   ss   — seconds (e.g. "00")
 *   AMPM — AM or PM
 *
 * @param {string|Date} date - The date to format
 * @param {string} format - Format template string (default: "MMM DD YYYY")
 * @returns {string} - Formatted date string or "Empty"
 *
 * @example
 * formatDate("2026-05-10", "MMM DD YYYY")  // "May 10 2026"
 * formatDate("2026-05-10", "DD/MM/YYYY")   // "10/05/2026"
 * formatDate(null)                         // "Empty"
 */
export const formatDate = (date, format = "MMM DD YYYY") => {
	if (!date) return "Empty";

	const tempDate = new Date(date);
	if (isNaN(tempDate.getTime())) return "Empty";

	const monthName = tempDate.toLocaleString("en-US", { month: "long" });
	const shortMonthName = tempDate.toLocaleString("en-US", { month: "short" });
	const month = (tempDate.getMonth() + 1).toString().padStart(2, "0");
	const day = tempDate.getDate().toString().padStart(2, "0");
	const year = tempDate.getFullYear();
	const hours24 = tempDate.getHours();
	const hours12 = hours24 % 12 || 12;
	const ampm = hours24 >= 12 ? "PM" : "AM";
	const hours = hours12.toString().padStart(2, "0");
	const hours24WithZero = hours24.toString().padStart(2, "0");
	const minutes = tempDate.getMinutes().toString().padStart(2, "0");
	const seconds = tempDate.getSeconds().toString().padStart(2, "0");

	return format
		.replace("MMMM", monthName)
		.replace("MMM", shortMonthName)
		.replace("YYYY", year)
		.replace("MM", month)
		.replace("DD", day)
		.replace("HH", hours24WithZero)
		.replace("hh", hours)
		.replace("mm", minutes)
		.replace("ss", seconds)
		.replace("AMPM", ampm);
};

/**
 * Formats a file size in bytes into a human-readable string.
 * Used in the Notes/Files attachment display.
 *
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size string (e.g. "2 MB", "512 KB")
 *
 * @example
 * formatSize(0)          // "0 Bytes"
 * formatSize(1024)       // "1 KB"
 * formatSize(1048576)    // "1 MB"
 */
export const formatSize = (bytes) => {
	const sizes = ["Bytes", "KB", "MB", "GB"];
	if (bytes === 0) return "0 Bytes";
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
};
