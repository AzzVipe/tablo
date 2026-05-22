<template>
	<div ref="root" class="relative w-full flex flex-col gap-2">
		<!-- READ-ONLY MODE (Update Modal) -->
		<div
			v-if="!editingMode"
			class="flex w-full min-w-[14.5rem] flex-wrap gap-2 border-b-2 border-gray-300 px-1.5 py-1.5 min-h-[42px] cursor-text"
			@click="startEditing">
			<!-- Visible chips -->
			<div
				v-for="(chip, index) in visibleChips"
				:key="index"
				class="text-sm px-3 py-1 rounded-full bg-gray-50 text-primary-700 shadow-sm shadow-primary-200 flex gap-1.5 items-center cursor-pointer truncate">
				{{ chip }}
			</div>

			<!-- +X more chip -->
			<div
				v-if="hiddenChipCount > 0"
				class="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-600 shadow-sm flex items-center cursor-pointer">
				+{{ hiddenChipCount }} more
			</div>
		</div>

		<!-- EDITING MODE (Table Row or activated in Modal) -->
		<div v-else class="w-full" ref="panel">
			<input
				ref="chipInput"
				:required="requiredChip"
				type="text"
				v-model="currentChip"
				class="input-box-outline"
				@keypress.enter="saveChip" />

			<!-- Custom Popover -->
			<transition name="fade">
				<div
					v-if="chips.length > 0"
					class="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white shadow-lg rounded-xl p-3 z-50 border border-gray-200 min-w-[100%]">
					<div class="flex flex-wrap gap-2">
						<div
							v-for="(chip, index) in chips"
							:key="index"
							class="text-sm px-3 py-1 rounded-full bg-gray-50 text-primary-700 shadow-sm shadow-primary-200 flex gap-1.5 items-center cursor-pointer"
							@click="removeChip(index)">
							{{ chip }}
							<UIcon name="ic:sharp-cancel" class="w-4 h-4" />
						</div>
					</div>
				</div>
			</transition>
		</div>
	</div>
</template>

<script setup>
	const { fieldValue, required, autoEdit } = defineProps([
		"fieldValue",
		"required",
		"autoEdit",
	]);
	const emit = defineEmits(["change"]);

	const maxVisibleChips = 2; // you can change to 2, 4, etc.

	const visibleChips = computed(() => chips.value.slice(0, maxVisibleChips));

	const hiddenChipCount = computed(() => chips.value.length - maxVisibleChips);

	const root = ref(null);
	const panel = ref(null);

	const handleClickOutside = (e) => {
		if (!editingMode.value) return; // only when editing
		if (autoEdit) return; // don't close for table-row case

		// treat "inside" as only the editing panel (input + chips popover)
		if (panel.value && !panel.value.contains(e.target)) {
			editingMode.value = false; // hide input + popover
		}
	};

	const requiredChip = ref(required);
	const currentChip = ref("");
	const chips = ref([]);
	const editingMode = ref(autoEdit ?? false); // TRUE for table-row, FALSE for modal
	const chipInput = ref(null);

	// Load initial chips
	if (Array.isArray(fieldValue) && fieldValue.length > 0) {
		chips.value = [...fieldValue];
	}

	// Autofocus when editing mode is enabled
	const focusInput = () => {
		nextTick(() => {
			chipInput.value?.focus();
		});
	};

	// When clicking chips (modal), start editing
	const startEditing = () => {
		editingMode.value = true;
		focusInput();
	};

	// Auto-focus immediately for table-row mode
	onMounted(() => {
		if (editingMode.value) focusInput();
	});

	// Add chip
	const saveChip = () => {
		if (currentChip.value.trim() === "") return;

		chips.value.push(currentChip.value);

		if (chips.value.length > 0) {
			requiredChip.value = false;
		}

		currentChip.value = "";
		emit("change", [...chips.value]);
	};

	// Remove chip
	const removeChip = (index) => {
		chips.value.splice(index, 1);

		if (chips.value.length === 0) {
			requiredChip.value = required;
		}

		emit("change", [...chips.value]);
	};

	onMounted(() => {
		document.addEventListener("click", handleClickOutside, true);
	});

	onBeforeUnmount(() => {
		document.removeEventListener("click", handleClickOutside, true);
	});

	// watch(
	// 	() => fieldValue,
	// 	(newVal) => {
	// 		if (Array.isArray(newVal)) {
	// 			chips.value = [...newVal];
	// 		} else {
	// 			chips.value = [];
	// 		}
	// 	}
	// );
</script>

<style scoped>
	.fade-enter-active,
	.fade-leave-active {
		transition: opacity 0.18s ease;
	}
	.fade-enter-from,
	.fade-leave-to {
		opacity: 0;
	}
</style>
