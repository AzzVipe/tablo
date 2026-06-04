import { __assertBaseContext } from "./helpers";

export async function __fetchNotes(context, recordid) {
	try {
		const { crud } = useApi();

		const res = await crud({
			apiPath: `/notes`,
			query: { recordId: recordid },
		});
		const notes = res?.notes ?? [];
		context.notes.set(recordid, notes);

		return notes;
	} catch (err) {
		console.error("[useAPIResource] Failed to fetch notes:", err);

		throw err;
	}
}

export async function __addNote(context, recordid, noteObj) {
	const { crud } = useApi();

	const res = await crud({
		method: "POST",
		apiPath: `/notes`,
		body: {
			content: noteObj.content,
			recordId: recordid,
			recordType: context.field,
		},
	});
	const existing = context.notes.get(recordid) ?? [];
	context.notes.set(recordid, [res, ...existing]);
	return res;
}

export async function __updateNote(context, recordid, updatedNote) {
	const { crud } = useApi();

	const res = await crud({
		method: "PATCH",
		apiPath: `/notes/${updatedNote.id}`,
		body: { content: updatedNote.content },
	});
	const existing = context.notes.get(recordid) ?? [];
	context.notes.set(
		recordid,
		existing.map((n) => (n.id === updatedNote.id ? { ...n, ...res } : n))
	);
}

export async function __deleteNote(context, recordid, noteid) {
	const { crud } = useApi();

	await crud({ method: "DELETE", apiPath: `/notes/${noteid}` });
	const existing = context.notes.get(recordid) ?? [];
	context.notes.set(
		recordid,
		existing.filter((n) => n.id !== noteid)
	);
}

// -------------------- Attachments(NOTES) --------------------
export async function __fetchAttachments(context, noteId, force) {
	return context.attachments.get(noteId) ?? [];
}

export async function __deleteAttachment(context, noteId, fileId) {
	if (context.attachments.has(noteId)) {
		const updated = context.attachments
			.get(noteId)
			.filter((f) => f.name !== fileId);
		context.attachments.set(noteId, updated);
	}
}
