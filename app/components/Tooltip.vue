<script setup>
	const { header, content } = defineProps(["header", "content"]);
</script>

<template>
	<UTooltip
		:text="content"
		:popper="{ arrow: !header || header.type !== 'textarea' }">
		<span :class="{ 'font-semibold': header.type === 'pipeline' }">
			{{ content }}
		</span>
	</UTooltip>
</template>
