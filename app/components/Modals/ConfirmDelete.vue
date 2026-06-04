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
		v-model="internalModelValue"
		@update:modelValue="emit('update:modelValue', $event)"
		:ui="{
			width: 'w-full !max-w-sm',
			overlay: { background: 'bg-black/50' },
		}">
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
			<div class="flex justify-center items-center space-x-4">
				<button
					@click="closeModal"
					type="button"
					class="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10">
					No, cancel
				</button>

				<button
					@click="confirmDelete"
					type="submit"
					class="py-2 px-3 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300">
					Yes, I'm sure
				</button>
			</div>
		</div>
	</UModal>
</template>
