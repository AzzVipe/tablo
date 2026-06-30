export function updateFilterOptions(header, fullObject) {
	if (!header || !header.filter_field) return;
	if (!Array.isArray(fullObject)) return;

	// Ensure array exists
	header.filter_options = header.filter_options || [];

	fullObject.forEach((obj) => {
		const newId = obj?.id;
		if (!newId) return;

		const exists = header.filter_options.some((opt) => opt.value === newId);

		if (!exists) {
			header.filter_options.push({
				name: obj?.name,
				value: newId,
			});
		}
	});
}
