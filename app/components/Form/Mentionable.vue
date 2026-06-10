<template>
	<div class="mentionable relative w-full">
		<!-- Textarea -->
		<textarea
			ref="displayTextRef"
			@input="onInput"
			v-model="displayText"
			:placeholder="placeholder"
			:disabled="disabled"
			rows="6"
			minlength="4"
			class="input-box" />

		<div class="flex flex-col gap-2 mt-4">
			<UDropdownMenu
				v-model:open="showDropdown"
				:items="[filteredUsers]"
				:ui="{ content: 'w-80 h-96' }"
				:content="{ side: 'bottom', align: 'start' }">
				<h2 class="font-semibold ml-2 text-[var(--text-title)]">
					{{ mentionsMap?.size }} mentions
				</h2>

				<!-- Custom slot for dropdown items -->
				<template #item="{ item }">
					<slot name="dropdown-item" :item="item" :selectUser="selectUser">
						<!-- Default style if no slot is passed -->
						<div
							class="flex flex-col px-3 py-2 cursor-pointer rounded-md"
							@click="selectUser(item)">
							@{{ item[props.mapLabel] }}
						</div>
					</slot>
				</template>
			</UDropdownMenu>

			<div v-if="mentionsMap?.size > 0" class="flex flex-wrap gap-2">
				<template v-for="[id, mention] in mentionsMap" :key="id">
					<UTooltip text="Click to remove mention">
						<div
							@click="removeMention(id)"
							class="flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--card-border)] shadow-sm text-sm hover:bg-[var(--card-hover)] cursor-pointer transition-all">
							<ImageWrapper
								:src="mention.avatar"
								:name="mention.name"
								styles="w-8 h-8 rounded-full object-cover text-white text-sm font-medium" />
							<div class="flex flex-col text-left">
								<span class="font-medium text-[var(--text-title)]">{{
									mention.name
								}}</span>
								<span class="font-light text-[var(--text-subtitle)]">
									{{ mention.email }}</span
								>
							</div>
						</div>
					</UTooltip>
				</template>
			</div>
		</div>
	</div>
</template>

<script setup>
	const props = defineProps({
		/**
		 * Array of mentionable items (e.g. users).
		 * Each item should at least have an `id` and a `name` field (configurable with map functions).
		 */
		items: {
			type: Array,
			required: true,
			default: () => [],
		},

		/**
		 * Function or string key to map item -> value inserted into the raw text
		 * e.g. (user) => `{{${user.id}}}`
		 */
		mapValue: {
			type: [Function, String],
			required: true,
		},

		/**
		 * Function or string key to map item -> visible label
		 * e.g. (user) => `@${user.name}`
		 */
		mapLabel: {
			type: [Function, String],
			required: true,
		},

		/**
		 * The character(s) that trigger the mention dropdown (default "@").
		 * Could also support "#" for tags, etc.
		 */
		triggers: {
			type: Array,
			default: () => ["@"],
		},

		/**
		 * Bound model (textarea value).
		 * This will be the "raw value" containing {{id}} placeholders.
		 */
		modelValue: {
			type: String,
			default: "",
		},

		/**
		 * Max number of suggestions to show in dropdown
		 */
		maxSuggestions: {
			type: Number,
			default: 5,
		},

		/**
		 * Whether to show plain @name in textarea (visual masking)
		 * or directly insert {{id}}.
		 * (This decides whether we maintain dual state: visible vs raw.)
		 */
		maskLabel: {
			type: Boolean,
			default: true,
		},

		/**
		 * Placeholder text for textarea
		 */
		placeholder: {
			type: String,
			default: "Write a note...",
		},

		/**
		 * Disable input
		 */
		disabled: {
			type: Boolean,
			default: false,
		},
	});

	const emit = defineEmits(["update:modelValue"]);
	const displayText = ref(""); // shown in textarea
	const displayTextRef = ref(null); // shown in textarea ref
	const rawValue = ref(props.modelValue || ""); // backend string
	const mentionsMap = ref(new Map()); // label -> id
	const showDropdown = ref(false);
	const mentionQuery = ref("");
	const caretPosition = ref(0);

	// Convert rawValue -> displayText by replacing {{id}} with @name
	const rebuildDisplayText = () => {
		displayText.value = rawValue.value.replace(/\{\{(.*?)\}\}/g, (_, id) => {
			const user = props.items.find((u) => u[props.mapValue] === id);
			return user ? `@${user[props.mapLabel]}` : `@unknown(${id})`;
		});

		mentionsMap.value.forEach((user, id) => {
			const label = user[props.mapLabel];
			const re = new RegExp(`@${label}`, "g");

			// not present → remove
			if (!re.test(displayText.value)) {
				mentionsMap.value.delete(id);
			}
		});
	};

	const rebuildRawValue = () => {
		let raw = displayText.value;

		mentionsMap.value.forEach((user, id) => {
			const label = user[props.mapLabel];
			const re = new RegExp(`@${label}`, "g");

			if (re.test(raw)) {
				// still present → replace
				raw = raw.replace(re, `{{${id}}}`);
			} else {
				// not present → remove stale mention
				mentionsMap.value.delete(id);
			}
		});

		rawValue.value = raw;

		emit("update:modelValue", rawValue.value);
	};

	watch(
		() => rawValue.value,
		() => rebuildDisplayText(),
		{ immediate: true }
	);

	watch(
		() => props.modelValue,
		(val) => {
			if (val !== rawValue.value) {
				rawValue.value = val || "";
				rebuildDisplayText();
			}
		}
	);

	const filteredUsers = computed(() => {
		if (!mentionQuery.value) return props.items;

		return props.items.filter((u) =>
			u[props.mapLabel].toLowerCase().includes(mentionQuery.value.toLowerCase())
		);
	});

	const onInput = (e) => {
		displayText.value = e.target.value;
		caretPosition.value = e.target.selectionStart;

		const textBeforeCaret = displayText.value.slice(0, caretPosition.value);

		// Check if we're inside an unfinished @mention
		const match = textBeforeCaret.match(/@(\w*)$/);

		if (match) {
			showDropdown.value = true;
			mentionQuery.value = match[1] || "";
		} else {
			showDropdown.value = false;
			mentionQuery.value = "";
		}

		rebuildRawValue();
	};

	const selectUser = (user) => {
		const before = displayText.value.slice(
			0,
			caretPosition.value - mentionQuery.value.length - 1
		);

		const after = displayText.value.slice(caretPosition.value);

		const label = user[props.mapLabel];
		const id = user[props.mapValue];

		displayText.value = before + "@" + label + " " + after;

		mentionsMap.value.set(id, user);

		rebuildRawValue();

		// move caret after inserted mention
		caretPosition.value = before.length + label.length + 2;

		showDropdown.value = false;
		mentionQuery.value = "";

		displayTextRef.value?.focus();
	};

	const removeMention = (id) => {
		mentionsMap.value.delete(id);

		rawValue.value = rawValue.value.replaceAll(`{{${id}}}`, "");

		rebuildDisplayText();

		displayTextRef.value?.focus();
	};
</script>

<style lang="scss" scoped></style>
