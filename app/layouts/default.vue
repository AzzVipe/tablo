<script setup>
	const isOpen = ref(false);

	const slideOverStyle = ref({
		content: "!z-30 lg:hidden !w-64 !h-screen",
		overlay: "bg-black/50 backdrop-blur-none",
	});
</script>

<template>
	<div>
		<div class="relative">
			<button
				@click="isOpen = true"
				type="button"
				class="secondary-button-outline lg:!hidden !absolute top-2 left-2">
				<UIcon name="ic:round-notes" class="w-5 h-5" />
			</button>

			<USlideover v-model:open="isOpen" side="left" :ui="slideOverStyle">
				<template #content>
					<UiSidebar />
				</template>
			</USlideover>

			<UiSidebar :isDesktop="true" />
		</div>

		<div :style="{ background: 'var(--page-bg)', minHeight: '100vh' }">
			<main class="p-0 ml-[72px] max-lg:ml-0">
				<slot />
			</main>
		</div>
	</div>
</template>
