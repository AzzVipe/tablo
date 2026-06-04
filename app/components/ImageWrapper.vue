<template>
	<img
		v-if="src"
		:src="src"
		:alt="name ? name : 'Image'"
		:class="styles"
		referrerPolicy="no-referrer" />
	<img
		v-else-if="!name"
		src="~/assets/images/default-user.png"
		alt="Image"
		:class="styles" />

	<div
		v-else
		class="inline-flex items-center justify-center bg-blue-600"
		:style="{ aspectRatio: '1 / 1' }"
		:class="styles">
		<span>{{ getInitials(name) }}</span>
	</div>
</template>

<script setup>
	const { src, name, styles } = defineProps({
		src: {
			required: false,
			type: String,
		},
		name: {
			type: String,
			required: false,
			validator: (value) => typeof value === "string",
		},
		styles: {
			required: false,
			type: String,
		},
	});

	const getInitials = (name) => {
		if (!name) return "";
		if (!name.trim) return "";

		const words = name?.trim()?.split(" ");

		return words.length > 1
			? (words[0][0] + words[1][0]).toUpperCase() // First letter of first two words
			: words[0].slice(0, 2).toUpperCase(); // First two letters of a single word
	};
</script>

<style lang="scss" scoped></style>
