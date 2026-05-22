// /** @type {import('tailwindcss').Config} */
export default {
	theme: {
		extend: {
			colors: {
				prime: {
					50: "#fefce8",
					100: "#fef9c3",
					200: "#fef08a",
					300: "#fde047",
					400: "#faca15",
					500: "#eab308",
					600: "#ca8a04",
					700: "#a16207",
					800: "#854d0e",
					900: "#713f12",
					950: "#422006",
				},
			},
			boxShadow: {
				spread: "0 0 0 15px",
			},
		},
	},
	safelist: [
		{
			pattern: /bg-(red|blue|green|yellow|gray|pink|purple|orange|amber|teal|cyan|amber)-(\d{3}|950)/,
		},
		{
			pattern: /text-(red|blue|green|yellow|gray|pink|purple|orange|amber|teal|cyan|amber)-(\d{3}|950)/,
		},
		"text-white",
		"text-black",
		"bg-white",
		"bg-black",
		"bg-transparent",
		"rounded-full",
		"font-medium",
		"font-semibold",
	],
};
