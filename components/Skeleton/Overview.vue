<script setup>
	const ui = {
		background: "bg-gray-200",
	};
</script>

<template>
	<div class="flex flex-col gap-4 p-4">
		<div class="flex flex-col gap-4">
			<div
				class="flex max-xl:flex-col-reverse gap-4 max-xl:gap-8 justify-between items-start rounded-lg p-4 shadow">
				<div class="grid grid-cols-2 max-md:grid-cols-1 gap-x-8 gap-y-2">
					<USkeleton v-for="n in 9" :key="n" class="h-6 w-80" :ui="ui" />
				</div>

				<div class="flex gap-4">
					<div
						v-for="n in 2"
						:key="n"
						class="flex flex-col gap-2 items-center justify-center text-sm">
						<USkeleton
							class="h-24 w-24"
							:ui="{
								rounded: 'rounded-full',
								...ui,
							}" />
						<USkeleton :key="n" class="h-4 w-20" :ui="ui" />
						<USkeleton :key="n" class="h-4 w-28" :ui="ui" />
					</div>
				</div>
			</div>

			<div
				class="flex flex-wrap px-4 items-center gap-8 max-md:gap-4 border-y shadow-sm py-2">
				<USkeleton class="h-8 w-32" :ui="ui" />
				<USkeleton class="h-8 w-36" :ui="ui" />
				<USkeleton class="h-8 w-40" :ui="ui" />
				<USkeleton class="h-8 w-24" :ui="ui" />
			</div>

			<div class="flex flex-col gap-4 px-4">
				<USkeleton class="h-6 w-24" :ui="ui" />
				<USkeleton class="h-24 w-36" :ui="ui" />

				<div v-for="n in 3" :key="n" class="flex flex-col gap-4">
					<USkeleton class="h-6 w-32" :ui="ui" />
					<USkeleton class="h-6 w-48" :ui="ui" />
				</div>
			</div>
		</div>
	</div>
</template>
