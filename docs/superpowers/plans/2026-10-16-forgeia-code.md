# FORGEIA CODE Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship FORGEIA CODE — a VS Code extension that turns Kilo Code into the FORGE IA coding assistant — plus the platform side (metered gateway, per-student AI budget, sign-in link, student and admin pages), installable before 2026-10-31.

**Architecture:** Our extension (`extension/`) depends on `kilocode.kilo-code` and writes Kilo's documented global config (`~/.config/kilo/kilo.jsonc` provider `forgeia`, `~/.config/kilo/agent/forgeia-*.md` agents). The Next.js app meters every gateway call into `ia_usage`, enforces a FCFA budget per enrollment, and exposes `/api/ia/v1/me` and `/api/ia/link` for the extension. The `.vsix` is built in CI and served from `/downloads`.

**Tech Stack:** Next.js 16.3 (App Router, read `node_modules/next/dist/docs/` before coding), Supabase (service role, RLS on, no policies), TypeScript, Vitest, VS Code Extension API, esbuild, `@vscode/vsce`, `jsonc-parser`.

**Spec:** `docs/superpowers/specs/2026-10-16-forgeia-code-design.md`

## Global Constraints

- Extension id `guelichweb.forgeia-code`, displayName `FORGEIA CODE`, version `2.0.0`, `extensionDependencies: ["kilocode.kilo-code"]`, `engines.vscode: "^1.105.0"`.
- Kilo provider id `forgeia`, npm `@ai-sdk/openai-compatible`, baseURL `https://ia.guelichweb.store/v1`; default model `forgeia/forgeia-coder`.
- Budget default `5000` FCFA (`formation.iaBudgetFcfa`); FX `600` FCFA per USD; coin top-up `1 coin = 50 FCFA`.
- Prices (USD / 1M tokens, miss / hit / output): `forgeia-coder`, `deepseek-v4-flash`, `deepseek-chat`, `deepseek-coder` = 0.30 / 0.006 / 1.20; `deepseek-v4-pro` = 1.32 / 0.044 / 3.96; `kimi-k3` and `nemotron-3.5` = 0.30 / 0.006 / 1.20 (placeholder until a provider bills them).
- Budget exhausted → HTTP 402, message `Ton crédit IA FORGE IA est épuisé. Recharge-le avec tes coins dans ton espace (Mon assistant IA).`
- All user-facing copy in French. Never print or commit secrets. Migrations are applied with the Supabase MCP `apply_migration`; never re-apply 006. Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Deploy = push to `main`.

## Review Focus

- A student who already has a `kilo.jsonc` with comments, other providers or their own default model: FORGEIA must add its provider without destroying anything — Task 9 test `preserves comments and other providers`.
- A stream that ends without a `usage` chunk (client closes VS Code, network cut): the call must still be charged by estimate — Task 4 test `estimates usage when the stream has no usage chunk`.
- Budget reaching zero mid-course: the next call gets a 402 with the French message, not a generic error — Task 4 test `refuses when remaining budget is zero or less`.
- An expired, tampered or replayed-from-another-student link token: refused — Task 5 tests.
- Kilo Code missing or the user declines installing it: FORGEIA CODE still activates and offers to install Kilo — Task 10 step 6 manual check.

---

### Task 1: Pricing and usage parsing (+ test tooling)

**Files:**
- Modify: `package.json` (devDependency `vitest`, script `"test": "vitest run"`)
- Create: `vitest.config.ts` (node env, alias `@` → `src`)
- Create: `src/lib/ia/pricing.ts`
- Modify: `src/lib/config/formation.ts` (add `iaBudgetFcfa: 5_000`)
- Test: `src/lib/ia/pricing.test.ts`

**Interfaces:**
- Produces: `type IaUsage = { promptTokens: number; cachedTokens: number; completionTokens: number }`; `parseUsage(raw: unknown): IaUsage | null`; `estimateUsage(requestChars: number, responseChars: number): IaUsage` (4 chars/token, cached 0); `computeCostFcfa(alias: string, usage: IaUsage): number` (rounded to 2 decimals; unknown alias uses `forgeia-coder` prices); `USD_TO_FCFA = 600`.

- [ ] **Step 1: Write failing tests**

```ts
expect(parseUsage({ prompt_tokens: 1000, completion_tokens: 50, prompt_tokens_details: { cached_tokens: 800 } }))
  .toEqual({ promptTokens: 1000, cachedTokens: 800, completionTokens: 50 });
expect(parseUsage({ prompt_tokens: 1000, completion_tokens: 50, prompt_cache_hit_tokens: 700 }))
  .toEqual({ promptTokens: 1000, cachedTokens: 700, completionTokens: 50 });
expect(parseUsage(undefined)).toBeNull();
expect(estimateUsage(4000, 400)).toEqual({ promptTokens: 1000, cachedTokens: 0, completionTokens: 100 });
// 1M miss + 0 hit + 0 out on flash = 0.30 $ = 180 F
expect(computeCostFcfa("forgeia-coder", { promptTokens: 1_000_000, cachedTokens: 0, completionTokens: 0 })).toBe(180);
// 1M all cached on flash = 0.006 $ = 3.6 F ; 1M output on pro = 3.96 $ = 2376 F
expect(computeCostFcfa("deepseek-v4-flash", { promptTokens: 1_000_000, cachedTokens: 1_000_000, completionTokens: 0 })).toBe(3.6);
expect(computeCostFcfa("deepseek-v4-pro", { promptTokens: 0, cachedTokens: 0, completionTokens: 1_000_000 })).toBe(2376);
expect(computeCostFcfa("inconnu", { promptTokens: 1_000_000, cachedTokens: 0, completionTokens: 0 })).toBe(180);
```

- [ ] **Step 2:** `npx vitest run src/lib/ia/pricing.test.ts` → FAIL (module missing).
- [ ] **Step 3:** Implement `pricing.ts` per Interfaces and Global Constraints prices.
- [ ] **Step 4:** Same command → PASS.
- [ ] **Step 5:** Commit `feat(ia): pricing and usage parsing for the gateway`.

### Task 2: Provider abstraction

**Files:**
- Create: `src/lib/ia/providers.ts`
- Modify: `src/lib/ia/gateway.ts` (use provider instead of hard-coded NVIDIA URL/key/models)
- Test: `src/lib/ia/providers.test.ts`

**Interfaces:**
- Produces: `type IaProvider = { id: "nvidia" | "deepseek"; chatUrl: string; apiKey: string | null; resolveModel(alias: string): string; fallbackAlias: string }`; `getIaProvider(env = process.env): IaProvider`.
- Values: `IA_PROVIDER` default `nvidia`. nvidia → `https://integrate.api.nvidia.com/v1/chat/completions`, key `NVIDIA_API_KEY`, mapping as in current `gateway.ts`, fallback alias `kimi-k3`. deepseek → `https://api.deepseek.com/chat/completions`, key `DEEPSEEK_API_KEY`, mapping `forgeia-coder|deepseek-v4-flash|deepseek-chat|deepseek-coder → deepseek-chat`, `deepseek-v4-pro → deepseek-reasoner` (verify names when the key arrives), fallback alias `deepseek-v4-pro`. Unknown alias passes through unchanged.

- [ ] **Step 1: Failing tests:** `getIaProvider({}).id === "nvidia"`; `getIaProvider({ IA_PROVIDER: "deepseek", DEEPSEEK_API_KEY: "k" }).apiKey === "k"`; nvidia `resolveModel("forgeia-coder") === "deepseek-ai/deepseek-v4-flash-0731"`; `resolveModel("custom/x") === "custom/x"`; missing key → `apiKey === null`.
- [ ] **Step 2:** run → FAIL. **Step 3:** implement; refactor `forwardChatCompletion` to call `getIaProvider()` (503 message unchanged when `apiKey` is null; failover goes to `resolveModel(fallbackAlias)`). **Step 4:** `npx vitest run && npx tsc --noEmit -p .` → PASS.
- [ ] **Step 5:** Commit `refactor(ia): provider abstraction (nvidia now, deepseek ready)`.

### Task 3: Usage table and store

**Files:**
- Create: `supabase/migrations/008_ia_usage.sql`
- Create: `src/lib/ia/usage-store.ts`

**Interfaces:**
- Consumes: `computeCostFcfa`, `IaUsage` (Task 1); `debitCoins`-style wallet helper from `src/lib/wallet/store.ts` (add `debitCoinsForIa(enrollmentId, coins): Promise<void>` there, recording a `coin_transactions` row with reason `Crédit IA`).
- Produces: `recordIaUsage(input: { enrollmentId: string; alias: string; usage: IaUsage; estimated: boolean }): Promise<void>`; `getIaBalance(enrollment: Enrollment): Promise<{ budgetFcfa: number; spentFcfa: number; remainingFcfa: number }>` (budget = `enrollment.iaBudgetFcfa ?? formation.iaBudgetFcfa`, spent = sum `cost_fcfa`, top-ups are negative rows); `listRecentIaUsage(enrollmentId: string, limit = 20)`; `listIaUsageByStudent(): Promise<{ enrollmentId: string; spentFcfa: number; calls: number; lastAt: string | null }[]>`; `setIaBudget(enrollmentId: string, fcfa: number | null)`; `topUpIaFromCoins(enrollmentId: string, coins: number)` (inserts row alias `topup`, cost `-coins*50`).
- Migration: table `public.ia_usage (id bigserial pk, enrollment_id uuid not null references enrollments(id) on delete cascade, alias text not null, prompt_tokens int not null default 0, cached_tokens int not null default 0, completion_tokens int not null default 0, estimated boolean not null default false, cost_fcfa numeric(12,2) not null, created_at timestamptz not null default now())`, index `(enrollment_id, created_at desc)`, RLS enabled; `alter table enrollments add column if not exists ia_budget_fcfa integer`. Add `iaBudgetFcfa?: number` to `Enrollment` + `mapRow`.

- [ ] **Step 1:** Write the migration; apply with MCP `apply_migration` (name `008_ia_usage`); verify with `list_tables` that `ia_usage` exists and `get_advisors` shows no new security error beyond the known "RLS without policy" info.
- [ ] **Step 2:** Implement the store; `npx tsc --noEmit -p .` → clean.
- [ ] **Step 3:** Commit `feat(ia): usage table and per-student AI budget store (migration 008)`.

### Task 4: Metering and budget enforcement in the gateway

**Files:**
- Create: `src/lib/ia/meter.ts`
- Modify: `src/lib/ia/gateway.ts`, `src/app/api/ia/v1/chat/completions/route.ts`
- Test: `src/lib/ia/meter.test.ts`

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces: `meterSseStream(body: ReadableStream<Uint8Array>, onDone: (usage: IaUsage | null, streamedChars: number) => void): ReadableStream<Uint8Array>` (passes bytes through unchanged; parses `data: {…}` lines, keeps the last `usage`, counts `choices[].delta.content` chars; calls `onDone` once on close, cancel or error); `checkBudget(remainingFcfa: number): Response | null` (402 + Global Constraints message when ≤ 0); `authenticateIaRequest(request): Promise<{ kind: "master" } | { kind: "student"; enrollment: Enrollment } | null>` replacing `authorizeIaRequest` (same 5-min cache, now caching the enrollment id).
- Gateway: for students, `checkBudget` before forwarding; set `stream_options: { include_usage: true }` when `stream === true`; streaming → wrap body with `meterSseStream`; non-streaming → read JSON, `parseUsage(json.usage)`, return it. Record with `recordIaUsage` (`estimated` true when falling back to `estimateUsage(JSON.stringify(payload.messages).length, streamedChars)`). Master calls are not recorded.

- [ ] **Step 1: Failing tests:**
  - `passes bytes through and reports the final usage chunk` — stream of 3 SSE events, last has `usage: { prompt_tokens: 10, completion_tokens: 2 }` → output text identical to input; `onDone` called once with `{ promptTokens: 10, cachedTokens: 0, completionTokens: 2 }`.
  - `estimates usage when the stream has no usage chunk` — deltas `"Bon"`, `"jour"`, no usage → `onDone(null, 7)`.
  - `refuses when remaining budget is zero or less` — `checkBudget(0)` status 402 and body message equals the Global Constraints text; `checkBudget(0.01)` → `null`.
- [ ] **Step 2:** run → FAIL. **Step 3:** implement. **Step 4:** `npx vitest run && npx tsc --noEmit -p .` → PASS.
- [ ] **Step 5:** Commit `feat(ia): meter gateway usage and enforce the per-student budget`.

### Task 5: Link token, `/api/ia/link` and `/api/ia/v1/me`

**Files:**
- Create: `src/lib/ia/link-token.ts`, `src/app/api/ia/link/route.ts`, `src/app/api/ia/v1/me/route.ts`
- Test: `src/lib/ia/link-token.test.ts`

**Interfaces:**
- Produces: `createIaLinkToken(enrollmentId: string, now = Date.now()): string` (`link:<id>:<exp>.<hmac>`, 10 min, secret `ADMIN_SESSION_SECRET`, prefix distinct from session/key tokens); `readIaLinkToken(token: string, now = Date.now()): string | null`.
- `POST /api/ia/link` body `{ token }` → `{ apiKey: createStudentIaKey(id), baseUrl: "https://ia.guelichweb.store/v1", firstName }` or 400/401. Refuse when registration unpaid or access blocked (same rule as the gateway).
- `GET /api/ia/v1/me` (Bearer student key) → `{ firstName, budgetFcfa, spentFcfa, remainingFcfa, currentLesson: { title, url } | null }`; `currentLesson` = first unlocked, not completed lesson from `getStudentProgress(id, getCourseAccess(enrollment))`, url `https://forgeia.guelichweb.store/espace/programme/<lessonId>`. CORS headers as other gateway routes.

- [ ] **Step 1: Failing tests:** round-trip returns the id; token read at `now + 11 min` → null; signature altered → null; token whose id part is swapped for another UUID → null; a student session token (`student:…`) → null.
- [ ] **Step 2–4:** FAIL → implement → `npx vitest run && npx tsc --noEmit -p .` PASS.
- [ ] **Step 5:** Commit `feat(ia): extension sign-in link and /me endpoint`.

### Task 6: Student page « Mon assistant IA »

**Files:**
- Create: `src/app/espace/assistant-ia/page.tsx`, `src/components/espace/AssistantIaClient.tsx`, `src/app/api/ia/topup/route.ts`
- Modify: `src/components/espace/StudentShell.tsx` (entry « Mon assistant IA » in section Outils), `src/components/espace/ResourcesHubClient.tsx` (AI card links to the new page instead of showing the key)

**Interfaces:**
- Consumes: `getIaBalance`, `listRecentIaUsage`, `topUpIaFromCoins`, `createIaLinkToken`, `createStudentIaKey`, wallet balance.
- Page content (French): 1) « Installer FORGEIA CODE » — download link `/downloads/forgeia-code-<version>.vsix` + 3 install steps; 2) « Connecter » — primary button `vscode://guelichweb.forgeia-code/connect?token=<createIaLinkToken>` and a « Copier ma clé » fallback; 3) budget bar (restant / budget, dépensé) ; 4) recharge: coins input (multiples of 10, ≤ wallet) → `POST /api/ia/topup { coins }` (session-authenticated, 400 if insufficient coins); 5) last 20 calls (date, mode/modèle, tokens, coût).
- Locked state when `getCourseAccess(...).blocked` or registration unpaid (same pattern as `/espace/projets`).

- [ ] **Step 1:** Implement; `npx tsc --noEmit -p .` clean.
- [ ] **Step 2:** Local check (dev server + test account cookie, see previous sessions): page renders at 375 px and 1280 px without horizontal overflow; top-up with 10 coins moves remaining budget by +500 F and wallet by −10, then revert in SQL.
- [ ] **Step 3:** Commit `feat(espace): Mon assistant IA page (install, connect, budget, top-up)`.

### Task 7: Admin page « Assistant IA »

**Files:**
- Create: `src/app/admin/(protected)/ia/page.tsx`, `src/components/admin/IaUsagePanel.tsx`, `src/app/api/admin/ia/budget/route.ts`
- Modify: `src/components/admin/AdminShell.tsx` (entry « Assistant IA » in Formation)

**Interfaces:**
- Consumes: `listIaUsageByStudent`, `listEnrollments`, `setIaBudget`.
- Panel: totals (dépensé total en F et en $, appels), per student card/table (same responsive pattern as the cohort list: cards < xl): nom, budget (editable number, empty = défaut), dépensé, restant, dernier appel. `POST /api/admin/ia/budget { id, budgetFcfa: number | null }` (protected by `src/proxy.ts`).

- [ ] **Step 1:** Implement; tsc clean. **Step 2:** local check at 375/1280 px; editing a budget persists and reflects in the student page. **Step 3:** Commit `feat(admin): AI usage and budgets per student`.

### Task 8: Extension scaffold

**Files:**
- Create: `extension/package.json`, `extension/tsconfig.json`, `extension/esbuild.mjs`, `extension/vitest.config.ts`, `extension/src/extension.ts`, `extension/media/icon.png` (from `public/logo-color.png`, 128×128), `extension/README.md` (French, install + usage), `extension/LICENSE` (MIT, GUELICHWEB), `extension/.vscodeignore`, `extension/CHANGELOG.md`
- Modify: root `.gitignore` (`extension/node_modules`, `extension/dist`, `*.vsix` except none tracked), root `tsconfig.json` exclude `extension`

**Interfaces:**
- Produces: `activate(context)` registering commands from later tasks; output channel `FORGEIA CODE`; scripts `build` (esbuild → `dist/extension.js`, cjs, external `vscode`), `test` (vitest), `package` (`vsce package --no-dependencies -o forgeia-code-<version>.vsix`).
- `package.json` per Global Constraints, `activationEvents: ["onStartupFinished", "onUri"]`, `categories: ["AI", "Education"]`, dependency `jsonc-parser`.

- [ ] **Step 1:** Scaffold; `cd extension && npm install && npm run build && npm run package` → produces `forgeia-code-2.0.0.vsix`.
- [ ] **Step 2:** `code --install-extension extension/forgeia-code-2.0.0.vsix` → VS Code reports installed (and Kilo already present). Commit `feat(extension): FORGEIA CODE scaffold`.

### Task 9: Kilo configuration writer

**Files:**
- Create: `extension/src/kilo-config.ts`, `extension/agents/` (filled in Task 13)
- Test: `extension/src/kilo-config.test.ts`

**Interfaces:**
- Produces: `applyForgeiaProvider(text: string, opts: { apiKey: string; baseUrl: string }): string` (uses `jsonc-parser` `modify`/`applyEdits`; sets `provider.forgeia` = `{ npm, name: "FORGE IA", options: { baseURL, apiKey }, models: { "forgeia-coder": { name: "FORGE IA Coder (DeepSeek)", limit: { context: 128000, output: 16384 } }, "deepseek-v4-pro": { name: "DeepSeek Pro (tâches difficiles)", limit: { context: 128000, output: 16384 } }, "kimi-k3": { name: "Kimi K3", limit: { context: 128000, output: 16384 } } } }` and `model` = `forgeia/forgeia-coder`); `removeForgeiaApiKey(text: string): string`; `kiloConfigPath(home: string): string` (`<home>/.config/kilo/kilo.jsonc`, or `kilo.json` if only that exists); `writeKiloConfig(home, opts)`; `installAdaptAgents(home, sourceDir)` (copies `forgeia-*.md` into `<home>/.config/kilo/agent/`, overwriting ours only).

- [ ] **Step 1: Failing tests:**
  - `adds the provider to an empty config` — input `{\n  "$schema": "https://app.kilo.ai/config.json"\n}` → parsed result has `provider.forgeia.options.baseURL === "https://ia.guelichweb.store/v1"`, `model === "forgeia/forgeia-coder"`, `$schema` kept.
  - `preserves comments and other providers` — input with `// mon commentaire` and `provider.vllm` → output still contains `// mon commentaire` and `provider.vllm` unchanged.
  - `is idempotent` — applying twice equals applying once.
  - `removeForgeiaApiKey` leaves the provider but `options.apiKey` absent.
- [ ] **Step 2–4:** FAIL → implement → `cd extension && npm test` PASS.
- [ ] **Step 5:** Commit `feat(extension): configure Kilo Code for the FORGE IA gateway`.

### Task 10: Sign-in

**Files:**
- Create: `extension/src/auth.ts`, `extension/src/api.ts`
- Modify: `extension/src/extension.ts`

**Interfaces:**
- Consumes: Task 9, `/api/ia/link`, `/api/ia/v1/me`.
- Produces: `api.exchangeLinkToken(token): Promise<{ apiKey: string; baseUrl: string; firstName: string }>`; `api.getMe(apiKey): Promise<Me>` (`Me` = Task 5 `/me` shape); `auth.getKey(ctx): Promise<string | undefined>` (SecretStorage key `forgeia.apiKey`); `auth.signIn(ctx, apiKey, baseUrl)` (store secret, `writeKiloConfig`, `installAdaptAgents`, info message « Connecté, <prénom> ! Ouvre Kilo Code et choisis un mode ADAPT. »); URI handler path `/connect`; commands `forgeia.connect` (opens `https://forgeia.guelichweb.store/espace/assistant-ia`), `forgeia.enterKey` (input box, validates via `getMe`), `forgeia.signOut` (delete secret + `removeForgeiaApiKey`).
- On activation: if `vscode.extensions.getExtension("kilocode.kilo-code")` is undefined → warning with button « Installer Kilo Code » → `workbench.extensions.installExtension`.

- [ ] **Step 1:** Implement; `npm run build` clean.
- [ ] **Step 2–5:** Manual on this PC with the test account: platform button opens VS Code and signs in; `~/.config/kilo/kilo.jsonc` contains provider `forgeia`; sign out removes the key; manual key entry works; invalid key shows « Clé refusée par FORGE IA ».
- [ ] **Step 6:** With Kilo disabled, reload: the install prompt appears and the extension does not crash.
- [ ] **Step 7:** Commit `feat(extension): FORGE IA sign-in (link + manual key)`.

### Task 11: Status bar, menu and daily tools

**Files:**
- Create: `extension/src/status.ts`, `extension/src/commands.ts`
- Modify: `extension/src/extension.ts`, `extension/package.json` (commands, menus)

**Interfaces:**
- Consumes: `api.getMe`, `auth.getKey`.
- Status bar item (left): signed out → `$(plug) FORGE IA : se connecter`; signed in → `$(sparkle) FORGE IA · <restant> F` (fr-FR format), warning background when < 500 F; refresh on activation, every 5 min and after commands; click → `forgeia.menu`.
- `forgeia.menu` QuickPick: « Exercice du jour » (opens `currentLesson.url` externally, or info « Aucun exercice ouvert pour l'instant »), « Nouveau projet de la formation » (Task 12), « Aperçu dans le navigateur interne » (input URL default `http://localhost:3000` → `simpleBrowser.show`), « Mon crédit IA » (opens assistant page), « Déposer mon projet » (opens `/espace/projets`), « Se déconnecter ».

- [ ] **Step 1:** Implement; build clean. **Step 2:** Manual: status bar shows the test account's remaining budget (5 000 F); menu entries open the right targets; preview opens VS Code's built-in browser. **Step 3:** Commit `feat(extension): status bar budget and FORGE IA menu`.

### Task 12: Project templates

**Files:**
- Create: `extension/templates/landing/{AGENTS.md,BRIEF.md,index.html,styles.css}`, `extension/templates/site/{AGENTS.md,BRIEF.md,index.html,about.html,contact.html,styles.css}`, `extension/templates/saas/{AGENTS.md,BRIEF.md,README.md,.env.example}`, `extension/src/templates.ts`
- Test: `extension/src/templates.test.ts`

**Interfaces:**
- Produces: `TEMPLATES: { id: "landing" | "site" | "saas"; label: string; description: string }[]` (labels: « Projet 1 — Landing page (UI8 / Figma) », « Projet 2 — Site vitrine (WordPress → code) », « Projet 3 — Mon SaaS (Supabase + FedaPay) »); `copyTemplate(id, sourceRoot, targetDir): Promise<string[]>` (refuses a non-empty target dir); command flow: QuickPick → folder picker → copy → `vscode.openFolder`.
- Every `AGENTS.md` states the ADAPT rules (explain before editing, small steps, test in the browser, French comments) and the project brief link in `BRIEF.md`.

- [ ] **Step 1: Failing tests:** `copyTemplate("landing", …, emptyTmp)` returns paths including `AGENTS.md` and `index.html`; on a dir containing a file → rejects with `Le dossier doit être vide`.
- [ ] **Step 2–4:** FAIL → implement → PASS. **Step 5:** Commit `feat(extension): templates for the 3 training projects`.

### Task 13: ADAPT agents and walkthrough

**Files:**
- Create: `extension/agents/forgeia-acquerir.md`, `forgeia-decortiquer.md`, `forgeia-assigner.md`, `forgeia-personnaliser.md`, `forgeia-tester.md`, `forgeia-coach.md`; `extension/walkthrough/*.md` (4 steps)
- Modify: `extension/package.json` (`contributes.walkthroughs` id `forgeia.start`, title « Démarrer avec FORGEIA CODE »)

**Interfaces:**
- Agent frontmatter per Kilo docs (`description`, `mode: primary`, `color`, `permission`); `acquerir`, `decortiquer`, `coach`: `permission.edit: deny`, `coach` also `bash: deny`; others default. Prompts in French, short (≤ 40 lines), each naming its ADAPT step and the expected student behaviour; `coach` never writes the solution, asks one guiding question at a time.
- Walkthrough steps: 1 Se connecter (`command:forgeia.connect`), 2 Choisir un mode ADAPT dans Kilo Code, 3 Créer le projet de la semaine (`command:forgeia.newProject`), 4 Voir le résultat dans le navigateur interne (`command:forgeia.preview`).

- [ ] **Step 1:** Write files. **Step 2:** Build, reinstall the vsix, sign in: the 6 agents appear in Kilo's agent picker; walkthrough opens from « Bienvenue ». **Step 3:** Commit `feat(extension): ADAPT modes, coach mode and getting-started walkthrough`.

### Task 14: CI packaging and distribution

**Files:**
- Modify: `.github/workflows/deploy.yml` (before the Docker build: `cd extension && npm ci && npm test && npm run build && npx vsce package --no-dependencies -o ../public/downloads/forgeia-code-$(node -p "require('./package.json').version").vsix`)
- Modify: `src/app/api/extension/version/route.ts` (version and URL from `extension/package.json`)
- Delete: `public/downloads/forgeia-code-1.0.0.vsix`
- Modify: `.dockerignore` if needed so `public/downloads/*.vsix` is included and `extension/node_modules` excluded

- [ ] **Step 1:** Implement. **Step 2:** Push; `gh run watch` → success; `curl -sI https://forgeia.guelichweb.store/downloads/forgeia-code-2.0.0.vsix` → 200; `/api/extension/version` → version `2.0.0`.
- [ ] **Step 3:** Commit `ci: build and publish the FORGEIA CODE vsix on deploy`.

### Task 15: End-to-end check on a fresh profile

- [ ] **Step 1:** `code --user-data-dir <tmp> --extensions-dir <tmp2> --install-extension <downloaded vsix>` → Kilo is installed as a dependency.
- [ ] **Step 2:** Sign in from the production page with the test account; status bar shows the budget; agents present; template + preview work.
- [ ] **Step 3:** Record what remains blocked on the AI key (real chat) in the final report; restore the test account data.
