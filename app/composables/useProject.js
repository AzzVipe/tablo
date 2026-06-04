export const useProject = () => {
	const currRecord = useState("project", () => {});
	const config = useState("projectConfig", () => null);
	const drawer = useState("projectDrawer", () => {});
	const bucket = useState("projectBucket", () => {});
	const activeTab = useState("projectActiveTab", () => null);
	const updateModal = useState("projectUpdateModal", () => {});
	const deleteModal = useState("projectDeleteModal", () => {});
	const tableState = useState("projectTableState", () => {
		return {
			name: null,
			filters: null,
			match: null,
			sort: null,
			hide: null,
			group: null,
		};
	});

	const defaultTableState = useState("projectDefaultTableState", () => {
		return null;
	});

	const activeTableState = useState("projectActiveTableState", () => {
		return null;
	});

	const tableStateList = useState("projectTableStateList", () => {
		return null;
	});

	const showClearButton = useState("projectTableStateClearButton", () => {
		return false;
	});

	const getCurrentRecordInfo = (info) => {
		currRecord.value = info;
	};

	return {
		drawer,
		config,
		bucket,
		tableState,
		activeTab,
		currRecord,
		updateModal,
		deleteModal,
		tableStateList,
		activeTableState,
		defaultTableState,
		showClearButton,
		getCurrentRecordInfo,
	};
};

export const useProjectHideDropDown = () => {
	const tableTdVisible = useState("projectTdVisible", () => {});

	const tdInit = (tableHeaders, tabHeaders) => {
		tableTdVisible.value = {};

		let visibleCount = 0;

		tableHeaders.forEach((item) => {
			if (!item.is_visible) return;

			tableTdVisible.value[item.name] = visibleCount < 10;
			visibleCount++;
		});

		for (const tab in tabHeaders) {
			tabHeaders[tab]?.headers?.forEach((item) => {
				if (item?.table_view !== false && item.is_visible)
					tableTdVisible.value[item.name] = false;
			});
		}
	};

	const tdToggle = (state) => {
		for (const key in tableTdVisible.value) {
			tableTdVisible.value[key] = state;
		}
	};

	const showAllTableTd = () => {
		tdToggle(true);
	};

	const hideAllTableTd = () => {
		tdToggle(false);
	};

	return { tableTdVisible, tdInit, showAllTableTd, hideAllTableTd };
};

export const useProjectGroup = () => {
	const grouped = useState("projectGroup", () => ({
		active: false,
		groupedBy: null,
		header: null,
	}));

	const setGroup = (item) => {
		grouped.value = item;
	};

	const unsetGroup = () => {
		grouped.value = {
			active: false,
			groupedBy: null,
			header: null,
		};
	};

	return { grouped, setGroup, unsetGroup };
};
