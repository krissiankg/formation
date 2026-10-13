# Formation ADAPT dans l'application — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mettre la formation ADAPT de 2 mois (contenus, défis, recherches, quiz, grilles, calendrier, prix) dans l'application, lisible par les apprenants.

**Architecture:** Les contenus vivent en Markdown versionné dans `content/formation/` (une leçon = un fichier avec un en-tête YAML) et les quiz dans `content/formation/quizzes.json`. Un script Node génère la migration SQL `supabase/migrations/006_formation_adapt.sql` (remplacement du programme, nouveaux types, quiz, séances, todos), appliquée à la base de production. Une nouvelle page `/espace/programme/[lessonId]` rend le Markdown et permet de marquer une leçon terminée.

**Tech Stack:** Next.js 16 (App Router), Supabase (supabase-js), `react-markdown` + `remark-gfm`, Node script (ESM) pour la génération SQL.

**Spec:** `docs/superpowers/specs/2026-10-13-formation-adapt-design.md`

## Global Constraints

- Langue : français, tutoiement, ton direct et pratique ; ≥ 70 % du temps de séance en pratique.
- Gabarit de séance : rappel 15 · code-along 45 · pratique guidée 50 · atelier outil IA 20 · pause 15 · défi 40 · projet 70 · bilan 10 (= 4 h 25).
- Dates : S1 2026-10-31/11-01 … S8 2026-12-19/20 (samedi = classe 1, dimanche = classe 2), horaires « 9h – 13h30 ».
- Prix : 5 000 (inscription, non remboursable) + 25 000 (1er jour) + 50 000 (1re semaine de décembre) = 80 000 F.
- Types de leçon : `séance`, `outil`, `code`, `test`, `défi`, `recherche`.
- Aucun secret dans le dépôt ; la génération SQL échappe les apostrophes (`'` → `''`).
- Déploiement : push sur `main` (GitHub Actions). Base : appliquer 006 via `docker exec supabase-db psql` sur le VPS.

## Review Focus

- Apprenant inscrit avant le changement (échéancier `start/month1/month3`) : ses paiements et reçus doivent toujours s'afficher.
- Leçon verrouillée ouverte par URL directe : afficher un écran « bientôt disponible », pas le contenu.
- Markdown contenant des blocs de code et des tableaux : rendu lisible sur mobile (défilement horizontal du code).
- Apostrophes et guillemets dans les contenus : la migration SQL doit s'exécuter sans erreur.
- Ré-exécution de la migration 006 : idempotente (pas de doublons de séances, todos ou quiz).

---

### Task 1: Types de leçon `défi` et `recherche`

**Files:** Modify `src/lib/programme/types.ts`, `src/app/api/admin/programme/route.ts:56,76`, `src/components/admin/ProgrammePanel.tsx:126`; add a label/badge helper `src/lib/programme/lesson-types.ts`.
**Interfaces:** Produces `LESSON_TYPE_LABELS: Record<LessonType, string>` (`séance`→« Séance », `outil`→« Outil IA », `code`→« Code », `test`→« Quiz », `défi`→« Défi », `recherche`→« Recherche »).
- [ ] Étendre `LessonType`, les casts des routes admin et les options du select admin.
- [ ] `LessonRow` affiche `LESSON_TYPE_LABELS[lesson.type]` au lieu du type brut.
- [ ] `npx tsc --noEmit -p .` → exit 0. Commit.

### Task 2: Page de lecture d'une leçon

**Files:** Create `src/app/espace/programme/[lessonId]/page.tsx`, `src/components/espace/LessonMarkdown.tsx`, `src/app/api/programme/progress/route.ts`; modify `LessonRow` (lien), `package.json`.
**Interfaces:** `POST /api/programme/progress` body `{ lessonId }` → marque `completed` pour l'apprenant connecté (upsert `student_lesson_progress`), 401 sans session, 404 leçon inconnue, 403 si la leçon est verrouillée.
- [ ] `npm install react-markdown remark-gfm`.
- [ ] Page : `getStudentContext()` ; leçon introuvable → `notFound()` ; statut `locked`/`upcoming` → écran « Bientôt disponible » ; sinon titre, type, durée, Markdown, bouton « J'ai terminé » (si `current`), liens leçon précédente/suivante.
- [ ] `LessonMarkdown` : `react-markdown` + `remark-gfm`, styles (titres, listes, tableaux, `pre` avec `overflow-x-auto`).
- [ ] `LessonRow` cliquable (lien) quand non verrouillée.
- [ ] tsc → 0. Commit.

### Task 3: Échéancier en 2 tranches

**Files:** Modify `src/lib/config/formation.ts`, `src/app/api/inscriptions/route.ts:31-45`, `src/app/api/paiements/route.ts:19,43-47`, `src/lib/programme/payments.ts:5-11`, `src/app/api/webhooks/fedapay/route.ts:14-15`, `src/app/espace/paiements/recu/[kind]/page.tsx:18-19`.
**Interfaces:** `formation.installments = [{id:"start", amount:25000, label:"Au démarrage", due:"Premier jour de formation (31 oct. / 1er nov. 2026)"}, {id:"month1", amount:50000, label:"Solde", due:"Première semaine de décembre 2026"}]`. `PaymentKind` garde `month3` (anciens inscrits).
- [ ] Inscription : échéancier construit par `formation.installments.map(...)`.
- [ ] Paiements/labels : recherche par `id` dans `installments`, libellé de repli pour `month3` (« 3e tranche (ancien échéancier) »).
- [ ] tsc → 0. Commit.

### Task 4: Configuration 2 mois et site public

**Files:** Modify `src/lib/config/formation.ts` (`durationMonths: 2`, `startLabel: "31 octobre 2026"`, `endLabel: "20 décembre 2026"`, `totalPrice: 80000`, `months` = 2 entrées ADAPT, `outcomes`), vérifier `src/app/page.tsx` et `src/components/SiteFooter.tsx` (marquee « Oct → Déc 2026 » → « Nov → Déc 2026 »).
- [ ] Mettre à jour la config ; relire chaque usage de `formation.*` dans `src/app/page.tsx` pour éviter un texte « 3 mois » codé en dur.
- [ ] tsc → 0. Commit.

### Task 5: Contenus — Module 0 « Bienvenue »

**Files:** Create `content/formation/00-bienvenue/*.md` : `01-bienvenue.md` (formateur + histoire du code et de l'IA + méthode ADAPT + règles du jeu), `02-forgeia-code.md`, `03-cursor.md`, `04-claude-code.md`, `05-antigravity.md`, `06-methodes-pro.md`.
**Format :** en-tête YAML `id` (uuid fixe), `module`, `order`, `title`, `type`, `duration` ; corps Markdown. Guides outils : à quoi il sert · installation et coût · gestes de base · méthodes pro · pièges et sécurité · mini-exercice.
- [ ] Rédiger les 6 fichiers. Commit.

### Task 6: Contenus — Mois 1 (S1–S4) et grilles P1, P2

**Files:** `content/formation/01-mois-1/` : pour chaque séance `sN-seance.md`, `sN-defi.md`, `sN-recherche.md` ; `grille-projet-1.md`, `grille-projet-2.md`.
**Séance :** objectifs · prérequis · déroulé minuté (gabarit) · code-along pas à pas · atelier outil IA · consignes types à copier · checklist de fin · pour aller plus loin. **Défi :** énoncé, durée, livrable, critères de réussite, bonus avancés, aide pour ceux en difficulté. **Recherche :** mission, livrable, où chercher, critères. **Grille :** 5–6 critères × 4 niveaux.
- [ ] Rédiger les 14 fichiers. Commit.

### Task 7: Contenus — Mois 2 (S5–S8) et grille P3

**Files:** `content/formation/02-mois-2/` : S5–S7 (séance, défi, recherche), S8 (séance Demo Day), `grille-projet-3.md`.
- [ ] Rédiger les 11 fichiers. Commit.

### Task 8: Quiz

**Files:** Create `content/formation/quizzes.json` : `[{ id, lessonFile, title, description, durationMinutes, passingScore: 70, questions: [{ question, options[4], correct, explanation }] }]` — 7 quiz de 10 questions (S1–S7, dont 2–3 questions de rappel des séances précédentes à partir de S2) + quiz final de 20 questions (S8). Chaque quiz est rattaché à une leçon `test` générée.
- [ ] Rédiger le JSON ; vérifier `correct` ∈ [0,3] et 4 options partout (script de contrôle dans Task 9). Commit.

### Task 9: Générateur de migration 006

**Files:** Create `scripts/build-formation-migration.mjs` → écrit `supabase/migrations/006_formation_adapt.sql`.
**Interfaces:** `node scripts/build-formation-migration.mjs` lit `content/formation/**/*.md` (front-matter minimal parsé à la main) et `quizzes.json`, valide (ids uniques, types valides, quiz cohérents) et écrit le SQL : extension de la contrainte `type`, suppression de l'ancien programme (modules sans ces ids), upsert modules/leçons (`on conflict (id) do update`), suppression puis réinsertion des séances/todos/quiz de la formation (ids fixes) dans une transaction.
- [ ] Écrire le script ; exécuter ; contrôler le SQL généré (aucune erreur de validation).
- [ ] Commit (script + SQL).

### Task 10: Application en base et déploiement

- [ ] Sauvegarde : `pg_dump` des tables `formation_*` et `student_lesson_progress` sur le VPS (`/root/backup-formation-<date>.sql`).
- [ ] Appliquer 006 via `docker exec -i supabase-db psql -v ON_ERROR_STOP=1` ; `NOTIFY pgrst, 'reload schema'`.
- [ ] Vérifier les comptes (modules 3, leçons, quiz 8, questions 90, séances 16, todos).
- [ ] Push `main` → déploiement GitHub Actions vert ; vérifier `/`, `/condition` (prix 80 000), `/espace/programme` (compte de test si disponible) et une page de leçon.
