<script setup>
	import { roles, tab_headers, headers } from "@/table_configs/task.json";

	import * as composable from "~/composables/useTask";

	definePageMeta({
		middleware: "auth",
	});

	const globalStore = useGlobalStore();

	const piniaStore = globalStore.taskStore;

	const table = useTableDefinition({
		read: false,
		write: false,

		tableName: {
			singular: "Task",
			plural: "Tasks",
		},

		store: piniaStore.useStore,

		headers,
		tab_headers,

		rowMap: new Map(),
		groupMap: new Map(),

		hideComposable: composable.useTaskHideDropDown,
		groupComposable: composable.useTaskGroup,
		currentRecord: composable.useTask,

		defaultSort: null,
		drawerComponent: "SideDrawerTask",
	});
</script>

<template>
	<TableWrapper :roles="roles" :tableConfig="table" />
</template>
