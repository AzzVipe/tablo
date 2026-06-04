/**
 * permissions.js
 * Utilities for resolving and applying role-based field permissions.
 *
 * Works with the `roles` array defined in each table_configs/*.json file.
 * At mount time, `setTableRules` stamps permissions onto every header object
 * so components can read `header.permissions.read/write` directly without
 * re-checking the role config every render.
 */

/**
 * Looks up the permissions for a specific field path from the table config's
 * current user role. Returns a permissions object with read, write, insert,
 * and delete flags.
 *
 * If the role defines per-field permissions under `role.headers[path]`,
 * those take precedence. Otherwise the role's top-level permissions apply.
 *
 * @param {string} path - The dot-notation field path (from getPathFromHeader)
 * @param {Object} tableConfig - The table config object with user_role stamped in
 * @returns {{ read: boolean, write: boolean, insert: boolean, delete: boolean }}
 *
 * @example
 * findFieldPermissions("title", tableConfig)
 * // → { read: true, write: true, insert: true, delete: false }
 */
export const findFieldPermissions = (path, tableConfig) => {
	const userRole = tableConfig?.user_role || {};
	const permissions = userRole.headers?.[path];
	const source = typeof permissions === "object" ? permissions : userRole;

	// insert inherits from write if not explicitly set
	let insert = !!source.insert;
	if (source.write) insert = true;

	return {
		read: !!source?.read,
		write: !!source?.write,
		insert,
		delete: !!source?.delete,
	};
};

/**
 * Stamps role-based permissions onto every header in the table config.
 * Called once at mount in Records/Wrapper.vue.
 *
 * For each header:
 * - Resolves the user's role from the roles array
 * - Looks up field-level permissions via findFieldPermissions
 * - Sets header.permissions, header.is_visible, header.is_update
 * - Sets tableConfig.read / tableConfig.write based on field permissions
 * - Also applies permissions to tab_headers (side drawer tabs)
 *
 * Mutates the tableConfig object directly — this is intentional since
 * tableConfig is a shared reactive object passed down through the component tree.
 *
 * @param {Object} tableConfig - The full table config object
 * @param {Array} roles - The roles array from the table config JSON
 */
export const setTableRules = (tableConfig, roles) => {
	const { currentUser } = useAuth();

	// Resolve and stamp the user's role object onto tableConfig
	if (isNullOrUndefinedOrEmpty(tableConfig.user_role)) {
		tableConfig.user_role = roles.find(
			(item) =>
				item.name.toLowerCase() === currentUser.value?.role?.toLowerCase()
		);
	}

	// Apply permissions to each column header
	tableConfig?.headers?.forEach((header) => {
		const perm = findFieldPermissions(getPathFromHeader(header), tableConfig);
		header.permissions = perm;

		if (header.is_visible === true && perm?.read === false) {
			header.is_visible = false;
		}
		if (header.is_update === true && perm?.write === false) {
			header.is_update = false;
		}

		// Escalate table-level read/write if any field has access
		if (perm?.read === true && tableConfig.read === false)
			tableConfig.read = true;
		if (perm?.write === true && tableConfig.write === false)
			tableConfig.write = true;
	});

	// Apply permissions to side drawer tab headers
	for (const key in tableConfig.tab_headers) {
		tableConfig.tab_headers[key].read = false;
		tableConfig.tab_headers[key].write = false;

		// Single header tab (e.g. detail, chip, pipeline)
		const singleHeader = tableConfig?.tab_headers[key]?.header;
		if (singleHeader) {
			const perm = findFieldPermissions(
				getPathFromHeader(singleHeader),
				tableConfig
			);
			singleHeader.permissions = perm;

			if (singleHeader.is_visible === true && perm?.read === false) {
				singleHeader.is_visible = false;
			}
			if (singleHeader.is_update === true && perm?.write === false) {
				singleHeader.is_update = false;
			}
			if (singleHeader.is_visible === true)
				tableConfig.tab_headers[key].read = true;
			if (singleHeader.is_update === true)
				tableConfig.tab_headers[key].write = true;
		}

		// Multi-header tab (e.g. details with multiple fields)
		tableConfig?.tab_headers[key]?.headers?.forEach((header) => {
			const perm = findFieldPermissions(getPathFromHeader(header), tableConfig);
			header.permissions = perm;

			if (header.is_visible === true && perm?.read === false) {
				header.is_visible = false;
			}
			if (header.is_update === true && perm?.write === false) {
				header.is_update = false;
			}
			if (header.is_visible === true) tableConfig.tab_headers[key].read = true;
			if (header.is_update === true) tableConfig.tab_headers[key].write = true;
		});
	}
};
