import * as __userStore from "~/stores/user";
import * as __taskStore from "~/stores/task";
import * as __projectStore from "~/stores/project";
import * as __organizationStore from "~/stores/organization";

export const useGlobalStore = () => {
	const userStore = __userStore;
	const taskStore = __taskStore;
	const projectStore = __projectStore;
	const organizationStore = __organizationStore;

	return {
		userStore,
		taskStore,
		projectStore,
		organizationStore,

		users: { currentRecord: useUser, store: userStore },
		tasks: { currentRecord: useTask, store: taskStore },
		projects: { currentRecord: useProject, store: projectStore },
		organizations: {
			currentRecord: useOrganization,
			store: organizationStore,
		},
	};
};
