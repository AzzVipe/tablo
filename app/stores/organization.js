import { defineStore } from "pinia";

export const useOrganizationStore = defineStore("organizationStore", {
	state: () => ({
		recordsData: [],
		recordsDataLength: 0,

		pageCache: {},

		notes: new Map(),
		attachments: new Map(),

		totalPages: 0,
		currentPage: 1,
		pageStep: 20,

		selectedRecords: [],

		defaultSort: null,
		defaultMatch: null,

		isFetching: true,
		isAdding: false,

		activeRequest: null,
		currentController: null,

		colName: "organizations",
		apiPath: "/organizations",
		field: "organizations",
	}),

	getters: {
		data: (state) => state.recordsData,
	},

	actions: {
		// -------------------- Fetching Data --------------------
		async fetchData(match, sort, page) {
			const { __fetchData } = useAPIResource();
			return __fetchData(this, match, sort, page);
		},

		async searchData(searchToken, sort) {
			const { __searchData } = useAPIResource();
			return __searchData(this, searchToken, sort);
		},

		async fetchUniqueFieldValues(field) {
			const { __fetchUniqueFieldValues } = useAPIResource();
			return __fetchUniqueFieldValues(this, field);
		},

		async findRecords(match, sort, options) {
			const { __findRecords } = useAPIResource();
			return __findRecords(this, match, sort, options);
		},

		async findByField(field, value) {
			const { __findByField } = useAPIResource();
			return __findByField(this, field, value);
		},

		async findById(id) {
			const { __findById } = useAPIResource();
			return __findById(this, id);
		},

		async refreshRecord(id) {
			const { __refreshRecord } = useAPIResource();
			return __refreshRecord(this, id);
		},

		// -------------------- CRUD Operations --------------------
		async addRecord(data, assign_files, globalStore) {
			const { __addRecord } = useAPIResource();
			return __addRecord(this, data, assign_files, globalStore);
		},

		async updateRecord(id, changes, options) {
			const { __updateRecord } = useAPIResource();
			return __updateRecord(this, id, changes, options);
		},

		async updateRecordsMany(changes, tableState, options) {
			const { __updateRecordsMany } = useAPIResource();
			return __updateRecordsMany(this, changes, tableState, options);
		},

		async deleteRecord(id) {
			const { __deleteRecord } = useAPIResource();
			return __deleteRecord(this, id);
		},

		async deleteRecordsMany(match) {
			const { __deleteRecordsMany } = useAPIResource();
			__deleteRecordsMany(this, match);
		},

		// -------------------- Notes --------------------
		async fetchNotes(pid) {
			const { __fetchNotes } = useAPIResource();
			return __fetchNotes(this, pid);
		},

		async addNote(pid, newNote) {
			const { __addNote } = useAPIResource();
			return __addNote(this, pid, newNote);
		},

		async updateNote(pid, updatedNote) {
			const { __updateNote } = useAPIResource();
			return __updateNote(this, pid, updatedNote);
		},

		async deleteNote(pid, noteId) {
			const { __deleteNote } = useAPIResource();
			return __deleteNote(this, pid, noteId);
		},

		// -------------------- Attachments(Notes) --------------------
		async fetchAttachments(noteId, force = false) {
			const { __fetchAttachments } = useAPIResource();
			return __fetchAttachments(this, noteId, force);
		},

		async deleteAttachment(noteId, fileId) {
			const { __deleteAttachment } = useAPIResource();
			return __deleteAttachment(this, noteId, fileId);
		},
	},
});
