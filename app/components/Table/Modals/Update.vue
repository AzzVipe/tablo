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
		v-model="updateModal"
		:ui="{
			width: 'w-full !max-w-4xl',
			overlay: { background: 'bg-black/50' },
		}">
		<!-- Modal content -->
		<div
			id="updateRecordModal"
			class="relative p-4 rounded-lg shadow sm:p-5 text-white">
			<!-- Modal header -->
			<div class="flex justify-between items-center pb-4 mb-4 rounded-t">
				<h3 class="text-xl font-semibold text-[var(--text-title)]">
					Edit Record
				</h3>
				<button
					@click="updateModal = false"
					type="button"
					class="ghost-button-sm !p-1">
					<UIcon name="ic:round-close" class="w-5 h-5" />
					<span class="sr-only">Close modal</span>
				</button>
			</div>
			<!-- Modal body -->
			<form
				v-if="recordData"
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
		</div>
	</UModal>
</template>
