<script setup>
	const props = defineProps({
		tab: { type: Object, required: true },
		tableConfig: { type: Object, required: true },
		id: { type: String, required: true },
	});

	const { currRecord } = props.tableConfig.currentRecord();
	const toStore = props.tableConfig.store();

	const handleUpdate = (event = {}) => {
		if (!event.id || !event.changes) {
			throw new Error("[SideDrawer/Tabs/index] id or changes is missing");
		}

		toStore.updateRecord(event.id, event.changes);
	};
</script>

<template>
	<div
		v-if="tab.read"
		class="px-4 py-2 rounded-lg"
		:id="id"
		role="tabpanel"
		:aria-labelledby="`${id}-tab`">
		<SideDrawerTabsDetails
			v-if="tab.type === 'details'"
			@update="handleUpdate"
			:key="currRecord"
			:record="currRecord"
			:headers="tab.headers"
			:config="{
				canEdit: tab.write,
				title: tab.name ?? 'Basic Information',
			}" />

		<SideDrawerTabsChips
			v-else-if="tab.type === 'chips'"
			:key="currRecord"
			:record="currRecord"
			:header="tab.header"
			:config="{ canEdit: tab.write }"
			@update="handleUpdate" />

		<SideDrawerTabsHistory
			v-else-if="tab.type === 'history'"
			:key="currRecord"
			:record="currRecord" />

		<SideDrawerTabsNotes
			v-else-if="tab.type === 'notes'"
			:key="currRecord"
			:data="currRecord"
			:header="tab.header"
			:canEdit="tab.write"
			:store="tableConfig.store"
			:composable="tableConfig.currentRecord" />
	</div>
</template>
