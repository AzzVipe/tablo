export default defineNuxtConfig({
	css: ["@/assets/css/main.css"],

	runtimeConfig: {
		public: {
			SERVER_BASE_URL: process.env.VITE_SERVER_BASE_URL,
			SERVER_API_VERSION: process.env.VITE_SERVER_API_VERSION,
		},
	},

	app: {
		head: {
			meta: [
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
			],
			title: "Tablo",
			link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
		},
	},

	components: {
		global: true,
		dirs: ["~/components"],
	},

	modules: [
		"@pinia/nuxt",
		[
			"@nuxt/ui",
			{
				colorMode: {
					preference: "light",
					fallback: "light",
					classSuffix: "-mode",
					storageKey: "tablo-theme",
				},
			},
		],
	],

	compatibilityDate: "2025-02-02",
});
