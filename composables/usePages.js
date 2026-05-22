import { config, roles } from "@/table_configs/pages.json";

export const usePages = () => {
	const pages = useState("pages", () => []);
	const currentPage = useState("currentPage", () => null);
	const currentPageConfig = useState("currentPageConfig", () => null);

	const setPages = () => {
		const { currentUser } = useAuth();
		const roleName = currentUser.value?.role?.toLowerCase();

		const currentRole = roleName
			? roles.find((r) => r.name.toLowerCase() === roleName)
			: null;

		pages.value = config.filter((page) => {
			if (!currentRole?.pages) {
				return true;
			}

			const access = currentRole.pages[page.value];

			if (access === true) {
				return true;
			}

			if (access !== false && currentRole.visible === true) {
				return true;
			}

			return false;
		});
	};

	const getPageByValue = (pageValue = currentPage.value) => {
		return pages.value.find((page) => page.value === pageValue);
	};

	return { currentPage, currentPageConfig, pages, setPages, getPageByValue };
};
