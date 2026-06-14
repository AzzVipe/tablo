<script setup>
	const isPopoverOpen = ref(false);

	const { headers, tabHeaders, hideComposable } = defineProps([
		"headers",
		"tabHeaders",
		"hideComposable",
	]);

	const { tableTdVisible, showAllTableTd, hideAllTableTd } = hideComposable();
</script>

<template>
	<ClientOnly>
		<template #fallback>
			<SkeletonDropBtn />
		</template>

		<UPopover v-model:open="isPopoverOpen">
			<UButton
				color="secondary"
				variant="outline"
				label="Hide"
				icon="ic:round-visibility-off" />

			<template #content>
				<div>
					<ul class="pl-2 py-2 pr-3 space-y-1 text-sm max-h-64 overflow-y-auto">
						<h1 class="p-2 font-semibold text-[var(--text-title)]">
							Table fields
						</h1>
						<li v-for="(header, key) in tableTdVisible" :key="key">
							<div class="flex p-2 rounded">
								<label
									class="relative inline-flex items-center w-full cursor-pointer text-[var(--text-subtitle)]">
									<input
										type="checkbox"
										v-model="tableTdVisible[key]"
										class="sr-only peer" />
									<div
										class="w-9 h-5 bg-red-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
									<span class="ml-3 text-sm">{{ key }}</span>
								</label>
							</div>
						</li>
					</ul>
					<div
						class="flex gap-2 justify-center text-gray-600 px-2 py-3 text-xs">
						<UButton
							@click="hideAllTableTd"
							label="Hide All"
							color="secondary"
							variant="outline"
							size="sm" />
						<UButton
							@click="showAllTableTd"
							label="Show All"
							color="secondary"
							variant="outline"
							size="sm" />
					</div>
				</div>
			</template>
		</UPopover>
	</ClientOnly>
</template>
