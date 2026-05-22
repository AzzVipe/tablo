<template>
	<div
		class="min-h-screen bg-[var(--page-bg)] text-[var(--text-description)] overflow-x-hidden">
		<!-- Nav -->
		<nav
			class="sticky top-0 z-50 px-8 py-4 border-b border-[var(--card-border)] bg-[var(--stone-950)] backdrop-blur-md">
			<div class="flex items-center justify-between max-w-6xl mx-auto">
				<UiLogo :size="44" :showName="true" :showTagline="false" />
				<div class="flex items-center gap-6">
					<a
						href="#how-it-works"
						class="text-sm text-[var(--stone-300)] hover:text-[var(--text-description)] transition-colors hidden sm:block"
						>How it works</a
					>
					<a
						href="#features"
						class="text-sm text-[var(--stone-300)] hover:text-[var(--text-description)] transition-colors hidden sm:block"
						>Features</a
					>
					<a
						href="#drawer"
						class="text-sm text-[var(--stone-300)] hover:text-[var(--text-description)] transition-colors hidden sm:block"
						>Side drawer</a
					>
					<a
						href="#get-started"
						class="text-sm text-[var(--stone-300)] hover:text-[var(--text-description)] transition-colors hidden sm:block"
						>Get started</a
					>
					<a href="/tasks" class="primary-button-sm !rounded-full"
						>Open demo →</a
					>
				</div>
			</div>
		</nav>

		<!-- Hero -->
		<section class="relative px-8 pt-24 pb-20">
			<div class="max-w-6xl mx-auto">
				<div class="relative">
					<div
						class="inline-flex items-center gap-2 border border-[var(--orange-focus)] text-[var(--text-subtitle)] text-xs font-medium px-3 py-1.5 rounded-full mb-6 font-mono">
						<span
							class="w-1.5 h-1.5 rounded-full bg-[var(--orange-focus)] inline-block"></span>
						open source · nuxt 3 · config-driven
					</div>

					<h1
						class="text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight mb-6 max-w-4xl">
						Build data tables
						<span class="text-[var(--text-title)] italic">without writing</span>
						<br />table components.
					</h1>

					<p
						class="text-lg text-[var(--stone-300)] max-w-2xl leading-relaxed mb-10">
						Tablo is a config-driven framework for Nuxt 3. Define your columns,
						types, filters, and permissions in a JSON file - the entire table
						UI, add/edit modals, side drawer, and search are generated
						automatically.
					</p>

					<div class="flex flex-wrap gap-3 mb-16">
						<a href="/tasks" class="primary-button">Open live demo →</a>
						<a
							href="https://github.com/AzzVipe/tablo"
							target="_blank"
							class="secondary-button flex items-center gap-2">
							<UIcon name="ic:baseline-code" class="w-4 h-4" />
							View on GitHub
						</a>
					</div>

					<!-- Before / After -->
					<div class="grid sm:grid-cols-2 gap-4">
						<div
							class="bg-[var(--stone-800)] border border-[var(--card-border)] rounded-xl p-5">
							<div
								class="text-xs font-mono text-[var(--stone-300)] mb-3 flex items-center gap-2">
								<span class="text-[var(--btn-danger-text)]">✕</span> Before -
								duplicated component per table
							</div>
							<div class="space-y-1.5">
								<div
									v-for="i in 6"
									:key="i"
									class="h-3 rounded bg-[var(--stone-700)]"
									:style="{ width: `${[90, 70, 85, 60, 75, 55][i - 1]}%` }" />
							</div>
							<p class="text-xs text-[var(--stone-300)] mt-3">
								~200 lines of repeated template per entity
							</p>
						</div>
						<div
							class="bg-[var(--stone-800)] border border-[var(--orange-focus)] rounded-xl p-5">
							<div
								class="text-xs font-mono text-[var(--stone-300)] mb-3 flex items-center gap-2">
								<span class="text-[var(--btn-success-text)]">✓</span> After -
								one JSON config file
							</div>
							<pre
								class="text-xs text-[var(--text-description)] leading-relaxed overflow-hidden">
								<code>
									<span class="text-[var(--stone-300)]">{</span>
									<span class="text-[var(--text-subtitle)]">"name"</span><span class="text-[var(--stone-300)]">:</span> <span class="text-green-400">"Priority"</span><span class="text-[var(--stone-300)]">,</span>
									<span class="text-[var(--text-subtitle)]">"type"</span><span class="text-[var(--stone-300)]">:</span> <span class="text-green-400">"select"</span><span class="text-[var(--stone-300)]">,</span>
									<span class="text-[var(--text-subtitle)]">"path"</span><span class="text-[var(--stone-300)]">:</span> <span class="text-green-400">"priority"</span><span class="text-[var(--stone-300)]">,</span>
									<span class="text-[var(--text-subtitle)]">"is_add"</span><span class="text-[var(--stone-300)]">:</span> <span class="text-orange-400">true</span><span class="text-[var(--stone-300)]">,</span>
									<span class="text-[var(--text-subtitle)]">"filter"</span><span class="text-[var(--stone-300)]">:</span> <span class="text-orange-400">true</span>
								<span class="text-[var(--stone-300)]">}</span>
								</code>
							</pre>
							<p class="text-xs text-[var(--btn-success-text)] mt-3">
								That's it. Table, form, filter - all generated.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Stats bar -->
		<div class="border-y border-[var(--card-border)] bg-[var(--stone-950)]">
			<div
				class="max-w-6xl mx-auto px-8 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
				<div v-for="stat in stats" :key="stat.label" class="text-center">
					<div class="text-2xl font-semibold text-[var(--text-title)]">
						{{ stat.value }}
					</div>
					<div class="text-xs text-[var(--stone-300)] mt-1">
						{{ stat.label }}
					</div>
				</div>
			</div>
		</div>

		<!-- Screenshot: full table -->
		<section class="px-8 py-16">
			<div class="max-w-6xl mx-auto">
				<div
					class="text-xs font-mono text-[var(--text-subtitle)] mb-3 tracking-widest uppercase">
					In action
				</div>
				<h2 class="text-3xl sm:text-4xl font-semibold mb-4">
					The full picture.
				</h2>
				<p class="text-[var(--stone-300)] max-w-2xl mb-8">
					Sortable columns, chip-based cell renderers, avatar groups, pipeline
					stages, date highlighting, and inline pagination - all from config.
				</p>
				<!-- SCREENSHOT: tablo-task.png - full table view -->
				<div
					class="rounded-xl overflow-hidden border border-[var(--card-border)] bg-[var(--stone-800)] flex items-center justify-center">
					<img
						src="/screenshots/tablo-tasks.png"
						alt="Task table screenshots" />
				</div>
			</div>
		</section>

		<!-- How it works -->
		<section id="how-it-works" class="px-8 py-24 bg-[var(--stone-950)]">
			<div class="max-w-6xl mx-auto">
				<div
					class="text-xs font-mono text-[var(--text-subtitle)] mb-3 tracking-widest uppercase">
					How it works
				</div>
				<h2 class="text-3xl sm:text-4xl font-semibold mb-4 max-w-xl">
					One config. Everything else is automatic.
				</h2>
				<p class="text-[var(--stone-300)] max-w-2xl mb-14">
					The JSON config is the only file you write per entity. Tablo reads it
					and renders the complete UI - table, add modal, edit modal, filters,
					sort, side drawer, and role-based access control.
				</p>

				<div class="grid sm:grid-cols-3 gap-6">
					<div v-for="step in steps" :key="step.num" class="relative">
						<div
							class="text-5xl font-semibold text-[var(--stone-700)] mb-4 font-mono">
							{{ step.num }}
						</div>
						<h3
							class="text-base font-semibold text-[var(--text-description)] mb-2">
							{{ step.title }}
						</h3>
						<p class="text-sm text-[var(--stone-300)] leading-relaxed">
							{{ step.desc }}
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Features -->
		<section id="features" class="px-8 py-24">
			<div class="max-w-6xl mx-auto">
				<div
					class="text-xs font-mono text-[var(--text-subtitle)] mb-3 tracking-widest uppercase">
					Features
				</div>
				<h2 class="text-3xl sm:text-4xl font-semibold mb-14 max-w-xl">
					Everything a data table needs. Nothing you have to build.
				</h2>

				<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
					<div
						v-for="feature in features"
						:key="feature.title"
						class="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 hover:border-[var(--orange-focus)]/40 transition-colors">
						<div
							class="w-8 h-8 rounded-lg bg-[var(--orange-focus)]/10 flex items-center justify-center mb-3">
							<UIcon
								:name="feature.icon"
								class="w-4 h-4 text-[var(--text-title)]" />
						</div>
						<h3
							class="text-sm font-semibold text-[var(--text-description)] mb-1.5">
							{{ feature.title }}
						</h3>
						<p class="text-xs text-[var(--stone-300)] leading-relaxed">
							{{ feature.desc }}
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Table State -->
		<section class="px-8 py-24 bg-[var(--stone-950)]">
			<div class="max-w-6xl mx-auto">
				<div
					class="text-xs font-mono text-[var(--text-subtitle)] mb-3 tracking-widest uppercase">
					Table state
				</div>
				<h2 class="text-3xl sm:text-4xl font-semibold mb-4 max-w-xl">
					Save and share exactly what you're looking at.
				</h2>
				<p class="text-[var(--stone-300)] max-w-2xl mb-10">
					Table state captures your current sort, active filters, and hidden
					columns as a named view. The state is serialized into the URL - copy
					the link and anyone who opens it sees the same filtered, sorted table
					you do.
				</p>
				<div class="grid sm:grid-cols-2 gap-6">
					<div>
						<!-- SCREENSHOT: table-task-tablestate.png - table state dropdown open -->
						<div
							class="rounded-xl overflow-hidden border border-[var(--card-border)] bg-[var(--stone-800)] flex items-center justify-center mb-3">
							<img
								src="/screenshots/tablo-tasks-tablestate.png"
								alt="Tablo tablestate dropdown" />
						</div>
						<p class="text-xs text-[var(--stone-300)]">
							The Table state dropdown - saved views listed and ready to apply.
						</p>
					</div>
					<div>
						<!-- SCREENSHOT: tablo-task-tablestate-active.png - filter active, count showing 10 -->
						<div
							class="rounded-xl overflow-hidden border border-[var(--card-border)] bg-[var(--stone-800)] flex items-center justify-center mb-3">
							<img
								src="/screenshots/tablo-tasks-tablestate-active.png"
								alt="Tablo tablestate active" />
						</div>
						<p class="text-xs text-[var(--stone-300)]">
							An active saved view - record count drops to 10, table state
							button shows the view name.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Side Drawer -->
		<section id="drawer" class="px-8 py-24">
			<div class="max-w-6xl mx-auto">
				<div
					class="text-xs font-mono text-[var(--text-subtitle)] mb-3 tracking-widest uppercase">
					Side drawer
				</div>
				<h2 class="text-3xl sm:text-4xl font-semibold mb-4 max-w-xl">
					Every record has a full detail panel.
				</h2>
				<p class="text-[var(--stone-300)] max-w-2xl mb-14">
					Click any row to open its side drawer without leaving the table. The
					drawer has four built-in tabs - Notes, Chips, History, and Details.
					Each tab is declared in the table config and renders automatically.
					Adding a new tab type is one component file.
				</p>

				<div class="grid sm:grid-cols-2 gap-6 mb-8">
					<div
						v-for="tab in drawerTabs"
						:key="tab.title"
						class="flex flex-col gap-2">
						<!-- SCREENSHOT -->
						<div
							class="rounded-xl overflow-hidden border border-[var(--card-border)] bg-[var(--stone-800)] flex items-center justify-center mb-3">
							<img :src="tab.image" :alt="tab.title" />
						</div>
						<div
							class="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
							<h3
								class="text-sm font-semibold text-[var(--text-description)] mb-1.5">
								{{ tab.title }}
							</h3>
							<p class="text-xs text-[var(--stone-300)] leading-relaxed">
								{{ tab.desc }}
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Add & Edit modals -->
		<section class="px-8 py-24 bg-[var(--stone-950)]">
			<div class="max-w-6xl mx-auto">
				<div
					class="text-xs font-mono text-[var(--text-subtitle)] mb-3 tracking-widest uppercase">
					Modals
				</div>
				<h2 class="text-3xl sm:text-4xl font-semibold mb-4 max-w-xl">
					Add and edit forms - no extra code.
				</h2>
				<p class="text-[var(--stone-300)] max-w-2xl mb-10">
					The Add and Edit modals are generated from the same table config.
					Fields marked
					<span
						class="font-mono text-[var(--text-description)] bg-[var(--stone-750)] px-1.5 py-0.5 rounded text-xs"
						>is_add: true</span
					>
					appear in Add, fields marked
					<span
						class="font-mono text-[var(--text-description)] bg-[var(--stone-750)] px-1.5 py-0.5 rounded text-xs"
						>is_update: true</span
					>
					appear in Edit. Field order, input type, required state, and dropdown
					options all come from the config. You never write a form component by
					hand.
				</p>
				<div class="grid sm:grid-cols-2 gap-6">
					<div>
						<!-- SCREENSHOT: tablo-task-add.png - add modal -->
						<div
							class="rounded-xl overflow-hidden border border-[var(--card-border)] bg-[var(--stone-800)] flex items-center justify-center mb-3">
							<img
								src="/screenshots/tablo-tasks-add.png"
								alt="Tablo tasks add modal" />
						</div>
						<p class="text-xs text-[var(--stone-300)]">
							Add modal - date picker, relation dropdown, multi-select, all from
							the same config.
						</p>
					</div>
					<div>
						<!-- SCREENSHOT: tablo-task-update.png - edit modal -->
						<div
							class="rounded-xl overflow-hidden border border-[var(--card-border)] bg-[var(--stone-800)] flex items-center justify-center mb-3">
							<img
								src="/screenshots/tablo-tasks-update.png"
								alt="Tablo tasks update modal" />
						</div>
						<p class="text-xs text-[var(--stone-300)]">
							Edit modal - pre-populated with current values. Only sends changed
							fields to the API.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- RBAC -->
		<section class="px-8 py-24">
			<div class="max-w-6xl mx-auto">
				<div
					class="text-xs font-mono text-[var(--text-subtitle)] mb-3 tracking-widest uppercase">
					Role-based access
				</div>
				<h2 class="text-3xl sm:text-4xl font-semibold mb-4 max-w-xl">
					Permissions declared in JSON. Applied automatically.
				</h2>
				<p class="text-[var(--stone-300)] max-w-2xl mb-10">
					Each table config has a
					<span
						class="font-mono text-[var(--text-description)] bg-[var(--stone-750)] px-1.5 py-0.5 rounded text-xs"
						>roles</span
					>
					array. At mount, Tablo reads the current user's role and stamps
					field-level permissions onto every header - hiding columns, removing
					edit access, and removing the Add/Delete buttons - all without
					touching any component code.
				</p>

				<div class="grid sm:grid-cols-3 gap-4 mb-10">
					<div
						v-for="role in roles"
						:key="role.name"
						class="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
						<div class="flex items-center gap-2 mb-3">
							<span
								class="text-xs font-mono font-medium px-2 py-0.5 rounded-full"
								:class="role.badgeClass"
								>{{ role.name }}</span
							>
						</div>
						<ul class="space-y-1.5">
							<li
								v-for="perm in role.perms"
								:key="perm.label"
								class="flex items-center gap-2 text-xs text-[var(--stone-300)]">
								<span
									:class="
										perm.allowed
											? 'text-[var(--btn-success-text)]'
											: 'text-[var(--btn-danger-text)]'
									"
									>{{ perm.allowed ? "✓" : "✕" }}</span
								>
								{{ perm.label }}
							</li>
						</ul>
					</div>
				</div>

				<div
					class="bg-[var(--card-bg)] border border-[var(--orange-focus)] rounded-xl p-6">
					<div class="flex items-start gap-3">
						<UIcon
							name="ic:round-info"
							class="w-5 h-5 text-[var(--text-title)] mt-0.5 flex-shrink-0" />
						<div>
							<p
								class="text-sm font-semibold text-[var(--text-description)] mb-1">
								Test different roles in the demo
							</p>
							<p class="text-sm text-[var(--stone-300)]">
								Open
								<span
									class="font-mono text-[var(--text-description)] bg-[var(--stone-750)] px-1.5 py-0.5 rounded text-xs"
									>composables/useAuth.js</span
								>
								and change
								<span
									class="font-mono text-[var(--text-description)] bg-[var(--stone-750)] px-1.5 py-0.5 rounded text-xs"
									>DEMO_USER.role</span
								>
								to
								<span
									class="font-mono text-[var(--text-description)] bg-[var(--stone-750)] px-1.5 py-0.5 rounded text-xs"
									>team</span
								>
								- the Users and Organizations pages disappear from the sidebar,
								write access is removed from the table, and the Add button
								hides. No code changes, just config.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Overview -->
		<section class="px-8 py-24 bg-[var(--stone-950)]">
			<div class="max-w-6xl mx-auto">
				<div
					class="text-xs font-mono text-[var(--text-subtitle)] mb-3 tracking-widest uppercase">
					Overview
				</div>
				<h2 class="text-3xl sm:text-4xl font-semibold mb-4 max-w-xl">
					Every entity can have its own overview page.
				</h2>
				<p class="text-[var(--stone-300)] max-w-2xl mb-10">
					The
					<span
						class="font-mono text-[var(--text-description)] bg-[var(--stone-750)] px-1.5 py-0.5 rounded text-xs"
						>/entity/[id]</span
					>
					route renders a full detail view with a two-column layout - fields on
					the left, tabs on the right. Double-click any field to edit it inline.
					The same table config drives the fields shown here.
				</p>

				<div
					class="rounded-xl overflow-hidden border border-[var(--card-border)] bg-[var(--stone-800)] flex items-center justify-center">
					<img
						src="/screenshots/tablo-tasks-overview.png"
						alt="Tablo tasks overview" />
				</div>
			</div>
		</section>

		<!-- Extensibility -->
		<section class="px-8 py-24">
			<div class="max-w-6xl mx-auto">
				<div
					class="text-xs font-mono text-[var(--text-subtitle)] mb-3 tracking-widest uppercase">
					Extensibility
				</div>
				<h2 class="text-3xl sm:text-4xl font-semibold mb-4 max-w-xl">
					Everything is a plugin point.
				</h2>
				<p class="text-[var(--stone-300)] max-w-2xl mb-14">
					Adding new capabilities is always one file - no touching the core
					framework.
				</p>

				<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<div
						v-for="ext in extensibility"
						:key="ext.title"
						class="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
						<div class="text-[var(--text-title)] text-lg mb-2">
							{{ ext.emoji }}
						</div>
						<h3
							class="text-sm font-semibold text-[var(--text-description)] mb-2">
							{{ ext.title }}
						</h3>
						<p class="text-xs text-[var(--stone-300)] leading-relaxed mb-3">
							{{ ext.desc }}
						</p>
						<div
							class="font-mono text-[10px] text-[var(--stone-500)] bg-[var(--stone-800)] px-2 py-1.5 rounded">
							{{ ext.file }}
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Theming -->
		<section class="px-8 py-24 bg-[var(--stone-950)]">
			<div class="max-w-6xl mx-auto">
				<div
					class="text-xs font-mono text-[var(--text-subtitle)] mb-3 tracking-widest uppercase">
					Theming
				</div>
				<h2 class="text-3xl sm:text-4xl font-semibold mb-4 max-w-xl">
					Change the entire theme in one file.
				</h2>
				<p class="text-[var(--stone-300)] max-w-2xl mb-10">
					All colors are CSS custom properties in two layers - primitive tokens
					(the actual values) and semantic tokens (what they're used for).
					Update one primitive and everything updates.
				</p>

				<div class="grid sm:grid-cols-2 gap-6">
					<pre
						class="text-xs bg-[var(--stone-800)] border border-[var(--card-border)] rounded-xl p-5 overflow-x-auto leading-relaxed">
						<code>
							<span class="text-[var(--stone-300)] text-[10px] uppercase tracking-widest">/* main.css - primitive tokens */</span>
							<span class="text-[var(--stone-300)]">:root {</span>
							<span class="text-[var(--text-subtitle)]">--stone-900</span><span class="text-[var(--stone-300)]">:</span> <span class="text-green-400">#1c1917</span><span class="text-[var(--stone-300)]">;</span>
							<span class="text-[var(--text-subtitle)]">--orange-focus</span><span class="text-[var(--stone-300)]">:</span> <span class="text-green-400">#ea580c</span><span class="text-[var(--stone-300)]">;</span>

							<span class="text-[var(--stone-300)]">/* semantic - mapped to primitives */</span>
							<span class="text-[var(--text-subtitle)]">--page-bg</span><span class="text-[var(--stone-300)]">:</span> <span class="text-orange-400">var(--stone-900)</span><span class="text-[var(--stone-300)]">;</span>
							<span class="text-[var(--text-subtitle)]">--text-title</span><span class="text-[var(--stone-300)]">:</span> <span class="text-orange-400">var(--orange-focus)</span><span class="text-[var(--stone-300)]">;</span>
							<span class="text-[var(--text-subtitle)]">--card-bg</span><span class="text-[var(--stone-300)]">:</span> <span class="text-orange-400">var(--stone-750)</span><span class="text-[var(--stone-300)]">;</span>
						<span class="text-[var(--stone-300)]">}</span>
						</code>
					</pre>

					<div class="flex flex-col gap-4">
						<p class="text-sm text-[var(--stone-300)]">
							The current theme uses a dark stone palette with an orange
							primary. Switching to a different look means updating the
							primitive values - all 40+ semantic tokens and all
							<span class="font-mono text-[var(--text-description)]"
								>@nuxt/ui</span
							>
							component overrides in
							<span class="font-mono text-[var(--text-description)]"
								>app.config.ts</span
							>
							update automatically.
						</p>
						<div class="flex gap-2 flex-wrap">
							<div
								v-for="color in palette"
								:key="color.name"
								class="flex items-center gap-2 bg-[var(--stone-800)] rounded-lg px-3 py-2 text-xs">
								<div
									class="w-4 h-4 rounded"
									:style="{ background: color.hex }" />
								<span class="text-[var(--stone-300)] font-mono">{{
									color.name
								}}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Get started -->
		<section id="get-started" class="px-8 py-24">
			<div class="max-w-6xl mx-auto">
				<div
					class="text-xs font-mono text-[var(--text-subtitle)] mb-3 tracking-widest uppercase">
					Get started
				</div>
				<h2 class="text-3xl sm:text-4xl font-semibold mb-14 max-w-xl">
					Running in under 2 minutes.
				</h2>

				<div class="grid sm:grid-cols-3 gap-4 mb-8">
					<div
						v-for="cmd in gettingStarted"
						:key="cmd.step"
						class="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
						<div class="text-xs font-mono text-[var(--stone-500)] mb-3">
							step {{ cmd.step }}
						</div>
						<h3
							class="text-sm font-semibold text-[var(--text-description)] mb-3">
							{{ cmd.title }}
						</h3>
						<pre
							class="text-xs bg-[var(--stone-800)] rounded-lg p-3 overflow-x-auto text-[var(--stone-300)] font-mono leading-relaxed"
							>{{ cmd.code }}</pre
						>
					</div>
				</div>

				<div class="grid sm:grid-cols-2 gap-4">
					<div
						class="bg-[var(--card-bg)] border border-[var(--orange-focus)] rounded-xl p-6">
						<div class="flex items-start gap-3">
							<UIcon
								name="ic:round-bolt"
								class="w-5 h-5 text-[var(--text-title)] mt-0.5 flex-shrink-0" />
							<div>
								<p
									class="text-sm font-semibold text-[var(--text-description)] mb-1">
									Adding a new table takes 30 seconds
								</p>
								<p class="text-sm text-[var(--stone-300)]">
									Run
									<span
										class="font-mono text-[var(--text-description)] bg-[var(--stone-750)] px-1.5 py-0.5 rounded text-xs"
										>node scripts/create-table.js</span
									>
									and enter a name. It scaffolds the page, store, composable,
									side drawer, and table config - all wired up.
								</p>
							</div>
						</div>
					</div>
					<div
						class="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6">
						<div class="flex items-start gap-3">
							<UIcon
								name="ic:round-swap-horiz"
								class="w-5 h-5 text-[var(--text-title)] mt-0.5 flex-shrink-0" />
							<div>
								<p
									class="text-sm font-semibold text-[var(--text-description)] mb-1">
									Connect your real backend in one line
								</p>
								<p class="text-sm text-[var(--stone-300)]">
									The demo uses
									<span
										class="font-mono text-[var(--text-description)] bg-[var(--stone-750)] px-1.5 py-0.5 rounded text-xs"
										>json-server</span
									>
									locally. Point
									<span
										class="font-mono text-[var(--text-description)] bg-[var(--stone-750)] px-1.5 py-0.5 rounded text-xs"
										>DEMO_BASE</span
									>
									in
									<span
										class="font-mono text-[var(--text-description)] bg-[var(--stone-750)] px-1.5 py-0.5 rounded text-xs"
										>useAPI.js</span
									>
									at your server and everything works immediately.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Footer -->
		<footer class="border-t border-[var(--card-border)] px-8 py-10">
			<div
				class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
				<UiLogo :size="24" :showName="true" :showTagline="true" />
				<div class="flex items-center gap-6 text-xs text-[var(--stone-300)]">
					<a
						href="https://github.com/yourusername/tablo"
						target="_blank"
						class="hover:text-[var(--text-description)] transition-colors"
						>GitHub</a
					>
					<a
						href="/tasks"
						class="hover:text-[var(--text-description)] transition-colors"
						>Live demo</a
					>
					<span>Built with Nuxt 3 · Vue 3 · Pinia · @nuxt/ui</span>
				</div>
			</div>
		</footer>
	</div>
</template>

<script setup>
	definePageMeta({ layout: "blank" });
	useHead({ title: "Tablo: Config-Driven Data Tables for Nuxt 3" });

	const stats = [
		{ value: "1 JSON", label: "file to add a new table" },
		{ value: "4 tabs", label: "built-in side drawer tabs" },
		{ value: "3 roles", label: "RBAC out of the box" },
		{ value: "0 rewrites", label: "to add a new column" },
	];

	const steps = [
		{
			num: "01",
			title: "Write a table config",
			desc: "Define your fields in a JSON file - name, type, visibility, filters, permissions, and the component that renders each cell.",
		},
		{
			num: "02",
			title: "Create a Pinia store",
			desc: "Wire up a store using the API resource factory. Pass your API path - CRUD, pagination, cache, search, and notes are all included.",
		},
		{
			num: "03",
			title: "Add a page",
			desc: "Pass your store and config to Table/Wrapper. The toolbar, modals, side drawer, pagination, and bulk actions render automatically.",
		},
	];

	const features = [
		{
			icon: "ic:round-table-chart",
			title: "Config-driven table",
			desc: "Columns, types, visibility, sort, and filter declared in JSON. Zero component code per entity.",
		},
		{
			icon: "ic:round-add-circle",
			title: "Add & edit modals",
			desc: "Generated from the same config. Field order, required state, and input type come from JSON.",
		},
		{
			icon: "ic:round-tune",
			title: "Filter & sort toolbar",
			desc: "Multi-field filters with = and != operators, sort by any column, save views via URL.",
		},
		{
			icon: "ic:round-bookmark",
			title: "Table state (saved views)",
			desc: "Save current filter, sort, and column visibility as a named view. Share as a direct URL.",
		},
		{
			icon: "ic:round-shield",
			title: "Role-based access",
			desc: "Field-level read and write permissions per role, declared in config. No component changes.",
		},
		{
			icon: "ic:round-history",
			title: "Audit history",
			desc: "Every PATCH request writes a server-generated history entry - who changed what field, from what value, to what value.",
		},
		{
			icon: "ic:round-edit-note",
			title: "Inline cell editing",
			desc: "Double-click any cell to edit it directly. Changes are debounced and queued before flushing to the API.",
		},
		{
			icon: "ic:round-search",
			title: "Full-text search",
			desc: "Debounced search across configurable fields per entity. Configurable in server.js.",
		},
		{
			icon: "ic:round-cached",
			title: "Page cache + abort",
			desc: "Client-side page cache with AbortController. Stale requests are cancelled automatically when a new one starts.",
		},
		{
			icon: "ic:round-drag-indicator",
			title: "Column reordering",
			desc: "Drag columns in the Hide panel to reorder them. Order is persisted in localStorage.",
		},
		{
			icon: "ic:round-select-all",
			title: "Bulk operations",
			desc: "Select multiple rows to bulk update a field or bulk delete. Respects role permissions.",
		},
		{
			icon: "ic:round-people",
			title: "Relation fields",
			desc: "Single and multi-relation dropdowns that fetch from another entity's store with avatar support.",
		},
	];

	const drawerTabs = [
		{
			title: "Notes",
			image: "/screenshots/tablo-tasks-notes.png",
			desc: "Rich text notes with @mention support. Mentions are tokenized and rendered as named links. Supports attachments stored locally in demo mode.",
		},
		{
			title: "Chips",
			image: "/screenshots/tablo-tasks-chips.png",
			desc: "Tag-style multi-value editor for any array field. Add by typing and pressing Enter, remove by clicking. Changes emit to the store immediately.",
		},
		{
			title: "History",
			image: "/screenshots/tablo-tasks-history.png",
			desc: "Server-generated audit trail. Every field change on PATCH is automatically recorded - user, field name, old value, new value, and timestamp.",
		},
		{
			title: "Details",
			image: "/screenshots/tablo-organizations-details.png",
			desc: "Editable field panel. All fields marked as visible are shown with their current values. Double-click any field to edit it inline.",
		},
	];

	const roles = [
		{
			name: "superadmin",
			badgeClass: "bg-[var(--orange-focus)]/20 text-[var(--text-title)]",
			perms: [
				{ label: "Read all records", allowed: true },
				{ label: "Create records", allowed: true },
				{ label: "Edit any field", allowed: true },
				{ label: "Delete records", allowed: true },
				{ label: "See all pages", allowed: true },
			],
		},
		{
			name: "admin",
			badgeClass: "bg-blue-950 text-blue-400",
			perms: [
				{ label: "Read all records", allowed: true },
				{ label: "Create records", allowed: true },
				{ label: "Edit any field", allowed: true },
				{ label: "Delete records", allowed: true },
				{ label: "See all pages", allowed: true },
			],
		},
		{
			name: "team",
			badgeClass: "bg-[var(--stone-700)] text-[var(--stone-300)]",
			perms: [
				{ label: "Read all records", allowed: true },
				{ label: "Create records", allowed: false },
				{ label: "Edit any field", allowed: false },
				{ label: "Delete records", allowed: false },
				{ label: "Users & Organizations pages", allowed: false },
			],
		},
	];

	const extensibility = [
		{
			emoji: "📋",
			title: "New table",
			desc: "Run the scaffold script. A new page, store, config, and side drawer component are created automatically.",
			file: "scripts/create-table.js",
		},
		{
			emoji: "🧩",
			title: "New cell component",
			desc: "Create a Vue component in Table/Cells/ and reference it by name in the config's component field.",
			file: "Table/Cells/MyCell.vue",
		},
		{
			emoji: "📝",
			title: "New form input",
			desc: "Add a component to Form/ and add a v-else-if in Form/Fields.vue for your new type key.",
			file: "Form/MyInput.vue",
		},
		{
			emoji: "📑",
			title: "New drawer tab",
			desc: "Create a tab component in SideDrawer/Tabs/ and register it in the entity's tab_headers config.",
			file: "SideDrawer/Tabs/MyTab.vue",
		},
	];

	const palette = [
		{ name: "--stone-900", hex: "#1c1917" },
		{ name: "--orange-focus", hex: "#ea580c" },
		{ name: "--stone-750", hex: "#26211d" },
		{ name: "--stone-300", hex: "#a09890" },
		{ name: "--stone-100", hex: "#e2ded9" },
	];

	const gettingStarted = [
		{
			step: "01",
			title: "Clone and install",
			code: "git clone github.com/AzzVipe/tablo\ncd tablo\nnpm install --legacy-peer-deps",
		},
		{
			step: "02",
			title: "Start the demo API",
			code: "cd json-server\nnpm install\nnode server.js\n# API at localhost:3001",
		},
		{
			step: "03",
			title: "Run the app",
			code: "npm run dev\n# Open localhost:3000\n# No login required",
		},
	];
</script>
