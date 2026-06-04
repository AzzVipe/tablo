<template>
	<td class="w-4 p-4 rounded-tl-md" scope="row">
		<div class="flex items-center">
			<input
				id="checkbox-table-row-skeleton"
				type="checkbox"
				class="h-5 w-5 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-transparent focus:ring-offset-transparent form-checkbox rounded bg-white border-gray-300 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-green-500" />
			<label for="checkbox-table-row-skeleton" class="sr-only">checkbox</label>
		</div>
	</td>
	<template v-for="(value, key) in tableTdVisible" :key="key">
		<td v-if="value" class="px-3 py-4 whitespace-nowrap">
			<div class="flex items-center justify-between animate-pulse">
				<div class="h-2.5 bg-gray-300 rounded-full w-24"></div>
			</div>
		</td>
	</template>

	<td class="px-3 py-4 rounded-tr-md"></td>
</template>

<script setup>
	const { hideComposable } = defineProps(["hideComposable"]);
	const { tableTdVisible } = hideComposable();
</script>

<style lang="scss" scoped></style>
