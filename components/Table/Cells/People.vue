<template>
	<div class="flex justify-start items-center">
		<ImageWrapper
			:src="image"
			:name="content"
			styles="w-8 h-8 rounded-full object-cover text-sm font-medium" />
		<p class="pl-3 pr-6 overflow-hidden whitespace-nowrap">
			{{ content }}
		</p>
	</div>
</template>

<script setup>
	const { content, header, image } = defineProps([
		"content",
		"header",
		"image",
	]);
</script>
