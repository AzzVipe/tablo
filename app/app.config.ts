export default defineAppConfig({
	ui: {
		primary: "orange",

		badge: {
			color: {
				gray: {
					ghost: "text-[var(--btn-ghost-text)] ",
					outline: "text-[var(--text-description)] ring-[var(--input-border)] ",
					soft: "text-[var(--text-description)] bg-[var(--btn-secondary-bg)] ",
				},
			},
		},
		dropdown: {
			background: "bg-[var(--input-bg)]",
			ring: "ring-1 ring-[var(--input-border)]",
			divide: "divide-[var(--input-border)]",
			shadow: "shadow-none",
			item: {
				base: "cursor-pointer",
				padding: "px-3 py-2",
				color: "text-[var(--text-description)]",
				active: "bg-[var(--btn-secondary-bg-hover)] text-[var(--text-subtitle)]",
				inactive: "text-[var(--text-description)]",
				disabled: "cursor-not-allowed opacity-50",
				icon: {
					active: "text-[var(--text-subtitle)]",
					inactive: "text-[var(--text-description)]",
				},
			},
		},

		popover: {
			background: "bg-[var(--input-bg)]",
			ring: "ring-1 ring-[var(--input-border)]",
			shadow: "shadow-none",
		},

		modal: {
			background: "bg-[var(--input-bg)]",
			ring: "ring-1 ring-[var(--input-border)]",
			shadow: "shadow-none",
			overlay: {
				background: "bg-black/60",
			},
		},

		slideover: {
			background: "bg-[var(--page-bg)]",
			ring: "ring-1 ring-[var(--input-border)]",
		},

		select: {
			color: {
				gray: {
					outline: "bg-[var(--input-bg)] text-[var(--input-text)] ring-[var(--input-border)] focus:ring-orange-500",
				},
			},
			icon: {
				color: "text-[var(--text-description)]",
			},
		},

		selectMenu: {
			background: "bg-[var(--input-bg)]",
			ring: "ring-1 ring-[var(--input-border)]",
			shadow: "shadow-none",
			option: {
				color: "text-[var(--text-description)] hover:bg-[var(--card-hover)]",
				active: "!bg-[var(--card-hover)] text-[var(--text-subtitle)]",
				selected: "text-[var(--text-subtitle)] bg-[var(--card-hover)]",
				icon: {
					active: "text-[var(--text-subtitle)]",
					inactive: "text-[var(--text-description)]",
				},
			},
			input: "bg-[var(--input-bg)] text-[var(--input-text)] placeholder-[var(--input-text-placeholder)]",
		},

		input: {
			color: {
				gray: {
					outline: "bg-[var(--input-bg)] text-[var(--input-text)] ring-[var(--input-border)] focus:ring-orange-500 placeholder:text-[var(--input-text-placeholder)]",
				},
			},
		},

		button: {
			color: {
				gray: {
					ghost: "text-[var(--btn-ghost-text)] hover:bg-[var(--btn-secondary-bg)] hover:text-[var(--btn-ghost-text-hover)]",
					outline: "text-[var(--text-description)] ring-[var(--input-border)] hover:bg-[var(--btn-secondary-bg)]",
					soft: "text-[var(--text-description)] bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-bg-hover)]",
					dark: "text-[var(--text-description)] bg-[var(--page-bg)] hover:bg-[var(--btn-secondary-bg-hover)]",
				},
			},
		},

		tooltip: {
			background: "bg-[var(--sidebar-bg)]",
			color: "text-[var(--text-description)]",
			ring: "ring-1 ring-[var(--input-border)]",
			base: "font-medium text-xs",
			arrow: {
				background: "before:bg-[var(--sidebar-bg)]",
			},
		},

		notifications: {
			position: "top-0 bottom-[unset]",
		},

		notification: {
			background: "bg-[var(--input-bg)]",
			ring: "ring-1 ring-[var(--input-border)]",
			default: {
				color: "green",
				timeout: 3000,
			},
		},

		card: {
			background: "bg-[var(--card-bg)]",
			ring: "ring-1 ring-[var(--input-border)]",
			divide: "divide-[var(--input-border)]",
			header: {
				padding: "px-4 py-3",
			},
		},
	},
});