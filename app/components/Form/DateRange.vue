<script setup>
	import { sub, format } from "date-fns";

	const props = defineProps(["modelValue"]);
	const emit = defineEmits(["update:modelValue", "change"]);

	const isOpen = ref(false);
	const triggerRef = ref(null);
	const panelRef = ref(null);

	function toggle() {
		isOpen.value = !isOpen.value;
		if (isOpen.value) {
			nextTick(() => {
				updatePanelPosition();
				document.addEventListener("click", handleClickOutside);
			});
		} else {
			document.removeEventListener("click", handleClickOutside);
		}
	}

	function closePicker() {
		isOpen.value = false;
		document.removeEventListener("click", handleClickOutside);
	}

	function handleClickOutside(e) {
		if (triggerRef.value?.contains(e.target)) return;
		if (panelRef.value?.contains(e.target)) return;
		closePicker();
	}

	// Default = last 7 days
	const defaultRange = [sub(new Date(), { days: 7 }), new Date()];

	const selected = ref({
		start: props.modelValue?.[0] ?? defaultRange[0],
		end: props.modelValue?.[1] ?? defaultRange[1],
	});

	if (!props.modelValue || !Array.isArray(props.modelValue)) {
		const arr = [selected.value.start, selected.value.end];
		emit("update:modelValue", arr);
		emit("change", arr);
	}

	watch(
		() => props.modelValue,
		(val) => {
			if (val && Array.isArray(val)) {
				selected.value = { start: val[0], end: val[1] };
			} else {
				selected.value = { start: defaultRange[0], end: defaultRange[1] };
			}
		},
		{ immediate: true, deep: true }
	);

	watch(
		() => selected.value,
		(val) => {
			const arr = [val.start, val.end];
			emit("update:modelValue", arr);
			emit("change", arr);
		},
		{ deep: true }
	);

	/* ---------- positioning + teleport logic ---------- */
	const panelStyle = ref({
		position: "fixed",
		top: "0px",
		left: "0px",
		zIndex: 9999,
		minWidth: "220px",
	});

	function updatePanelPosition() {
		nextTick(() => {
			const rect = triggerRef.value?.getBoundingClientRect();
			if (!rect) return;

			panelStyle.value = {
				position: "fixed",
				top: `${Math.round(rect.bottom)}px`,
				left: `${Math.round(rect.left)}px`,
				zIndex: 9999,
				minWidth: `${Math.round(rect.width)}px`,
			};
		});
	}

	onBeforeUnmount(() => {
		document.removeEventListener("click", handleClickOutside);
	});
</script>

<template>
	<div>
		<span ref="triggerRef" style="display: inline-block">
			<UButton
				icon="ic:round-calendar-month"
				@click="toggle"
				class="bg-white box-border border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-medium !ring-0 placeholder:text-gray-500 w-full outline-none rounded-lg">
				{{ format(selected.start, "MMM d yyyy") }} -
				{{ format(selected.end, "MMM d yyyy") }}
			</UButton>
		</span>

		<Teleport to="body">
			<div
				v-if="isOpen"
				ref="panelRef"
				:style="panelStyle"
				class="bg-white border rounded-lg shadow-lg overflow-hidden mt-2">
				<FormDatePicker v-model="selected" @close="closePicker" />
			</div>
		</Teleport>
	</div>
</template>
