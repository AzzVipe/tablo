import modelPath from "@/directives/model-path";
import autoFocus from "@/directives/auto-focus";
import clickOutside from "@/directives/click-outside";
import resizable from "@/directives/resizable";

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.directive("model-path", modelPath);
	nuxtApp.vueApp.directive("auto-focus", autoFocus);
	nuxtApp.vueApp.directive("click-outside", clickOutside);
	nuxtApp.vueApp.directive("resizable", resizable);
});
