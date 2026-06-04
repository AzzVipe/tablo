// middleware/auth.js
// DEMO VERSION — no-op, never redirects to login

export default defineNuxtRouteMiddleware(() => {
  // Auth is bypassed in demo mode.
  // The hardcoded user in composables/auth.js handles identity.
});
