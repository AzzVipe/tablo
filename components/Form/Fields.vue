<script setup>
	const props = defineProps({
		header: { type: Object, required: true },
		data: { type: Object, required: true },
		config: {
			type: Object,
			default: () => ({
				operationType: "add",
				hideLabel: false,
				chipAutoEdit: false,
			}),
		},
	});

	const emit = defineEmits(["update"]);

	// ---- Core state ----
	const path = computed(
		() => props.header.assign_data_path || getPathFromHeader(props.header)
	);
	const dateMap = ref("");
	const fieldValue = computed(() => getValueByPath(props.data, path.value));

	// ---- Sync dateMap when fieldValue changes ----
	watch(
		fieldValue,
		(newVal) => {
			if (props.header.type === "date" && newVal) {
				dateMap.value = new Date(newVal);
			}
		},
		{ immediate: true }
	);

	// ---- Computed ----
	const isRequired = computed(() => {
		const { operationType } = props.config;
		// required defaults to true for add, false for update
		if (operationType === "add") return Boolean(props.header.required ?? true);
		if (operationType === "update")
			return Boolean(props.header.required ?? false);
		return false;
	});

	const labelFor = computed(() => {
		const id = props.data?.id;
		const base = `${props.config.operationType}-${path.value}`;
		return id ? `${props.config.operationType}-${id}-${path.value}` : base;
	});

	const inputConfig = computed(() => ({
		prefix: props.config.operationType,
		required: isRequired.value,
		variant: "default",
	}));

	// ---- Handlers ----

	// Used by components that emit their value directly (dropdowns, chips, date)
	const handleEmittedValue = (updatedValue) => {
		emit("update", { [path.value]: updatedValue });
	};

	// Used by native inputs (text, textarea) that use v-model-path
	// reads value from data after v-model-path has updated it
	const handleNativeInput = (event) => {
		let value = event.target.value;

		const isTextType =
			props.header.type === "text" || props.header.type === "textarea";
		if (isTextType && props.header.nullable === true && value === "") {
			value = null;
		}

		emit("update", { [path.value]: value });
	};
</script>

<template>
	<div class="flex flex-col gap-2">
		<!-- Label -->
		<template v-if="!config.hideLabel">
			<slot name="label" :for="labelFor" :label="header.name">
				<label
					:for="labelFor"
					class="block text-sm font-medium text-[var(--text-subtitle)]">
					{{ header.name }}
					<span v-if="isRequired" class="text-[var(--btn-danger-text)]">*</span>
				</label>
			</slot>
		</template>

		<!-- Chips -->
		<FormChip
			v-if="header.type === 'chips'"
			:header="header"
			:fieldValue="fieldValue"
			:required="isRequired"
			:autoEdit="config.chipAutoEdit"
			@change="handleEmittedValue" />

		<!-- Single assign -->
		<FormAssignDropdown
			v-else-if="header.type === 'relation'"
			:header="header"
			:modelValue="getValueByPath(props.data, header.assign_data_path || path)"
			:config="inputConfig"
			@update:modelValue="handleEmittedValue" />

		<!-- Multi assign -->
		<FormMultiAssignDropdown
			v-else-if="header.type === 'multi-relation'"
			:header="header"
			:modelValue="getValueByPath(props.data, header.assign_data_path || path)"
			:config="inputConfig"
			@update:modelValue="handleEmittedValue" />

		<!-- Single select dropdown -->
		<FormSingleSelectDropdown
			v-else-if="header.type === 'select'"
			:header="header"
			:modelValue="fieldValue"
			:config="inputConfig"
			@update:modelValue="handleEmittedValue" />

		<!-- Multi select dropdown -->
		<FormMultiSelectDropdown
			v-else-if="header.type === 'multi-select'"
			:header="header"
			:modelValue="fieldValue"
			:config="inputConfig"
			@update:modelValue="handleEmittedValue" />

		<!-- File -->
		<div v-else-if="header.type === 'file'">
			<input
				type="file"
				:id="`${config.operationType}-file-${path}`"
				:name="`${config.operationType}-file-${path}`"
				:multiple="true"
				:accept="header.accept || '*/*'"
				class="input-file-type" />
		</div>

		<!-- Date -->
		<UPopover
			v-else-if="header.type === 'date'"
			:popper="{ placement: 'bottom-start' }">
			<UButton
				icon="ic:round-calendar-month"
				:label="formatDate(dateMap, 'MMM DD YYYY')"
				class="input-box !flex !items-center !justify-start w-full" />

			<template #panel="{ close }">
				<FormDatePicker
					v-model="dateMap"
					is-required
					@update:modelValue="handleEmittedValue"
					@close="close" />
			</template>
		</UPopover>

		<!-- Image -->
		<div v-else-if="header.type === 'image'">
			<input
				v-if="!header.default"
				type="file"
				:id="`${config.operationType}-${path}`"
				:name="`${config.operationType}-${path}`"
				class="input-file-type"
				accept="image/jpg, image/jpeg, image/png" />

			<div class="flex items-center mt-2">
				<input
					v-model="header.default"
					id="use-default-image"
					type="checkbox"
					class="w-4 h-4 rounded border-[var(--input-border)] bg-[var(--input-bg)] text-orange-500 focus:ring-orange-500 focus:ring-offset-[var(--page-bg)] disabled:opacity-50 disabled:cursor-not-allowed" />
				<label
					for="use-default-image"
					class="ms-2 text-sm font-medium text-[var(--text-subtitle)]">
					Use Default Image
				</label>
			</div>
		</div>

		<!-- Textarea -->
		<textarea
			v-else-if="header.type === 'textarea'"
			v-model-path="{ obj: props.data, path: path }"
			:id="`${config.operationType}-${path}`"
			:name="`${config.operationType}-${path}`"
			:required="isRequired"
			:placeholder="header.placeholder || header.name"
			:maxlength="header?.max_length"
			:minlength="header?.min_length"
			class="input-box"
			@change="handleNativeInput($event)" />

		<!-- Text / Number / Email etc -->
		<input
			v-else
			v-model-path="{ obj: props.data, path: path }"
			:id="`${config.operationType}-${path}`"
			:name="`${config.operationType}-${path}`"
			:type="header.type"
			:required="isRequired"
			:placeholder="header.placeholder || header.name"
			:step="header.step"
			:maxlength="header?.max_length"
			:minlength="header?.min_length"
			class="input-box"
			@change="handleNativeInput($event)" />
	</div>
</template>
