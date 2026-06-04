<template>
	<div class="flex items-center gap-2">
		<UIcon
			v-if="header?.icon"
			:name="header.icon"
			class="w-5 h-5"
			:class="header.iconClass" />
		<span>
			{{ content }}
		</span>
	</div>
</template>

<script setup>
	const { content, header } = defineProps(["content", "header"]);
</script>
