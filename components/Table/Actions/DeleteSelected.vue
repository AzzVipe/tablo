<script setup>
	const { length } = defineProps(["length"]);
	const emit = defineEmits(["deleteSelected"]);
	const deleteModal = ref(false);
</script>

<template>
	<TableActionsButton
		@tap="deleteModal = true"
		:popoverOpen="deleteModal"
		label="Delete selected"
		styles="secondary-button-outline-danger"
		actStyles="shadow !shadow-red-300 !border-red-300">
		<UIcon name="ic:baseline-delete-outline" class="w-5 h-5" />
		<span class="max-sm:hidden">Delete All</span>
	</TableActionsButton>

	<UModal
		v-model="deleteModal"
		:ui="{
			width: 'w-full !max-w-md',
			overlay: { background: 'bg-black/50' },
		}">
		<!-- Modal content -->
		<div class="relative p-4 text-center sm:px-4 sm:py-6">
			<button
				@click="deleteModal = false"
				type="button"
				class="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-700 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center">
				<UIcon name="ic:round-close" class="w-5 h-5" />
				<span class="sr-only">Close modal</span>
			</button>
			<svg
				class="text-gray-400 w-11 h-11 mb-3.5 mx-auto"
				aria-hidden="true"
				fill="currentColor"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg">
				<path
					fill-rule="evenodd"
					d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
					clip-rule="evenodd"></path>
			</svg>
			<p class="mb-4 text-gray-500">
				Are you sure you want to delete {{ length }}
				<span v-if="length > 1">records</span>
				<span v-else>record</span>
				?
			</p>
			<div class="flex justify-center items-center space-x-4">
				<button
					type="button"
					class="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10">
					No, cancel
				</button>
				<button
					@click="
						emit('deleteSelected');
						deleteModal = false;
					"
					type="submit"
					class="py-2 px-3 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300">
					Yes, I'm sure
				</button>
			</div>
		</div>
	</UModal>
</template>
