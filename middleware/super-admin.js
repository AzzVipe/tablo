export default defineNuxtRouteMiddleware(async () => {
	const { currentUser } = useAuth();

	if (!["superadmin"].includes(currentUser.value?.role?.toLowerCase())) {
		return navigateTo("/unauthorized");
	}
});
