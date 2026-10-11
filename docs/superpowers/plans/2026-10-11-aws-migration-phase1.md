# Migration AWS Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire tourner l'application Next.js FORGE IA sur le compte AWS de l'utilisateur (eu-west-3), servie sur les mêmes domaines, la base Supabase et Evolution API restant sur le VPS.

**Architecture:** Image Docker `output: "standalone"` poussée sur ECR → ECS Fargate (1 tâche, IP publique, sans NAT) derrière un ALB → CloudFront (HTTPS, domaines `forgeia`/`forgia.guelichweb.store` + `aws-test.guelichweb.store`). `/uploads/*` est servi par CloudFront depuis un bucket S3 privé (OAC) ; l'admin téléverse directement vers S3 via URL pré-signée. Les variables d'environnement vivent dans un secret Secrets Manager injecté dans la tâche. Infra en AWS CDK (TypeScript) dans `infra/`.

**Tech Stack:** Next.js 16.3 standalone, Node 22, Docker (build sur le VPS, pas de Docker en local), AWS CDK v2, `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`.

**Spec:** design validé avec l'utilisateur en conversation le 2026-10-11 (résumé dans « Architecture » ci-dessus).

## Global Constraints

- Région applicative : `eu-west-3`. Certificat CloudFront : `us-east-1`. Profil CLI : `--profile GCHRISTIAN`.
- Aucun NAT Gateway. Une seule tâche Fargate 0.5 vCPU / 1 GB.
- Aucun secret dans le code, l'image, les logs ou la conversation : les valeurs passent VPS → Secrets Manager par pipe, sans affichage.
- La production VPS (`/www/wwwroot/forgeia.guelichweb.store`, PM2 `forgeia`) n'est jamais modifiée avant la bascule ; elle reste le plan de retour arrière.
- Toute création de ressource AWS facturable et toute modification DNS chez LWS : validation de l'utilisateur avant exécution.
- Noms et descriptions de ressources AWS : tirets, jamais de tiret cadratin. Préfixe `forgeia-`.
- En local (pas de bucket configuré), l'upload sur disque existant doit continuer de fonctionner.

## Review Focus

- Fichier de 500 Mo téléversé par l'admin : doit atteindre S3 avec barre de progression, sans passer par le conteneur.
- Nom de fichier avec accents/espaces/emoji : clé S3 assainie identique à l'ancien format `<base>_<id><ext>`.
- Retour FedaPay après paiement derrière CloudFront : l'URL de callback doit être `https://<domaine visité>/...`, jamais `http://`.
- Redémarrage de la tâche Fargate : Google Drive reste connecté (refresh token lu depuis l'environnement).
- Accès direct à l'ALB en contournant CloudFront : refusé (403).

---

### Task 1: Origine publique correcte derrière CloudFront

**Files:**
- Create: `src/lib/http/public-origin.ts`
- Modify: `src/app/api/admin/drive/auth/route.ts:18-20`, `src/app/api/admin/drive/callback/route.ts:14-15`, `src/app/api/inscriptions/route.ts:~50-53`, `src/app/api/wallet/recharge/route.ts:54-55`

**Interfaces:**
- Produces: `getPublicOrigin(request: Request, fallbackHost?: string): string` → `"https://forgeia.guelichweb.store"`

- [ ] **Step 1:** Implémenter `getPublicOrigin` : proto = `cloudfront-forwarded-proto` ‖ `x-forwarded-proto` ‖ `"https"` ; host = `x-forwarded-host` ‖ `host` ‖ `fallbackHost` ‖ host de `request.url`.
- [ ] **Step 2:** Remplacer les 4 constructions manuelles host/proto par `getPublicOrigin`, en conservant le fallback `"forgeia.guelichweb.store"` de `wallet/recharge`.
- [ ] **Step 3:** `npm run lint && npm run build` → succès.
- [ ] **Step 4:** Commit `fix(http): derive public origin from CloudFront headers`.

### Task 2: Upload direct vers S3 par URL pré-signée

**Files:**
- Create: `src/lib/storage/resource-key.ts`, `src/lib/storage/s3-upload.ts`, `src/app/api/admin/content/upload-url/route.ts`
- Modify: `src/app/api/admin/content/upload/route.ts` (utilise `buildResourceFileName`), `src/components/admin/ContentPanel.tsx:31-73`, `package.json`

**Interfaces:**
- Produces: `buildResourceFileName(originalName: string): { id: string; fileName: string }` (logique d'assainissement actuelle des lignes 26-38, déplacée telle quelle) ; `isS3UploadEnabled(): boolean` (vrai si `UPLOADS_BUCKET` défini) ; `createResourceUploadUrl(fileName: string, contentType: string): Promise<string>` (PUT pré-signé, clé `uploads/resources/<fileName>`, expiration 3600 s, région `AWS_REGION`).
- `POST /api/admin/content/upload-url` body `{ name, type, size }` → 200 `{ mode: "s3", uploadUrl, attachment: { id, name, size, formattedSize, url: "/uploads/resources/<fileName>", type } }` ou 200 `{ mode: "local" }` si S3 désactivé ; 400 si `name` manquant ou `size > 500 * 1024 * 1024`. Protégé par `src/middleware.ts` (préfixe `/api/admin`).

- [ ] **Step 1:** `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`.
- [ ] **Step 2:** Extraire `buildResourceFileName` ; la route `upload` existante l'utilise (comportement inchangé).
- [ ] **Step 3:** Implémenter `s3-upload.ts` et la route `upload-url`.
- [ ] **Step 4:** `ContentPanel.uploadSingleFile` : appelle `upload-url` ; si `mode === "s3"`, XHR `PUT uploadUrl` avec `Content-Type: file.type || "application/octet-stream"` et `upload.onprogress`, puis résout `attachment` ; sinon chemin actuel `POST /api/admin/content/upload`.
- [ ] **Step 5:** `npm run dev` sans `UPLOADS_BUCKET` → upload admin d'un fichier fonctionne comme avant (mode local). `npm run lint && npm run build` → succès.
- [ ] **Step 6:** Commit `feat(uploads): presigned direct-to-S3 uploads with local fallback`.

### Task 3: Image Docker standalone + health check

**Files:**
- Create: `Dockerfile`, `.dockerignore`, `src/app/api/health/route.ts`
- Modify: `next.config.ts` (`output: "standalone"`)

**Interfaces:**
- Produces: `GET /api/health` → 200 `{ ok: true }` (dynamique, sans accès base). Image écoutant sur `PORT=3000`, `HOSTNAME=0.0.0.0`, utilisateur non-root.
- Build args : `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (inlinés au build).

- [ ] **Step 1:** Dockerfile multi-étapes `node:22-bookworm-slim` : `npm ci` → `next build` → runtime copiant `.next/standalone`, `.next/static`, `public`. `.dockerignore` exclut `.env*`, `.data`, `data`, `node_modules`, `.next`, `extension`, `public/uploads`, `.git`, `infra`, `docs`.
- [ ] **Step 2:** Route health + `output: "standalone"`.
- [ ] **Step 3:** `npm run build` local puis `node .next/standalone/server.js` (après copie static/public) et `curl http://localhost:3000/api/health` → `{"ok":true}`.
- [ ] **Step 4:** Commit `build: standalone Docker image and health endpoint`, push de la branche `aws-migration`.

### Task 4: Infrastructure CDK

**Files:**
- Create: `infra/package.json`, `infra/tsconfig.json`, `infra/cdk.json`, `infra/bin/forgeia.ts`, `infra/lib/base-stack.ts`, `infra/lib/web-stack.ts`

**Interfaces:**
- `ForgeiaBaseStack` (eu-west-3) : ECR `forgeia-web` (garde 10 images), bucket S3 `forgeia-uploads-<account>` (privé, chiffré, CORS `PUT` depuis les 3 domaines), secret `forgeia/web/env`, budget mensuel 50 USD avec alerte e-mail à 80 % et 100 %. Exporte les noms.
- `ForgeiaWebStack` (eu-west-3, contexte `certificateArn`, `imageTag`) : VPC 2 AZ sous-réseaux publics, `natGateways: 0` ; cluster ECS ; service Fargate 512/1024, `assignPublicIp: true`, circuit breaker avec rollback, health check `/api/health` ; chaque clé du secret injectée via `ecs.Secret.fromSecretsManager(secret, key)`, plus `UPLOADS_BUCKET`, `AWS_REGION`, `NODE_ENV=production` ; rôle de tâche `s3:PutObject` sur `uploads/resources/*` ; ALB dont le SG n'accepte que le prefix list CloudFront et dont le listener renvoie 403 sans l'en-tête secret `X-Origin-Verify` ; CloudFront : défaut → ALB (`CACHING_DISABLED`, `ALL_VIEWER_AND_CLOUDFRONT_2022`), `/_next/static/*` → ALB (`CACHING_OPTIMIZED`), `/uploads/*` → S3 via OAC ; alias des 3 domaines ; logs 30 jours ; alarme 5xx/cibles non saines → SNS e-mail. Sorties : domaine CloudFront.

- [ ] **Step 1:** Écrire l'app CDK. `npx cdk synth` → succès, aucune ressource NAT dans le template.
- [ ] **Step 2:** Commit `infra: CDK stacks for ECS Fargate, CloudFront and S3`.

### Task 5: Déploiement sur AWS (validation utilisateur à chaque étape facturable)

- [ ] **Step 1:** Montrer l'estimation de coût ; sur accord, `cdk bootstrap` eu-west-3 puis `cdk deploy ForgeiaBaseStack`.
- [ ] **Step 2:** Certificat ACM us-east-1 (3 domaines, validation DNS) ; l'utilisateur ajoute les CNAME chez LWS ; attendre `ISSUED`.
- [ ] **Step 3:** Remplir `forgeia/web/env` depuis `.env.local` du VPS + `GOOGLE_REFRESH_TOKEN` (depuis `data/google-drive-token.json`), avec `SUPABASE_INTERNAL_URL=https://supabase.guelichweb.store` et `EVOLUTION_API_URL=https://evolution.guelichweb.store`, par pipe sans affichage (skill `aws-secrets-manager` chargé avant).
- [ ] **Step 4:** Sur le VPS, dans un répertoire séparé `/home/debian/forgeia-build` : checkout de `aws-migration`, `docker build` avec les build args, login ECR par mot de passe temporaire transmis en pipe, `docker push forgeia-web:<sha>`.
- [ ] **Step 5:** `cdk deploy ForgeiaWebStack -c imageTag=<sha> -c certificateArn=<arn>` ; copier `public/uploads/resources/*` du VPS vers S3.
- [ ] **Step 6:** L'utilisateur crée `aws-test.guelichweb.store` CNAME → CloudFront chez LWS. Vérifier : `/api/health`, page d'accueil, connexion admin, upload 500 Mo, téléchargement, quiz, recherche Drive, inscription jusqu'à la page FedaPay (URL de retour en `https`), notifications Telegram/WhatsApp, `curl` direct sur l'ALB → 403.

### Task 6: Bascule DNS et retour arrière

- [ ] **Step 1:** Veille : l'utilisateur baisse le TTL de `forgeia` et `forgia` à 300 s chez LWS.
- [ ] **Step 2:** Jour J : CNAME `forgeia` et `forgia` → domaine CloudFront. Vérifier résolution, parcours de la Task 5 Step 6 sur le vrai domaine, webhook FedaPay reçu (logs CloudWatch).
- [ ] **Step 3:** Retour arrière documenté : remettre l'enregistrement A vers `149.56.131.125` (PM2 `forgeia` toujours actif).
- [ ] **Step 4:** Après une semaine stable (hors de ce plan) : arrêter `forgeia` sur le VPS, CI/CD GitHub → ECR/ECS.
