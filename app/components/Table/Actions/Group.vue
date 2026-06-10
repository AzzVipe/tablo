<script setup>
	const { groupComposable, headers } = defineProps([
		"groupComposable",
		"headers",
	]);

	const isPopoverOpen = ref(false);

	const { grouped, setGroup } = groupComposable();
</script>

<template>
	<ClientOnly>
		<template #fallback>
			<SkeletonDropBtn />
		</template>

		<UPopover v-model:open="isPopoverOpen">
			<TableActionsButton :popoverOpen="isPopoverOpen" label="group">
				<UIcon name="ic:round-grid-view" class="w-5 h-5" />
				<span class="max-sm:hidden">Group</span>
			</TableActionsButton>

			<template #content>
				<div class="bg-white divide-y divide-gray-100 px-2 w-28">
					<div
						v-if="grouped.active"
						class="text-sm px-2 pt-2 pb-1.5 font-medium flex items-center justify-between">
						<p class="text-base font-bold">
							{{ grouped.groupedBy }}
						</p>
						<button
							type="button"
							@click="
								setGroup({
									active: false,
									groupedBy: null,
									header: null,
								})
							">
							<UIcon name="ic:round-close" class="w-4 h-4 mt-2" />
						</button>
					</div>

					<ul class="flex flex-col items-start w-full py-2 text-sm">
						<template v-for="header in headers" :key="header.id">
							<li v-if="header.is_group" class="w-full">
								<button
									type="button"
									@click="
										setGroup({
											active: true,
											groupedBy: header.name,
											header: header,
										})
									"
									class="w-full flex items-start py-2 px-2 hover:bg-gray-100 rounded-md">
									{{ header.name }}
								</button>
							</li>
						</template>
					</ul>
				</div>
			</template>
		</UPopover>
	</ClientOnly>
</template>
