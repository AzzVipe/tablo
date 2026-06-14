<template>
	<div class="flex items-center justify-center">
		<UButton
			:to="content"
			target="_blank"
			icon="ic:round-link"
			label="Open link" />
	</div>
</template>

<script setup>
	const { content, header } = defineProps(["content", "header"]);
</script>
