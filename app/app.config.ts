export default defineAppConfig({
	ui: {
		colors: {
			primary: "orange",
			secondary: "stone",
		},

		button: {
			defaultVariants: {
				size: "lg",
			},
			compoundVariants: [
				{
					color: "primary",
					variant: "solid",
					class: {
						base: "bg-gradient-to-tr from-primary-400 via-primary-500 to-primary-700 text-white border-transparent hover:bg-gradient-to-bl focus:ring-4 focus:ring-primary-200 focus:outline-none",
					},
				},

				{
					color: "secondary",
					variant: "soft",
					class: {
						base: "bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] hover:bg-[var(--btn-secondary-bg-hover)]",
					},
				},

				{
					color: "secondary",
					variant: "outline",
					class: {
						base: "bg-transparent text-[var(--btn-secondary-text)] ring-[var(--btn-secondary-border)] hover:bg-[var(--btn-secondary-bg)] hover:ring-[var(--btn-secondary-border-hover)]",
					},
				},

				{
					color: "secondary",
					variant: "ghost",
					class: {
						base: "text-[var(--btn-ghost-text)] hover:bg-[var(--btn-secondary-bg-hover)] hover:text-[var(--btn-ghost-text-hover)]",
					},
				},

				{
					color: "secondary",
					variant: "solid",
					class: {
						base: "bg-[var(--page-bg)] text-[var(--btn-secondary-text)] hover:bg-[var(--btn-secondary-bg-hover)]",
					},
				},

				{
					color: "error",
					variant: "solid",
					class: {
						base: "bg-[var(--btn-danger-bg)] text-[var(--btn-danger-text)] ring-[var(--btn-danger-border)] hover:bg-[var(--btn-danger-bg-hover)]",
					},
				},

				{
					color: "error",
					variant: "outline",
					class: {
						base: "bg-transparent text-[var(--btn-danger-text)] ring-[var(--btn-danger-border)] hover:bg-[var(--btn-danger-bg)]",
					},
				},

				{
					color: "warning",
					variant: "solid",
					class: {
						base: "bg-[var(--btn-warning-bg)] text-[var(--btn-warning-text)] ring-[var(--btn-warning-border)] hover:bg-[var(--btn-warning-bg-hover)]",
					},
				},

				{
					color: "success",
					variant: "solid",
					class: {
						base: "bg-[var(--btn-success-bg)] text-[var(--btn-success-text)] ring-[var(--btn-success-border)] hover:bg-[var(--btn-success-bg-hover)]",
					},
				},
			],
		},

		badge: {
			compoundVariants: [
				{
					color: "neutral",
					variant: "ghost",
					class: {
						base: "text-[var(--btn-ghost-text)]",
					},
				},
				{
					color: "neutral",
					variant: "outline",
					class: {
						base: "text-[var(--text-description)] ring-[var(--input-border)]",
					},
				},
				{
					color: "neutral",
					variant: "soft",
					class: {
						base: "text-[var(--text-description)] bg-[var(--btn-secondary-bg)]",
					},
				},
			],
		},

		dropdownMenu: {
			slots: {
				content:
					"bg-[var(--input-bg)] ring-1 ring-[var(--input-border)] divide-[var(--input-border)] shadow-none !z-20",
				item: "cursor-pointer px-3 py-2 text-[var(--text-description)] data-highlighted:bg-[var(--btn-secondary-bg-hover)] data-highlighted:text-[var(--text-subtitle)] data-disabled:cursor-not-allowed data-disabled:opacity-50",
				itemLeadingIcon:
					"text-[var(--text-description)] group-data-highlighted/item:text-[var(--text-subtitle)]",
			},
			compoundVariants: [
				{
					color: "neutral",
					class: {
						item: "p-2",
					},
				},
			],
		},

		popover: {
			slots: {
				content:
					"bg-[var(--input-bg)] ring-1 ring-[var(--input-border)] shadow-none",
			},
		},

		modal: {
			slots: {
				overlay: "fixed inset-0 bg-black/60",
				content:
					"bg-[var(--input-bg)] !ring-1 !ring-[var(--input-border)] !divide-[var(--input-border)] shadow-none",
			},
		},

		slideover: {
			slots: {
				overlay: "bg-black/10 backdrop-blur-none",
				content:
					"bg-[var(--page-bg)] ring-1 ring-black !max-w-[45vw] max-2xl:!max-w-[50vw] max-xl:!max-w-[66vw] max-lg:!max-w-[50vw] max-md:!max-w-[55vw] max-sm:!max-w-[80vw] !z-10",
			},
		},

		select: {
			slots: {
				leadingIcon: "text-[var(--text-description)]",
			},
			compoundVariants: [
				{
					color: "neutral",
					variant: "outline",
					class: {
						base: "bg-[var(--input-bg)] text-[var(--input-text)] ring-[var(--input-border)] focus:ring-orange-500",
					},
				},
			],
		},

		selectMenu: {
			slots: {
				placeholder: "text-[var(--input-text-placeholder)]",
				content:
					"bg-[var(--input-bg)] ring-1 ring-[var(--input-border)] shadow-none",
				group: "flex flex-col gap-1",
				item: "rounded-md text-[var(--text-description)] hover:bg-[var(--card-hover)] data-highlighted:bg-[var(--card-hover)] data-highlighted:text-[var(--text-subtitle)] data-selected:text-[var(--text-subtitle)] data-selected:bg-[var(--card-hover)]",
				itemLeadingIcon:
					"text-[var(--text-description)] group-data-highlighted/item:text-[var(--text-subtitle)]",
				input:
					"bg-[var(--input-bg)] text-[var(--input-text)] placeholder:text-[var(--input-text-placeholder)]",
			},
		},

		input: {
			compoundVariants: [
				{
					color: "neutral",
					variant: "outline",
					class: {
						base: "bg-[var(--input-bg)] text-[var(--input-text)] ring-[var(--input-border)] focus:ring-orange-500 placeholder:text-[var(--input-text-placeholder)]",
					},
				},
			],
		},

		tooltip: {
			slots: {
				content:
					"bg-[var(--sidebar-bg)] text-[var(--text-description)] ring-1 ring-[var(--input-border)] font-medium text-xs z-50",
				arrow: "fill-[var(--sidebar-bg)]",
			},
		},

		toast: {
			slots: {
				root: "bg-[var(--input-bg)] ring-1 ring-[var(--input-border)] z-100",
			},
			defaultVariants: {
				color: "success",
			},
		},

		card: {
			slots: {
				root: "bg-[var(--card-bg)] ring-1 ring-[var(--input-border)] divide-[var(--input-border)]",
				header: "px-4 py-3",
			},
		},
	},
});
