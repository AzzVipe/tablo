<script setup>
	const { currentUser } = useAuth();

	const newRecord = ref(null);
	const assign_files = ref(null);
	const addModalOpen = ref(false);

	const emit = defineEmits(["addRecord"]);

	const { modalId, headers, useStore, btnStyle, modalTitle } = defineProps([
		"modalId",
		"btnStyle",
		"modalTitle",
		"headers",
		"useStore",
	]);

	const store = useStore();

	const parseDynamicDefaultValue = (value, type) => {
		if (type !== "date" || typeof value !== "string") return value;

		const now = new Date();

		if (value.trim().toLowerCase() === "now") {
			return now.toISOString().split("T")[0]; // yyyy-mm-dd
		}

		const regex = /^now\s*([+-])\s*(\d+)([dmy])$/i;
		const match = value.match(regex);

		if (match) {
			const [, operator, amountStr, unit] = match;
			const amount = parseInt(amountStr, 10);
			if (isNaN(amount)) return now;

			switch (unit.toLowerCase()) {
				case "d":
					now.setDate(now.getDate() + (operator === "+" ? amount : -amount));
					break;
				case "m":
					now.setMonth(now.getMonth() + (operator === "+" ? amount : -amount));
					break;
				case "y":
					now.setFullYear(
						now.getFullYear() + (operator === "+" ? amount : -amount)
					);
					break;
			}
			return now.toISOString().split("T")[0];
		}

		return value;
	};

	const initNewRecord = () => {
		newRecord.value = {};

		headers?.forEach((header) => {
			if (header.type === "image") {
				header.default = true;
			}

			const path = header.assign_data_path || getPathFromHeader(header);

			if ("default_value" in header) {
				const evaluatedDefault = parseDynamicDefaultValue(
					header.default_value,
					header.type
				);
				setValueByPath(newRecord.value, path, evaluatedDefault);
			}
		});

		assign_files.value = null;
	};

	initNewRecord();

	const addNewRecord = async () => {
		if (modalId === "AddRecord") store.isAdding = true;

		await headers?.forEach(async (header) => {
			if (!header.creatable && !header.add_value_same_as) return;

			const path = header.assign_data_path || getPathFromHeader(header);

			if (header.type === "file") {
				const files = document.getElementById(`add-file-${path}`)?.files;
				if (files.length > 0) {
					assign_files.value = files;
				}
			}

			if (
				header.creatable &&
				isNullOrUndefinedOrEmpty(getValueByPath(newRecord.value, path))
			) {
				console.log(path, "EMPTY");
				return;
			}

			switch (header.type) {
				case "date":
					const dateValue = getValueByPath(newRecord.value, path);

					if (isNullOrUndefinedOrEmpty(dateValue) || dateValue instanceof Date)
						break;
					else if (typeof dateValue === "string") {
						const d = new Date(dateValue.trim());

						if (!isNaN(d.getTime())) setValueByPath(newRecord.value, path, d);
					}

					break;

				case "pipeline":
					let pipeline = {
						stages: [],
						current_stage: 0,
						assignee: "",
						owner: "",
						notes: [],
					};

					header.stages?.forEach((item) => {
						pipeline.stages.push({
							name: item,
							date: null,
							description: "",
							comment: "",
						});
					});

					pipeline.stages[0].date = new Date();
					setValueByPath(newRecord.value, path, pipeline);

					break;
			}

			if (header.combine) {
				if (!getValueByPath(newRecord.value, path)) {
					setValueByPath(newRecord.value, path, "");
				}

				const combinedValue = header.combine
					.reduce(
						(result, item) =>
							result.concat(" ", getValueByPath(newRecord.value, item)),
						""
					)
					.trim();

				setValueByPath(newRecord.value, path, combinedValue);
			}

			if (header.add_value_same_as) {
				const d = getValueByPath(newRecord.value, header.add_value_same_as);

				setValueByPath(newRecord.value, path, d);
			}
		});

		newRecord.value.created_at = new Date();
		newRecord.value.created_by = currentUser?.id;

		emit("addRecord", {
			data: newRecord.value,
			assign_files: assign_files.value,
		});

		initNewRecord();

		addModalOpen.value = false;
	};

	const defaultActStyles =
		"!border-[var(--input-focus-border)] !shadow !shadow-[var(--orange-shadow)]";

	const filteredHeaders = computed(() =>
		headers.filter((h) => {
			if (!h.creatable) return false;

			if (!h.show_in) return true; // backward compatible

			if (typeof h.show_in === "string") return h.show_in === modalId;

			return Array.isArray(h.show_in) && h.show_in.includes(modalId);
		})
	);

	const handleAddFields = (set = {}) => {
		newRecord.value = { ...newRecord.value, ...set };
	};
</script>

<template>
	<div>
		<button
			@click="addModalOpen = true"
			:class="[
				btnStyle ? btnStyle : 'secondary-button',
				addModalOpen ? defaultActStyles : '',
			]">
			<UIcon name="ic:round-plus" class="w-5 h-5" />
			<span class="max-sm:hidden">New</span>
		</button>
		<UModal
			v-model="addModalOpen"
			:ui="{
				width: 'w-full !max-w-4xl',
				overlay: { background: 'bg-black/50' },
			}">
			<!-- Modal content -->
			<div
				id="addRecordModal"
				class="relative p-4 rounded-lg shadow sm:p-5 text-white">
				<!-- Modal header -->
				<div class="flex justify-between items-center pb-4 mb-4 rounded-t">
					<h3 class="text-xl font-semibold text-[var(--text-title)]">
						{{ modalTitle ? modalTitle : "New Record" }}
					</h3>
					<button
						@click="addModalOpen = false"
						type="button"
						class="ghost-button-sm !p-1">
						<UIcon name="ic:round-close" class="w-5 h-5" />
						<span class="sr-only">Close modal</span>
					</button>
				</div>
				<!-- Modal body -->
				<form
					v-auto-focus
					autocomplete="off"
					@keypress.enter.prevent
					@submit.prevent="addNewRecord()">
					<div
						class="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mb-8">
						<template v-for="(header, index) in filteredHeaders" :key="index">
							<FormFields
								@update="handleAddFields($event)"
								:header="header"
								:data="newRecord"
								:config="{
									operationType: 'add',
									chipAutoEdit: false,
								}" />
						</template>
					</div>
					<button class="primary-button">Add record</button>
				</form>
			</div>
			<!-- </div>
		</div> -->
		</UModal>
	</div>
</template>
