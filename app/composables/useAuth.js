/*
	SUPERADMIN_USER = {
		"id": "user_2",
		"name": "Jonas Kahnwald",
		"email": "jonas@example.com",
		"role": "superadmin",
		"avatar": "https://i.pravatar.cc/150?u=jonas@example.com",
		"organization": "org_1",
		"department": "Product",
		"joinedAt": "2023-11-10T09:00:00Z"
	},

	ADMIN_USER = {
		"id": "user_7",
		"name": "Debra Morgan",
		"email": "morgan@example.com",
		"role": "admin",
		"avatar": "https://i.pravatar.cc/150?u=morgan@example.com",
		"organization": "org_1",
		"department": "Product",
		"joinedAt": "2023-10-01T09:00:00Z"
	},

	TEAM_USER = {
		"id": "user_4",
		"name": "Lila West",
		"email": "lila@example.com",
		"role": "team",
		"avatar": "https://i.pravatar.cc/150?u=lila@example.com",
		"organization": "org_1",
		"department": "Engineering",
		"joinedAt": "2024-06-01T09:00:00Z"
	},
*/

export const useAuth = () => {
	// Hardcoded demo user — matches user_1 in db.json
	// Change this to any user id/role from your db.json to test different roles
	const DEMO_USER = {
		id: "user_2",
		name: "Jonas Kahnwald",
		email: "jonas@example.com",
		role: "superadmin",
		avatar: "https://i.pravatar.cc/150?u=jonas@example.com",
		organization: "org_1",
		department: "Product",
		joinedAt: "2023-11-10T09:00:00Z",
	};

	const currentUser = useState("currentUser", () => DEMO_USER);
	const pending = useState("authPending", () => false);
	const sessionToken = useState("sessionToken", () => "demo-token");

	// No-op — user is already "fetched"
	const getCurrentUser = async () => {
		console.log("getCurrentUser called");

		currentUser.value = DEMO_USER;
		pending.value = false;
		const { setPages } = usePages();
		setPages();
	};

	const logOut = async () => {
		navigateTo("/");
	};

	const setSessionToken = () => true;

	const isCurrentUserClient = () => false;

	const isCurrentUserAdmin = () =>
		["admin", "superadmin"].includes(currentUser.value?.role);

	const isCurrentUserSuperAdmin = () =>
		currentUser.value?.role === "superadmin";

	return {
		currentUser,
		pending,
		sessionToken,
		getCurrentUser,
		logOut,
		setSessionToken,
		isCurrentUserClient,
		isCurrentUserAdmin,
		isCurrentUserSuperAdmin,
	};
};
