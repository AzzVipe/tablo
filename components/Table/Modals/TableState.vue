<script setup>
	import { useStore } from "~/stores/tablestate";

	const { refreshRecordsHandle, tableConfig } = defineProps([
		"refreshRecordsHandle",
		"tableConfig",
	]);

	const store = tableConfig.store();

	const tableStateStore = useStore();

	const tableStateName = ref("");
	const nameInputRef = ref(null);

	const tableStateDropdown = ref(false);
	const tableStateModal = ref(false);

	const showConfirmModal = ref(false);
	const selectedView = ref(null);

	const collection = store.apiPath.slice(1);

	const tableStateList = computed(
		() => tableStateStore.viewsMap.get(collection) || []
	);
	const loadingState = computed(() => tableStateStore.loadingState);

	const { activeTableState } = tableConfig.currentRecord();

	// Toggle dropdown
	const toggleDropdown = () => {
		tableStateDropdown.value = false;
		selectedView.value = null;
		refreshRecordsHandle();
	};

	// Modal open handler
	const modalOpenHandler = () => {
		tableStateModal.value = true;
		nextTick(() => {
			nameInputRef.value?.focus();
		});
	};

	// Clear input field
	const clearTableStateName = () => {
		tableStateName.value = "";
		tableStateModal.value = false;
	};

	const openDeleteModal = (view) => {
		selectedView.value = view;
		showConfirmModal.value = true;
	};

	const deleteView = () => {
		tableStateStore.deleteView(collection, selectedView.value.id);
	};

	watch(tableStateDropdown, (newVal) => {
		if (newVal) {
			tableStateStore.listViews(collection);
		}
	});

	const dltBtnUi = {
		color: {
			gray: {
				ghost: "hover:bg-red-100",
			},
		},
		icon: {
			base: "text-red-500",
		},
	};
</script>

<template>
	<ModalsConfirmDelete
		v-model="showConfirmModal"
		@delete="deleteView"
		:name="selectedView?.name" />

	<ClientOnly>
		<UPopover v-model:open="tableStateDropdown">
			<div class="primary-button !rounded-full !p-0 !pl-3 border-none">
				<button type="button" class="flex items-center gap-1">
					<UIcon
						name="ic:baseline-turned-in-not"
						class="w-5 h-5 font-semibold sm:hidden" />

					<span class="max-sm:hidden">
						{{ activeTableState?.name ? activeTableState.name : "Table state" }}
					</span>
					<UIcon name="ic:round-expand-more" class="w-6 h-6 max-sm:hidden h-" />
				</button>
				<UTooltip text="Add new view">
					<button
						class="secondary-button !rounded-full !rounded-l-none"
						@click.stop="modalOpenHandler">
						<UIcon name="ic:round-plus" class="w-6 h-6 max-md:w-5 max-md:h-5" />
					</button>
				</UTooltip>
			</div>

			<!-- Dropdown menu -->
			<template #panel>
				<div class="rounded-md shadow w-fit text-sm">
					<div
						v-if="activeTableState"
						class="flex justify-between items-center px-2 py-2 gap-2 text-[var(--card-text)]">
						<h2 class="font-medium">
							{{
								activeTableState?.name ? activeTableState.name : "Table state"
							}}
						</h2>

						<UTooltip text="Remove view">
							<UButton
								@click="clearTableState(tableConfig, toggleDropdown)"
								size="xl"
								color="blue"
								variant="link"
								icon="ic:round-close"
								class="p-0" />
						</UTooltip>
					</div>
					<ul
						v-if="tableStateList?.length > 0 && loadingState !== 'fetching'"
						class="py-1 text-center">
						<template v-for="item in tableStateList" :key="item.id">
							<li
								v-if="activeTableState?.id !== item.id"
								class="px-2 py-1 cursor-pointer hover:bg-[var(--card-hover)] flex gap-2 items-center justify-between">
								<button
									@click="applyTableState(tableConfig, item, toggleDropdown)"
									class="py-1.5 text-left font-medium w-full">
									{{ item.name }}
								</button>

								<UTooltip text="Delete this view">
									<UButton
										@click="openDeleteModal(item)"
										size="xl"
										color="gray"
										variant="link"
										icon="ic:round-delete"
										class="rounded-full hover:text-red-600 p-0" />
								</UTooltip>
							</li>
						</template>
					</ul>
					<ul v-else-if="loadingState === 'fetching'">
						<SkeletonTableState />
						<SkeletonTableState />
					</ul>

					<div v-else class="py-2 text-center">
						<p class="text-gray-700">No saved views</p>
					</div>

					<div class="p-2">
						<button @click="modalOpenHandler" class="primary-button-sm w-full">
							<UIcon
								name="ic:round-plus"
								class="w-4 h-4 max-md:w-5 max-md:h-5" />
							Add new
						</button>
					</div>
				</div>
			</template>
		</UPopover>
	</ClientOnly>

	<UModal
		v-model="tableStateModal"
		:ui="{
			width: 'w-full !max-w-md',
			overlay: { background: 'bg-black/50' },
		}">
		<!-- Modal content -->
		<div class="relative rounded-lg shadow">
			<button
				@click="tableStateModal = false"
				type="button"
				class="absolute top-3 right-2.5 ghost-button-sm !p-1">
				<UIcon name="ic:round-close" class="w-5 h-5" />
				<span class="sr-only">Close modal</span>
			</button>
			<div class="p-4">
				<h3 class="mb-8 text-xl font-medium text-[var(--text-title)]">
					Save current view
				</h3>
				<form
					@submit.prevent="
						addTableState(tableConfig, tableStateName, clearTableStateName)
					"
					class="flex flex-col gap-8">
					<div>
						<label
							for="tablestate-name"
							class="block mb-2 text-sm font-medium text-[var(--text-subtitle)]">
							Template name
						</label>
						<input
							type="text"
							name="tablestate-name"
							id="tablestate-name"
							ref="nameInputRef"
							v-model="tableStateName"
							class="input-box"
							placeholder="Name"
							required />
					</div>

					<button
						type="submit"
						:class="{
							'opacity-50 cursor-not-allowed': loadingState === 'adding',
						}"
						:disabled="loadingState === 'adding'"
						class="primary-button w-full">
						{{ loadingState === "adding" ? "Adding..." : "Save" }}
					</button>
				</form>
			</div>
		</div>
	</UModal>
</template>
