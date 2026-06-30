export const useTask = () => {
	const currRecord = useState("task", () => {});
	const config = useState("taskConfig", () => null);
	const drawer = useState("taskDrawer", () => {});
	const bucket = useState("taskBucket", () => {});
	const activeTab = useState("taskActiveTab", () => null);
	const updateModal = useState("taskUpdateModal", () => {});
	const deleteModal = useState("taskDeleteModal", () => {});
	const tableState = useState("taskTableState", () => {
		return {
			name: null,
			filters: null,
			match: null,
			sort: null,
			hide: null,
			group: null,
		};
	});

	const defaultTableState = useState("taskDefaultTableState", () => {
		return null;
	});

	const activeTableState = useState("taskActiveTableState", () => {
		return null;
	});

	const tableStateList = useState("taskTableStateList", () => {
		return null;
	});

	const showClearButton = useState("taskTableStateClearButton", () => {
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

export const useTaskHideDropDown = () => {
	const tableTdVisible = useState("taskTdVisible", () => {});

	const tdInit = (tableHeaders, tabHeaders) => {
		tableTdVisible.value = {};

		let visibleCount = 0;

		tableHeaders.forEach((item) => {
			if (!item.visible) return;

			tableTdVisible.value[item.name] = visibleCount < 10;
			visibleCount++;
		});

		for (const tab in tabHeaders) {
			tabHeaders[tab]?.headers?.forEach((item) => {
				if (item?.table_view !== false && item.visible)
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

export const useTaskGroup = () => {
	const grouped = useState("taskGroup", () => ({
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
