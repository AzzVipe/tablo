<script setup>
	const { currentUser, logOut, isCurrentUserClient } = useAuth();
	const { currentPage, pages } = usePages();

	const sidebarOpen = ref(false);

	const { isDesktop } = defineProps(["isDesktop"]);

	const isExpanded = computed(() => sidebarOpen.value || !isDesktop);

	const handlePageChange = (page) => {
		setTimeout(() => {
			navigateTo({ path: page.to, query: { page: 1 } });
		}, 1);
	};
</script>

<template>
	<ClientOnly>
		<template #fallback>
			<div
				class="z-[100] bg-[var(--sidebar-bg)] border-[var(--sidebar-border)] fixed top-0 left-0 px-2 h-screen text-white flex flex-col shadow-md overflow-hidden transition-all duration-200 ease-in-out w-[4.5rem] animate-pulse" />
		</template>

		<div
			class="z-[100] bg-[var(--sidebar-bg)] border-[var(--sidebar-border)] fixed top-0 left-0 px-2 h-screen text-white flex flex-col shadow-md overflow-hidden transition-all duration-200 ease-in-out"
			:class="{
				'w-64': isExpanded,
				'w-[4.5rem]': !isExpanded,
				'max-lg:hidden': isDesktop,
			}"
			@mouseenter="isDesktop && (sidebarOpen = true)"
			@mouseleave="isDesktop && (sidebarOpen = false)">
			<!-- Header Section -->
			<div
				class="flex items-center justify-center border-b border-[var(--sidebar-border)] py-4 px-3">
				<NuxtLink to="/">
					<UiLogo :size="44" :showName="isExpanded" />
				</NuxtLink>
			</div>

			<!-- Menu Section -->
			<ul
				class="py-2 flex-1 transition-all duration-200 overflow-hidden"
				:class="{
					'overflow-y-auto max-h-[calc(100vh-100px)]': isExpanded,
					'overflow-hidden': !isExpanded,
				}">
				<template v-for="page in pages" :key="page.to">
					<li v-if="page.children">
						<div
							class="flex items-center px-4 py-3 my-2 rounded-full transition-all cursor-pointer w-full text-white hover:bg-[var(--sidebar-hover)]"
							:class="{
								'primary-gradient-tr-to-bl transition-all':
									currentPage?.includes(page.to),
							}">
							<UIcon :name="page.icon" class="text-gray-50 w-6 h-6" />
							<span
								v-show="isExpanded"
								class="ml-4 text-base font-medium absolute left-12 animate-fade-in duration-300 text-nowrap">
								{{ page.name }}
							</span>
						</div>
						<ul v-if="isExpanded" class="ml-4 border-gray-600">
							<li v-for="child in page.children" :key="child.to">
								<NuxtLink
									@click="handlePageChange(child)"
									:to="{ path: child.to, query: { page: 1 } }"
									class="flex items-center px-4 py-3 my-2 rounded-full transition-all cursor-pointer w-full text-white hover:bg-[var(--sidebar-hover)]"
									:class="{
										'primary-gradient-tr-to-bl transition-all':
											currentPage?.includes(child.to),
									}">
									<UIcon :name="child.icon" class="text-gray-50 w-5 h-5" />
									<span
										v-show="isExpanded"
										class="ml-6 text-base font-medium absolute left-12 animate-fade-in duration-300 text-nowrap">
										{{ child.name }}
									</span>
								</NuxtLink>
							</li>
						</ul>
					</li>

					<li v-else>
						<NuxtLink
							@click="handlePageChange(page)"
							:to="
								page.pagination === false
									? { path: page.to }
									: { path: page.to, query: { page: 1 } }
							"
							class="flex items-center px-4 py-3 my-2 rounded-full transition-all cursor-pointer w-full text-white hover:bg-[var(--sidebar-hover)]"
							:class="{
								'primary-gradient-tr-to-bl transition-all':
									currentPage?.includes(page.to),
							}">
							<div class="flex items-center space-x-4">
								<UIcon
									:name="page.icon"
									class="text-gray-50 w-6 h-6 shrink-0" />
								<span
									v-show="isExpanded"
									class="text-base font-medium animate-fade-in duration-300 text-nowrap">
									{{ page.name }}
								</span>
							</div>
						</NuxtLink>
					</li>
				</template>
			</ul>

			<!-- Footer Section -->
			<div
				v-if="currentUser"
				class="flex flex-col justify-center items-center my-2 bg-[var(--sidebar-hover)] rounded-lg">
				<UBadge
					color="gray"
					variant="ghost"
					class="flex w-full items-center justify-center gap-2 relative h-12">
					<ImageWrapper
						:src="currentUser.avatar"
						:name="currentUser.name"
						styles="w-8 h-8 rounded-full object-cover text-white text-sm font-medium flex-shrink-0" />
					<div
						v-if="isExpanded"
						class="whitespace-nowrap overflow-hidden left-14">
						<p class="font-medium capitalize text-[var(--text-title)]">
							{{ currentUser.name }}
						</p>
						<p class="text-sm text-[var(--text-subtitle)] truncate">
							{{ currentUser.email }}
						</p>
					</div>
				</UBadge>
				<div class="w-full py-2" :class="{ 'px-2': isExpanded }">
					<UButton
						@click="logOut"
						color="gray"
						variant="outline"
						class="flex w-full items-center relative">
						<UIcon
							name="ic:baseline-power-settings-new"
							class="size-6 ml-1.5" />
						<span
							v-if="isExpanded"
							class="whitespace-nowrap overflow-hidden absolute left-14">
							Sign Out
						</span>
					</UButton>
				</div>
			</div>
		</div>
	</ClientOnly>
</template>

<style scoped>
	.nav-item:hover {
		background: var(--sidebar-hover);
	}
</style>
