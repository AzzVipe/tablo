<script setup>
	const { hasUpdate, hasDelete } = defineProps({
		hasUpdate: {
			type: Boolean,
			required: true,
		},
		hasDelete: {
			type: Boolean,
			required: true,
		},
	});
	
	const emit = defineEmits(["update", "delete"]);

	const items = [
		[
			{
				label: "Edit",
				icon: "ic:round-mode-edit-outline",
				click: () => {
					emit("update");
				},
				disabled: !hasUpdate,
			},
		],
		[
			{
				label: "Delete",
				icon: "ic:round-delete",
				click: () => {
					emit("delete");
				},
				disabled: !hasDelete,
			},
		],
	];
</script>

<template>
	<UDropdown
		:items="items"
		:ui="{
			padding: 'p-1',
			divide: 'divide-none',
			width: 'w-40',
			item: {
				disabled: 'cursor-text select-text',
				padding: 'px-2 py-1.5',
			},
		}"
		:popper="{ placement: 'left-start' }">
		<UButton
			color="gray"
			variant="ghost"
			size="sm"
			icon="ic:round-more-horiz"
			class="rounded-full" />

		<template #item="{ item }">
			<span class="truncate text-sm font-medium">
				{{ item.label }}
			</span>

			<UIcon
				:name="item.icon"
				class="flex-shrink-0 h-6 w-6 text-red-500 ms-auto" />
		</template>
	</UDropdown>
</template>
