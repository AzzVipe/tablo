<script setup>
	const isOpen = ref(false);

	const slideOverStyle = ref({
		background: "",
		wrapper: "!z-30 lg:hidden",
		overlay: { background: "bg-black/50 backdrop-blur-none" },
		width: "max-w-64",
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

			<USlideover v-model="isOpen" side="left" :ui="slideOverStyle">
				<div class="p-4 flex-1">
					<!-- Fallback focusable element -->
					<button
						type="button"
						@click="isOpen = false"
						class="sr-only focusable-close-button">
						Close Sidebar
					</button>
					<UiSidebar />
				</div>
			</USlideover>

			<UiSidebar :isDesktop="true" />
		</div>

		<div :style="{ background: 'var(--page-bg)', minHeight: '100vh' }">
			<main class="p-0 ml-[72px] max-lg:ml-0">
				<slot />
			</main>
		</div>

		<UNotifications />
	</div>
</template>
