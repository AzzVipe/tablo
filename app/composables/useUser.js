export const useUser = () => {
	const currRecord = useState("user", () => {});
	const config = useState("userConfig", () => null);
	const drawer = useState("userDrawer", () => {});
	const bucket = useState("userBucket", () => {});
	const activeTab = useState("userActiveTab", () => null);
	const updateModal = useState("userUpdateModal", () => {});
	const deleteModal = useState("userDeleteModal", () => {});
	const tableState = useState("userTableState", () => {
		return {
			name: null,
			filters: null,
			match: null,
			sort: null,
			hide: null,
			group: null,
		};
	});

	const defaultTableState = useState("userDefaultTableState", () => {
		return null;
	});

	const activeTableState = useState("userActiveTableState", () => {
		return null;
	});

	const tableStateList = useState("userTableStateList", () => {
		return null;
	});

	const showClearButton = useState("userTableStateClearButton", () => {
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

export const useUserHideDropDown = () => {
	const tableTdVisible = useState("userTdVisible", () => {});

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

export const useUserGroup = () => {
	const grouped = useState("userGroup", () => ({
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
