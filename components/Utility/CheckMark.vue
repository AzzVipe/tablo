<template>
	<div>
		<svg
			class="checkmark"
			:style="{ width, height }"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 52 52">
			<circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
			<path
				class="checkmark__check"
				fill="none"
				d="M14.1 27.2l7.1 7.2 16.7-16.8" />
		</svg>
	</div>
</template>

<script setup>
	const props = defineProps({
		width: {
			type: String,
			default: "100px",
		},
		height: {
			type: String,
			default: "100px",
		},
	});
</script>

<style scoped>
	.checkmark {
		border-radius: 50%;
		display: block;
		stroke-width: 3;
		stroke: #34d399;
		stroke-miterlimit: 10;
		box-shadow: inset 0px 0px 0px #34d399;
		animation: fill 0.4s ease-in-out 0.4s forwards,
			scale 0.3s ease-in-out 0.9s both;
		position: relative;
		top: 5px;
		right: 5px;
		margin: 0 auto;
	}
	.checkmark__circle {
		stroke-dasharray: 166;
		stroke-dashoffset: 166;
		stroke-width: 3;
		stroke-miterlimit: 10;
		stroke: #34d399;
		animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
		fill: white;
	}
	.checkmark__check {
		transform-origin: 50% 50%;
		stroke-dasharray: 48;
		stroke-dashoffset: 48;
		animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
	}

	@keyframes stroke {
		100% {
			stroke-dashoffset: 0;
		}
	}
	@keyframes scale {
		0%,
		100% {
			transform: none;
		}
		50% {
			transform: scale3d(1.1, 1.1, 1);
		}
	}
	@keyframes fill {
		100% {
			box-shadow: inset 0px 0px 0px 30px #34d399;
		}
	}
</style>
