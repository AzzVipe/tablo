<script setup>
	const { id, composable, headers } = defineProps([
		"id",
		"composable",
		"headers",
	]);

	const recordData = ref(null);
	const { currRecord, updateModal } = composable();

	const emit = defineEmits(["update"]);
	const changeSet = ref({});

	const handleSubmit = () => {
		if (Object.keys(changeSet.value).length === 0) return;

		emit("update", { changes: changeSet.value, id: recordData.value.id });

		updateModal.value = false;
	};

	const initRecord = () => {
		recordData.value = JSON.parse(JSON.stringify(currRecord.value));
	};

	watch(currRecord, (newVal) => {
		if (newVal) initRecord();
	});

	watch(updateModal, (newVal) => {
		if (!newVal) {
			currRecord.value = null;
		}
	});

	if (currRecord.value) initRecord();

	const handleAddFields = (set = {}) => {
		Object.assign(changeSet.value, set);

		recordData.value = { ...recordData.value, ...set };
	};
</script>

<template>
	<UModal
		v-if="recordData"
		title="Edit Record"
		v-model:open="updateModal"
		:ui="{
			content: 'w-full !max-w-4xl',
			overlay: 'bg-black/50',
		}">
		<template #body>
			<form
				id="update-record-form"
				v-auto-focus
				autocomplete="off"
				@keypress.enter.prevent
				@submit.prevent="handleSubmit">
				<div class="grid gap-4 mb-8 sm:grid-cols-2">
					<template v-for="(header, index) in headers" :key="index">
						<FormFields
							v-if="header.is_update"
							@update="handleAddFields($event)"
							:key="currRecord"
							:header="header"
							:data="recordData"
							:config="{
								operationType: 'update',
								chipAutoEdit: false,
							}" />
					</template>
				</div>
				<button class="primary-button">Update record</button>
			</form>
		</template>
	</UModal>
</template>
