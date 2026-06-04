<script setup>
	import {
		roles,
		tab_headers,
		config as headers,
	} from "@/table_configs/project.json";

	import * as composable from "~/composables/useProject";

	definePageMeta({
		middleware: "auth",
	});

	const table = useTableDefinition({
		read: false,
		write: false,

		tableName: {
			singular: "Project",
			plural: "Projects",
		},

		store: useProjectStore,

		headers,
		tab_headers,

		rowMap: new Map(),
		groupMap: new Map(),

		hideComposable: composable.useProjectHideDropDown,
		groupComposable: composable.useProjectGroup,
		currentRecord: composable.useProject,

		defaultSort: null,
		drawerComponent: "SideDrawerProject",
	});
</script>

<template>
	<TableWrapper :roles="roles" :tableConfig="table" />
</template>
