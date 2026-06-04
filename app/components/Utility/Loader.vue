<template>
	<div class="loader-wrapper">
		<!-- Dots Animation -->
		<div :class="['dots-loader', sizeClass]">
			<span v-for="n in 3" :key="n" :style="{ backgroundColor: color }"></span>
		</div>
	</div>
</template>

<script setup>
	import { computed } from "vue";

	const props = defineProps({
		size: { type: String, default: "lg" }, // sm, md, lg, xl
		color: { type: String, default: "#9880ff" }, // Default color
	});

	// Compute size class based on prop
	const sizeClass = computed(() => {
		return (
			{
				sm: "loader-sm",
				md: "loader-md",
				lg: "loader-lg",
				xl: "loader-xl",
			}[props.size] || "loader-md"
		); // Default to 'md' if invalid size
	});
</script>

<style scoped>
	/* Loader Wrapper */
	.loader-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	/* ========= DOTS LOADER ========= */
	.dots-loader {
		display: flex;
	}

	.dots-loader span {
		display: inline-block;
		border-radius: 50%;
		animation: dots-bounce 1.5s infinite ease-in-out;
	}

	/* Dot Animations */
	.dots-loader span:nth-child(1) {
		animation-delay: 0s;
	}
	.dots-loader span:nth-child(2) {
		animation-delay: 0.2s;
	}
	.dots-loader span:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes dots-bounce {
		0%,
		100% {
			transform: translateY(0);
			opacity: 0.3;
		}
		50% {
			transform: translateY(-5px);
			opacity: 1;
		}
	}

	/* ========= SIZE CLASSES ========= */
	.loader-sm {
		gap: 5px;
	}
	.loader-md {
		gap: 10px;
	}
	.loader-lg {
		gap: 15px;
	}
	.loader-xl {
		gap: 20px;
	}

	.loader-sm span {
		width: 10px;
		height: 10px;
	}
	.loader-md span {
		width: 20px;
		height: 20px;
	}
	.loader-lg span {
		width: 30px;
		height: 30px;
	}
	.loader-xl span {
		width: 40px;
		height: 40px;
	}
</style>
