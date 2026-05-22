<template>
	<div class="flex items-center justify-center">
		<a
			:href="content"
			target="_blank"
			class="primary-button-sm !rounded-full focus:ring-0 focus:outline-none w-fit">
			<Icon name="ic:round-link" class="w-4 h-4" />

			Open link
		</a>
	</div>
</template>

<script setup>
	const { content, header } = defineProps(["content", "header"]);
</script>
