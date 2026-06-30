<script setup>
	import {
		roles,
		tab_headers,
		headers,
	} from "@/table_configs/organization.json";

	import * as composable from "~/composables/useOrganization";

	definePageMeta({
		middleware: "admin-or-super-admin",
	});

	const globalStore = useGlobalStore();

	const piniaStore = globalStore.organizationStore;

	const table = useTableDefinition({
		read: false,
		write: false,

		tableName: {
			singular: "Organization",
			plural: "Organizations",
		},

		store: piniaStore.useStore,

		headers,
		tab_headers,

		rowMap: new Map(),
		groupMap: new Map(),

		hideComposable: composable.useOrganizationHideDropDown,
		groupComposable: composable.useOrganizationGroup,
		currentRecord: composable.useOrganization,

		defaultSort: null,
		drawerComponent: "SideDrawerOrganization",
	});
</script>

<template>
	<TableWrapper :roles="roles" :tableConfig="table" />
</template>
