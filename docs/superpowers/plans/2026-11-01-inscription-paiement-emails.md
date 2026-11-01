# Inscription avec mot de passe, paiement obligatoire et emails — plan de mise en œuvre

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Students create an account with email + password, must pay the 2 500 F pre-registration before reaching `/espace`, then see the WhatsApp group link. All notifications go by email (Brevo) instead of WhatsApp.

**Architecture:**
- A small email layer (`src/lib/email/*`): a Brevo HTTP client, an HTML/text layout and one builder per message. Route handlers call `notifyStudent` / `notifyAdmin`.
- A pure access rule `hasRegistrationAccess` gates the `/espace` layout. Unpaid students land on a new `/inscription/paiement` page.
- Passwords reuse the existing scrypt hashing. Reset links reuse the session HMAC secret with a `reset:` prefix.
- Every WhatsApp sending path (Evolution, Meta) is removed.

**Tech Stack:** Next.js 16.3 App Router (route handlers, server components, `proxy.ts`), React 19, TypeScript, Supabase (service role), Vitest (node environment), AWS CDK (`infra/`), Brevo transactional API.

**Spec:** `docs/superpowers/specs/2026-11-01-inscription-paiement-emails-design.md`

## Global Constraints

- Before writing a page or route handler, read the matching guide in `node_modules/next/dist/docs/01-app/` (AGENTS.md). Middleware is `src/proxy.ts`. `/api/admin/*` is already admin-protected there; admin route handlers still re-check with `verifyAdminSessionToken`, like `src/app/api/admin/drive/status/route.ts`.
- Tests: Vitest, files `src/**/*.test.ts`, `environment: "node"` (no DOM). Client components are checked by the build and by manual checks, not unit tests.
- UI and email copy is in French, addressing the student as « tu ».
- Passwords: 8 characters minimum, everywhere (registration, reset, profile).
- Email sender: `EMAIL_FROM` env, default `FORGE IA <notifications@forgeia.site>`. Brevo endpoint: `POST https://api.brevo.com/v3/smtp/email`, header `api-key: <BREVO_API_KEY>`. Timeout 8 s (`AbortSignal.timeout(8000)`).
- Emails never block the action that triggered them: `sendEmail` never throws. Addresses ending in `@forgeia.local` are never sent to.
- Site URL: `siteOrigin` from `src/lib/config/site.ts` (`https://www.forgeia.site`).
- **The real WhatsApp group link must never appear in the repository** (the repo is public). Tests use `https://chat.whatsapp.com/AbCdEf123456`.
- Never read AWS secret values. `BREVO_API_KEY` already exists in the secret `forgeia/web/env` (added 2026-11-01).
- Work on branch `feat/inscription-emails`. Commit after each task. Merging or pushing to `main` (which deploys) needs Christian's go-ahead.

## Review Focus

1. **Existing student without a password** (registered under the old flow) tries to log in. Expected: a clear 401 telling them to create their password through « mot de passe oublié » (Task 7).
2. **Several enrollment rows with the same email** (people registered twice under the old flow). Expected: login and reset use the most recent row instead of failing (Task 6, `findEnrollmentByEmail`).
3. **FedaPay is down when the form is submitted.** The account and session already exist. Expected: the student is sent to `/inscription/paiement` to retry, not a 500 followed by « email déjà utilisé » (Task 6).
4. **Someone repeats « mot de passe oublié » or tries unknown emails.** Expected: the same answer every time, no email for unknown addresses, at most one email per address per 60 s, which protects the Brevo quota of 300 per day (Task 8).
5. **A student who has not paid opens `/espace/...` directly**, or a test account in « accès complet ». Expected: unpaid → `/inscription/paiement`; « accès complet » → espace (Task 4 rule; layout redirect checked manually in Task 11).

---

### Task 1: Email sending core (Brevo client, layout, notify helpers)

**Files:**
- Create: `src/lib/email/brevo.ts`, `src/lib/email/layout.ts`, `src/lib/email/notify.ts`
- Test: `src/lib/email/brevo.test.ts`, `src/lib/email/layout.test.ts`

**Interfaces:**
- Produces:
  - `type EmailMessage = { subject: string; html: string; text: string }` (exported from `brevo.ts`)
  - `sendEmail(to: { email: string; name?: string }, message: EmailMessage): Promise<{ ok: boolean; stub: boolean }>`
  - `renderEmail(input: { title: string; paragraphs: string[]; button?: { label: string; url: string }; footnote?: string }): { html: string; text: string }` — escapes every dynamic string for HTML
  - `notifyStudent(student: { email: string; fullName: string }, message: EmailMessage): Promise<{ ok: boolean; stub: boolean }>` — the result of `sendEmail`
  - `notifyAdmin(message: EmailMessage): Promise<{ ok: boolean; stub: boolean }>` — sends to `ADMIN_EMAIL`; returns `{ ok: true, stub: true }` without sending if it is unset

- [ ] **Step 1: Write the failing tests** (stub `fetch` with `vi.stubGlobal`, env with `vi.stubEnv`, as in `src/lib/drive/google-drive.test.ts`)
  - `brevo.test.ts`
    - "sends the message through Brevo": with `BREVO_API_KEY=test-key`, one call to `https://api.brevo.com/v3/smtp/email`, method POST, header `api-key: test-key`. Body equals `{ sender: { name: "FORGE IA", email: "notifications@forgeia.site" }, to: [{ email: "awa@example.com", name: "Awa K" }], subject, htmlContent, textContent }`. Result `{ ok: true, stub: false }`.
    - "logs instead of sending without a key": no `fetch` call, result `{ ok: true, stub: true }`.
    - "never sends to test accounts": `to.email = "test@forgeia.local"` gives no `fetch` call.
    - "reports a Brevo refusal without throwing": the stub returns 400 `{ code: "invalid_parameter", message: "sender is not valid" }`, result `{ ok: false, stub: false }`.
    - "reports a network error without throwing": the stub rejects, result `{ ok: false, stub: false }`.
  - `layout.test.ts`
    - "escapes user text in the HTML": paragraph `Awa <script>` gives html containing `Awa &lt;script&gt;` and not `<script>`.
    - "puts the button link in the text version": `button: { label: "Payer", url: "https://www.forgeia.site/inscription/paiement" }` gives text containing `Payer : https://www.forgeia.site/inscription/paiement`.

- [ ] **Step 2: Run the tests and see them fail**
  Run: `npx vitest run src/lib/email` (expected: FAIL, modules not found)

- [ ] **Step 3: Implement the three files**
  - `brevo.ts`: parse `EMAIL_FROM` (`Name <email>`).
  - `layout.ts`: inline-styled HTML with the bordeaux brand colour `#7a1f3d`, title, paragraphs and a button. The text version lists the title, the paragraphs and `label : url`.
  - `notify.ts`: thin wrappers.

- [ ] **Step 4: Run the tests and see them pass**
  Run: `npx vitest run src/lib/email` (expected: PASS)

- [ ] **Step 5: Commit**
  `git add src/lib/email && git commit -m "feat(email): Brevo client, email layout and notify helpers"`

### Task 2: Email messages

**Files:**
- Create: `src/lib/email/messages.ts`
- Test: `src/lib/email/messages.test.ts`

**Interfaces:**
- Consumes: `renderEmail`, `EmailMessage` (Task 1), `siteOrigin`, `formatFcfa`.
- Produces (all return `EmailMessage`):
  - `accountCreatedEmail({ firstname, scheduleLabel, amount })`: button « Finaliser ma préinscription » → `${siteOrigin}/inscription/paiement`
  - `registrationConfirmedEmail({ firstname, scheduleLabel, groupUrl: string | null })`: button « Rejoindre le groupe WhatsApp » when `groupUrl`, plus the receipt link `${siteOrigin}/espace/paiements/recu/registration`
  - `paymentReceivedEmail({ firstname, label, amount, kind })`: receipt link `${siteOrigin}/espace/paiements/recu/${kind}`
  - `coinsCreditedEmail({ firstname, coins, amount })`: link `${siteOrigin}/espace/ressources`
  - `registrationReminderEmail({ firstname, scheduleLabel })` and `paymentReminderEmail({ firstname, scheduleLabel })`
  - `trainerMessageEmail({ firstname, message })`
  - `passwordLinkEmail({ firstname, url, purpose: "reset" | "setup" })`: subject « Réinitialise ton mot de passe FORGE IA » or « Crée ton mot de passe FORGE IA »; says the link is valid for 1 hour
  - `newContentEmail({ kind, title })`
  - `projectReviewedEmail({ firstname, title, approved, score: number | null, feedback: string })`
  - `adminAlertEmail(title: string, lines: [string, string][])`: subject `[FORGE IA] ${title}`

- [ ] **Step 1: Write the failing tests**
  - "the WhatsApp group link is only in the confirmed registration email": `registrationConfirmedEmail({ …, groupUrl: "https://chat.whatsapp.com/AbCdEf123456" })` gives html and text containing that URL. `accountCreatedEmail(...)` and `registrationReminderEmail(...)` contain no `chat.whatsapp.com`.
  - "no group block when the link is not set": with `groupUrl: null`, the text contains no « groupe WhatsApp ».
  - "project review without score or comment": `projectReviewedEmail({ firstname: "Awa", title: "Landing", approved: false, score: null, feedback: "" })` gives text containing « modifications demandées » and neither `null` nor « Commentaire ».
  - "admin alert subject": `adminAlertEmail("Nouvelle inscription", [["Nom", "Awa K"]]).subject === "[FORGE IA] Nouvelle inscription"`, and the text contains `Nom : Awa K`.
  - "payment receipt link": `paymentReceivedEmail({ firstname: "Awa", label: "Tranche 1 (Démarrage)", amount: 30000, kind: "start" }).text` contains `https://www.forgeia.site/espace/paiements/recu/start` and `30 000`.

- [ ] **Step 2: Run them and see them fail**
  Run: `npx vitest run src/lib/email/messages.test.ts`

- [ ] **Step 3: Implement `messages.ts`** (copy in French, short, one call to action per email)

- [ ] **Step 4: Run them and see them pass**
  Run: `npx vitest run src/lib/email`

- [ ] **Step 5: Commit**
  `git commit -m "feat(email): FORGE IA email messages"`

### Task 3: WhatsApp group link setting

**Files:**
- Create: `src/lib/settings/whatsapp-group.ts`, `src/app/api/admin/settings/whatsapp-group/route.ts`, `src/components/admin/WhatsAppGroupCard.tsx`
- Modify: `src/app/admin/(protected)/page.tsx` (render the card above `AdminDashboard`)
- Test: `src/lib/settings/whatsapp-group.test.ts`, `src/app/api/admin/settings/whatsapp-group/route.test.ts`

**Interfaces:**
- Produces:
  - `isWhatsAppGroupUrl(url: string): boolean`: true only for `https://chat.whatsapp.com/<letters/digits>` with an optional query string
  - `getWhatsAppGroupUrl(): Promise<string | null>` and `setWhatsAppGroupUrl(url: string | null): Promise<void>`: table `app_settings`, key `whatsapp_group_url`, value `{ url }`. Same access pattern as `readTokenFromDb` / `writeTokenToDb` in `src/lib/drive/google-drive.ts`.
  - Route: `GET` returns `{ url: string | null }`. `PUT { url }` returns 400 `{ error: "Lien de groupe WhatsApp invalide." }` unless `url === ""` (clears) or `isWhatsAppGroupUrl(url)`. Both return 401 without an admin session.

- [ ] **Step 1: Write the failing tests**
  - `isWhatsAppGroupUrl`
    - true for `https://chat.whatsapp.com/AbCdEf123456` and `https://chat.whatsapp.com/AbCdEf123456?s=cl&p=a`
    - false for `http://chat.whatsapp.com/AbCdEf123456`, `https://evil.example/chat.whatsapp.com/x`, `https://chat.whatsapp.com/` and `javascript:alert(1)`
  - Route (mock `next/headers`, `@/lib/auth/admin-session`, `@/lib/settings/whatsapp-group`, like `src/app/api/admin/drive/status/route.test.ts`)
    - 401 and no `setWhatsAppGroupUrl` call without a session
    - PUT with an invalid url gives 400 and no set call
    - PUT with a valid url calls `setWhatsAppGroupUrl(url)` and returns it
    - PUT with `""` calls `setWhatsAppGroupUrl(null)`

- [ ] **Step 2: Run them and see them fail**
  Run: `npx vitest run src/lib/settings src/app/api/admin/settings`

- [ ] **Step 3: Implement the module, the route and the card**
  The card is a client component: input, « Enregistrer » button and the current status. The page passes `initialUrl` from `getWhatsAppGroupUrl()`.

- [ ] **Step 4: Run them and see them pass**

- [ ] **Step 5: Commit**
  `git commit -m "feat(admin): store the WhatsApp group link outside the repository"`

### Task 4: Registration access rule, espace gate, group banner and menu

**Files:**
- Create: `src/lib/access/registration.ts`, `src/components/espace/WhatsAppGroupBanner.tsx`
- Modify:
  - `src/app/espace/layout.tsx`: after the session check, `if (!hasRegistrationAccess(enrollment)) redirect("/inscription/paiement")`; read `getWhatsAppGroupUrl()` and pass it to the shell
  - `src/components/espace/StudentShell.tsx`: new prop `whatsappGroupUrl: string | null`; when set, an external item « Groupe WhatsApp » (icon 💬, `target="_blank" rel="noreferrer"`) at the end of « Mon compte »
  - `src/app/espace/page.tsx` and `src/components/espace/StudentDashboard.tsx`: new prop `whatsappGroupUrl`; render `<WhatsAppGroupBanner url=… />` at the top
- Test: `src/lib/access/registration.test.ts`

**Interfaces:**
- Consumes: `getWhatsAppGroupUrl` (Task 3).
- Produces: `hasRegistrationAccess(enrollment: Pick<Enrollment, "payments" | "accessOverride">): boolean`, true when `accessOverride === "full"` or the `registration` payment is `paid`.

- [ ] **Step 1: Write the failing test** (table)
  - registration paid → true
  - registration pending → false
  - pending + override `full` → true
  - paid + override `blocked` → true (blocking stays handled by `getCourseAccess`)
  - no payments → false

- [ ] **Step 2: Run it and see it fail**
  Run: `npx vitest run src/lib/access/registration.test.ts`

- [ ] **Step 3: Implement the rule, the layout gate, the shell item and the banner**
  The banner says « Rejoins le groupe WhatsApp FORGEIA » with the buttons « Rejoindre le groupe » and « C'est fait ». « C'est fait » stores `forgeia:whatsapp-group-joined=1` in `localStorage` inside try/catch and hides the banner. The banner is not rendered when `url` is null.

- [ ] **Step 4: Run the test and the typecheck**
  Run: `npx vitest run src/lib/access && npx tsc --noEmit -p .`

- [ ] **Step 5: Commit**
  `git commit -m "feat(espace): pre-registration payment required, WhatsApp group banner"`

### Task 5: Payment page `/inscription/paiement`

**Files:**
- Create:
  - `src/app/inscription/paiement/page.tsx` (server)
  - `src/components/inscription/RegistrationPayment.tsx` (client: pay button + status poller)
  - `src/components/inscription/SignupSteps.tsx` (« 1. Ton compte → 2. Paiement → 3. Bienvenue », prop `current: 1 | 2 | 3`)
- Modify:
  - `src/app/api/paiements/route.ts`: accept `kind === "registration"` in addition to `PAYABLE_INSTALLMENTS`; callback `${origin}/inscription/paiement?retour=1` for `registration`, unchanged for the others
  - `src/app/inscription/confirmation/page.tsx`: replace the whole page with `redirect("/inscription/paiement")`
  - `src/lib/integrations.ts`: in the dev mock of `createFedapayTransaction`, build `paymentUrl` with `new URL(callbackUrl)` + `searchParams.set("mock_payment", "1")` + `set("tx", id)`
- Test: `src/app/api/paiements/route.test.ts`

**Interfaces:**
- Consumes: `hasRegistrationAccess` (Task 4), `getSessionEnrollment`, `markRegistrationPaid`, `formation.registrationFee`.
- Page behaviour:
  - no session → `redirect("/connexion")`
  - paid → step 3 « Paiement confirmé, bienvenue ! » + link « Accéder à mon espace » → `/espace`
  - unpaid → step 2 recap (name, créneau, `formatFcfa(registrationFee)`) + `RegistrationPayment`, which posts `{ kind: "registration" }` to `/api/paiements` and goes to `paymentUrl`; plus a « Se déconnecter » button (`POST /api/auth/logout` then `/connexion`)
  - `?retour=1` and unpaid → « Vérification du paiement… », `router.refresh()` every 3 s, at most 20 times, then « Réessayer le paiement »
  - Dev only (`NODE_ENV !== "production"` and no `FEDAPAY_SECRET_KEY`), `?mock_payment=1` marks the registration paid, as the old confirmation page did

- [ ] **Step 1: Write the failing route test** (mock `@/lib/auth/session`, `@/lib/store/enrollments`, `@/lib/integrations`)
  - "a student can pay the pre-registration and returns to the payment page": `kind: "registration"` → `createFedapayTransaction` receives `callbackUrl: "https://www.forgeia.site/inscription/paiement?retour=1"` and `amount: 2500`
  - "an installment keeps its return page": `kind: "start"` → callback starts with `https://www.forgeia.site/espace/paiements`
  - "an already paid pre-registration is refused": 400 `{ error: "Cette tranche a déjà été réglée." }`

- [ ] **Step 2: Run it and see it fail**
  Run: `npx vitest run src/app/api/paiements`

- [ ] **Step 3: Implement the route change, the page, the components, the confirmation redirect and the mock URL fix**

- [ ] **Step 4: Run the tests and the typecheck**
  Run: `npx vitest run src/app/api/paiements && npx tsc --noEmit -p .`

- [ ] **Step 5: Commit**
  `git commit -m "feat(inscription): payment page between sign-up and the student space"`

### Task 6: Sign-up with password

**Files:**
- Modify:
  - `src/lib/types.ts`: `validateInscription` reads `password` and `passwordConfirm`; `InscriptionInput` gains `password: string`
  - `src/lib/store/enrollments.ts`: `createEnrollment` input gains `passwordHash: string` → column `password_hash`. `findEnrollmentByEmail` returns the most recent row (`.order("created_at", { ascending: false }).limit(1).maybeSingle()`)
  - `src/app/api/inscriptions/route.ts`
  - `src/components/InscriptionForm.tsx`: two password fields, `SignupSteps current={1}`, handles `redirectTo`
- Test: `src/lib/types.test.ts`, `src/app/api/inscriptions/route.test.ts`, `src/lib/store/enrollments.test.ts`

**Interfaces:**
- Consumes: `hashPassword`, `createSession`, `notifyStudent`, `notifyAdmin`, `accountCreatedEmail`, `adminAlertEmail`.
- Route response:
  - success: `{ enrollmentId: string; paymentUrl: string | null; redirectTo?: "/inscription/paiement" }`
  - 409 `{ error: "Un compte existe déjà avec cet email. Connecte-toi pour continuer." }` when `findEnrollmentByEmail` finds the email

- [ ] **Step 1: Write the failing tests**
  - `validateInscription`
    - password `"court"` → error « Le mot de passe doit contenir au moins 8 caractères. »
    - password `"motdepasse1"` with confirm `"motdepasse2"` → « Les deux mots de passe ne correspondent pas. »
    - a valid body → `data.password === "motdepasse1"`
  - Route (mock store, session, integrations, notify, seats)
    - "an existing email is sent to the login page": 409 with the error above and no `createEnrollment`
    - "creates the account, signs the student in and starts the payment": `createEnrollment` gets a `passwordHash` different from the plain password; `createSession(enrollment.id)` is called; FedaPay `callbackUrl === "https://www.forgeia.site/inscription/paiement?retour=1"`; `notifyStudent` and `notifyAdmin` are each called once; the response has the FedaPay `paymentUrl`
    - "FedaPay down still lets the student retry" (Review Focus 3): `createFedapayTransaction` rejects → 200 `{ enrollmentId, paymentUrl: null, redirectTo: "/inscription/paiement" }` and the session is created
  - `findEnrollmentByEmail` (Review Focus 2), in `src/lib/store/enrollments.test.ts` with `@/lib/supabase/admin` mocked to a chainable query builder:
    - the query uses `eq("email", "awa@example.com")` (lower-cased input `" Awa@Example.com "`), `order("created_at", { ascending: false })` and `limit(1)`
    - the mapped row is returned

- [ ] **Step 2: Run them and see them fail**
  Run: `npx vitest run src/lib/types.test.ts src/lib/store/enrollments.test.ts src/app/api/inscriptions`

- [ ] **Step 3: Implement the validation, store, route and form changes**
  In the route, drop the `notifyWhatsApp` / `notifyAdminWhatsApp` calls. Keep the Telegram message and add the email line.

- [ ] **Step 4: Run them and see them pass, then the full suite**
  Run: `npx vitest run`

- [ ] **Step 5: Commit**
  `git commit -m "feat(inscription): account with password created before payment"`

### Task 7: Password-only login and reset tokens

**Files:**
- Create: `src/lib/auth/hmac.ts` (move `sign` out of `session.ts`), `src/lib/auth/password-reset.ts`
- Modify:
  - `src/lib/auth/session.ts`: use `hmacSign`; remove `normalizePhone`, `phonesMatch`, `findEnrollmentByCredentials`
  - `src/lib/store/enrollments.ts`: remove `findEnrollmentByEmailAndWhatsapp`; `updateEnrollmentProfile` password threshold goes to 8
  - `src/app/api/profile/route.ts`: message « … au moins 8 caractères. »
  - `src/app/api/auth/login/route.ts`
  - `src/components/LoginForm.tsx`: email + password; links « Mot de passe oublié ? » → `/mot-de-passe-oublie`; hint « Première connexion depuis la mise à jour ? Crée ton mot de passe »
  - `src/lib/auth/session-isolation.test.ts`: remove the `findEnrollmentByEmailAndWhatsapp` mock
- Test: `src/lib/auth/password-reset.test.ts`, `src/app/api/auth/login/route.test.ts`

**Interfaces:**
- Produces:
  - `hmacSign(payload: string): string` and `hmacMatches(payload: string, signature: string): boolean` (secret `ADMIN_SESSION_SECRET`, timing-safe compare)
  - `passwordFingerprint(passwordHash: string | undefined): string`: first 16 hex characters of SHA-256 of `passwordHash ?? "aucun"`
  - `createPasswordResetToken(enrollment: { id: string; passwordHash?: string }, nowMs?: number): string`: payload `reset:<id>:<expSeconds>:<fingerprint>`, validity 3600 s
  - `readPasswordResetToken(token: string, nowMs?: number): { enrollmentId: string; fingerprint: string } | null`
  - Login: `POST { email, password }` → 200 `{ ok: true, redirectTo: "/espace" }`. 401 `{ error: "Email ou mot de passe incorrect." }`. For an account without a password: 401 `{ error: "Ton compte n'a pas encore de mot de passe. Clique sur « Mot de passe oublié » pour le créer.", needsPassword: true }`

- [ ] **Step 1: Write the failing tests**
  - Reset token
    - round trip returns the id and fingerprint
    - after 3601 s → null
    - one character changed in the signature → null
    - a student session token (`student:<id>:<exp>.<sig>`) is refused
    - `passwordFingerprint` differs after `hashPassword` of a new password
  - Login route
    - right password → `createSession` called
    - wrong password → 401 with the message above
    - account without `passwordHash` → 401 with `needsPassword: true` (Review Focus 1)
    - body `{ email, whatsapp }` with no password → 401, no session

- [ ] **Step 2: Run them and see them fail**
  Run: `npx vitest run src/lib/auth src/app/api/auth/login`

- [ ] **Step 3: Implement the files**
  The existing session-isolation tests must still pass after `sign` moves to `hmac.ts`.

- [ ] **Step 4: Run the full suite**
  Run: `npx vitest run` (expected: PASS, including `session-isolation.test.ts`)

- [ ] **Step 5: Commit**
  `git commit -m "feat(auth): password-only login and signed reset tokens"`

### Task 8: « Mot de passe oublié » routes and pages

**Files:**
- Create:
  - `src/app/api/auth/password/forgot/route.ts`
  - `src/app/api/auth/password/reset/route.ts`
  - `src/app/mot-de-passe-oublie/page.tsx` + `src/components/auth/ForgotPasswordForm.tsx`
  - `src/app/mot-de-passe/nouveau/page.tsx` + `src/components/auth/NewPasswordForm.tsx`
- Test: `src/app/api/auth/password/forgot/route.test.ts`, `src/app/api/auth/password/reset/route.test.ts`

**Interfaces:**
- Consumes: `findEnrollmentByEmail`, `getEnrollment`, `updateEnrollmentProfile`, `createSession`, `createPasswordResetToken`, `readPasswordResetToken`, `passwordFingerprint`, `passwordLinkEmail`, `notifyStudent`, `getPublicOrigin`.
- Forgot: `POST { email }` → always 200 `{ ok: true }`. When the account exists and the address got no email in the last 60 s (in-memory `Map<string, number>` per container), it sends `passwordLinkEmail({ purpose: hasPassword ? "reset" : "setup", url: `${origin}/mot-de-passe/nouveau?token=${token}` })`.
- Reset: `POST { token, password, passwordConfirm }`:
  - 400 `{ error: "Ce lien n'est plus valable. Demande un nouveau lien." }` for an invalid or expired token, or a fingerprint that no longer matches
  - 400 for a short or mismatched password (same messages as Task 6)
  - on success: update the password, call `createSession`, return 200 `{ redirectTo: "/espace" }`

- [ ] **Step 1: Write the failing tests**
  - Forgot
    - unknown email → 200 and `notifyStudent` not called
    - known email → one call whose text contains `/mot-de-passe/nouveau?token=`
    - same email again right away → 200, still one call (Review Focus 4)
  - Reset
    - valid token → `updateEnrollmentProfile(id, { password })` + `createSession(id)` + `redirectTo`
    - token minted before a password change (different fingerprint) → 400 « Ce lien n'est plus valable… »
    - `password: "court"` → 400

- [ ] **Step 2: Run them and see them fail**
  Run: `npx vitest run src/app/api/auth/password`

- [ ] **Step 3: Implement the routes and the two pages**
  - The forgot page shows the generic confirmation after submit.
  - The new-password page reads `token` from `searchParams` and redirects to `redirectTo` on success.

- [ ] **Step 4: Run them and see them pass**

- [ ] **Step 5: Commit**
  `git commit -m "feat(auth): forgot password by email"`

### Task 9: Email notifications replace WhatsApp everywhere

**Files:**
- Modify:
  - `src/app/api/webhooks/fedapay/route.ts`:
    - registration → `registrationConfirmedEmail` with `await getWhatsAppGroupUrl()`
    - other installments → `paymentReceivedEmail`
    - coins → `coinsCreditedEmail`
    - each also sends `notifyAdmin(adminAlertEmail(...))`; Telegram is unchanged
  - `src/app/api/admin/enrollments/payment/route.ts`: same choice, registration vs installment
  - `src/app/api/admin/content/route.ts`: `newContentEmail` to students with `hasRegistrationAccess`
  - `src/app/api/admin/projects/route.ts`: `projectReviewedEmail`
  - `src/app/api/projects/route.ts`: `notifyAdmin(adminAlertEmail("Nouveau projet soumis", …))`
  - `src/app/api/quizzes/route.ts`: remove the WhatsApp notification (no email)
  - `src/components/admin/EnrollmentRow.tsx`:
    - call `/api/admin/remind`
    - button labels « Relancer par email »
    - new button « Envoyer le lien mot de passe » (`type: "password"`)
    - keep the manual `wa.me` link
- Create: `src/app/api/admin/remind/route.ts`
- Delete: `src/app/api/admin/whatsapp/remind/route.ts`
- Test: `src/app/api/admin/remind/route.test.ts`, `src/app/api/webhooks/fedapay/route.test.ts`

**Interfaces:**
- Remind route: `POST { enrollmentId, type: "registration" | "payment" | "custom" | "password", customMessage? }`:
  - 200 `{ ok: true, sentTo: email }`
  - 400 `{ error: "Type de message invalide" }`
  - 502 `{ error: "Échec de l'envoi de l'email" }` when `notifyStudent` returns `ok: false`
  - `password` uses `passwordLinkEmail` with `purpose: "setup"` when the student has no password, `"reset"` otherwise

- [ ] **Step 1: Write the failing tests**
  - Remind route
    - `type: "password"` for a student without a password → the email subject is « Crée ton mot de passe FORGE IA » and the text contains `/mot-de-passe/nouveau?token=`
    - `type: "bogus"` → 400
  - Webhook (mock `verifyFedapayWebhook`, the store, `getWhatsAppGroupUrl` → `"https://chat.whatsapp.com/AbCdEf123456"`, notify)
    - approved `registration` → the student email contains the group link and the admin alert is sent
    - approved `start` → the student email contains no `chat.whatsapp.com`

- [ ] **Step 2: Run them and see them fail**
  Run: `npx vitest run src/app/api/admin/remind src/app/api/webhooks`

- [ ] **Step 3: Replace every `notifyWhatsApp` / `notifyAdminWhatsApp` call as listed and delete the old remind route**

- [ ] **Step 4: Run the full suite and the typecheck**
  Run: `npx vitest run && npx tsc --noEmit -p .`

- [ ] **Step 5: Commit**
  `git commit -m "feat(notifications): emails instead of WhatsApp"`

### Task 10: Remove WhatsApp sending code and update the infrastructure

**Files:**
- Modify:
  - `src/lib/integrations.ts`: remove `formatWhatsAppDigits`, `whatsAppNumberCandidates`, `beninLocalDigits`, `sendViaEvolutionApi`, `pickEvolutionNumber`, `notifyWhatsApp`; keep Telegram and FedaPay
  - `src/components/admin/AdminShell.tsx`: remove the external link « WhatsApp (Evolution) »
  - `infra/lib/web-stack.ts`:
    - remove the env vars `EVOLUTION_API_URL` and `EVOLUTION_API_INSTANCE`
    - remove `EVOLUTION_API_KEY` and `ADMIN_WHATSAPP` from `ENV_SECRET_KEYS`
    - add `BREVO_API_KEY` to `ENV_SECRET_KEYS`
    - add env `EMAIL_FROM: "FORGE IA <notifications@forgeia.site>"`
- Delete: `src/lib/integrations.test.ts` (it only tested the removed WhatsApp code)

- [ ] **Step 1: Remove the code and update the CDK**

- [ ] **Step 2: Verify that nothing references WhatsApp sending anymore**
  Run: `grep -rnE "notifyWhatsApp|notifyAdminWhatsApp|EVOLUTION_|whatsAppNumberCandidates" src infra/lib` (expected: no output)

- [ ] **Step 3: Typecheck, tests and CDK synth**
  - `npx tsc --noEmit -p .`
  - `npx vitest run`
  - in `infra/`: `npx cdk synth ForgeiaWebStack --exclusively -c imageTag=test --profile GCHRISTIAN -q`; then in the synthesized task definition, check that `BREVO_API_KEY` is a secret, `EMAIL_FROM` is an env var, and no `EVOLUTION*` entry remains

- [ ] **Step 4: Commit**
  `git commit -m "chore: remove WhatsApp sending (Evolution) and wire Brevo in the infrastructure"`

### Task 11: Final checks, deploy and production test

- [ ] **Step 1: Full local check**
  - `npx vitest run`
  - `npx eslint` on the changed files (only the pre-existing `any` errors may remain)
  - `NEXT_PUBLIC_APP_URL=https://www.forgeia.site NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=build-placeholder npx next build`

- [ ] **Step 2: Ask Christian for the go-ahead**, then merge `feat/inscription-emails` into `main` and push. This deploys; follow the « Déploiement AWS » run until it succeeds.

- [ ] **Step 3: Christian pastes the WhatsApp group link** in Admin → card « Groupe WhatsApp »

- [ ] **Step 4: Production test** with an `@forgeia.local` test account, plus a real email for the email checks:
  1. Sign up → redirect to FedaPay. Coming back without paying → `/inscription/paiement`. `/espace` → redirected.
  2. In the admin, mark the pre-registration paid by hand → `/espace` opens and the group banner and menu item appear.
  3. Ask for « mot de passe oublié » with Christian's real email (a real account) → the email arrives, is not in spam, and the link works.
  4. Check in Brevo (Transactional logs) that the emails show as delivered.

- [ ] **Step 5: Update memory and the docs**
  Mark Evolution and the VPS as no longer needed for FORGE IA.
