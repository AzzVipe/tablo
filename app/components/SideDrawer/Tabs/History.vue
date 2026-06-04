<script setup>
	const props = defineProps({
		record: { type: Object, required: true },
		config: { type: Object, default: () => ({}) },
	});

	// ---- Local state ----
	const history = ref([]);
	const isLoading = ref(false);
	const error = ref(null);

	// ---- Fetch history for this record ----
	const fetchHistory = async () => {
		if (!props.record?.id) return;

		isLoading.value = true;
		error.value = null;

		try {
			const { crud } = useApi();
			const res = await crud({
				apiPath: "/history",
				query: {
					recordId: props.record.id,
					sort: "-createdAt",
				},
			});

			// json-server returns array directly for simple queries
			history.value = Array.isArray(res) ? res : res?.history ?? [];
		} catch (err) {
			console.error("[History] Failed to fetch:", err);
			error.value = "Failed to load history.";
		} finally {
			isLoading.value = false;
		}
	};

	onMounted(fetchHistory);

	// Refetch if the record changes (e.g. navigating between drawer records)
	watch(() => props.record?.id, fetchHistory);

	// ---- Helpers ----

	/**
	 * Formats a field name from dot-notation or camelCase into readable text.
	 * "assignedTo" → "Assigned To"
	 * "project.title" → "Project Title"
	 */
	const formatFieldName = (field) => {
		if (!field) return "Unknown field";
		return field
			.split(".")
			.map((part) =>
				part
					.replace(/([A-Z])/g, " $1")
					.replace(/^./, (s) => s.toUpperCase())
					.trim()
			)
			.join(" › ");
	};

	/**
	 * Formats a raw value for display.
	 * Arrays are joined, objects show their name/title, primitives are stringified.
	 */
	const formatValue = (value) => {
		if (value === null || value === undefined) return "—";
		if (Array.isArray(value)) {
			if (value.length === 0) return "—";
			return value
				.map((v) =>
					typeof v === "object"
						? v?.name ?? v?.title ?? JSON.stringify(v)
						: String(v)
				)
				.join(", ");
		}
		if (typeof value === "object") {
			return value?.name ?? value?.title ?? value?.id ?? JSON.stringify(value);
		}
		return String(value);
	};

	/**
	 * Returns a human-readable sentence describing what changed.
	 * e.g. "Changed priority from Low to High"
	 */
	const describeChange = (entry) => {
		const field = formatFieldName(entry.field);
		const from = formatValue(entry.from);
		const to = formatValue(entry.to);

		if (!entry.from && entry.from !== 0) {
			return { field, action: "Set", from: null, to };
		}
		return { field, action: "Changed", from, to };
	};

	// ---- Sorted history — most recent first ----
	const sortedHistory = computed(() =>
		[...history.value].sort(
			(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
		)
	);

	// ---- Created entry — always shown at the bottom ----
	const createdEntry = computed(() => ({
		id: "created",
		createdBy: props.record?.createdBy ?? null,
		createdAt: props.record?.createdAt ?? null,
		field: null,
		from: null,
		to: null,
	}));
</script>

<template>
	<div class="flex flex-col h-full">
		<!-- Loading -->
		<div v-if="isLoading" class="flex flex-col gap-3 p-4">
			<div
				v-for="i in 4"
				:key="i"
				class="flex gap-3 animate-pulse"
				:style="{ opacity: 1 - i * 0.15 }">
				<div
					class="w-8 h-8 rounded-full bg-[var(--table-skeleton)] flex-shrink-0 mt-0.5" />
				<div class="flex-1 flex flex-col gap-2">
					<div class="h-3 rounded-full bg-[var(--table-skeleton)] w-3/4" />
					<div class="h-2.5 rounded-full bg-[var(--table-skeleton)] w-1/2" />
				</div>
			</div>
		</div>

		<!-- Error -->
		<div
			v-else-if="error"
			class="flex flex-col items-center justify-center gap-2 p-8 text-center">
			<UIcon
				name="ic:round-error-outline"
				class="w-8 h-8 text-[var(--btn-danger-text)]" />
			<p class="text-sm text-[var(--stone-300)]">{{ error }}</p>
			<button class="ghost-button-sm" @click="fetchHistory">Try again</button>
		</div>

		<!-- Empty -->
		<div
			v-else-if="!sortedHistory.length && !createdEntry.createdAt"
			class="flex flex-col items-center justify-center gap-2 p-8 text-center">
			<UIcon name="ic:round-history" class="w-8 h-8 text-[var(--stone-300)]" />
			<p class="text-sm text-[var(--stone-300)]">No history yet</p>
		</div>

		<!-- Timeline -->
		<ol v-else class="relative flex flex-col gap-0">
			<!-- Vertical line -->
			<div
				class="absolute left-[1rem] top-6 bottom-6 w-px bg-[var(--input-border)]" />

			<!-- Change entries -->
			<li
				v-for="entry in sortedHistory"
				:key="entry.id"
				class="relative flex gap-3 pb-5 items-center">
				<!-- Avatar -->
				<div class="flex-shrink-0 z-10">
					<ImageWrapper
						:src="entry.createdBy?.avatar"
						:name="entry.createdBy?.name"
						styles="w-8 h-8 rounded-full object-cover text-white text-xs font-medium ring-2 ring-[var(--page-bg)]" />
				</div>

				<!-- Content -->
				<div
					class="flex-1 min-w-0 bg-[var(--table-row)] border border-[var(--card-border)] rounded-lg px-3 py-2.5">
					<div class="flex items-start justify-between gap-2 flex-wrap">
						<!-- Description -->
						<p
							class="text-sm text-[var(--text-description)] leading-snug flex-1">
							<span class="font-medium text-[var(--text-subtitle)]">
								{{ entry.createdBy?.name ?? "Unknown user" }}
							</span>
							{{ " " }}
							<template v-if="describeChange(entry).from">
								changed
								<span class="font-medium text-[var(--text-description)]">
									{{ describeChange(entry).field }}
								</span>
								from
								<span
									class="inline-flex items-center bg-[var(--stone-800)] text-[var(--stone-300)] text-xs px-1.5 py-0.5 rounded font-mono">
									{{ describeChange(entry).from }}
								</span>
								to
								<span
									class="inline-flex items-center bg-[var(--stone-800)] text-[var(--text-title)] text-xs px-1.5 py-0.5 rounded font-mono">
									{{ describeChange(entry).to }}
								</span>
							</template>
							<template v-else>
								set
								<span class="font-medium text-[var(--text-description)]">
									{{ describeChange(entry).field }}
								</span>
								to
								<span
									class="inline-flex items-center bg-[var(--stone-800)] text-[var(--text-title)] text-xs px-1.5 py-0.5 rounded font-mono">
									{{ describeChange(entry).to }}
								</span>
							</template>
						</p>

						<!-- Timestamp -->
						<time
							class="text-[11px] text-[var(--stone-300)] whitespace-nowrap flex-shrink-0 mt-0.5">
							{{ formatDate(entry.createdAt, "MMM DD, hh:mm AMPM") }}
						</time>
					</div>
				</div>
			</li>

			<!-- Created entry — always at bottom -->
			<li v-if="createdEntry.createdAt" class="relative flex gap-3 items-center">
				<div class="flex-shrink-0 z-10">
					<ImageWrapper
						:src="createdEntry.createdBy?.avatar"
						:name="createdEntry.createdBy?.name"
						styles="w-8 h-8 rounded-full object-cover text-white text-xs font-medium ring-2 ring-[var(--page-bg)]" />
				</div>
				<div
					class="flex-1 min-w-0 bg-[var(--table-row)] border border-[var(--card-border)] rounded-lg px-3 py-2.5">
					<div class="flex items-start justify-between gap-2 flex-wrap">
						<p class="text-sm text-[var(--text-description)] leading-snug">
							<span class="font-medium text-[var(--text-subtitle)]">
								{{ createdEntry.createdBy?.name ?? "Unknown user" }}
							</span>
							{{ " " }}
							<span class="text-[var(--stone-300)]">created this record</span>
						</p>
						<time
							class="text-[11px] text-[var(--stone-300)] whitespace-nowrap flex-shrink-0 mt-0.5">
							{{ formatDate(createdEntry.createdAt, "MMM DD, hh:mm AMPM") }}
						</time>
					</div>
				</div>
			</li>
		</ol>
	</div>
</template>
