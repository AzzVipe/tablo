<script setup>
	const ui = {
		background: "bg-gray-200",
	};
</script>

<template>
	<li
		class="flex flex-col gap-2.5 px-4 py-2.5 text-base border rounded-lg shadow">
		<div class="flex items-center gap-3">
			<USkeleton
				class="h-10 w-10"
				:ui="{
					rounded: 'rounded-full',
					...ui,
				}" />
			<USkeleton :ui="ui" class="h-4 w-[250px]" />
		</div>

		<USkeleton :ui="ui" class="h-7 w-full" />
	</li>
</template>
