<script setup>
	const { refreshRecordsHandle, tableConfig } = defineProps([
		"refreshRecordsHandle",
		"tableConfig",
	]);

	const store = tableConfig.store();

	const tableStateStore = useTableStateStore();

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
	<UPopover v-model:open="tableStateDropdown">
		<UFieldGroup>
			<UButton
				:label="activeTableState?.name ?? 'Table state'"
				color="primary"
				variant="solid"
				icon="ic:baseline-turned-in-not"
				class="rounded-full" />
			<UTooltip text="Add new view">
				<UButton
					@click.stop="modalOpenHandler"
					color="secondary"
					variant="outline"
					icon="ic:round-plus"
					class="rounded-full">
				</UButton>
			</UTooltip>
		</UFieldGroup>

		<!-- Dropdown menu -->
		<template #content>
			<div class="rounded-md shadow w-fit text-sm">
				<div
					v-if="activeTableState"
					class="flex justify-between items-center px-2 py-2 gap-2 text-[var(--card-text)]">
					<h2 class="font-medium">
						{{ activeTableState?.name ? activeTableState.name : "Table state" }}
					</h2>

					<UTooltip text="Remove view">
						<UButton
							@click="clearTableState(tableConfig, toggleDropdown)"
							color="blue"
							variant="link"
							icon="ic:round-close"
							class="p-0" />
					</UTooltip>
				</div>
				<ul
					v-if="tableStateList?.length > 0 && loadingState !== 'fetching'"
					class="p-2">
					<template v-for="item in tableStateList" :key="item.id">
						<li v-if="activeTableState?.id !== item.id" class="flex gap-1">
							<UButton
								@click="applyTableState(tableConfig, item, toggleDropdown)"
								color="secondary"
								variant="outline"
								:label="item.name"
								size="sm" />
							<UTooltip text="Delete this view">
								<UButton
									@click="openDeleteModal(item)"
									color="error"
									variant="ghost"
									size="sm"
									icon="ic:round-delete"
									class="rounded-full" />
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
					<UButton
						@click="modalOpenHandler"
						color="primary"
						variant="solid"
						label="Add new"
						icon="ic:round-plus"
						size="xs"
						class="w-full justify-center" />
				</div>
			</div>
		</template>
	</UPopover>
	<UModal
		v-model:open="tableStateModal"
		:ui="{
			width: 'w-full !max-w-md',
			overlay: 'bg-black/50',
		}"
		title="Save current view">
		<template #body>
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

				<UButton
					type="submit"
					:label="loadingState === 'adding' ? 'Adding...' : 'Save'"
					:disabled="loadingState === 'adding'" />
			</form>
		</template>
	</UModal>
</template>
