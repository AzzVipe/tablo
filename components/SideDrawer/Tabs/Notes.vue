<script setup>
	import { useStore } from "~/stores/user";

	const toast = useToast();
	const userStore = useStore();

	const supportedExtensions = [
		"docx",
		"doc",
		"xls",
		"pdf",
		"xlsx",
		"pptx",
		"txt",
		"zip",
		"rar",
		"jpg",
		"jpeg",
		"png",
		"gif",
		"bmp",
		"tiff",
		"svg",
		"webp",
		"heic",
		"heif",
		"avif",
		"jxl",
	];

	const imageExtensions = [
		"jpg",
		"jpeg",
		"png",
		"gif",
		"bmp",
		"tiff",
		"svg",
		"webp",
		"heic",
		"heif",
		"avif",
		"jxl",
	];

	const icons = {
		pdf: "i-mdi-file-pdf-box",
		ppt: "i-mdi-file-powerpoint-box-outline",
		pptx: "i-mdi-file-powerpoint-box",
		doc: "i-mdi-file-word-box-outline",
		docx: "i-mdi-file-word-box",
		xls: "i-mdi-file-excel-box-outline",
		xlsx: "i-mdi-file-excel-box",
		txt: "i-mdi-file-document-outline",
		zip: "i-material-symbols-folder-zip-rounded",
		rar: "i-mdi-folder-zip",
		image: "i-mdi-file-image-box",
	};

	const { data, header, canEdit, store, composable } = defineProps([
		"data",
		"header",
		"canEdit",
		"store",
		"composable",
	]);

	const { activeTab } = composable();

	const canInsert = computed(() => header?.permissions?.insert === true);
	const hasAttach = computed(() => header?.attachment === true);

	const tableStore = store();

	const comment = ref("");
	const formRef = ref(null);
	const textareaRef = ref(null);
	const formToggle = ref(false);
	const noteToEdit = ref(null);
	const noteToDelete = ref(null);

	const notes = computed(() => tableStore.notes.get(data?.id));
	const parsedNotes = computed(() => {
		const rawNotes = notes.value ?? [];
		return rawNotes.map((note) => ({
			...note,
			tokens: tokenizeNote(note.content),
		}));
	});

	const originalAttachments = ref([]);

	const selectedAttachments = ref([]);
	const existingAttachments = ref([]);

	const showDeleteModal = ref(false);

	watch(comment, (newVal) => {
		if (newVal.trim() === "") {
			noteToEdit.value = null;
			originalAttachments.value = [];
			existingAttachments.value = [];
			if (!canInsert.value) {
				formToggle.value = false;
			}
		}
	});

	watch(activeTab, (newTab) => {
		if (newTab === "note") {
			nextTick(() => {
				setTimeout(() => {
					textareaRef.value?.focus();
				}, 50); // 50ms delay
			});
		}
	});

	const loadingState = ref(null);

	onMounted(async () => {
		userStore.fetchData();

		if (canInsert.value) formToggle.value = true;

		loadingState.value = "initial";

		await nextTick();

		textareaRef.value?.focus();

		try {
			await tableStore.fetchNotes(data?.id);
		} catch (err) {
		} finally {
			loadingState.value = null;
		}
	});

	const userMap = computed(() =>
		Object.fromEntries((userStore?.recordsData ?? []).map((u) => [u?.id, u]))
	);

	const sortByDate = (array) => {
		if (array)
			return array.sort(
				(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
			);
		return null;
	};

	const formatDate = (dateStr) => {
		const date = new Date(dateStr);

		const formattedDate = date
			.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			})
			.replace(",", ""); // Remove comma from date

		const formattedTime = date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});

		return `${formattedDate}, ${formattedTime}`;
	};

	const addNote = async (data) => {
		if (comment.value.length <= 4) return;

		try {
			if (noteToEdit.value) {
				loadingState.value = "updating";
				const updatedNote = { ...noteToEdit.value, content: comment.value };

				await tableStore.updateNote(data?.id, updatedNote);

				const deletedFiles = originalAttachments.value.filter(
					(file) => !existingAttachments.value.some((f) => f.id === file.id)
				);

				await Promise.all(
					deletedFiles.map((file) =>
						tableStore.deleteAttachment(noteToEdit.value.id, file.id)
					)
				);

				if (selectedAttachments.value.length) {
					// 🔥 ADD new attachments
					const existing =
						tableStore.attachments.get(noteToEdit.value.id) ?? [];
					tableStore.attachments.set(noteToEdit.value.id, [
						...existing,
						...selectedAttachments.value,
					]);
				}

				selectedAttachments.value = [];
				existingAttachments.value = []; // Reset after update
			} else {
				loadingState.value = "adding";

				const noteObj = {
					content: comment.value,
				};

				if (selectedAttachments.value.length) {
					noteObj._deferAdd = true;
				}

				const newNote = await tableStore.addNote(data?.id, noteObj);

				if (selectedAttachments.value.length) {
					tableStore.attachments.set(newNote.id, [
						...selectedAttachments.value,
					]);

					// Update store cache

					// Now push manually after upload is done
					const notesForid = tableStore.notes.get(data?.id) || [];
					notesForid.push(newNote);
					tableStore.notes.set(data?.id, notesForid);
				}
				selectedAttachments.value = [];
			}
		} catch (err) {
		} finally {
			if (!canInsert.value) {
				formToggle.value = false; // Close form after update
			}

			comment.value = "";
			noteToEdit.value = null;
			loadingState.value = null;
		}
	};

	const editNoteHandler = (note) => {
		formToggle.value = true;

		nextTick(async () => {
			noteToEdit.value = note;
			comment.value = note.content;

			if (hasAttach.value) {
				const fetched = tableStore.attachments.get(note.id) ?? [];
				existingAttachments.value = [...fetched]; // used in UI
				originalAttachments.value = [...fetched]; // immutable copy for comparison
			}

			formRef.value?.scrollIntoView({ behavior: "smooth" });
			textareaRef.value?.focus();
		});
	};

	const deleteNoteHandler = async (id, noteid) => {
		const noteElement = document.getElementById(`note-${noteid}`);
		if (noteElement) {
			noteElement.classList.add("opacity-0");

			// Step 1: Delete the note
			await tableStore.deleteNote(id, noteid);

			// Step 2: Get related attachments from noteAttachments ref
			const relatedFiles = tableStore.attachments.get(noteid) || [];

			// Step 3: Use store method to delete each attachment
			await Promise.all(
				relatedFiles.map((file) => tableStore.deleteAttachment(noteid, file.id))
			);

			// Step 4: Optionally remove the entire entry from attachments map
			tableStore.attachments.delete(noteid);

			// Reset state
			noteToDelete.value = null;
		}
	};

	const buttonText = computed(() => {
		if (loadingState.value === "updating") return "Updating...";
		if (loadingState.value === "adding") return "Adding...";
		return noteToEdit.value ? "Update" : "Add";
	});

	const handleFileSelection = (event) => {
		const files = Array.from(event.target.files);

		for (const file of files) {
			if (!selectedAttachments.value.some((f) => f.name === file.name)) {
				selectedAttachments.value.push(file);
			}
		}

		event.target.value = null;
	};

	const getFileIcon = (filename) => {
		const ext = filename.split(".").pop().toLowerCase();

		if (imageExtensions.includes(ext)) {
			return icons.image;
		}

		return icons[ext] || "i-mdi-file-question-box";
	};

	const getFileColor = (filename) => {
		const ext = filename.split(".").pop().toLowerCase();
		const colors = {
			doc: "text-blue-800",
			docx: "text-blue-800",
			xls: "text-green-800",
			pdf: "text-red-800",
			xlsx: "text-green-800",
			ppt: "text-orange-800",
			pptx: "text-orange-800",
			txt: "text-gray-500",
			zip: "text-yellow-500",
			rar: "text-yellow-500",
			image: "text-purple-800",
		};

		return imageExtensions.includes(ext)
			? colors.image
			: colors[ext] || "text-gray-500";
	};

	const isSupportedFile = (fileName) => {
		if (!fileName) return false;

		const extension = fileName.split(".").pop().toLowerCase();

		return supportedExtensions.includes(extension);
	};

	const previewLocal = (file) => {
		const fileURL = URL.createObjectURL(file);
		window.open(fileURL, "_blank");
	};

	const tokenizeNote = (content) => {
		const tokens = [];
		const regex = /\{\{(.*?)\}\}/g;
		let lastIndex = 0;
		let match;

		while ((match = regex.exec(content)) !== null) {
			if (match.index > lastIndex) {
				tokens.push({
					type: "text",
					value: content.slice(lastIndex, match.index),
				});
			}

			const mentionedId = match[1];
			if (mentionedId.startsWith("org-")) {
				tokens.push({ type: "org", id: mentionedId.split("org-")?.[1] });
			} else {
				tokens.push({ type: "user", id: mentionedId });
			}
			lastIndex = regex.lastIndex;
		}

		if (lastIndex < content.length) {
			tokens.push({ type: "text", value: content.slice(lastIndex) });
		}

		return tokens;
	};
</script>

<template>
	<section v-if="data" class="flex flex-col gap-8">
		<form
			v-if="formToggle === true"
			@submit.prevent="addNote(data)"
			class="flex flex-col gap-4"
			ref="formRef">
			<FormMentionable
				v-model="comment"
				mapValue="id"
				mapLabel="name"
				placeholder="Type @ to mention someone..."
				:items="userStore.recordsData ?? []">
				<template #dropdown-item="{ item, selectUser }">
					<div
						class="flex items-center gap-2 px-2 py-1 cursor-pointer rounded-md w-full"
						@click="selectUser(item)">
						<ImageWrapper
							:src="item.avatar"
							:name="item.name"
							styles="w-8 h-8 rounded-full object-cover text-white text-sm font-medium" />
						<div class="flex flex-col text-left">
							<span class="font-medium text-[var(--text-title)]">{{
								item.name
							}}</span>
							<span class="font-medium text-sm text-[var(--text-subtitle)]">
								{{ item.email }}</span
							>
						</div>
					</div>
				</template>
			</FormMentionable>

			<div v-show="hasAttach">
				<ul class="space-y-2" v-if="existingAttachments.length">
					<li
						v-for="(file, index) in existingAttachments"
						:key="file.id"
						class="flex items-center justify-between border p-2 rounded shadow-sm bg-white dark:bg-gray-800">
						<div class="flex items-center gap-1 max-w-xs truncate">
							<UIcon
								:name="getFileIcon(file.name)"
								:class="['w-5 h-5', getFileColor(file.name)]" />

							<span class="truncate text-gray-800 text-sm font-medium">
								{{ file.name }}
							</span>

							<span class="text-sm text-gray-500 font-medium">
								({{ formatSize(file.size) }})
							</span>
						</div>

						<UButton
							@click="existingAttachments.splice(index, 1)"
							icon="ic:outline-close"
							size="xs"
							color="primary"
							variant="ghost"
							:trailing="false" />
					</li>
				</ul>

				<ul class="space-y-2 mt-2" v-if="selectedAttachments.length">
					<li
						v-for="(file, index) in selectedAttachments"
						:key="file.name"
						class="flex items-center justify-between border px-3 py-2 rounded shadow-sm">
						<div class="flex items-center gap-1 max-w-xs truncate">
							<UIcon
								:name="getFileIcon(file.name)"
								:class="['w-5 h-5', getFileColor(file.name)]" />
							<button
								type="button"
								@click="previewLocal(file)"
								class="truncate text-[var(--text-title)] text-sm font-medium">
								{{ file.name }}
							</button>

							<span class="text-sm text-gray-500 font-medium">
								({{ formatSize(file.size) }})
							</span>
						</div>
						<UButton
							@click="selectedAttachments.splice(index, 1)"
							icon="ic:outline-close"
							size="xs"
							color="primary"
							variant="ghost"
							:trailing="false" />
					</li>
				</ul>
			</div>

			<div class="flex gap-4 items-center">
				<button
					type="submit"
					class="primary-button w-fit"
					:class="{ 'opacity-50 cursor-not-allowed': loadingState }"
					:disabled="loadingState">
					{{ buttonText }}
				</button>

				<label
					v-show="hasAttach"
					for="notes-attachment"
					class="secondary-button relative inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
					<UIcon name="ic:twotone-attach-file" class="w-5 h-5 text-primary" />
					<span class="select-none font-medium">Attach files</span>

					<input
						@change="handleFileSelection"
						id="notes-attachment"
						type="file"
						class="hidden"
						multiple />
				</label>
			</div>
		</form>

		<ul class="flex flex-col gap-4">
			<ModalsConfirmDelete
				v-model="showDeleteModal"
				@delete="deleteNoteHandler(data?.id, noteToDelete)"
				name="this note" />

			<SkeletonNotes v-show="loadingState === 'adding'" />

			<ul v-show="loadingState === 'initial'" class="flex flex-col gap-4">
				<SkeletonNotes />
				<SkeletonNotes />
				<SkeletonNotes />
			</ul>

			<li
				v-show="loadingState !== 'initial'"
				v-for="note in sortByDate(parsedNotes)"
				:key="note.id"
				:id="`note-${note.id}`"
				class="p-4 text-base border border-[var(--input-border)] rounded-lg shadow transition-opacity duration-300">
				<div class="flex justify-between items-center mb-4">
					<div class="flex items-center">
						<p class="inline-flex items-center mr-3 text-[var(--text-title)]">
							<img
								v-if="note?.createdBy.avatar"
								class="mr-2 w-6 h-6 rounded-full object-cover"
								:src="note?.createdBy.avatar"
								referrerPolicy="no-referrer"
								alt="User image" />
							<img
								v-else
								class="mr-2 w-6 h-6 rounded-full object-cover"
								src="~/assets/images/default-user.png"
								alt="Default user image" />
							<span v-if="note?.createdBy" class="whitespace-nowrap">
								{{ note?.createdBy?.name }}
							</span>
							<span v-else class="whitespace-nowrap">User</span>
						</p>
						<p class="text-sm text-[var(--text-description)]">
							<time pubdate datetime="2022-02-08" title="February 8th, 2022">
								{{ formatDate(note?.createdAt) }}
							</time>
						</p>
					</div>
					<TableMenu
						@update="editNoteHandler(note)"
						@delete="
							showDeleteModal = true;
							noteToDelete = note?.id;
						"
						:hasUpdate="header?.permissions?.write"
						:hasDelete="header?.permissions?.delete" />
				</div>

				<div class="flex items-start gap-2 text-[var(--text-description)]">
					<div class="whitespace-pre-wrap">
						<template v-for="(token, i) in note.tokens" :key="i">
							<span v-if="token.type === 'text'">{{ token.value }}</span>

							<UPopover v-else-if="token.type === 'user'" class="inline-block">
								<UTooltip text="View user profile">
									<span
										class="text-[var(--text-title)] font-medium cursor-pointer"
										>@{{ userMap[token.id]?.name }}</span
									>
								</UTooltip>

								<template #panel>
									<div class="flex items-center justify-center gap-4 p-4">
										<ImageWrapper
											:src="userMap[token.id]?.avatar"
											:name="userMap[token.id]?.name"
											styles="w-10 h-10 rounded-full object-cover text-white text-sm font-medium" />
										<div class="flex flex-col">
											<h3 class="font-bold">
												{{ userMap[token.id]?.name }}
											</h3>
											<h4 class="text-sm text-gray-500">
												{{ userMap[token.id]?.email }}
											</h4>
										</div>
									</div>
								</template>
							</UPopover>
						</template>
					</div>
				</div>

				<div
					v-if="tableStore.attachments.get(note.id)?.length && hasAttach"
					class="mt-3 flex flex-wrap gap-2">
					<div
						v-for="file in tableStore.attachments.get(note.id) || []"
						:key="file.id"
						class="flex items-center gap-2 border shadow-sm px-2 pr-4 py-1.5 rounded-full">
						<UIcon
							v-if="isSupportedFile(file.name)"
							:name="getFileIcon(file.name)"
							:class="['w-6 h-6', getFileColor(file.name)]" />

						<UIcon
							v-else
							name="i-heroicons-question-mark-circle-20-solid"
							class="w-6 h-6 text-red-500" />

						<div class="flex items-center gap-1">
							<button
								@click="previewLocal(file)"
								class="flex-1 font-medium text-xs text-gray-800 max-w-[14rem] truncate hover:text-[var(--text-title)]">
								{{ file.name }}
							</button>
							<span class="text-xs font-medium text-gray-700">
								({{ formatSize(file.size) }})
							</span>
						</div>
					</div>
				</div>
			</li>
		</ul>
	</section>
</template>
