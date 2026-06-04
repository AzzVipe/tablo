export const useGlobalStore = () => {
	return {
		users: { currentRecord: useUser, store: useUserStore },
		tasks: { currentRecord: useTask, store: useTaskStore },
		projects: { currentRecord: useProject, store: useProjectStore },
		organizations: {
			currentRecord: useOrganization,
			store: useOrganizationStore,
		},
	};
};
