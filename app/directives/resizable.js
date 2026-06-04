export default {
	mounted(el, binding) {
		// Works if resizable = false or no handler
		if (!binding.value || typeof binding.value.onResize !== "function") return;

		const resizer = document.createElement("div");
		resizer.style.width = "5px";
		resizer.style.cursor = "col-resize";
		resizer.style.position = "absolute";
		resizer.style.right = "0";
		resizer.style.top = "0";
		resizer.style.bottom = "0";
		resizer.style.zIndex = "10";

		resizer.addEventListener("mousedown", (e) => {
			e.preventDefault();
			document.body.style.cursor = "col-resize";

			const startX = e.clientX;
			const startWidth = el.offsetWidth;

			const minWidth = binding.value.minWidth ?? 80;
			const maxWidth = binding.value.maxWidth ?? 600;

			const onMouseMove = (e) => {
				const newWidth = startWidth + (e.clientX - startX);

				if (newWidth >= minWidth && newWidth <= maxWidth) {
					el.style.width = `${newWidth}px`;
				}
			};

			const onMouseUp = () => {
				document.removeEventListener("mousemove", onMouseMove);
				document.removeEventListener("mouseup", onMouseUp);
				document.body.style.cursor = "";

				// Save width only on drag end
				if (binding?.value?.onResize) {
					binding.value.onResize(el.style.width);
				}
			};

			document.addEventListener("mousemove", onMouseMove);
			document.addEventListener("mouseup", onMouseUp);
		});

		el.style.position = "relative";
		el.appendChild(resizer);
	},
};
