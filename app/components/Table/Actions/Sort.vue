<script setup>
	const { data, tableConfig } = defineProps(["data", "tableConfig"]);

	const emit = defineEmits(["sortData"]);

	const isPopoverOpen = ref(false);

	const sortObject = ref({});

	onBeforeMount(() => {
		tableConfig.headers.forEach((header) => {
			const path = getPathFromHeader(header);

			if (data?.hasOwnProperty(path)) sortObject.value[path] = data[path];
			else sortObject.value[path] = 1;
		});
	});

	const sortHandler = (header) => {
		let obj = {};

		const path = getPathFromHeader(header);

		obj[path] = Number(sortObject.value[path]);

		emit("sortData", obj);
	};
</script>

<template>
	<ClientOnly>
		<template #fallback>
			<SkeletonDropBtn />
		</template>

		<UPopover v-model:open="isPopoverOpen" :ui="{ base: 'overflow-visible' }">
			<UButton
				color="secondary"
				variant="outline"
				label="Sort"
				icon="ic:round-swap-vert" />

			<template #content>
				<div class="divide-y divide-gray-100">
					<ul class="px-3 py-2 text-sm flex flex-col gap-1">
						<template v-for="(header, i) in tableConfig.headers" :key="i">
							<li
								v-if="header.is_visible && header.sort"
								class="flex items-center gap-2">
								<span
									class="w-full py-2 text-start text-nowrap text-[var(--text-subtitle)]"
									>{{ header.name }}:
								</span>

								<TableActionsSelectMenu
									v-if="header.type === 'text' || header.type === 'email'"
									@change="sortHandler(header)"
									:options="[
										{ label: 'A &rarr; Z', value: 1 },
										{ label: 'Z &rarr; A', value: -1 },
									]"
									v-model="sortObject[getPathFromHeader(header)]"
									placeholder="sort"
									optAttr="label"
									valAttr="value" />

								<TableActionsSelectMenu
									v-if="header.type === 'tel' || header.type === 'number'"
									@change="sortHandler(header)"
									:options="[
										{ label: 'Lowest to Highest', value: 1 },
										{ label: 'Highest to Lowest', value: -1 },
									]"
									v-model="sortObject[getPathFromHeader(header)]"
									placeholder="sort"
									optAttr="label"
									valAttr="value" />

								<TableActionsSelectMenu
									v-if="header.type === 'date'"
									@change="sortHandler(header)"
									:options="[
										{ label: 'Oldest to Newest', value: 1 },
										{ label: 'Newest to Oldest', value: -1 },
									]"
									v-model="sortObject[getPathFromHeader(header)]"
									placeholder="sort"
									optAttr="label"
									valAttr="value" />
							</li>
						</template>
					</ul>
				</div>
			</template>
		</UPopover>
	</ClientOnly>
</template>
