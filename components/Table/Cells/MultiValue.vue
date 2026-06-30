<template>
	<div
		class="flex items-center gap-2 relative panel-container"
		:class="!Array.isArray(content) && header?.options_wrapper_class">
		<!-- Not set -->
		<p
			v-if="isNullOrUndefinedOrEmpty(content)"
			class="flex items-center gap-1 italic font-light">
			<UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4" />
			<span>Not set</span>
		</p>

		<!-- ARRAY -->
		<template v-else-if="Array.isArray(content)">
			<div
				ref="containerRef"
				class="flex items-center gap-1 cursor-pointer whitespace-nowrap overflow-hidden"
				@mouseenter="onHover"
				@mouseleave="showPanel = false">
				<span
					v-for="(item, index) in visibleItems"
					:key="index"
					class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium"
					:class="chipClass(item)">
					{{ displayValue(item, shouldAbbreviate) }}

					<!-- stage icon support -->
					<UIcon
						v-if="isStage && getMatchingOption(valueOf(item))?.icon"
						:name="getMatchingOption(valueOf(item))?.icon"
						class="w-3 h-3" />
				</span>

				<!-- +N -->
				<span
					v-if="hiddenCount > 0"
					class="inline-flex items-center justify-center rounded-full px-2 py-1 text-sm"
					:class="chipClass()">
					+{{ hiddenCount }}
				</span>
			</div>
		</template>

		<!-- OBJECT (peoplearray single) -->
		<template v-else-if="typeof content === 'object'">
			<span
				class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium"
				:class="singleClass">
				{{ displayValue(content) }}
			</span>
		</template>

		<!-- PRIMITIVE (stage single) -->
		<template v-else>
			<span
				class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium"
				:class="chipClass(content)">
				<p class="overflow-hidden">{{ getDisplayText(content) }}</p>
				<UIcon
					v-if="isStage && matchingOption?.icon"
					:name="matchingOption.icon"
					class="w-4 h-4" />
			</span>
		</template>

		<!-- POPOVER -->
		<Transition
			enter-active-class="transition ease-out duration-200"
			enter-from-class="opacity-0 translate-y-1"
			enter-to-class="opacity-100 translate-y-0"
			leave-active-class="transition ease-in duration-150"
			leave-from-class="opacity-100 translate-y-0"
			leave-to-class="opacity-0 translate-y-1">
			<div
				v-if="
					showPanel && (hiddenCount > 0 || isOverflowing || shouldAbbreviate)
				"
				ref="panelRef"
				class="absolute left-1/2 -translate-x-1/2 z-50 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-lg rounded-lg p-2 flex flex-wrap gap-2 max-w-80 min-w-40 panel"
				:class="
					panelPosition === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'
				"
				style="width: max-content">
				<span
					v-for="(item, index) in content"
					:key="index"
					class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs"
					:class="chipClass(item)">
					{{ displayValue(item) }}

					<UIcon
						v-if="isStage && getMatchingOption(valueOf(item))?.icon"
						:name="getMatchingOption(valueOf(item))?.icon"
						class="w-3 h-3" />
				</span>
			</div>
		</Transition>
	</div>
</template>

<script setup>
	const { content, header } = defineProps(["content", "header"]);

	const isAssign = computed(() => header?.render_as === "assign");
	const isStage = computed(() => header?.render_as === "stage");
	const isChip = computed(() => header?.render_as === "chip");

	const containerRef = ref(null);
	const panelRef = ref(null);
	const panelPosition = ref("bottom");

	const visibleCount = ref(1);
	const showPanel = ref(false);
	const isOverflowing = ref(false);

	let resizeObserver;
	const singleClass = computed(() =>
		isAssign.value
			? "bg-[var(--page-bg)] text-[var(--text-description)] px-2 py-1"
			: ""
	);

	const valueOf = (item) =>
		isAssign.value && item ? item[header.source_field || "name"] : item;

	const displayValue = (item, abbreviate = false) => {
		const val = valueOf(item);
		return abbreviate ? getAbbreviation(val) : getDisplayText(val);
	};

	const chipClass = (item = "") => {
		return (
			getMatchingOption(valueOf(item))?.class ||
			header?.class ||
			singleClass.value
		);
	};

	const getMatchingOption = (value) => {
		if (!header?.options) {
			if (header?.class) return { class: header.class };
			return null;
		}

		const lower = value?.toLowerCase();

		return header.options.find(
			(opt) =>
				opt.value?.toLowerCase() === lower ||
				opt.matches?.some((m) => m?.toLowerCase() === lower)
		);
	};

	const getDisplayText = (value) => {
		// people & chip: raw value only
		if (!isStage.value) return value;

		const match = getMatchingOption(value);
		if (!match) return value;

		const lower = value?.toLowerCase();
		return match.matches?.some((m) => m?.toLowerCase() === lower)
			? value
			: match.name;
	};

	const getAbbreviation = (text) =>
		text
			?.split(" ")
			.map((w) => w.charAt(0).toUpperCase())
			.join("");

	const matchingOption = computed(() => getMatchingOption(content));

	const visibleItems = computed(() =>
		Array.isArray(content) ? content.slice(0, visibleCount.value) : []
	);

	const hiddenCount = computed(() =>
		Array.isArray(content)
			? Math.max(0, content.length - visibleCount.value)
			: 0
	);

	const shouldAbbreviate = computed(
		() => Array.isArray(content) && content.length > 2
	);

	const calculateVisibleItems = async () => {
		await nextTick();

		const container = containerRef.value;
		if (!container) return;

		const spans = container.querySelectorAll("span");
		if (!spans.length) return;

		const width = container.parentElement?.offsetWidth || container.offsetWidth;

		isOverflowing.value = container.scrollWidth > container.clientWidth;

		let total = 0;
		let count = 0;
		const buffer = isAssign.value ? 4 : 10;

		for (const el of spans) {
			total += el.offsetWidth + 20;
			if (total + buffer > width) break;
			count++;
		}

		visibleCount.value = Math.max(1, count);
	};

	const FLIP_BUFFER = 60;

	const updatePanelPosition = async () => {
		await nextTick();

		if (!containerRef.value || !panelRef.value) return;

		const rect = containerRef.value.getBoundingClientRect();
		const panelHeight = panelRef.value.offsetHeight;
		const viewport = window.innerHeight;

		const spaceBelow = viewport - rect.bottom;
		const spaceAbove = rect.top;

		panelPosition.value =
			spaceBelow < panelHeight + FLIP_BUFFER && spaceAbove > panelHeight
				? "top"
				: "bottom";
	};

	const onHover = async () => {
		showPanel.value = true;
		await nextTick();
		updatePanelPosition();
	};

	onMounted(() => {
		calculateVisibleItems();

		resizeObserver = new ResizeObserver(calculateVisibleItems);

		if (containerRef.value?.parentElement) {
			resizeObserver.observe(containerRef.value.parentElement);
		}
	});

	onBeforeUnmount(() => {
		if (resizeObserver && containerRef.value?.parentElement) {
			resizeObserver.unobserve(containerRef.value.parentElement);
		}
	});

	watch(
		() => content,
		async () => {
			await nextTick();
			calculateVisibleItems();
		},
		{ deep: true }
	);
</script>
