<script setup>
	const props = defineProps({
		name: String,
		modelValue: Boolean,
	});

	const emit = defineEmits(["update:modelValue", "delete"]);

	// Internal state to avoid mutating the prop directly
	const internalModelValue = ref(props.modelValue);

	// Sync internal state when parent updates modelValue
	watch(
		() => props.modelValue,
		(newVal) => {
			internalModelValue.value = newVal;
		}
	);

	// Emit the value change when internal state changes
	const closeModal = () => {
		internalModelValue.value = false;
		emit("update:modelValue", false);
	};

	const confirmDelete = () => {
		emit("delete");
		closeModal();
	};
</script>

<template>
	<UModal
		v-model:open="internalModelValue"
		@update:modelValue="emit('update:modelValue', $event)"
		:ui="{
			content: 'w-full !max-w-sm',
			overlay: 'bg-black/50',
		}">
		<template #content>
			<div class="relative p-4 text-center sm:px-4 sm:py-6">
				<UButton
					class="absolute top-2.5 right-2.5"
					@click="closeModal"
					icon="ic:round-close"
					size="sm"
					color="gray"
					variant="ghost" />

				<UIcon
					name="ic:round-delete"
					class="w-12 h-12 text-gray-400 font-semibold" />

				<!-- Text -->
				<p class="mb-4 text-gray-500">
					Are you sure you want to delete
					<strong>{{ props.name }}</strong>
					?
				</p>

				<!-- Buttons -->
				<div class="flex justify-center items-center gap-4">
					<UButton
						@click="closeModal"
						label="No, cancel"
						color="secondary"
						variant="ghost" />
					<UButton @click="confirmDelete" label="Yes, I'm sure" color="error" />
				</div>
			</div>
		</template>
	</UModal>
</template>
