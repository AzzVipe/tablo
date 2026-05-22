export default {
	mounted(el) {
		// Find the first input/textarea/select element inside the form
		const focusableElement = el.querySelector(
			'input:not([type="hidden"]), textarea, select'
		);

		// Focus the element if it exists
		if (focusableElement) {
			focusableElement.focus();
		}
	},
};
