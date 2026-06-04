<script setup>
	import {
		roles,
		tab_headers,
		config as headers,
	} from "@/table_configs/task.json";

	definePageMeta({
		middleware: "auth",
	});

	const isLoaded = ref(false);
	const error = ref(null);

	const id = ref(null);
	const route = useRoute();
	const composable = await import("~/composables/useTask");

	const store = useTaskStore();
	const { currRecord } = composable.useTask();

	if (route.params?.id) id.value = route.params?.id;

	const table = useTableDefinition({
		read: false,
		write: false,

		tableName: {
			singular: "Task",
			plural: "Tasks",
		},

		store: useTaskStore,

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
