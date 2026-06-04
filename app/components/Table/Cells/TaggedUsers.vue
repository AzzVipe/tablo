<template>
	<div class="flex justify-start items-center gap-1">
		<template v-for="(item, i) in contentWithUsers" :key="i">
			<div class="flex"></div>

			<UPopover class="inline-block">
				<UTooltip text="View user profile">
					<ImageWrapper
						:src="getValueByPath(item?.user, 'avatar')"
						:name="getValueByPath(item?.user, 'name')"
						styles="w-8 h-8 rounded-full object-cover text-white text-sm font-medium" />
				</UTooltip>

				<template #panel>
					<div class="flex items-center justify-center gap-4 p-4">
						<ImageWrapper
							:src="item?.user?.avatar"
							:name="item?.user?.name"
							styles="w-10 h-10 rounded-full object-cover text-white text-sm font-medium" />
						<div class="flex flex-col text-black">
							<h3 class="font-bold">
								{{ item?.user?.name }}
							</h3>
							<h4 class="text-sm text-gray-500">
								{{ item?.user?.email }}
							</h4>
						</div>
					</div>
				</template>
			</UPopover>
		</template>
	</div>
</template>

<script setup>
	const { content, header } = defineProps(["content", "header"]);
	const userStore = useUserStore();
	const isFetchingUsers = useState("isTaggedUserFetching", () => false);

	const findUser = (id) => {
		return userStore?.recordsData?.find((u) => u.id == id);
	};

	const contentWithUsers = computed(() =>
		content?.map((item) => ({
			...item,
			user: findUser(item.userId),
		}))
	);

	onMounted(() => {
		if (userStore.recordsDataLength <= 0 && !isFetchingUsers.value) {
			isFetchingUsers.value = true;
			userStore?.fetchData();
		} else if (
			userStore.recordsDataLength > 0 &&
			isFetchingUsers.value === false
		) {
			isFetchingUsers.value = true;
		}
	});
</script>
