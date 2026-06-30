<script setup>
	const props = defineProps({
		record: { type: Object, required: true },
		headers: { type: Array, required: true },
		config: {
			type: Object,
			default: () => ({
				canEdit: false,
				title: "Basic Information",
			}),
		},
	});

	const emit = defineEmits(["update"]);

	const isEditing = ref(false);
	const recordDup = ref(null);
	const isMounted = ref(false);

	const changeSet = ref({});

	onMounted(() => (isMounted.value = true));

	// ---- Init edit form ----
	const editInit = () => {
		recordDup.value = JSON.parse(JSON.stringify(props.record));
		isEditing.value = true;
	};

	// ---- Handle field update from InputFields ----
	const handleFieldUpdate = (set) => {
		if (!recordDup.value) return;
		// Object.assign(recordDup.value, set);
		Object.assign(changeSet.value, set);
	};

	// ---- Submit ----
	const handleSubmit = () => {
		if (!props.record) return;

		emit("update", { id: props.record?.id, changes: changeSet.value });
		isEditing.value = false;
	};

	// ---- Read display value using getPathFromHeader ----
	const getDisplayValue = (header) => {
		const path = getPathFromHeader(header);
		const val = getValueByPath(props.record, path);
		if (isNullOrUndefinedOrEmpty(val)) return "—";
		return val;
	};

	const visibleHeaders = computed(() => props.headers.filter((h) => h.visible));

	const editableHeaders = computed(() =>
		props.headers.filter((h) => h.editable)
	);
</script>

<template>
	<div class="flex flex-col gap-4">
		<div class="rounded-xl border border-[var(--card-border)] overflow-hidden">
			<!-- Header bar -->
			<div
				class="flex justify-between items-center px-4 py-3 border-b border-[var(--card-border)] bg-[var(--stone-800)]">
				<h3 class="text-sm font-medium text-[var(--text-description)]">
					{{ config.title }}
				</h3>
				<button
					v-if="config.canEdit && !isEditing"
					@click="editInit"
					class="ghost-button-sm flex items-center gap-1.5 text-xs">
					<UIcon name="ic:round-edit-note" class="w-4 h-4" />
					Edit
				</button>
			</div>

			<!-- Read view -->
			<div
				v-if="!isEditing"
				class="p-4 grid gap-3"
				style="grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr))">
				<div
					v-for="(header, index) in visibleHeaders"
					:key="index"
					class="flex flex-col gap-1">
					<span
						class="text-[10px] font-medium uppercase tracking-wider text-[var(--stone-300)]">
						{{ header.name }}
					</span>
					<span class="text-sm text-[var(--text-description)]">
						{{ getDisplayValue(header) }}
					</span>
				</div>
			</div>

			<!-- Edit view -->
			<form
				v-else
				@submit.prevent="handleSubmit"
				class="p-4 flex flex-col gap-4">
				<div
					class="grid gap-4"
					style="grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr))">
					<FormFields
						v-for="(header, index) in editableHeaders"
						:key="index"
						:header="header"
						:data="recordDup"
						:config="{ operationType: 'update', hideLabel: false }"
						@update="handleFieldUpdate($event)" />
				</div>
				<div class="flex gap-2">
					<button type="submit" class="primary-button-sm">Update</button>
					<button
						type="button"
						class="secondary-button-sm"
						@click="isEditing = false">
						Cancel
					</button>
				</div>
			</form>
		</div>
	</div>
</template>
