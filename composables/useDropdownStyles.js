export function useDropdownStyles(variant, options, header) {
	const baseOption = {
		base: "cursor-pointer m-1.5",
		container: "flex items-center gap-1.5 w-full",
		active: "bg-gray-100 ",
		padding: "p-0",
		selected: "pe-0",
		selectedIcon: {
			wrapper: "absolute inset-y-0 start-0 flex items-center",
			padding: "pe-2 ps-1",
			base: "h-5 w-5 text-gray-100 flex-shrink-0",
		},
	};

	const baseUiMenu = {
		container: "z-20 group",
		option: baseOption,
	};

	const hasCustomStyle = computed(() => {
		const hasClass = options?.some((option) => !!option.class);
		const hasColors = header?.colors && header.colors.length > 0;
		return hasClass || hasColors;
	});

	const variantStyles = computed(() => {
		if (variant === "sm") {
			return {
				selectClass: "input-box-dropdown-sm",
				uiMenu: {
					...baseUiMenu,
					width: "w-fit",
				},
				labelClass: "max-w-64 truncate",
				optionClass: "ml-1 whitespace-nowrap mr-6",
				selectSize: { sm: "cursor-pointer" },
				iconSize: { sm: "h-5 w-5" },
			};
		}

		return {
			selectClass: "input-box-dropdown",
			uiMenu: baseUiMenu,
			labelClass: "truncate",
			optionClass: "mx-1",
			selectSize: { sm: "cursor-pointer" },
			iconSize: {},
		};
	});

	const uiMenuValue = computed(() => {
		const baseMenu = variantStyles.value.uiMenu;

		// Check if header specifies right-side layout
		const iconWrapper =
			!header?.optionsParentClass ||
			header.optionsParentClass.includes("flex-row-reverse")
				? "absolute inset-y-0 end-0 flex items-center"
				: "absolute inset-y-0 start-0 flex items-center";

		if (hasCustomStyle?.value) {
			return {
				...baseMenu,
				option: {
					...baseMenu.option,
					selectedIcon: {
						...baseMenu.option.selectedIcon,
						wrapper: iconWrapper,
					},
				},
			};
		}

		// override selected icon color for default variant
		return {
			...baseMenu,
			option: {
				...baseMenu.option,
				selectedIcon: {
					...baseMenu.option.selectedIcon,
					base: "h-5 w-5 text-gray-600 flex-shrink-0",
					wrapper: iconWrapper,
				},
			},
		};
	});

	const optionWrapperClass = computed(() => {
		if (!header?.optionsParentClass) return "";
		const isLeftAligned =
			header.optionsParentClass.includes("flex-row-reverse");
		return `${header.optionsParentClass} ${isLeftAligned ? "pe-6" : "ps-5"}`;
	});

	return { variantStyles, uiMenuValue, optionWrapperClass };
}
