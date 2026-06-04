export default {
	beforeMount(el, binding) {
		el.clickOutsideEvent = function (event) {
			// Check if the click was outside the element
			if (!(el === event.target || el.contains(event.target))) {
				binding.value(event); // Call the method provided in the binding value
			}
		};
		document.addEventListener("click", el.clickOutsideEvent);
	},
	unmounted(el) {
		document.removeEventListener("click", el.clickOutsideEvent);
	},
};
