<script setup>
	const { content, recordId, header, image } = defineProps([
		"content",
		"recordId",
		"header",
		"image",
	]);

	const globalStore = useGlobalStore();

	const output = ref("");
	const arrayRegex = /[\[\]"]/g;

	let fromStore;

	const getDropdownName = (data, options) => {
		const res = options.filter((opt) => opt.value === content);

		if (res?.length > 0) return res[0].name;
		else return data;
	};

	const handleAssignDataInit = () => {
		if (header?.bidirectional === false) {
			let obj = {};
			obj[header.assign_to_field] = { $eq: recordId };

			fromStore.findRecords([obj]).then((res) => {
				if (res?.length > 0) {
					output.value = res[0][header.source_field];
				}
			});
		} else if (Array.isArray(content)) {
			output.value = "";
			content.forEach((item) => {
				fromStore.findByField(header.source_value, item).then((res) => {
					if (res) {
						output.value = output.value.concat(res[header.source_field], ", ");
					}
				});
			});
		} else {
			fromStore.findByField(header.source_value, content).then((res) => {
				if (res) {
					output.value = res[header.source_field];
				}
			});
		}
	};
</script>

<template>
	<div class="truncate">
		<!-- Handle empty case -->
		<template
			v-if="
				(isNullOrUndefinedOrEmpty(output) &&
					isNullOrUndefinedOrEmpty(content)) ||
				isNullOrUndefinedOrEmpty(content) ||
				(Array.isArray(content) && content.length === 0)
			">
			<span class="italic">Empty</span>
		</template>

		<!-- Handle case if path is set -->
		<template v-else>
			<div
				v-if="Array.isArray(content)"
				:class="(output = JSON.stringify(content).replace(arrayRegex, ' '))">
				<Tooltip v-if="header.tooltip" :content="output" :header="header" />

				<span v-else>
					{{ output }}
				</span>
			</div>

			<!-- If content is a value from dropdown -->
			<div
				v-else-if="header.type === 'select' && header.options?.length > 0"
				:class="(output = getDropdownName(content, header.options))">
				<Tooltip v-if="header.tooltip" :content="output" :header="header" />

				<span v-else>
					{{ output }}
				</span>
			</div>

			<!-- Default -->
			<div v-else>
				<Tooltip v-if="header.tooltip" :content="content" :header="header" />

				<span v-else>
					{{ content }}
				</span>
			</div>
		</template>
	</div>
</template>
