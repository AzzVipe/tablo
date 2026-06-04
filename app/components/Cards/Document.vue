<template>
	<div class="w-full">
		<!-- Directory Block -->
		<div v-if="document?.type === 'folder'" class="flex flex-col">
			<div class="flex gap-4 justify-between w-full">
				<h1 class="font-semibold">
					<!-- {{ dashes }} -->
					{{ document.name }} /
				</h1>
				<Spinner v-if="isLoading" />
				<button
					@click="handleOpenAllLinks"
					type="button"
					title="Open all links"
					class="flex items-center justify-center p-1.5 hover:bg-gray-100 hover:text-blue-600 cursor-pointer rounded-full">
					<UIcon name="ic:round-open-in-new" class="w-5 h-5" />
				</button>
			</div>
			<div class="flex flex-col gap-2 pl-4">
				<CardsDocument
					v-for="subdoc in document.files"
					:key="subdoc.name"
					:document="subdoc"
					:depth="depth + 1" />
			</div>
		</div>

		<!-- File Block -->
		<div
			v-else-if="!isNullOrUndefinedOrEmpty(document)"
			class="flex gap-4 justify-between items-center">
			<div class="flex gap-4 justify-between w-full italic">
				<h1
					@click="handleOpenFile(document)"
					class="cursor-pointer hover:text-blue-700">
					<!-- {{ dashes }} -->
					{{ document.name }}
				</h1>
				<Spinner v-if="isLoading" />
				<h2 v-if="document.size / 1024 < 1" class="text-sm">
					{{ document.size }} bytes
				</h2>
				<h2 v-else class="text-sm">
					{{ (document.size / 1024).toFixed(1) }} Kb
				</h2>
			</div>
		</div>
	</div>
</template>

<script setup>
	const { document, depth } = defineProps({
		document: {
			type: Object,
			required: true,
		},
		depth: {
			type: Number,
			default: 0,
		},
	});

	const isLoading = ref(false);

	const dashes = computed(() => {
		return "-".repeat(depth * 3);
	});

	const handleOpenFile = async (file) => {
		isLoading.value = true;

		console.log(file);

		const signedUrl = await downloadFiles(file.id);

		isLoading.value = false;

		if (signedUrl) {
			window.open(signedUrl, "_blank");
		}
	};

	const handleOpenAllLinks = async () => {
		// Recursively traverse the folder structure and collect all file URLs
		const collectFileUrls = async (folder) => {
			let fileUrls = [];

			for (const subdoc of folder.files) {
				if (subdoc.type === "folder") {
					// If it's a subfolder, collect URLs from its files recursively
					const subfolderFileUrls = await collectFileUrls(subdoc);
					fileUrls.push(...subfolderFileUrls);
				} else {
					// If it's a file, get the signed URL and add it to the list
					const signedUrl = await downloadFiles(subdoc.s3);

					if (signedUrl) {
						fileUrls.push(signedUrl);
					}
				}
			}

			return fileUrls;
		};

		if (document.type === "folder") {
			try {
				isLoading.value = true;

				// Collect all the file URLs from the folder
				const fileUrls = await collectFileUrls(document);

				isLoading.value = false;

				// Open each URL in a new browser tab
				fileUrls.forEach((url) => {
					window.open(url, "_blank");
				});
			} catch (error) {
				console.error("Error opening files: ", error);
			}
		}
	};
</script>

<style lang="scss" scoped></style>
