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
				onSelect: () => {
					emit("update");
				},
				disabled: !hasUpdate,
			},
		],
		[
			{
				label: "Delete",
				icon: "ic:round-delete",
				onSelect: () => {
					emit("delete");
				},
				disabled: !hasDelete,
			},
		],
	];
</script>

<template>
	<UDropdownMenu
		:items="items"
		:ui="{
			content: 'p-1 divide-none w-40',
			item: 'cursor-text select-text px-2 py-1.5',
		}"
		:content="{ side: 'left', align: 'start' }">
		<UButton
			color="neutral"
			variant="ghost"
			size="sm"
			icon="ic:round-more-horiz"
			class="rounded-full" />

		<template #item="{ item }">
			<span class="truncate text-sm font-medium">
				{{ item.label }}
			</span>

			<UIcon :name="item.icon" class="shrink-0 size-6 text-red-500 ms-auto" />
		</template>
	</UDropdownMenu>
</template>
