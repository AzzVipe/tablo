<script setup>
	import {
		roles,
		tab_headers,
		config as headers,
	} from "@/table_configs/user.json";

	definePageMeta({
		middleware: "super-admin",
	});

	const isLoaded = ref(false);
	const error = ref(null);

	const id = ref(null);
	const route = useRoute();
	const piniaStore = useGlobalStore().userStore;
	const composable = await import("~/composables/useUser");

	const store = piniaStore.useStore();
	const { currRecord } = composable.useUser();

	if (route.params?.id) id.value = route.params?.id;

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

	onBeforeMount(() => {
		setTableRules(table, roles);
	});

	onMounted(async () => {
		try {
			if (id.value) {
				currRecord.value = await store.findById(id.value);
			}
			isLoaded.value = true;
		} catch (err) {
			error.value = err;
		}
	});
</script>

<template>
	<SkeletonOverview v-if="!isLoaded && !error" />
	<TableOverview v-else-if="isLoaded && !error" :tableConfig="table" />
	<div v-else class="ml-4 mt-4">No record found!</div>
</template>
