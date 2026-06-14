<script setup>
	const { tableConfig } = defineProps({
		tableConfig: {
			type: Object,
			required: true,
		},
	});
	const { currRecord } = tableConfig.currentRecord();
</script>

<template>
	<SideDrawer :tableConfig="tableConfig">
		<template #header>
			<header class="flex flex-col bg-[var(--page-bg)] px-5 py-6 max-xl:p-4">
				<div class="flex items-center gap-6 text-[var(--text-description)]">
					<div class="relative">
						<ImageWrapper
							:src="currRecord.avatar"
							:name="currRecord.title"
							styles="w-20 h-20 rounded-full object-cover text-2xl font-bold" />
					</div>
					<div class="flex flex-col gap-2">
						<h1 class="font-medium text-[var(--text-title)]">
							{{ currRecord?.title }}
						</h1>
						<UButton
							:to="`/projects/${currRecord.id}`"
							target="_blank"
							icon="ic:outline-open-in-new"
							color="secondary"
							variant="outline"
							size="sm"
							label="Open in new tab"
							class="rounded-full" />
					</div>
				</div>
			</header>
		</template>
	</SideDrawer>
</template>
