export default defineNuxtRouteMiddleware(async () => {
	const { currentUser } = useAuth();

	if (
		!["admin", "superadmin"].includes(currentUser.value?.role?.toLowerCase())
	) {
		return navigateTo("/unauthorized");
	}
});
