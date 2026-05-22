<script setup>
	import {
		roles,
		tab_headers,
		config as headers,
	} from "@/table_configs/user.json";

	import * as composable from "~/composables/useUser";

	definePageMeta({
		middleware: "super-admin",
	});

	const globalStore = useGlobalStore();

	const piniaStore = globalStore.userStore;

	const table = useTableDefinition({
		read: false,
		write: false,

		tableName: {
			singular: "User",
			plural: "Users",
		},

		store: piniaStore.useStore,

		headers,
		tab_headers,

		rowMap: new Map(),
		groupMap: new Map(),

		hideComposable: composable.useUserHideDropDown,
		groupComposable: composable.useUserGroup,
		currentRecord: composable.useUser,

		defaultSort: null,
		drawerComponent: "SideDrawerUser",
	});
</script>

<template>
	<TableWrapper :roles="roles" :tableConfig="table" />
</template>
