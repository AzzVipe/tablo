<script setup>
	const props = defineProps({
		record: { type: Object, required: true },
		header: { type: Object, required: true },
		config: {
			type: Object,
			default: () => ({ canEdit: false }),
		},
	});

	const emit = defineEmits(["update"]);

	const path = computed(() => getPathFromHeader(props.header));
	const chips = ref([]);
	const currentChip = ref("");

	// ---- Initialize chips from data ----
	onMounted(() => {
		const val = getValueByPath(props.record, path.value);
		if (Array.isArray(val)) {
			chips.value = JSON.parse(JSON.stringify(val));
		}
	});

	// ---- Add chip on Enter ----
	const addChip = () => {
		const val = currentChip.value.trim();
		if (!val) return;
		chips.value.push(val);
		currentChip.value = "";
		emitUpdate();
	};

	// ---- Remove chip by index ----
	const removeChip = (index) => {
		chips.value.splice(index, 1);
		emitUpdate();
	};

	// ---- Emit change set ----
	const emitUpdate = () => {
		const changes = {
			[path.value]: chips.value,
		};

		emit("update", { id: props.record.id, changes });
	};
</script>

<template>
	<div class="flex flex-col gap-3">
		<!-- Chips display -->
		<div class="flex gap-2 flex-wrap min-h-[2rem]">
			<span
				v-for="(chip, index) in chips"
				:key="chip"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--stone-700)] text-[var(--text-description)] transition-colors"
				:class="
					config.canEdit
						? 'cursor-pointer hover:bg-[var(--btn-danger-bg)] hover:text-[var(--btn-danger-text)]'
						: 'cursor-default'
				"
				@click="config.canEdit && removeChip(index)">
				{{ chip }}
				<UIcon
					v-if="config.canEdit"
					name="ic:round-close"
					class="w-3.5 h-3.5 opacity-60" />
			</span>

			<span v-if="!chips.length" class="text-sm text-[var(--stone-300)] italic">
				No {{ header.name.toLowerCase() }} added yet
			</span>
		</div>

		<!-- Input -->
		<div v-if="config.canEdit" class="flex gap-2">
			<input
				v-model="currentChip"
				type="text"
				:placeholder="`Add ${header.name.toLowerCase()} and press Enter`"
				class="input-box flex-1"
				@keydown.enter.prevent="addChip" />
		</div>
	</div>
</template>
