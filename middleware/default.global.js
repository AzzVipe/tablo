// middleware/default.global.js
// DEMO VERSION — no auth redirect, sets current page config, no redirect loop

import pagesConfig from "@/table_configs/pages.json";

export default defineNuxtRouteMiddleware(async (to) => {
	const { currentUser, getCurrentUser } = useAuth();
	const { pages, currentPage, currentPageConfig, setPages } = usePages();

	// Ensure demo user is always set
	if (!currentUser.value) {
		await getCurrentUser();
	}

	if (!pages.value?.length) {
		setPages();
	}

	// Set the current page config for the sidebar + icon display
	const page = pagesConfig.config.find((p) => p.to === to.path);
	currentPageConfig.value = page || null;
	currentPage.value = to.path;

	// Only add ?page=1 if:
	// 1. This page uses pagination (pagination !== false)
	// 2. The param is genuinely missing
	// 3. We're not already navigating to avoid infinite redirect loop
	const needsPagination = page && page.pagination !== false;
	const hasPageParam = to.query.page !== undefined && to.query.page !== null;

	if (needsPagination && !hasPageParam) {
		return navigateTo(
			{ path: to.path, query: { ...to.query, page: 1 } },
			{ replace: true } // replace: true prevents a new history entry each time
		);
	}
});
