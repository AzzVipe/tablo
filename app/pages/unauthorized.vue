<template>
	<section
		class="bg-white dark:bg-gray-900 h-screen flex justify-center items-center">
		<div class="p-4 max-w-screen-xl h-fit">
			<div class="mx-auto max-w-screen-sm text-center">
				<h1
					class="text-[150px] tracking-wider font-extrabold lg:text-[250px] text-primary-600 dark:text-primary-500">
					401
				</h1>
				<p
					class="mb-6 text-3xl tracking-tight font-bold text-gray-900 lg:text-6xl dark:text-white">
					Not Authorized.
				</p>
				<p class="mb-4 text-lg text-gray-500 dark:text-gray-400">
					Sorry, you are not authorized to view this page.
				</p>
				<UButton
					@click="loginPage"
					color="primary"
					variant="solid"
					label="Back to Login Page" />
			</div>
		</div>
	</section>
</template>

<script setup>
	const { currentUser } = useAuth();

	definePageMeta({
		layout: "blank",
	});

	const loginPage = async () => {
		if (currentUser) await currentUser.logOut();
		navigateTo("/");
	};
</script>

<style scoped></style>
