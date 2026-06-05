export default defineAppConfig({
	ui: {
		colors: {
			primary: "orange",
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
					"bg-[var(--input-bg)] ring-1 ring-[var(--input-border)] divide-[var(--input-border)] shadow-none",
				item: "cursor-pointer px-3 py-2 text-[var(--text-description)] data-highlighted:bg-[var(--btn-secondary-bg-hover)] data-highlighted:text-[var(--text-subtitle)] data-disabled:cursor-not-allowed data-disabled:opacity-50",
				itemLeadingIcon:
					"text-[var(--text-description)] group-data-highlighted/item:text-[var(--text-subtitle)]",
			},
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
					"bg-[var(--input-bg)] ring-1 ring-[var(--input-border)] shadow-none",
			},
		},

		slideover: {
			slots: {
				content: "bg-[var(--page-bg)] ring-1 ring-[var(--input-border)]",
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
				content:
					"bg-[var(--input-bg)] ring-1 ring-[var(--input-border)] shadow-none",
				item: "text-[var(--text-description)] hover:bg-[var(--card-hover)] data-highlighted:bg-[var(--card-hover)] data-highlighted:text-[var(--text-subtitle)] data-selected:text-[var(--text-subtitle)] data-selected:bg-[var(--card-hover)]",
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

		button: {
			compoundVariants: [
				{
					color: "neutral",
					variant: "ghost",
					class: {
						base: "text-[var(--btn-ghost-text)] hover:bg-[var(--btn-secondary-bg)] hover:text-[var(--btn-ghost-text-hover)]",
					},
				},
				{
					color: "neutral",
					variant: "outline",
					class: {
						base: "text-[var(--text-description)] ring-[var(--input-border)] hover:bg-[var(--btn-secondary-bg)]",
					},
				},
				{
					color: "neutral",
					variant: "soft",
					class: {
						base: "text-[var(--text-description)] bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-bg-hover)]",
					},
				},
				{
					color: "neutral",
					variant: "solid",
					class: {
						base: "text-[var(--text-description)] bg-[var(--page-bg)] hover:bg-[var(--btn-secondary-bg-hover)]",
					},
				},
			],
		},

		tooltip: {
			slots: {
				content:
					"bg-[var(--sidebar-bg)] text-[var(--text-description)] ring-1 ring-[var(--input-border)] font-medium text-xs",
				arrow: "fill-[var(--sidebar-bg)]",
			},
		},

		toast: {
			slots: {
				root: "bg-[var(--input-bg)] ring-1 ring-[var(--input-border)]",
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
