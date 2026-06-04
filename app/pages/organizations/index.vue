<script setup>
	import {
		roles,
		tab_headers,
		config as headers,
	} from "@/table_configs/organization.json";

	import * as composable from "~/composables/useOrganization";

	definePageMeta({
		middleware: "admin-or-super-admin",
	});

	const table = useTableDefinition({
		read: false,
		write: false,

		tableName: {
			singular: "Organization",
			plural: "Organizations",
		},

		store: useOrganizationStore,

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
