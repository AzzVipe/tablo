export function useDropdownStyles(variant, options, header) {
	const variantStyles = computed(() => {
		if (variant === "sm") {
			return {
				selectClass: "input-box-dropdown-sm",
				labelClass: "max-w-64 truncate",
				optionClass: "ml-1 whitespace-nowrap mr-6",
			};
		}
		return {
			selectClass: "input-box-dropdown",
			labelClass: "truncate",
			optionClass: "mx-1",
		};
	});

	const uiMenuValue = computed(() => ({
		side: "bottom",
		align: "start",
		sideOffset: 4,
		class: `z-20 ${variant === "sm" ? "w-fit" : ""}`.trim(),
	}));

	const optionWrapperClass = computed(() => {
		if (!header?.optionsParentClass) return "";
		const isLeftAligned =
			header.optionsParentClass.includes("flex-row-reverse");
		return `${header.optionsParentClass} ${isLeftAligned ? "pe-6" : "ps-5"}`;
	});

	return { variantStyles, uiMenuValue, optionWrapperClass };
}
