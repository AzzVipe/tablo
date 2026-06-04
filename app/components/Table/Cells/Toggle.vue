<template>
	<div class="max-w-xs text-black truncate">
		<label class="relative inline-flex items-center cursor-pointer">
			<input
				@change="handleToggle"
				type="checkbox"
				value=""
				v-model="toggle"
				class="sr-only peer" />
			<div
				class="w-11 h-6 bg-red-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
			<span
				v-if="toggle === true"
				class="ms-3 text-sm font-medium text-gray-900"
				>{{
					isNullOrUndefinedOrEmpty(header.toggle_active_label)
						? "Active"
						: header.toggle_active_label
				}}</span
			>
			<span
				v-else-if="toggle === false"
				class="ms-3 text-sm font-medium text-gray-900"
				>{{
					isNullOrUndefinedOrEmpty(header.toggle_inactive_label)
						? "Inactive"
						: header.toggle_inactive_label
				}}</span
			>
		</label>
	</div>
</template>

<script setup>
	const { content, recordId, header, image, index } = defineProps([
		"content",
		"recordId",
		"header",
		"image",
		"index",
	]);

	const emit = defineEmits(["updateColumn"]);

	const toggle = ref(false);

	if (content) toggle.value = true;
	else toggle.value = false;

	const handleToggle = () => {
		let set = {};

		const path = getPathFromHeader(header);

		set[path] = toggle.value;

		emit("updateColumn", set);
	};
</script>
