export default defineNuxtPlugin(() => {
	if (typeof window !== "undefined") {
		// Run on client-side only
		const disableAutocomplete = () => {
			const inputs = document.querySelectorAll("input, textarea");
			inputs.forEach((input) => {
				input.setAttribute("autocomplete", "off");
			});
		};

		// Apply on page load
		disableAutocomplete();

		// Observe DOM changes to dynamically handle new inputs
		const observer = new MutationObserver(() => {
			disableAutocomplete();
		});

		observer.observe(document.body, {
			childList: true, // Observe direct children changes
			subtree: true, // Observe all nested children
		});
	}
});
