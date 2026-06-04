export default {
	mounted(el, binding) {
		const path = binding.value.path;
		const obj = binding.value.obj;

		const getValueFromPath = (obj, path) => {
			return path.split(".").reduce((acc, key) => acc && acc[key], obj);
		};

		const setValueAtPath = (obj, path, value) => {
			const keys = path.split(".");
			const lastKey = keys.pop();
			const lastObj = keys.reduce((acc, key) => {
				if (!acc[key]) acc[key] = {};
				return acc[key];
			}, obj);
			lastObj[lastKey] = value;
		};

		const value = getValueFromPath(obj, path);
		el.value = value !== undefined ? value : "";

		// Add event listener
		el.addEventListener("input", (event) => {
			setValueAtPath(obj, path, event.target.value);
		});
	},
	updated(el, binding) {
		const path = binding.value.path;
		const obj = binding.value.obj;
		const value = path.split(".").reduce((acc, key) => acc && acc[key], obj);
		el.value = value !== undefined ? value : "";
	},
};
