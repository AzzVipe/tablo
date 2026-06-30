export const useOrganization = () => {
	const currRecord = useState("organization", () => {});
	const config = useState("organizationConfig", () => null);
	const drawer = useState("organizationDrawer", () => {});
	const bucket = useState("organizationBucket", () => {});
	const activeTab = useState("organizationActiveTab", () => null);
	const updateModal = useState("organizationUpdateModal", () => {});
	const deleteModal = useState("organizationDeleteModal", () => {});
	const tableState = useState("organizationTableState", () => {
		return {
			name: null,
			filters: null,
			match: null,
			sort: null,
			hide: null,
			group: null,
		};
	});

	const defaultTableState = useState("notificationDefaultTableState", () => {
		return null;
	});

	const activeTableState = useState("organizationActiveTableState", () => {
		return null;
	});

	const tableStateList = useState("organizationTableStateList", () => {
		return null;
	});

	const showClearButton = useState("organizationTableStateClearButton", () => {
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

export const useOrganizationHideDropDown = () => {
	const tableTdVisible = useState("organizationTdVisible", () => {});

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

export const useOrganizationGroup = () => {
	const grouped = useState("organizationGroup", () => ({
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
