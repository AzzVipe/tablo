<template>
	<div>
		<div class="flex gap-2">
			<span
				v-for="keyword in content"
				:key="keyword"
				class="px-3 py-0.5 rounded-full bg-gray-50 text-primary-700 shadow shadow-primary-300">
				{{ keyword }}
			</span>
		</div>
	</div>
</template>

<script setup>
	const { content, header } = defineProps(["content", "header"]);
</script>
