<template>
	<UModal
		v-model="deleteModal"
		:ui="{
			width: 'w-full !max-w-md',
			overlay: { background: 'bg-black/50' },
		}">
		<!-- Modal content -->
		<div
			class="relative p-4 text-center sm:px-4 sm:py-6 text-[var(--text-description)]">
			<button
				@click="deleteModal = false"
				type="button"
				class="ghost-button-sm !p-1">
				<UIcon name="ic:round-close" class="w-5 h-5" />
				<span class="sr-only">Close modal</span>
			</button>
			<svg
				class="w-11 h-11 mb-3.5 mx-auto"
				aria-hidden="true"
				fill="currentColor"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg">
				<path
					fill-rule="evenodd"
					d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
					clip-rule="evenodd"></path>
			</svg>
			<p class="mb-4">
				Are you sure you want to delete {{ length }}
				<span v-if="length > 1">records</span>
				<span v-else>record</span>
				?
			</p>
			<div class="flex justify-center items-center space-x-4">
				<button
					@click="deleteModal = false"
					type="button"
					class="secondary-button">
					No, cancel
				</button>
				<button
					@click="
						emit('deleteRecord');
						deleteModal = false;
					"
					type="submit"
					class="danger-button">
					Yes, I'm sure
				</button>
			</div>
		</div>
	</UModal>
</template>

<script setup>
	const { id, length, composable } = defineProps([
		"id",
		"length",
		"composable",
	]);

	const emit = defineEmits(["deleteRecord"]);
	const { deleteModal } = composable();
</script>

<style lang="scss" scoped></style>
