<template>
	<div class="flex items-center gap-2" :class="setColor(content)">
		<Icon name="ic:round-calendar-month" size="24" />
		<span>
			{{ formatDate(content, header.date_format) }}
		</span>
	</div>
</template>

<script setup>
	const { content, header } = defineProps(["content", "header"]);

	const setColor = (date) => {
		if (isNullOrUndefinedOrEmpty(date) || !header.flag_overdue)
			return "text-primary-600";

		const contentDate = new Date(date);
		const now = new Date();

		if (now > contentDate) return "text-red-600";
		else return "text-primary-600";
	};
</script>
