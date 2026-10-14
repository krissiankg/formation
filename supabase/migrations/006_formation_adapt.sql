-- ATTENTION : SEED INITIAL, DEJA APPLIQUE (VPS et Supabase Cloud, 2026-10-13). NE PAS REAPPLIQUER :
-- il ecraserait les lecons, quiz et seances modifies depuis le tableau de bord admin.
-- Le contenu de la formation se gere desormais dans Admin > Programme / Tests / Seances.
-- 006_formation_adapt.sql — GÉNÉRÉ par scripts/build-formation-migration.mjs, ne pas éditer à la main.
-- Remplace le programme 3 mois par la formation ADAPT (2 mois) : modules, leçons, quiz, séances, préparation.
begin;

alter table public.formation_lessons drop constraint if exists formation_lessons_type_check;
alter table public.formation_lessons add constraint formation_lessons_type_check check (type in ('séance', 'outil', 'code', 'test', 'défi', 'recherche'));

-- Ancien programme : suppression en cascade (leçons, quiz, progression).
delete from public.formation_modules where id not in ('c0000000-0000-4000-8000-000000000000', 'c0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002');

-- Modules
insert into public.formation_modules (id, sort_order, month_label, title) values ('c0000000-0000-4000-8000-000000000000', 0, $forge$Avant de commencer$forge$, $forge$Bienvenue, boîte à outils IA et méthodes pro$forge$) on conflict (id) do update set sort_order = excluded.sort_order, month_label = excluded.month_label, title = excluded.title;
insert into public.formation_modules (id, sort_order, month_label, title) values ('c0000000-0000-4000-8000-000000000001', 1, $forge$Mois 1 · Novembre$forge$, $forge$La méthode ADAPT sur de vrais sites$forge$) on conflict (id) do update set sort_order = excluded.sort_order, month_label = excluded.month_label, title = excluded.title;
insert into public.formation_modules (id, sort_order, month_label, title) values ('c0000000-0000-4000-8000-000000000002', 2, $forge$Mois 2 · Décembre$forge$, $forge$Ton SaaS et ton offre$forge$) on conflict (id) do update set sort_order = excluded.sort_order, month_label = excluded.month_label, title = excluded.title;

-- Leçons
delete from public.formation_lessons where id not in ('d0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000006', 'd0000000-0000-4000-8000-000000000007', 'e1000000-0000-4000-8000-000000000011', 'e1000000-0000-4000-8000-000000000013', 'e1000000-0000-4000-8000-000000000010', 'e1000000-0000-4000-8000-000000000021', 'e1000000-0000-4000-8000-000000000023', 'e1000000-0000-4000-8000-000000000020', 'e1000000-0000-4000-8000-000000000031', 'e1000000-0000-4000-8000-000000000033', 'e1000000-0000-4000-8000-000000000030', 'e1000000-0000-4000-8000-000000000041', 'e1000000-0000-4000-8000-000000000043', 'e1000000-0000-4000-8000-000000000040', 'e2000000-0000-4000-8000-000000000051', 'e2000000-0000-4000-8000-000000000053', 'e2000000-0000-4000-8000-000000000050', 'e2000000-0000-4000-8000-000000000061', 'e2000000-0000-4000-8000-000000000063', 'e2000000-0000-4000-8000-000000000060', 'e2000000-0000-4000-8000-000000000071', 'e2000000-0000-4000-8000-000000000073', 'e2000000-0000-4000-8000-000000000070', 'e2000000-0000-4000-8000-000000000080', 'e1000000-0000-4000-8000-000000000012', 'e1000000-0000-4000-8000-000000000022', 'e1000000-0000-4000-8000-000000000032', 'e1000000-0000-4000-8000-000000000042', 'e2000000-0000-4000-8000-000000000052', 'e2000000-0000-4000-8000-000000000062', 'e2000000-0000-4000-8000-000000000072', 'e2000000-0000-4000-8000-000000000082');
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('d0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000000', 1, $forge$Bienvenue dans FORGE IA — ton formateur, la méthode, les règles du jeu$forge$, 'séance', $forge$25 min$forge$, $forge$## Bienvenue 👋

Pendant 2 mois, tu vas apprendre à **livrer de vrais sites et un vrai produit en ligne** — pas en codant tout de zéro, mais en faisant ce que font les pros en 2026 : **partir d'un design et d'un code de qualité, et diriger l'IA pour les adapter à ton besoin.**

À la fin, tu auras **3 projets dans ton portfolio**, dont **ton propre SaaS** capable d'encaisser des paiements Mobile Money.

## Ton formateur

**Christian GUEGUELIGUE** — *Full-Stack Engineer, AI Automation Architect & Vibe Coder*, plus de **11 ans d'expérience** dans le digital.

- **Fondateur & développeur principal de GUELICHWEB** (agence digitale, depuis 2023) : sites, applications, automatisations IA, CRM, chatbots et produits numériques pour des entreprises de la zone UEMOA.
- **Consultant en stratégie digitale & développeur web** depuis 2017, notamment pour l'**Alliance Bioversity-CIAT** : sites vitrines et e-commerce, SEO, UX/UI sur Figma, maintenance en production.
- **Formateur** depuis 2022 (DR Computer, SNB, particuliers) : WordPress, copywriting, montage vidéo.
- Sa stack au quotidien : **Next.js, React, TypeScript, Tailwind, WordPress, Supabase**, et côté IA **Cursor, Antigravity, n8n, Make** — plus **Figma** pour le design et **AWS / Vercel / Netlify** pour la mise en ligne.

Cette plateforme elle-même (inscription, paiements, espace apprenant, quiz, coins, extension FORGEIA CODE) a été construite avec la méthode que tu vas apprendre.

> 🔗 Portfolio : [gchristian.online](https://gchristian.online)

## Une brève histoire du code et de l'IA (pour comprendre où tu arrives)

| Époque | Ce qui change | Ce qu'il fallait savoir faire |
|---|---|---|
| 1940–1950 | Premiers ordinateurs, cartes perforées, langage machine | Parler la langue de la machine, instruction par instruction |
| 1950–1980 | Langages « humains » : Fortran, COBOL, C | Écrire des programmes complets à la main |
| 1990–2000 | Le **web** : HTML, CSS, JavaScript, PHP | Construire des pages et des sites |
| 2003–2010 | **WordPress** et les CMS : un site sans coder | Choisir un thème, l'installer, le configurer |
| 2010–2020 | Frameworks (React, Next.js), **no-code**, marchés de templates (ThemeForest, UI8) | Assembler des briques existantes |
| 1956 → 2017 | L'IA : de la conférence de Dartmouth aux réseaux de neurones, puis l'architecture **Transformer** (2017) | — |
| 2022 | **ChatGPT** : l'IA devient grand public | Savoir poser une question |
| 2023–2024 | Assistants de code (Copilot, Cursor) : l'IA complète et modifie ton code | Savoir **décrire** précisément ce qu'on veut |
| 2025–2026 | **Agents** (Claude Code, Antigravity, Cursor Agent) : l'IA lit tout un projet, planifie, exécute, vérifie | Savoir **diriger, découper et vérifier** |

**La leçon de l'histoire :** chaque vague a rendu la création plus accessible — et a récompensé ceux qui maîtrisaient **la méthode**, pas seulement l'outil. Les outils changeront encore dans 6 mois. La méthode que tu vas apprendre, elle, restera.

## La méthode ADAPT

C'est le fil rouge de toute la formation. Chaque projet suit ces 5 étapes :

1. **A — Acquérir** : trouver le bon point de départ (template UI8, kit Figma, thème WordPress) et **vérifier sa licence**.
2. **D — Décortiquer** : analyser sa structure — pages, sections, composants, couleurs, typographies, espacements.
3. **A — Assigner à l'IA** : faire reconstruire le code **composant par composant**, avec des consignes précises.
4. **P — Personnaliser** : y mettre la marque, les textes, les images et les fonctionnalités voulues.
5. **T — Tester & mettre en ligne** : vérifier ce que l'IA a produit, l'affichage mobile, puis publier.

## Comment se passe la formation

- **8 séances de 4 h 30**, une par semaine : le **samedi** (classe 1) ou le **dimanche** (classe 2), de 9 h à 13 h 30.
- **Chaque séance est pratique à plus de 70 %** : rappel flash → démo en *code-along* (tu reproduis en même temps) → pratique guidée → atelier outil IA → défi chronométré → atelier projet → bilan.
- **Entre deux séances (2 à 3 h)** : un quiz, une mission de recherche, et l'avancement de ton projet.

### Les 3 projets de ton portfolio

| Projet | Ce que tu livres | Quand |
|---|---|---|
| **1. Landing page** | Un template UI8 ou Figma transformé en vrai site, en ligne | Séance 3 |
| **2. Site vitrine** | Un thème WordPress analysé puis recodé en site moderne de plusieurs pages | Séance 5 |
| **3. Ton SaaS** | Ton propre produit : tableau de bord, base de données, connexion, paiement Mobile Money | Séance 8 (Demo Day) |

Les **grilles d'évaluation** des 3 projets sont dans ce programme : tu sais dès le départ sur quoi tu seras évalué.

### Le certificat FORGE IA

Tu l'obtiens si : **tes 3 projets sont validés** (niveau « satisfaisant » ou plus sur chaque critère essentiel) **et ta moyenne aux quiz est d'au moins 70 %**.

## Les règles du jeu

1. **Ton ordinateur portable à chaque séance**, chargé, avec les outils installés (voir la liste de préparation).
2. **Commit avant chaque demande à l'IA.** Toujours. On t'expliquera pourquoi dès la séance 1.
3. **Tu restes le chef de projet.** L'IA propose, tu décides, tu vérifies.
4. **On partage.** Si tu bloques plus de 15 minutes, tu demandes. Si tu trouves une astuce, tu la partages.
5. **On respecte les licences.** La bibliothèque à coins sert à t'entraîner ; pour un client ou ton SaaS, utilise un template dont tu as la licence.
6. **Jamais de mot de passe ou de clé secrète dans une conversation avec l'IA.**

## Ta première action

- [ ] Lis les 4 guides de la **boîte à outils IA** (leçons suivantes).
- [ ] Coche la **liste de préparation** dans ton tableau de bord.
- [ ] Clique sur « J'ai terminé » en bas de cette page.

On se voit en séance 1. 🚀
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('d0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000000', 2, $forge$Boîte à outils IA #1 — FORGEIA CODE (ton outil par défaut)$forge$, 'outil', $forge$20 min$forge$, $forge$## À quoi il sert

**FORGEIA CODE** est l'extension VS Code de la formation : un **agent de code** qui lit ton projet, propose un plan, crée et modifie des fichiers et lance des commandes — en te demandant ton accord. Il est branché sur la **passerelle IA FORGE IA** (modèles DeepSeek et Kimi via NVIDIA), donc **tu n'as pas d'abonnement à payer** pendant la formation.

**Quand le choisir :** pour tout le travail de la formation, en classe comme chez toi. C'est l'outil commun à tous : quand on montre une manip en séance, tu peux la reproduire exactement.

## Installation (10 minutes)

1. Installe **VS Code** : [code.visualstudio.com](https://code.visualstudio.com).
2. Dans ton espace apprenant → **Ressources** → onglet **Environnement développeur IA** : télécharge le fichier `.vsix` de FORGEIA CODE.
3. Dans VS Code : panneau **Extensions** → menu `…` → **Install from VSIX…** → choisis le fichier.
4. Ouvre FORGEIA CODE dans la barre latérale → réglages du fournisseur :
   - **API Provider** : *OpenAI Compatible*
   - **Base URL** : `https://ia.guelichweb.store/v1`
   - **API Key** : ta **clé personnelle** (même onglet des Ressources — elle est à toi, ne la partage pas)
   - **Model** : `forgeia-coder` (ou `deepseek-v4-flash`)
5. Test : ouvre un dossier vide et demande « Crée un fichier `index.html` avec une page “Bonjour FORGE IA” centrée ». Si le fichier apparaît, tu es prêt.

## Les gestes de base

- **Deux modes** : **Plan** (l'agent réfléchit et propose, sans toucher aux fichiers) et **Act** (il exécute). **Commence toujours en Plan** pour une tâche de plus de 2 fichiers.
- **Mentionner du contexte** avec `@` : `@fichier`, `@dossier/`, une URL de doc, les **problèmes** affichés par VS Code ou le **terminal**. Plus le contexte est précis, meilleur est le résultat.
- **Approuver ou refuser** chaque action (écriture de fichier, commande). Lis ce qu'il propose avant d'approuver.
- **Checkpoints** : à chaque étape, tu peux comparer et revenir en arrière si le résultat ne te plaît pas.
- **Glisser une image** (capture d'écran d'un design) dans la conversation : l'agent s'en sert comme modèle.

## Les méthodes pro (ce qu'on ne voit pas dans les tutos)

1. **Un fichier de règles par projet.** Crée `.clinerules` à la racine du projet avec ta stack, tes conventions et tes interdits. Exemple :
   ```
   - Stack : Next.js (App Router), TypeScript, Tailwind CSS.
   - Couleurs et typographies : uniquement celles de design-tokens.md.
   - Un composant = un fichier dans components/.
   - Ne jamais installer de dépendance sans me demander.
   - Réponds en français, explique en 3 lignes ce que tu as changé.
   ```
   L'agent relit ces règles à chaque demande : tu n'as plus à te répéter.
2. **Une demande = un résultat vérifiable.** « Reproduis le header du design » ✅ — « Fais tout le site » ❌.
3. **Commit Git avant chaque demande.** Si l'agent casse quelque chose, `git restore .` et tu repars propre.
4. **Demande-lui de se relire** : « Relis tes modifications : qu'est-ce qui pourrait casser sur mobile ? »
5. **Conversation neuve par tâche.** Une conversation trop longue fait perdre le fil à l'agent (et coûte plus). Nouvelle tâche = nouvelle conversation.
6. **Limite l'auto-approbation** : autorise la lecture de fichiers automatiquement, mais garde la validation manuelle pour les commandes du terminal.

## Pièges et sécurité

- ❌ Ne colle **jamais** de mot de passe, de clé secrète ou de fichier `.env` dans la conversation.
- ❌ N'approuve pas une commande que tu ne comprends pas (surtout `rm`, `del`, `git push --force`). Demande d'abord : « Explique cette commande ».
- ⚠️ Le modèle peut inventer une fonction ou un paquet qui n'existe pas : si une erreur apparaît, colle-la telle quelle et demande la cause.

## Mini-exercice (5 min)

Dans un dossier `test-forgeia`, en mode **Plan** puis **Act** :
> « Crée une page HTML avec Tailwind (CDN) : un titre, un paragraphe et un bouton bordeaux #791d3e. Explique ensuite ce que tu as fait en 3 lignes. »

Ouvre la page dans ton navigateur. ✅ Ton atelier IA fonctionne.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('d0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000000', 3, $forge$Boîte à outils IA #2 — Cursor$forge$, 'outil', $forge$25 min$forge$, $forge$## À quoi il sert

**Cursor** est un éditeur de code (une version de VS Code) **construit autour de l'IA** : complétion intelligente, édition en ligne, chat sur ton projet et **agent** capable de modifier plusieurs fichiers. C'est l'outil le plus utilisé par les développeurs qui travaillent avec l'IA.

**Quand le choisir :** quand tu veux un éditeur où l'IA est partout (complétion à chaque frappe, modifications ciblées très rapides). Idéal pour **retoucher et peaufiner** du code existant — exactement le cœur de la méthode ADAPT.

## Installation et coût

- Télécharge sur [cursor.com](https://cursor.com) et connecte-toi.
- Au premier lancement, **importe tes extensions et réglages VS Code** (un clic).
- **Coût** : une offre gratuite limitée pour découvrir, puis un abonnement mensuel (environ 20 $/mois). Vérifie le tarif actuel sur le site. Pendant la formation, **FORGEIA CODE reste l'outil gratuit par défaut** ; Cursor est une alternative pour ceux qui veulent investir.

## Les gestes de base

| Besoin | Geste |
|---|---|
| Compléter le code en tapant | **Tab** pour accepter la suggestion |
| Modifier un bloc précis | Sélectionne le code → **Ctrl+K** (Cmd+K sur Mac) → décris la modification |
| Poser une question sur le projet | Mode **Ask** dans le panneau de chat (ne modifie rien) |
| Travail sur plusieurs fichiers | Mode **Agent** |
| Tâche importante | Mode **Plan** : l'agent étudie le projet, pose des questions, propose un plan à valider |
| Donner du contexte | `@` + fichier, dossier, documentation, page web |

Les raccourcis et noms de modes évoluent vite : si un raccourci ne marche pas, regarde le menu du panneau de chat.

## Les méthodes pro

1. **Ctrl+K pour le chirurgical, Agent pour le structurel.** Changer une couleur, un texte, un espacement → sélection + Ctrl+K (rapide, pas d'effet de bord). Créer une page ou une fonctionnalité → Agent.
2. **Plan d'abord pour tout ce qui touche plus de 3 fichiers.** Corriger un mauvais plan coûte 30 secondes ; corriger 20 fichiers mal modifiés coûte une heure. Les plans peuvent être enregistrés en Markdown pour être réutilisés.
3. **Des règles de projet** dans `.cursor/rules/` (fichiers `.md`) : stack, conventions, design tokens, interdits. Elles s'appliquent à chaque demande, et elles sont **versionnées avec ton projet**.
4. **Relis chaque diff avant d'accepter.** Cursor montre en vert ce qui est ajouté et en rouge ce qui est supprimé. Une suppression inattendue = refuse et reformule.
5. **Ajoute la doc officielle comme contexte** (`@` + URL de la documentation Tailwind, Next.js, Supabase…) : l'agent invente beaucoup moins.
6. **Le bon modèle pour la bonne tâche** : un modèle rapide et économique pour les petites retouches ; un modèle puissant pour planifier ou déboguer un problème difficile.
7. **Revenir en arrière** : Cursor garde des points de restauration dans la conversation. Couplé à un commit Git avant chaque tâche, tu ne perds jamais ton travail.

## Pièges et sécurité

- ⚠️ L'agent a tendance à **en faire trop** (refactoriser ce qu'on ne lui a pas demandé). Précise : « Ne modifie que le fichier X. »
- ⚠️ Complétion **Tab** trop rapide = code accepté sans le lire. Prends l'habitude de lire avant Tab.
- ❌ Ne mets pas ton fichier `.env` dans le contexte : ajoute-le à la liste des fichiers ignorés par l'IA (`.cursorignore`).

## Mini-exercice (5 min)

Ouvre ta landing de test. Sélectionne le bouton principal → **Ctrl+K** :
> « Arrondis ce bouton, ajoute une ombre douce et un effet au survol. Ne touche à rien d'autre. »

Relis le diff, accepte, vérifie dans le navigateur.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('d0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000000', 4, $forge$Boîte à outils IA #3 — Claude Code$forge$, 'outil', $forge$25 min$forge$, $forge$## À quoi il sert

**Claude Code** est l'agent de code d'Anthropic. Il fonctionne **dans le terminal** (et aussi dans VS Code, dans l'application de bureau Claude et sur le web) : il lit tout ton projet, planifie, modifie les fichiers, lance les commandes, les tests et Git. C'est un des agents les plus capables pour les **tâches longues et complexes**.

**Quand le choisir :** pour les gros chantiers — créer une fonctionnalité de bout en bout, déboguer un problème qui touche plusieurs fichiers, migrer ou réorganiser un projet. Moins adapté aux micro-retouches visuelles (là, Cursor + Ctrl+K est plus rapide).

## Installation et coût

- Installation : suis la page officielle **docs.claude.com → Claude Code** (une commande à copier dans le terminal, ou l'extension VS Code).
- **Coût** : il faut un abonnement Claude (Pro ou Max) ou un compte API payant. Vérifie le tarif actuel. Pendant la formation, on le montre en démonstration et en atelier ; tu choisis ensuite s'il vaut l'investissement pour toi.
- Lancement : ouvre un terminal **dans le dossier de ton projet** et tape `claude`.

## Les gestes de base

| Commande / geste | Ce que ça fait |
|---|---|
| `claude` | Démarre une session dans le dossier courant |
| `/init` | Analyse le projet et crée un fichier **`CLAUDE.md`** (la mémoire du projet) |
| **Shift+Tab** | Change de mode : normal → acceptation automatique des modifications → **mode plan** |
| **Échap** | Interrompt l'agent (pour corriger sa trajectoire) |
| **Échap Échap** | Revenir à un message précédent (et annuler ce qui a suivi) |
| `@fichier` | Mentionne un fichier comme contexte |
| `/clear` | Repart d'une conversation vide (même projet, même `CLAUDE.md`) |
| `/compact` | Résume la conversation pour libérer de la place |
| `/help` | Liste toutes les commandes disponibles |

## Les méthodes pro

1. **`CLAUDE.md` est ton arme principale.** C'est un fichier lu automatiquement à chaque session. Mets-y : la stack, comment lancer le projet, les conventions, les pièges connus, les commandes utiles. Un bon `CLAUDE.md` vaut mieux que 100 prompts parfaits.
2. **Mode plan pour toute tâche sérieuse** (Shift+Tab jusqu'au mode plan). L'agent explore, puis propose un plan **sans rien toucher**. Tu corriges le plan, puis tu le laisses exécuter.
3. **Donne-lui un moyen de se vérifier** : « Après la modification, lance `npm run build` et corrige les erreurs jusqu'à ce que ça passe. » Un agent qui peut vérifier son travail est 10 fois plus fiable.
4. **Interromps tôt.** S'il part dans une mauvaise direction, **Échap** tout de suite et recadre. N'attends pas qu'il ait modifié 15 fichiers.
5. **Commandes personnalisées** : un fichier Markdown dans `.claude/commands/` devient une commande `/nom`. Exemple `/audit-mobile` : « Vérifie toutes les pages en largeur 375 px et liste les problèmes ». Tu automatises tes vérifications.
6. **Sous-agents** : Claude Code peut confier une sous-tâche (rechercher, relire, tester) à un agent séparé qui travaille dans son propre contexte — ta conversation principale reste propre.
7. **`/clear` entre deux tâches sans rapport.** Un contexte encombré = des réponses moins bonnes et plus chères.
8. **Fais-lui faire Git** : « Crée un commit avec un message clair pour ces changements ». Il écrit d'excellents messages de commit.

## Pièges et sécurité

- ⚠️ En mode « acceptation automatique », il modifie sans demander : à réserver aux tâches bien cadrées, sur une branche Git propre.
- ❌ Ne lui donne jamais de clés secrètes en clair dans la conversation ; elles vont dans `.env` (jamais commité).
- ⚠️ Surveille ta consommation : les longues sessions sur un gros projet consomment beaucoup.

## Mini-exercice (5 min — en démo ou si tu as un abonnement)

Dans ton projet de landing :
1. `claude` puis `/init` → lis le `CLAUDE.md` généré et ajoute 2 règles à toi.
2. Shift+Tab jusqu'au mode plan :
   > « Ajoute une section FAQ de 4 questions sous la section Tarifs, dans le même style. Vérifie ensuite que `npm run build` passe. »
3. Relis le plan, valide, regarde-le travailler.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('d0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000000', 5, $forge$Boîte à outils IA #4 — Google Antigravity$forge$, 'outil', $forge$25 min$forge$, $forge$## À quoi il sert

**Antigravity** est l'environnement de développement « agent d'abord » de Google. Il a deux faces :
- l'**Éditeur** : un éditeur de code classique avec un agent dans la barre latérale ;
- le **Manager** : une « tour de contrôle » où tu lances et supervises **plusieurs agents en parallèle**, chacun sur sa tâche.

Sa particularité : les agents produisent des **Artifacts** — liste de tâches, plan d'implémentation, captures d'écran, enregistrements du navigateur, résultats de tests — que tu peux **commenter comme un document partagé**. Et l'agent peut **ouvrir un navigateur, cliquer dans ton site et vérifier lui-même** que ça marche.

**Quand le choisir :** pour lancer plusieurs chantiers en parallèle (un agent sur la page d'accueil, un autre sur le tableau de bord), et pour tout ce qui demande une **vérification visuelle** dans le navigateur.

## Installation et coût

- Téléchargement sur le site officiel **Google Antigravity** (Windows, macOS, Linux), connexion avec un compte Google.
- **Coût** : Google a proposé un accès gratuit avec des quotas sur ses modèles Gemini (et d'autres modèles au choix). Les conditions évoluent : vérifie la page officielle. C'est souvent **l'option la plus généreuse gratuitement** pour un débutant.
- Installe l'extension navigateur proposée au premier lancement : c'est elle qui permet à l'agent de piloter Chrome pour tester ton site.

## Les gestes de base

1. **Ouvre ton projet** (un dossier = un espace de travail).
2. Dans le **Manager**, démarre une conversation et choisis le mode **Planning** (l'agent planifie avant d'agir) pour les tâches importantes, ou un mode rapide pour les petites.
3. L'agent produit un **plan d'implémentation** : **lis-le et commente-le** avant de le laisser continuer.
4. Pendant qu'il travaille, bascule dans l'**Éditeur** pour voir les fichiers apparaître.
5. À la fin, consulte les **Artifacts** : captures, enregistrement du navigateur, résumé des changements.

## Les méthodes pro

1. **Commente les Artifacts au lieu de réécrire ta demande.** « Dans le plan, étape 3 : utilise Supabase, pas Firebase » directement sur le plan — l'agent ajuste sans repartir de zéro.
2. **Parallélise intelligemment** : 2 à 3 agents maximum, sur des parties **indépendantes** du projet (pages différentes). Deux agents sur le même fichier = conflits.
3. **Exige la preuve visuelle** : « Ouvre la page dans le navigateur à 375 px et 1440 px de large et fais une capture de chaque. » Tu vérifies en 10 secondes au lieu de tester toi-même.
4. **Reproduire un bug** : « Ouvre la page d'inscription, remplis le formulaire avec des données de test, clique sur Envoyer et enregistre ce qui se passe. » L'enregistrement montre exactement où ça casse.
5. **Règle les autorisations** : laisse l'agent lire et écrire les fichiers, mais **garde la validation manuelle des commandes du terminal**, et interdis les commandes destructrices.
6. **Utilise-le comme relecteur** d'un travail fait ailleurs (Cursor, FORGEIA CODE) : « Vérifie ce projet comme un client exigeant : liste tout ce qui ne va pas, captures à l'appui. »

## Pièges et sécurité

- ⚠️ Les agents en parallèle **consomment vite les quotas**. Réserve le mode multi-agents aux vrais gros chantiers.
- ⚠️ Un agent qui « vérifie lui-même » peut se tromper : regarde toujours les captures, ne te contente pas du message « tout fonctionne ».
- ❌ Comme partout : aucune clé secrète dans la conversation.

## Mini-exercice (5 min)

Ouvre ta landing de test dans Antigravity :
> « Ouvre la page dans le navigateur, fais une capture en largeur mobile (375 px) et liste 3 problèmes d'affichage, sans rien corriger. »

Compare sa liste avec ce que tu vois toi-même. Puis demande-lui de corriger **un seul** des problèmes.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('d0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000000', 6, $forge$Les méthodes pro + ta bibliothèque de consignes$forge$, 'outil', $forge$30 min$forge$, $forge$Les outils changent tous les 6 mois. **Ces méthodes, elles, fonctionnent avec tous les agents** (FORGEIA CODE, Cursor, Claude Code, Antigravity). C'est ce qui sépare quelqu'un qui « joue avec l'IA » de quelqu'un qui **livre**.

## Les 10 réflexes du pro

1. **Commit avant chaque demande.** `git add . && git commit -m "avant: header"`. Si l'IA casse tout : `git restore .` → retour à la situation propre en 2 secondes. C'est ton filet de sécurité.
2. **Plan avant code.** Pour toute tâche de plus de 2 fichiers : mode plan, tu lis, tu corriges, puis tu exécutes.
3. **Une demande = un résultat vérifiable.** Découpe : header, puis hero, puis cartes, puis footer. Jamais « fais tout le site ».
4. **Le contexte permanent dans un fichier** (`.clinerules`, `.cursor/rules/`, `CLAUDE.md`) : stack, conventions, couleurs, interdits. Tu l'écris une fois, l'IA le relit toujours.
5. **Des valeurs exactes, pas des adjectifs.** « Titre 48 px, Inter Bold, couleur #171D17, 24 px sous le titre » bat « un beau titre ».
6. **Montre au lieu de décrire** : une capture d'écran du design vaut 200 mots.
7. **Fais vérifier** : « lance le build », « ouvre la page à 375 px », « liste ce qui pourrait casser ». Un agent qui se vérifie est fiable ; un agent qui ne se vérifie pas te ment sans le savoir.
8. **Fais expliquer le diff** : « Explique-moi en 5 lignes ce que tu as changé et pourquoi. » Tu apprends, et tu repères les erreurs.
9. **Conversation neuve quand ça dérive.** Après 3 corrections ratées, ne t'acharne pas : nouvelle conversation, demande reformulée avec ce que tu as appris.
10. **Le bon modèle au bon moment** : modèle rapide et économique pour le répétitif ; modèle puissant pour planifier et déboguer.

## Quel outil pour quelle tâche ?

| Tâche | Outil conseillé |
|---|---|
| Retouche visuelle précise (couleur, marge, texte) | Cursor (Ctrl+K) ou FORGEIA CODE |
| Reconstruire une section à partir d'une capture | FORGEIA CODE, Cursor Agent, Antigravity |
| Fonctionnalité complète sur plusieurs fichiers | Claude Code (mode plan), Cursor Plan |
| Plusieurs chantiers en parallèle | Antigravity (Manager) |
| Vérifier visuellement / reproduire un bug | Antigravity (navigateur) |
| Bug mystérieux, erreur incompréhensible | Claude Code ou modèle puissant + logs complets |

## Ta bibliothèque de consignes (à copier et adapter)

### 1. Extraire les design tokens d'un design
```
Voici une capture du design [joindre l'image].
Extrais les design tokens dans un fichier design-tokens.md :
- couleurs (hex) avec leur rôle (fond, texte, accent, bordure…)
- typographies (famille, tailles, graisses, interlignes)
- espacements et rayons de bordure récurrents
N'écris aucun autre code.
```

### 2. Reconstruire un composant à partir d'une capture (le cœur d'ADAPT)
```
Rôle : tu es un intégrateur front-end senior.
Contexte : projet Next.js + Tailwind. Respecte design-tokens.md.
Tâche : reproduis ce composant [capture] dans components/Hero.tsx.
Contraintes :
- fidèle au design en largeur 1440 px ET lisible à 375 px
- textes en props pour pouvoir les changer
- n'installe aucune dépendance
- ne modifie aucun autre fichier
À la fin : liste les écarts éventuels avec le design.
```

### 3. Personnaliser pour un client
```
Remplace tous les textes de la page par ceux de content/client.md.
Garde exactement la structure et le style.
Remplace la couleur d'accent par #XXXXXX partout (via les tokens).
Liste les textes qui ne rentrent pas bien dans le design.
```

### 4. Relecture « client exigeant »
```
Relis ce projet comme un client exigeant et un développeur senior.
Liste, par ordre de gravité : bugs, problèmes mobile, lenteurs,
problèmes d'accessibilité, textes manquants. Ne corrige rien encore.
```

### 5. Déboguer proprement
```
Voici l'erreur complète : [coller l'erreur ENTIÈRE et le fichier concerné]
1. Explique la cause probable en 3 lignes.
2. Propose la correction la plus petite possible.
3. Dis-moi comment vérifier que c'est réglé.
N'applique rien avant que je valide.
```

### 6. Comprendre du code existant
```
Explique ce fichier comme à quelqu'un qui débute : à quoi il sert,
les 3 parties importantes, et ce que je peux modifier sans risque.
```

### 7. Préparer un commit
```
Résume les changements en cours et propose un message de commit
clair (une ligne + 3 puces), en français.
```

> 💡 **Ta mission permanente** : crée un fichier `mes-consignes.md` dans ton ordinateur. Chaque fois qu'une consigne marche très bien, ajoute-la. Dans 2 mois, cette bibliothèque vaudra de l'or.

## Les licences, en 2 minutes

| Source | Ce que tu peux faire en général | À vérifier |
|---|---|---|
| **UI8, ThemeForest** (achat) | Utiliser et modifier pour toi ou **un** client, selon le type de licence | Licence « standard » vs « étendue », nombre de projets, revente interdite |
| **Figma Community** | Dépend de l'auteur : souvent libre avec attribution | La mention de licence sur la page du fichier |
| **Thèmes WordPress GPL** | Utiliser, modifier, redistribuer le code | Les images et polices peuvent avoir leur propre licence |
| **Bibliothèque à coins FORGE IA** | **S'entraîner** (exercices, défis) | Pour un client ou ton SaaS : utilise un template dont tu as la licence |

Règle d'or : **si tu ne sais pas, tu demandes ou tu ne l'utilises pas pour un client.**
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('d0000000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-000000000000', 7, $forge$Les grilles d'évaluation de tes 3 projets$forge$, 'outil', $forge$15 min$forge$, $forge$Tu sais **dès maintenant** sur quoi tes projets seront évalués. Chaque critère a 4 niveaux. Un projet est **validé** quand chaque critère marqué ⭐ (essentiel) est au moins au niveau **Satisfaisant**.

**Niveaux** : 1 — À reprendre · 2 — Satisfaisant · 3 — Bien · 4 — Excellent

Tu déposes chaque projet dans **Mon espace → Projets** (lien du site en ligne + lien GitHub). Le formateur note et te fait un retour écrit.

## Projet 1 — Landing page (template UI8 / Figma → code) · livraison séance 3

| Critère | 1 — À reprendre | 2 — Satisfaisant | 3 — Bien | 4 — Excellent |
|---|---|---|---|---|
| ⭐ **Fidélité au design** | Écarts visibles partout | Structure et couleurs respectées | Typos et espacements fidèles | Indiscernable du design, détails soignés |
| ⭐ **Affichage mobile** | Cassé à 375 px | Lisible, quelques défauts | Propre sur mobile et tablette | Pensé mobile, menu et images adaptés |
| ⭐ **En ligne** | Pas en ligne | En ligne, lien fonctionnel | + code sur GitHub avec commits réguliers | + nom de projet propre, README clair |
| **Personnalisation** | Textes du template | Textes et couleurs changés | Marque cohérente (logo, ton) | Contenu réel et convaincant |
| **Qualité du code** | Un seul gros fichier illisible | Découpé en sections | Composants réutilisables | Design tokens + composants propres |
| **Méthode ADAPT** | Pas de trace | Licence vérifiée | + tokens extraits, consignes notées | + journal des consignes dans le README |

## Projet 2 — Site vitrine (thème WordPress → code) · livraison séance 5

| Critère | 1 — À reprendre | 2 — Satisfaisant | 3 — Bien | 4 — Excellent |
|---|---|---|---|---|
| ⭐ **Analyse de l'existant** | Pas d'analyse | Plan du site listé | + gabarits et composants identifiés | + choix argumentés (ce qu'on garde, change, supprime) |
| ⭐ **Plusieurs pages** | Une seule page | 3 pages navigables | 4+ pages, menu cohérent | + page 404 et pied de page complet |
| ⭐ **Formulaire de contact** | Absent | Présent | Fonctionnel (envoi réel) | + validation et message de confirmation |
| ⭐ **En ligne & mobile** | Pas en ligne | En ligne, lisible sur mobile | Propre sur tous les écrans | Rapide (images optimisées) |
| **Référencement de base** | Rien | Titres de pages | + descriptions et aperçu de partage | + plan du site, balises propres |
| **Contenu client** | Textes du thème | Textes adaptés | Contenu réel d'un client ciblé | Prêt à être présenté au client |

## Projet 3 — Ton SaaS (kit dashboard + Supabase + FedaPay) · Demo Day séance 8

| Critère | 1 — À reprendre | 2 — Satisfaisant | 3 — Bien | 4 — Excellent |
|---|---|---|---|---|
| ⭐ **Problème & valeur** | Flou | Problème clair | Cible et bénéfice clairs | Validé par de vrais prospects |
| ⭐ **Fonctionnalité cœur** | Ne marche pas | Marche sur le chemin principal | Robuste (erreurs gérées) | Fluide et agréable |
| ⭐ **Données & connexion** | Pas de base | Données enregistrées (Supabase) | + connexion des utilisateurs | + chaque utilisateur ne voit que ses données |
| ⭐ **Paiement** | Absent | Paiement test FedaPay qui aboutit | + accès débloqué après paiement | + confirmation automatique (webhook) |
| **Interface** | Brute | Kit dashboard intégré | Cohérente et mobile | Soignée, états vides et chargements |
| **Mise en ligne & sécurité** | Pas en ligne | En ligne | Clés dans `.env`, pas dans le code | + domaine et vérifications finales |
| **Démo & offre** | Pas préparée | Démo qui marche | + prix et cible présentés | Pitch convaincant de 5 minutes |
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e1000000-0000-4000-8000-000000000010', 'c0000000-0000-4000-8000-000000000001', 10, $forge$Séance 1 — Ton atelier IA et ton premier « remix »$forge$, 'séance', $forge$4h30$forge$, $forge$## Objectifs de la séance

À la fin de la séance, tu sais :
- installer et régler ton **atelier** : VS Code, Git, GitHub, Node.js, FORGEIA CODE ;
- utiliser **Git comme filet de sécurité** (commit avant chaque demande à l'IA) ;
- écrire une **consigne efficace** : rôle, contexte, tâche, contraintes, vérification ;
- **modifier un template existant avec l'IA** — ton premier remix.

**Prérequis** : ordinateur portable chargé, compte GitHub créé, liste de préparation cochée.

## Déroulé (4 h 30)

| Heure | Moment | Ce qu'on fait |
|---|---|---|
| 9h00 | Accueil (15 min) | Tour de table : ton projet rêvé en une phrase. Présentation de la méthode ADAPT. |
| 9h15 | Code-along (45 min) | Installation guidée pas à pas (ci-dessous). Tout le monde au même point. |
| 10h00 | Pratique guidée (50 min) | Premier remix d'une landing avec FORGEIA CODE. |
| 10h50 | Atelier outil IA (20 min) | FORGEIA CODE : Plan/Act, `@`, checkpoints, `.clinerules`. |
| 11h10 | Pause (15 min) | |
| 11h25 | Défi (40 min) | Voir la leçon « Défi — Séance 1 ». |
| 12h05 | Atelier projet (70 min) | Choisir ton template pour le projet 1 + démarrer ton journal de consignes. |
| 13h15 | Bilan (15 min) | Ce qu'on retient + mission de la semaine. |

## Code-along : ton atelier en 6 étapes

1. **VS Code** installé et en français (extension *French Language Pack*).
2. **Git** : installe-le, puis dans un terminal :
   ```bash
   git config --global user.name "Ton Nom"
   git config --global user.email "ton@email.com"
   ```
3. **Node.js** (version LTS) depuis nodejs.org. Vérifie : `node -v` et `npm -v`.
4. **GitHub** : connecte VS Code à ton compte (icône compte en bas à gauche).
5. **FORGEIA CODE** installé et branché sur la passerelle (voir le guide de la boîte à outils).
6. **Ton dossier de travail** : `Documents/forge-ia/` — tous tes projets iront dedans.

## Pratique guidée : ton premier remix

On part d'une **landing de la bibliothèque** (onglet Ressources, ou celle fournie en séance).

1. Ouvre le dossier dans VS Code, puis le terminal :
   ```bash
   git init
   git add .
   git commit -m "template d'origine"
   ```
2. Ouvre le fichier HTML dans le navigateur. **Observe** : quelles sections ? Quelles couleurs ?
3. Dans FORGEIA CODE, **mode Plan** :
   ```
   Rôle : tu es un intégrateur web.
   Contexte : cette landing page en HTML + Tailwind.
   Tâche : change la couleur principale en bordeaux #791d3e et remplace
   le titre principal par "Mon premier remix avec l'IA".
   Contraintes : ne modifie rien d'autre.
   Vérification : liste les lignes que tu as changées.
   ```
4. Lis le plan → **Act** → recharge la page.
5. **Commit** : `git add . && git commit -m "couleur et titre"`.
6. Recommence avec une demande à toi (changer une image, un bouton, un texte).

> 💡 Remarque l'ordre : **commit → demande → vérifie → commit**. C'est le rythme de toute la formation.

## Atelier outil IA (20 min) — FORGEIA CODE

- Crée un fichier `.clinerules` à la racine avec 4 règles (langue, stack, ne rien installer, expliquer en 3 lignes).
- Teste la différence **avec** et **sans** `@fichier` dans ta demande.
- Fais volontairement une mauvaise demande, puis **reviens en arrière** avec un checkpoint et `git restore .`.

## L'anatomie d'une bonne consigne

| Élément | Exemple |
|---|---|
| **Rôle** | « Tu es un intégrateur front-end senior. » |
| **Contexte** | « Landing en HTML + Tailwind, voir @index.html. » |
| **Tâche** | « Ajoute une section témoignages de 3 cartes. » |
| **Contraintes** | « Mêmes couleurs, pas de nouvelle dépendance, ne touche qu'à cette section. » |
| **Vérification** | « Dis-moi comment vérifier que c'est bon sur mobile. » |

## Checklist de fin de séance

- [ ] VS Code, Git, Node, FORGEIA CODE fonctionnent
- [ ] J'ai fait au moins 3 commits sur mon remix
- [ ] J'ai un fichier `.clinerules`
- [ ] J'ai choisi (ou présélectionné) le template de mon projet 1
- [ ] J'ai créé mon fichier `mes-consignes.md`

## Pour aller plus loin

- Fais le même remix avec **Cursor** (Ctrl+K) et compare la rapidité.
- Lis le guide « Les méthodes pro » et teste la consigne n° 1 (extraire les design tokens).
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e1000000-0000-4000-8000-000000000011', 'c0000000-0000-4000-8000-000000000001', 11, $forge$Défi — Séance 1 : le remix express (30 min)$forge$, 'défi', $forge$30 min$forge$, $forge$## L'énoncé

Tu reçois une **landing page de la bibliothèque** que tu n'as jamais vue. En **30 minutes**, avec l'IA, transforme-la pour une **boulangerie fictive « Pain d'Or » à Cotonou**.

## Ce que tu dois livrer

1. La couleur principale passe à un **brun doré** de ton choix (donne le code hex à l'IA).
2. Le titre, le sous-titre et le bouton principal parlent de **Pain d'Or**.
3. Une **nouvelle section** « Nos horaires » (jours + heures) dans le même style que la page.
4. **Au moins 4 commits** avec des messages clairs.

## Critères de réussite

- ✅ La page s'affiche sans erreur, y compris en largeur mobile (outils de développement du navigateur → icône mobile).
- ✅ La nouvelle section respecte le style existant (polices, espacements, couleurs).
- ✅ `git log --oneline` montre au moins 4 commits.

## Bonus (si tu as fini en avance)

- Ajoute un bouton **WhatsApp** flottant.
- Refais une partie avec **Cursor** ou **Antigravity** et note la différence.

## Si tu bloques

- Découpe : **une demande par point** (1, puis 2, puis 3).
- Utilise la consigne « Reconstruire un composant » de ta bibliothèque.
- Lève la main après 10 minutes bloqué : c'est le jeu.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e1000000-0000-4000-8000-000000000012', 'c0000000-0000-4000-8000-000000000001', 12, $forge$Quiz — Séance 1 : ton atelier IA$forge$, 'test', $forge$10 min$forge$, $forge$Git, la méthode ADAPT et l'anatomie d'une bonne consigne.

- 10 questions, 10 minutes
- Note minimale : 70 %
- Chaque réponse est expliquée à la fin

Clique sur « Passer le quiz » : il se valide dans l'onglet **Tests**.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e1000000-0000-4000-8000-000000000013', 'c0000000-0000-4000-8000-000000000001', 13, $forge$Recherche — Semaine 1 : choisir le template de ton projet 1$forge$, 'recherche', $forge$1h$forge$, $forge$## Ta mission

Trouver **3 templates de landing page** qui pourraient servir de base à ton **projet 1**, analyser leur **licence**, puis en choisir **un**.

## Où chercher

- **Bibliothèque à coins** de la plateforme (pour t'entraîner).
- **Figma Community** : recherche « landing page », « SaaS landing », « agency landing ».
- **UI8** et **ThemeForest** (regarde, n'achète pas encore).

## Ce que tu livres (dans ton `mes-consignes.md` ou un document)

Pour chaque template :

| | Template 1 | Template 2 | Template 3 |
|---|---|---|---|
| Nom + lien | | | |
| Pour quel type de client ? | | | |
| Nombre de sections | | | |
| Licence (gratuite, attribution, usage commercial ?) | | | |
| Ce qui me plaît / ce qui sera difficile | | | |

Puis : **ton choix + 3 phrases pour le justifier.**

## Critères

- ✅ 3 templates différents, avec leur lien.
- ✅ La licence de chacun est notée (même si c'est « non précisée — à éviter pour un client »).
- ✅ Ton choix est argumenté.

> 💡 Astuce pro : choisis un template **pas trop long** (5 à 7 sections). Mieux vaut une landing courte et parfaite qu'une longue à moitié finie.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e1000000-0000-4000-8000-000000000020', 'c0000000-0000-4000-8000-000000000001', 20, $forge$Séance 2 — Décortiquer un design et démarrer ton projet 1$forge$, 'séance', $forge$4h30$forge$, $forge$## Objectifs de la séance

- Lire un design dans **Figma** comme un intégrateur : cadres, mise en page automatique, styles, mesures.
- **Extraire les design tokens** (couleurs, typographies, espacements) dans un fichier.
- **Découper une page en composants** avant d'écrire une ligne de code.
- Créer ton **projet Next.js + Tailwind** et reconstruire tes premiers composants avec l'IA.
- Atelier outil : **Cursor** (Ctrl+K, `@`, règles de projet).

## Déroulé (4 h 30)

| Heure | Moment | Ce qu'on fait |
|---|---|---|
| 9h00 | Rappel flash (15 min) | 5 questions sur la séance 1 (Git, consigne, ADAPT). |
| 9h15 | Code-along (45 min) | Décortiquer un design Figma ensemble. |
| 10h00 | Pratique guidée (50 min) | Créer le projet Next.js, tokens, premier composant. |
| 10h50 | Atelier outil IA (20 min) | Cursor : Ctrl+K, `@`, `.cursor/rules`. |
| 11h10 | Pause (15 min) | |
| 11h25 | Défi (40 min) | Reproduire une carte Figma. |
| 12h05 | Atelier projet (70 min) | Projet 1 : header + hero + une section. |
| 13h15 | Bilan (15 min) | Mission de la semaine. |

## Code-along : décortiquer un design (étape D d'ADAPT)

1. Ouvre le fichier Figma (duplique-le dans ton compte si c'est un fichier Community).
2. Active le **mode Dev** ou le panneau **Inspect** : clique sur un élément → tu vois tailles, couleurs, polices, espacements.
3. Repère les **styles** du fichier (panneau de droite, rien de sélectionné) : couleurs et styles de texte nommés.
4. **Découpe la page** sur papier ou dans un fichier `plan.md` :
   ```
   Page d'accueil
   ├── Header (logo, menu, bouton)
   ├── Hero (titre, sous-titre, 2 boutons, image)
   ├── Logos clients
   ├── 3 cartes « avantages »  → composant Carte réutilisé 3 fois
   ├── Témoignages
   ├── Tarifs (3 offres)       → composant Offre
   └── Footer
   ```
5. Repère ce qui se **répète** : chaque élément répété = un composant.

## Pratique guidée : le projet 1 démarre

1. Crée le projet :
   ```bash
   cd Documents/forge-ia
   npx create-next-app@latest projet-1 --typescript --tailwind --app
   cd projet-1
   git add . && git commit -m "projet initial"
   npm run dev
   ```
2. **Design tokens** : exporte une capture du design et utilise la consigne n° 1 de ta bibliothèque → `design-tokens.md`.
3. Demande à l'IA de **brancher les tokens dans Tailwind** (couleurs et polices du design disponibles comme classes).
4. **Premier composant** — le header, avec la consigne n° 2 (capture du header jointe). Vérifie dans le navigateur à 1440 px et 375 px.
5. Commit.

## Atelier outil IA (20 min) — Cursor

- Ouvre ton projet 1 dans Cursor.
- Crée `.cursor/rules/projet.md` : stack, « respecte design-tokens.md », « un composant par fichier ».
- Sélectionne un titre → **Ctrl+K** → « taille 48 px sur ordinateur, 32 px sur mobile ». Relis le diff.
- Pose une question en mode **Ask** : « Quels composants de ce projet pourraient être réutilisés ? »

## Lire du code sans savoir l'écrire

Tu n'as pas besoin d'écrire Tailwind de mémoire, mais tu dois le **lire** :

| Classe | Signification |
|---|---|
| `flex items-center gap-4` | éléments en ligne, centrés verticalement, 16 px d'écart |
| `text-4xl font-bold` | grand texte en gras |
| `px-6 py-3` | marges intérieures horizontales 24 px, verticales 12 px |
| `rounded-xl shadow-md` | coins arrondis, ombre moyenne |
| `md:grid-cols-3` | 3 colonnes à partir de la taille tablette |

> 💡 Si tu ne comprends pas une ligne : sélectionne-la et demande « explique-moi cette ligne simplement ».

## Checklist de fin de séance

- [ ] Mon fichier `plan.md` découpe la page en composants
- [ ] `design-tokens.md` est créé et branché dans Tailwind
- [ ] Header + hero reconstruits et fidèles au design
- [ ] Au moins 5 commits sur le projet 1
- [ ] Le projet est poussé sur GitHub (dépôt `projet-1`)

## Pour aller plus loin

- Fais reconstruire la même section par **deux outils différents** et garde la meilleure version.
- Ajoute une **animation d'apparition** discrète au hero.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e1000000-0000-4000-8000-000000000021', 'c0000000-0000-4000-8000-000000000001', 21, $forge$Défi — Séance 2 : la carte au pixel près (30 min)$forge$, 'défi', $forge$30 min$forge$, $forge$## L'énoncé

Le formateur affiche une **carte** issue d'un design Figma (une carte d'offre ou de témoignage). En **30 minutes**, reproduis-la dans ton projet comme **composant réutilisable**.

## Ce que tu dois livrer

1. Un fichier `components/Carte.tsx` (ou le nom de ton choix) dont le **titre, le texte et l'image** sont des propriétés.
2. La carte affichée **3 fois** avec des contenus différents, côte à côte sur ordinateur, l'une sous l'autre sur mobile.
3. Une **capture côte à côte** : le design Figma et ton résultat.

## Critères de réussite

- ✅ Couleurs, polices, rayons et ombres correspondent au design (vérifie avec Inspect).
- ✅ Le composant est réutilisé (pas copié-collé 3 fois).
- ✅ Affichage correct à 375 px.

## Bonus

- Ajoute un effet au survol (légère élévation).
- Demande à l'IA de lister les écarts restants avec le design et corrige-les.

## Si tu bloques

- Commence par la capture + la consigne n° 2 de ta bibliothèque.
- Donne les valeurs exactes lues dans Figma (taille, couleur hex, rayon) au lieu de « comme sur l'image ».
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e1000000-0000-4000-8000-000000000022', 'c0000000-0000-4000-8000-000000000001', 22, $forge$Quiz — Séance 2 : décortiquer un design$forge$, 'test', $forge$10 min$forge$, $forge$Figma, design tokens, composants, Tailwind et Cursor.

- 10 questions, 10 minutes
- Note minimale : 70 %
- Chaque réponse est expliquée à la fin

Clique sur « Passer le quiz » : il se valide dans l'onglet **Tests**.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e1000000-0000-4000-8000-000000000023', 'c0000000-0000-4000-8000-000000000001', 23, $forge$Recherche — Semaine 2 : lire une licence et analyser 3 landings qui vendent$forge$, 'recherche', $forge$1h30$forge$, $forge$## Ta mission (2 parties)

### Partie 1 — La licence de ton template (20 min)

Retrouve la licence exacte du template de ton projet 1 et réponds :
1. Ai-je le droit de l'utiliser pour **un client** ? Pour **plusieurs** ?
2. Puis-je le **modifier** ? Le **revendre** tel quel ?
3. Dois-je **citer l'auteur** ?
4. Les **images et polices** incluses sont-elles couvertes ?

### Partie 2 — Analyser 3 landings qui vendent (1 h)

Choisis 3 landing pages de produits ou services qui vendent bien (startups, SaaS, formations en ligne). Pour chacune :

| | Landing 1 | Landing 2 | Landing 3 |
|---|---|---|---|
| Lien | | | |
| Promesse du titre (en une phrase) | | | |
| Ordre des sections | | | |
| Preuves (témoignages, chiffres, logos) | | | |
| Appel à l'action principal | | | |
| Une idée que je vais réutiliser | | | |

## Ce que tu livres

Le tableau rempli + tes réponses sur la licence, dans ton dossier `projet-1/notes/`.

## Critères

- ✅ Les 4 questions de licence ont une réponse sourcée (lien ou capture).
- ✅ Les 3 landings sont analysées avec au moins une idée concrète à réutiliser.

> 💡 Astuce pro : les meilleures landings suivent presque toujours le même ordre — **promesse → preuve → bénéfices → offre → objections (FAQ) → appel à l'action**. Vérifie si c'est le cas.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e1000000-0000-4000-8000-000000000030', 'c0000000-0000-4000-8000-000000000001', 30, $forge$Séance 3 — Vérifier, mettre en ligne et livrer le projet 1$forge$, 'séance', $forge$4h30$forge$, $forge$## Objectifs de la séance

- Rendre un site **impeccable sur mobile**.
- **Vérifier le travail de l'IA** avec une checklist de pro (au lieu de croire « ça marche »).
- Maîtriser le circuit **Git → GitHub → mise en ligne gratuite** (Vercel ou Netlify).
- **Livrer le projet 1** et faire une revue entre pairs avec la grille.
- Atelier outil : **Cursor** — mode Plan et relecture des diffs.

## Déroulé (4 h 30)

| Heure | Moment | Ce qu'on fait |
|---|---|---|
| 9h00 | Rappel flash (15 min) | Tokens, composants, Tailwind. |
| 9h15 | Code-along (45 min) | Mise en ligne d'un projet en direct. |
| 10h00 | Pratique guidée (50 min) | Checklist de vérification sur ton projet 1. |
| 10h50 | Atelier outil IA (20 min) | Cursor Plan + relecture des diffs. |
| 11h10 | Pause (15 min) | |
| 11h25 | Défi (40 min) | La chasse aux 5 bugs. |
| 12h05 | Atelier projet (70 min) | Finitions, mise en ligne, dépôt, revue par un pair. |
| 13h15 | Bilan (15 min) | Mission de la semaine. |

## Code-along : en ligne en 10 minutes

1. Ton projet est sur GitHub (sinon : `git remote add origin …` puis `git push -u origin main`).
2. Crée un compte sur **Vercel** (ou **Netlify**) avec ton compte GitHub.
3. **Importer un projet** → choisis `projet-1` → Déployer. Aucun réglage pour un projet Next.js.
4. Tu obtiens une adresse publique. 🎉
5. **Le plus important** : chaque nouveau `git push` met le site à jour automatiquement.

> 💡 C'est exactement comme ça que fonctionne la plateforme FORGE IA : on pousse sur GitHub, le site se met à jour tout seul.

## Pratique guidée : la checklist du pro

Passe ton projet 1 au crible :

**Affichage**
- [ ] 375 px (téléphone), 768 px (tablette), 1440 px (ordinateur) : rien ne déborde
- [ ] Les images ne sont pas déformées
- [ ] Le menu est utilisable sur mobile

**Fonctionnement**
- [ ] Tous les liens et boutons mènent quelque part
- [ ] Aucune erreur rouge dans la console du navigateur (F12 → Console)
- [ ] `npm run build` passe sans erreur

**Qualité**
- [ ] Chaque image a un texte alternatif
- [ ] Le titre de la page (onglet du navigateur) est le bon
- [ ] Les textes du template ont tous été remplacés

Pour chaque case non cochée : **une demande ciblée à l'IA**, puis vérification, puis commit.

## Atelier outil IA (20 min) — Cursor : Plan et diffs

- Passe en **mode Plan** : « Rends le menu utilisable sur mobile (menu hamburger) ». Lis le plan, **corrige au moins une étape**, puis lance.
- Dans le diff : repère une ligne supprimée. Était-elle utile ? Si oui, refuse ce morceau.
- Leçon : **le plan est le moment le moins cher pour corriger l'IA.**

## Livraison du projet 1

1. Mets le lien en ligne + le lien GitHub dans **Mon espace → Projets**.
2. **Revue par un pair** : échange ton lien avec un voisin. Chacun évalue l'autre avec la **grille du projet 1** et note 2 points forts + 2 améliorations.
3. Applique les 2 améliorations reçues si tu as le temps.

## Checklist de fin de séance

- [ ] Projet 1 en ligne avec une adresse publique
- [ ] Toutes les cases de la checklist du pro cochées
- [ ] Projet déposé dans Mon espace → Projets
- [ ] Revue par un pair faite et reçue

## Pour aller plus loin

- Ajoute un **nom de domaine** (notions vues en séance) ou un sous-domaine propre.
- Demande à **Antigravity** de vérifier ton site en mobile avec captures.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e1000000-0000-4000-8000-000000000031', 'c0000000-0000-4000-8000-000000000001', 31, $forge$Défi — Séance 3 : la chasse aux 5 bugs (40 min)$forge$, 'défi', $forge$40 min$forge$, $forge$## L'énoncé

Le formateur te donne un petit projet (dépôt GitHub de la séance) dans lequel **5 bugs ont été cachés volontairement** : affichage mobile cassé, lien mort, image déformée, erreur dans la console, texte qui déborde.

En **40 minutes**, trouve-les et corrige-les **avec l'IA**, mais **sans lui dire où ils sont** au départ.

## La méthode imposée

1. Lance le projet et **observe** toi-même (5 tailles d'écran, console, clics).
2. Note chaque problème trouvé dans `bugs.md` : *où, quoi, comment le reproduire*.
3. Pour chaque bug : **une** demande à l'IA avec ta description précise → vérifie → commit.
4. À la fin : demande à l'IA « Relis ce projet et liste les problèmes restants » pour vérifier que tu n'en as pas oublié.

## Critères de réussite

- ✅ 5 bugs trouvés et décrits dans `bugs.md`.
- ✅ 5 commits, un par correction.
- ✅ `npm run build` passe et la console est vide.

## Bonus

- Il y a peut-être un **6e bug** que le formateur n'a pas mis exprès… 😉
- Fais vérifier le résultat final par Antigravity (captures mobile et ordinateur).

## Ce qu'on retient

Un bug bien **décrit** (où, quoi, comment le reproduire) est un bug à moitié corrigé. « Ça marche pas » ne permet à personne — ni à l'IA — de t'aider.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e1000000-0000-4000-8000-000000000032', 'c0000000-0000-4000-8000-000000000001', 32, $forge$Quiz — Séance 3 : vérifier et livrer$forge$, 'test', $forge$10 min$forge$, $forge$Responsive, checklist du pro, mise en ligne et mode Plan.

- 10 questions, 10 minutes
- Note minimale : 70 %
- Chaque réponse est expliquée à la fin

Clique sur « Passer le quiz » : il se valide dans l'onglet **Tests**.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e1000000-0000-4000-8000-000000000033', 'c0000000-0000-4000-8000-000000000001', 33, $forge$Recherche — Semaine 3 : un thème WordPress et un vrai client cible$forge$, 'recherche', $forge$1h30$forge$, $forge$## Ta mission

Préparer le **projet 2** : un site vitrine pour un **commerce ou une structure de ta ville**, en partant d'un **thème WordPress**.

### Partie 1 — Trouver ton client cible (45 min)

Choisis un commerce, un artisan, une école, une ONG ou un professionnel de ta ville **qui n'a pas de site, ou un site vieillot**. Note :
- son nom, son activité, son quartier ;
- comment il se présente aujourd'hui (Facebook, WhatsApp, Google Maps…) ;
- 3 informations qu'un client cherche sur lui (horaires, prix, localisation, contact…).

> Tu n'as pas besoin de le contacter maintenant. Mais si ton site est réussi, **tu auras quelque chose de concret à lui montrer**.

### Partie 2 — Trouver le thème WordPress (45 min)

Cherche un **thème WordPress sous licence GPL** adapté à son activité (répertoire officiel WordPress.org, ou démos de thèmes populaires). Note :
- le nom et le lien de la **démo en ligne** ;
- les **pages** de la démo (accueil, à propos, services, contact…) ;
- pourquoi il correspond à ton client.

## Ce que tu livres

Un fichier `projet-2/notes/brief.md` avec : le client cible, le thème choisi (lien de démo), la liste des pages, et 3 éléments du thème que tu vas changer.

## Critères

- ✅ Client cible réel (ou fictif réaliste) décrit précisément.
- ✅ Thème GPL avec démo en ligne.
- ✅ Liste des pages à recréer.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e1000000-0000-4000-8000-000000000040', 'c0000000-0000-4000-8000-000000000001', 40, $forge$Séance 4 — Transformer un thème WordPress en site moderne$forge$, 'séance', $forge$4h30$forge$, $forge$## Objectifs de la séance

- **Analyser un site existant** (la démo d'un thème WordPress) : plan du site, gabarits, composants, styles.
- **Extraire** contenus, couleurs et typographies avec l'**inspecteur du navigateur**.
- Recréer un **site de plusieurs pages** en Next.js avec l'IA (mise en page commune, navigation).
- Comprendre la différence **GPL / ThemeForest** pour un usage client.
- Atelier outil : **Claude Code** — `/init`, `CLAUDE.md`, mode plan.

## Pourquoi recoder un thème WordPress ?

| WordPress + thème | Site recodé avec l'IA |
|---|---|
| Rapide à installer | Rapide à créer **avec la méthode ADAPT** |
| Lourd (extensions, mises à jour, sécurité) | Léger et très rapide |
| Hébergement payant + maintenance | Hébergement gratuit (Vercel/Netlify) |
| Personnalisation limitée par le thème | Tout est modifiable |

Pour beaucoup de petits commerces, un site vitrine rapide, sans maintenance, est **plus rentable** — et c'est un service que tu peux vendre.

## Déroulé (4 h 30)

| Heure | Moment | Ce qu'on fait |
|---|---|---|
| 9h00 | Rappel flash (15 min) | Mise en ligne, checklist, Git. |
| 9h15 | Code-along (45 min) | Analyse d'une démo WordPress en direct. |
| 10h00 | Pratique guidée (50 min) | Squelette multipage du projet 2. |
| 10h50 | Atelier outil IA (20 min) | Claude Code : `/init`, `CLAUDE.md`, mode plan. |
| 11h10 | Pause (15 min) | |
| 11h25 | Défi (40 min) | La page « À propos » en 40 minutes. |
| 12h05 | Atelier projet (70 min) | Pages du projet 2. |
| 13h15 | Bilan (15 min) | Mission de la semaine. |

## Code-along : décortiquer une démo WordPress

1. Ouvre la démo du thème. Liste les **pages** et dessine le **plan du site**.
2. Repère les **gabarits** : quelles pages partagent la même structure ? (en-tête et pied de page communs, pages de contenu, page contact).
3. **Inspecteur du navigateur** (clic droit → Inspecter) :
   - onglet **Éléments** : clique sur un titre → lis la police, la taille, la couleur ;
   - **pipette** de couleur : récupère les codes hex ;
   - onglet **Réseau** (filtre « Font ») : trouve les polices utilisées.
4. Fais une **capture pleine page** de chaque page (outil de capture du navigateur ou extension).
5. Rédige `analyse.md` : pages, gabarits, composants répétés, tokens.

## Pratique guidée : le squelette du projet 2

1. Nouveau projet : `npx create-next-app@latest projet-2 --typescript --tailwind --app`, puis commit.
2. Avec l'IA, en **mode plan** :
   ```
   Contexte : je recrée ce thème WordPress (analyse.md + captures jointes).
   Tâche : crée la structure du site :
   - une mise en page commune (header + footer) pour toutes les pages
   - les pages : accueil, à propos, services, contact (contenu provisoire)
   - un menu qui indique la page active
   Contraintes : tokens de design-tokens.md, un composant par fichier.
   Vérification : npm run build doit passer.
   ```
3. Vérifie la navigation entre les pages, sur ordinateur et mobile. Commit.

## Atelier outil IA (20 min) — Claude Code

*(En démonstration par le formateur, ou sur ta machine si tu as un abonnement.)*
- `claude` dans le dossier `projet-2`, puis `/init` → lecture commentée du `CLAUDE.md` généré.
- On y ajoute : « Respecte analyse.md et design-tokens.md », « Vérifie toujours avec npm run build ».
- **Shift+Tab** jusqu'au mode plan : « Recrée la section services de la page d'accueil à partir de la capture. »
- Montrer **Échap** pour interrompre et recadrer, et **Échap Échap** pour revenir en arrière.

## GPL ou ThemeForest ?

- Un thème **GPL** (répertoire WordPress.org) : tu peux étudier, modifier et réutiliser son **code**. Les **images de démo** sont souvent sous une autre licence : ne les réutilise pas, remplace-les.
- Un thème **ThemeForest** : licence par projet final. Pour un client, il faut **une licence par client**.
- Dans les deux cas, ce que tu recrées avec l'IA **à partir de l'analyse** (structure, idées de mise en page) devient ton propre code — mais **ne copie pas** les textes, les images et les logos.

## Checklist de fin de séance

- [ ] `analyse.md` complet (pages, gabarits, composants, tokens)
- [ ] Projet 2 créé, 4 pages navigables avec mise en page commune
- [ ] Au moins 1 page fidèle au thème
- [ ] Projet poussé sur GitHub

## Pour aller plus loin

- Mets le projet 2 en ligne dès maintenant (même incomplet) : chaque push le mettra à jour.
- Crée une commande personnalisée Claude Code `/verif-mobile`.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e1000000-0000-4000-8000-000000000041', 'c0000000-0000-4000-8000-000000000001', 41, $forge$Défi — Séance 4 : la page « À propos » en 40 minutes$forge$, 'défi', $forge$40 min$forge$, $forge$## L'énoncé

À partir de la page **« À propos »** de la démo de ton thème WordPress, recrée-la dans ton projet 2 en **40 minutes**, avec le contenu de **ton client cible**.

## Ce que tu dois livrer

1. La page `/a-propos` avec **au moins 3 sections** fidèles à la démo (structure, styles).
2. Les textes réécrits pour ton client (son histoire, son équipe ou ses valeurs).
3. Aucune image de la démo : remplace-les par des images libres de droits ou des emplacements provisoires.
4. Un commit par section.

## Critères de réussite

- ✅ La page utilise la mise en page commune (header + footer).
- ✅ Fidélité visuelle avec la démo, adaptée au client.
- ✅ Lisible à 375 px.

## Bonus

- Ajoute une section **chiffres clés** animée.
- Fais relire la page par Antigravity (« client exigeant »).

## Si tu bloques

- Une capture par section + la consigne n° 2 de ta bibliothèque.
- Écris d'abord les textes du client dans `content/a-propos.md`, puis demande à l'IA de les intégrer (consigne n° 3).
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e1000000-0000-4000-8000-000000000042', 'c0000000-0000-4000-8000-000000000001', 42, $forge$Quiz — Séance 4 : WordPress → code et Claude Code$forge$, 'test', $forge$10 min$forge$, $forge$Analyse d'un thème, inspecteur, licences et Claude Code.

- 10 questions, 10 minutes
- Note minimale : 70 %
- Chaque réponse est expliquée à la fin

Clique sur « Passer le quiz » : il se valide dans l'onglet **Tests**.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e1000000-0000-4000-8000-000000000043', 'c0000000-0000-4000-8000-000000000001', 43, $forge$Recherche — Semaine 4 : les vrais textes de ton client$forge$, 'recherche', $forge$1h30$forge$, $forge$## Ta mission

Un site vitrine vaut ce que valent ses **textes**. Cette semaine, tu rédiges (avec l'aide de l'IA) le contenu réel du site de ton client cible.

## Étapes

1. **Récolte** : sa page Facebook, ses avis Google, ses photos, ce que disent ses clients. Note les faits : services, prix, horaires, adresse, numéro WhatsApp.
2. **Rédige** avec l'IA :
   ```
   Tu es un copywriter pour les petits commerces d'Afrique de l'Ouest.
   Voici les faits sur mon client : [coller tes notes].
   Rédige les textes de 4 pages : accueil, à propos, services, contact.
   Ton : chaleureux, clair, phrases courtes. Pas d'exagération,
   n'invente aucun fait (mets [À VÉRIFIER] si une info manque).
   ```
3. **Relis et corrige** : supprime tout ce qui sonne faux ou générique. Vérifie chaque `[À VÉRIFIER]`.

## Ce que tu livres

`projet-2/content/` avec un fichier par page (`accueil.md`, `a-propos.md`, `services.md`, `contact.md`).

## Critères

- ✅ Des faits réels et vérifiables (pas de « leader du marché » inventé).
- ✅ Chaque page a un titre accrocheur et un appel à l'action (appeler, écrire sur WhatsApp, venir).
- ✅ Les informations pratiques sont complètes (adresse, horaires, contact).

> 💡 Astuce pro : un texte écrit par l'IA et **non relu** se repère tout de suite. C'est ta relecture humaine qui fait la valeur.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e2000000-0000-4000-8000-000000000050', 'c0000000-0000-4000-8000-000000000002', 50, $forge$Séance 5 — Un site qui travaille pour son client (et livraison du projet 2)$forge$, 'séance', $forge$4h30$forge$, $forge$## Objectifs de la séance

- Ajouter ce qui transforme un joli site en **outil commercial** : formulaire de contact, bouton WhatsApp, carte d'accès.
- Poser les bases du **référencement** : titres, descriptions, aperçu de partage sur les réseaux (Open Graph).
- Rendre le site **rapide** : images optimisées, polices, mesure avec un outil gratuit.
- **Livrer le projet 2** avec revue entre pairs.
- Atelier outil : **Claude Code** — commandes personnalisées, sous-agents, retour arrière.

## Déroulé (4 h 30)

| Heure | Moment | Ce qu'on fait |
|---|---|---|
| 9h00 | Rappel flash (15 min) | Analyse d'un thème, gabarits, GPL. |
| 9h15 | Code-along (45 min) | Formulaire + WhatsApp + référencement en direct. |
| 10h00 | Pratique guidée (50 min) | Les mêmes ajouts sur ton projet 2. |
| 10h50 | Atelier outil IA (20 min) | Claude Code : commandes perso et sous-agents. |
| 11h10 | Pause (15 min) | |
| 11h25 | Défi (40 min) | WhatsApp + aperçu de partage en 30 min. |
| 12h05 | Atelier projet (70 min) | Finitions, mise en ligne, dépôt, revue. |
| 13h15 | Bilan (15 min) | Mission : ton idée de SaaS. |

## Code-along : 3 ajouts qui font vendre

### 1. Le formulaire de contact
Pour un site vitrine sans serveur, le plus simple est un service de formulaires (par exemple Formspree ou Web3Forms, offres gratuites) ou une redirection vers WhatsApp avec le message pré-rempli.
```
Ajoute à la page contact un formulaire (nom, téléphone, message).
À l'envoi : ouvre WhatsApp vers le +229XXXXXXXX avec un message
pré-rempli contenant les champs. Valide les champs et affiche
un message clair en cas d'oubli.
```

### 2. Le bouton WhatsApp flottant
Un bouton rond en bas à droite, sur toutes les pages, avec un message pré-rempli : « Bonjour, je viens de votre site… ». C'est souvent **le bouton le plus cliqué** d'un site de commerce local.

### 3. Le référencement de base
```
Pour chaque page, ajoute un titre et une description uniques
(métadonnées Next.js), et une image d'aperçu de partage (Open Graph)
de 1200x630. Liste ensuite les titres et descriptions dans un tableau.
```
Teste l'aperçu : colle le lien dans WhatsApp → l'image et le titre doivent apparaître.

## Pratique guidée : vitesse et qualité

- Remplace les images par des versions **compressées** (format WebP, taille adaptée) et utilise le composant `Image` de Next.js.
- Mesure avec **PageSpeed Insights** (pagespeed.web.dev) : note la performance avant/après.
- Demande à l'IA : « Voici le rapport PageSpeed [coller]. Donne-moi les 3 corrections les plus rentables. »

## Atelier outil IA (20 min) — Claude Code (niveau 2)

- Crée `.claude/commands/verif-site.md` :
  ```
  Vérifie le site comme un client exigeant :
  1. npm run build doit passer
  2. chaque page a un titre et une description
  3. toutes les images ont un texte alternatif
  4. aucun lien mort
  Donne un tableau : élément / OK ou problème / correction proposée.
  ```
  Lance `/verif-site`.
- Démonstration des **sous-agents** : « Utilise un sous-agent pour rechercher tous les textes encore en anglais dans le projet. »
- **Échap Échap** : revenir à un état précédent de la conversation après une mauvaise direction.

## Livraison du projet 2

1. Mets à jour le site en ligne (push) et dépose-le dans **Mon espace → Projets**.
2. Revue par un pair avec la **grille du projet 2** : 2 points forts + 2 améliorations.

## Checklist de fin de séance

- [ ] Formulaire de contact fonctionnel
- [ ] Bouton WhatsApp sur toutes les pages
- [ ] Titres, descriptions et aperçu de partage sur chaque page
- [ ] Score PageSpeed noté avant/après
- [ ] Projet 2 déposé et revu

## Pour aller plus loin

- Montre le site à ton client cible. C'est peut-être ta **première vente**.
- Ajoute un fichier `sitemap` et `robots.txt` (demande à l'IA comment avec Next.js).
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e2000000-0000-4000-8000-000000000051', 'c0000000-0000-4000-8000-000000000002', 51, $forge$Défi — Séance 5 : WhatsApp + aperçu de partage en 30 minutes$forge$, 'défi', $forge$30 min$forge$, $forge$## L'énoncé

Sur un **projet fourni** (ou ton projet 2 s'il n'a pas encore ces éléments), ajoute en **30 minutes** :

1. un **bouton WhatsApp flottant** sur toutes les pages, avec message pré-rempli ;
2. un **aperçu de partage** (titre, description, image) qui s'affiche correctement quand on colle le lien dans WhatsApp ;
3. un **titre d'onglet** différent pour chaque page.

## Critères de réussite

- ✅ Le bouton ouvre WhatsApp avec le bon numéro et le message pré-rempli.
- ✅ Le lien collé dans WhatsApp affiche l'image et le titre (site mis en ligne).
- ✅ Chaque page a son propre titre d'onglet.

## Bonus

- Le bouton WhatsApp s'anime légèrement pour attirer l'œil (sans être agaçant).
- Ajoute un bouton « Appeler » visible uniquement sur mobile.

## Si tu bloques

- Pour WhatsApp : le lien a la forme `https://wa.me/229XXXXXXXX?text=...` (texte encodé).
- Pour l'aperçu : demande à l'IA « Comment définir les métadonnées Open Graph dans Next.js App Router ? » en joignant `@app/layout.tsx`.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e2000000-0000-4000-8000-000000000052', 'c0000000-0000-4000-8000-000000000002', 52, $forge$Quiz — Séance 5 : un site qui travaille$forge$, 'test', $forge$10 min$forge$, $forge$Formulaire, WhatsApp, référencement, vitesse et commandes Claude Code.

- 10 questions, 10 minutes
- Note minimale : 70 %
- Chaque réponse est expliquée à la fin

Clique sur « Passer le quiz » : il se valide dans l'onglet **Tests**.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e2000000-0000-4000-8000-000000000053', 'c0000000-0000-4000-8000-000000000002', 53, $forge$Recherche — Semaine 5 : trouver l'idée de ton SaaS$forge$, 'recherche', $forge$2h$forge$, $forge$## Ta mission

Un bon SaaS ne commence pas par du code : il commence par **un problème que quelqu'un paie déjà pour résoudre** (en temps, en argent ou en stress).

## Étapes

1. **Liste 10 problèmes** que tu observes autour de toi (commerces, écoles, églises, associations, freelances, transport, santé, agriculture…). Exemples : « Le coiffeur gère ses rendez-vous dans un cahier », « L'école envoie les notes sur papier ».
2. **Garde-en 3** et pour chacun réponds :
   - Qui a ce problème, précisément ?
   - Comment le résout-il aujourd'hui ? Combien ça lui coûte ?
   - Serait-il prêt à payer **chaque mois** pour une solution simple ? Combien ?
3. **Valide** : parle à **au moins 2 personnes** concernées (WhatsApp, appel, visite). Pose 3 questions : « Comment faites-vous aujourd'hui ? », « Qu'est-ce qui vous fait perdre le plus de temps ? », « Si une appli le faisait, que devrait-elle faire en premier ? »
4. **Choisis ton idée** et remplis la fiche ci-dessous.

## Ta fiche idée (livrable)

```
Nom provisoire :
Pour qui (cible précise) :
Problème (en une phrase) :
Solution (en une phrase) :
La fonctionnalité cœur (UNE seule) :
Ce que l'utilisateur paie et combien (FCFA / mois) :
Ce que m'ont dit les 2 personnes interrogées :
```

## Critères

- ✅ Une cible précise (pas « tout le monde »).
- ✅ **Une seule** fonctionnalité cœur — on fera mieux qu'un produit à 10 fonctionnalités à moitié finies.
- ✅ Au moins 2 vraies personnes interrogées.

> 💡 Astuce pro : un SaaS qui fait **une seule chose très bien** pour **un seul type de client** se vend mieux qu'une usine à gaz.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e2000000-0000-4000-8000-000000000060', 'c0000000-0000-4000-8000-000000000002', 60, $forge$Séance 6 — Ton SaaS : interface, données et connexion$forge$, 'séance', $forge$4h30$forge$, $forge$## Objectifs de la séance

- Choisir et intégrer un **kit de tableau de bord** (UI kit) pour ton SaaS.
- **Décrire tes données** avant de coder : tables, colonnes, liens.
- Utiliser **Supabase** : créer les tables, la **connexion des utilisateurs**, et les règles qui protègent les données.
- Faire **lire, créer, modifier et supprimer** des données avec l'IA.
- Protéger tes **clés secrètes** (`.env`).
- Atelier outil : **Antigravity** — Manager, mode Plan, Artifacts.

## Déroulé (4 h 30)

| Heure | Moment | Ce qu'on fait |
|---|---|---|
| 9h00 | Rappel flash (15 min) | Formulaire, référencement, vitesse. |
| 9h15 | Code-along (45 min) | Données + Supabase sur un mini-SaaS de démo. |
| 10h00 | Pratique guidée (50 min) | Ton SaaS : kit dashboard + tables + connexion. |
| 10h50 | Atelier outil IA (20 min) | Antigravity : Manager, Plan, Artifacts. |
| 11h10 | Pause (15 min) | |
| 11h25 | Défi (40 min) | Une table et son affichage en 40 min. |
| 12h05 | Atelier projet (70 min) | Fonctionnalité cœur de ton SaaS. |
| 13h15 | Bilan (15 min) | Mission de la semaine. |

## Code-along : décrire ses données (avant tout code)

Exemple — **« RDV Coiffure »** : les clients prennent rendez-vous chez un coiffeur.

```
Table salons      : id, nom, quartier, propriétaire (utilisateur)
Table services    : id, salon, nom, prix, durée
Table rendez_vous : id, salon, service, nom_client, téléphone, date_heure, statut
```

Règle d'or : **chaque propriétaire ne voit que les données de son salon.** Dans Supabase, ce sont les règles de sécurité au niveau des lignes (RLS) qui le garantissent.

## Pratique guidée : ton SaaS prend vie

1. **Kit dashboard** : choisis un kit (bibliothèque à coins pour t'entraîner, ou un kit dont tu as la licence) et fais reconstruire la **mise en page** (menu latéral, en-tête, zone de contenu) avec la méthode ADAPT.
2. **Supabase** : crée un projet gratuit sur supabase.com, puis demande à l'IA :
   ```
   Voici mes données : [coller ta description de tables].
   Écris le SQL Supabase pour créer ces tables, avec les règles RLS
   pour que chaque utilisateur ne voie que ses propres lignes.
   Explique chaque règle en une phrase.
   ```
   Colle le SQL dans l'éditeur SQL de Supabase et exécute-le.
3. **Clés** : copie l'URL et la clé « anon » du projet dans `.env.local` (jamais dans le code, jamais commité — vérifie `.gitignore`).
4. **Connexion** : « Ajoute l'inscription et la connexion par e-mail avec Supabase Auth, et protège les pages du tableau de bord. »
5. **Première liste** : « Affiche la liste des [éléments] de l'utilisateur connecté, avec un formulaire d'ajout. »
6. Teste avec **deux comptes différents** : chacun doit voir uniquement ses données.

## Atelier outil IA (20 min) — Antigravity

- Ouvre ton SaaS dans Antigravity, mode **Planning** dans le Manager :
  > « Ajoute la modification et la suppression des éléments de la liste. »
- **Commente le plan** (Artifact) au lieu de réécrire ta demande.
- Lance un **2e agent en parallèle** sur une partie indépendante : « Crée une page Paramètres du compte. »
- Lis le résumé et les captures produits à la fin.

## Les pièges de sécurité à connaître

- ❌ Clé **service_role** de Supabase dans le navigateur : interdite (elle contourne toutes les règles).
- ❌ Tables sans RLS : n'importe qui peut lire tes données.
- ✅ Teste toujours avec deux comptes.

## Checklist de fin de séance

- [ ] Le kit dashboard est intégré (menu, en-tête, contenu)
- [ ] Les tables existent dans Supabase avec RLS activé
- [ ] Inscription / connexion fonctionnent
- [ ] Je peux ajouter et voir mes données ; un 2e compte ne les voit pas
- [ ] `.env.local` n'est pas sur GitHub

## Pour aller plus loin

- Ajoute des **états vides** (« Aucun rendez-vous pour l'instant ») et des **chargements**.
- Demande à Antigravity de tester le parcours inscription → ajout → déconnexion dans le navigateur.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e2000000-0000-4000-8000-000000000061', 'c0000000-0000-4000-8000-000000000002', 61, $forge$Défi — Séance 6 : une table et son affichage en 40 minutes$forge$, 'défi', $forge$40 min$forge$, $forge$## L'énoncé

Dans **ton SaaS**, ajoute en **40 minutes** une nouvelle donnée complète, de la base jusqu'à l'écran. Exemple : des **catégories**, des **notes** ou des **clients**.

## Ce que tu dois livrer

1. La **table** dans Supabase (avec RLS : chaque utilisateur ne voit que ses lignes).
2. Une **page** qui liste les éléments de l'utilisateur connecté.
3. Un **formulaire d'ajout** qui met la liste à jour.
4. La **suppression** d'un élément (avec confirmation).

## Critères de réussite

- ✅ Testé avec 2 comptes : chacun ne voit que ses éléments.
- ✅ Aucune clé secrète dans le code.
- ✅ `npm run build` passe.

## Bonus

- Modification d'un élément.
- Recherche ou filtre dans la liste.

## Si tu bloques

- Écris d'abord la **description de la table** en une ligne, puis demande le SQL + RLS.
- Si une erreur Supabase apparaît, colle l'erreur **complète** avec la consigne n° 5 (déboguer proprement).
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e2000000-0000-4000-8000-000000000062', 'c0000000-0000-4000-8000-000000000002', 62, $forge$Quiz — Séance 6 : données, connexion et Antigravity$forge$, 'test', $forge$10 min$forge$, $forge$Modèle de données, Supabase, RLS, clés et Antigravity.

- 10 questions, 10 minutes
- Note minimale : 70 %
- Chaque réponse est expliquée à la fin

Clique sur « Passer le quiz » : il se valide dans l'onglet **Tests**.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e2000000-0000-4000-8000-000000000063', 'c0000000-0000-4000-8000-000000000002', 63, $forge$Recherche — Semaine 6 : les écrans de ton SaaS et l'avis d'un vrai utilisateur$forge$, 'recherche', $forge$2h$forge$, $forge$## Ta mission

1. **Termine les écrans principaux** de ton SaaS (ceux de la fonctionnalité cœur), avec états vides et messages d'erreur clairs.
2. **Fais tester** ton SaaS par **une personne de ta cible** (même incomplet) pendant 10 minutes. Ne l'aide pas : observe.

## Ce que tu notes pendant le test

| Ce qu'elle a essayé de faire | Où elle a hésité ou bloqué | Ce qu'elle a dit |
|---|---|---|
| | | |

Puis : les **3 changements** les plus importants à faire, classés par priorité.

## Ce que tu livres

`notes/test-utilisateur.md` avec le tableau et tes 3 changements prioritaires.

## Critères

- ✅ Une vraie personne de ta cible a testé.
- ✅ Les blocages sont notés précisément (pas « elle a aimé »).
- ✅ 3 changements concrets et classés.

> 💡 Astuce pro : 10 minutes d'observation d'un vrai utilisateur valent plus que 10 heures de suppositions.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e2000000-0000-4000-8000-000000000070', 'c0000000-0000-4000-8000-000000000002', 70, $forge$Séance 7 — Ton SaaS encaisse : paiement Mobile Money, débogage et mise en ligne$forge$, 'séance', $forge$4h30$forge$, $forge$## Objectifs de la séance

- Brancher **FedaPay en mode test** : créer un paiement, rediriger l'utilisateur, **débloquer l'accès** après paiement.
- Comprendre la **confirmation automatique** (webhook) : pourquoi on ne fait jamais confiance au seul retour du navigateur.
- **Déboguer avec l'IA** comme un pro : lire une erreur, les logs, isoler, corriger petit.
- **Mettre le SaaS en ligne** avec ses variables d'environnement.
- Fixer ton **prix**.
- Atelier outil : **Antigravity** — vérification dans le navigateur et débogage.

## Déroulé (4 h 30)

| Heure | Moment | Ce qu'on fait |
|---|---|---|
| 9h00 | Rappel flash (15 min) | Tables, RLS, connexion, clés. |
| 9h15 | Code-along (45 min) | Paiement FedaPay de bout en bout sur la démo. |
| 10h00 | Pratique guidée (50 min) | Le paiement dans ton SaaS. |
| 10h50 | Atelier outil IA (20 min) | Antigravity : tester le parcours de paiement dans le navigateur. |
| 11h10 | Pause (15 min) | |
| 11h25 | Défi (40 min) | Chasse aux bugs en binôme. |
| 12h05 | Atelier projet (70 min) | Mise en ligne + finitions. |
| 13h15 | Bilan (15 min) | Mission : ton offre commerciale. |

## Code-along : le parcours de paiement

```
1. L'utilisateur clique « Passer à l'offre Pro (2 000 F/mois) »
2. Ton serveur crée une transaction FedaPay (mode test) et reçoit un lien de paiement
3. L'utilisateur paie sur la page FedaPay (numéros de test fournis par FedaPay)
4. FedaPay revient sur ton site ET prévient ton serveur (webhook)
5. Ton serveur vérifie le paiement et passe le compte en « Pro » dans Supabase
```

- Crée un compte FedaPay et récupère tes **clés de test** (bac à sable).
- Clés dans `.env.local` : `FEDAPAY_SECRET_KEY` (jamais dans le navigateur).
- Consigne :
  ```
  Contexte : SaaS Next.js + Supabase. Doc FedaPay : [coller le lien de la doc].
  Tâche : ajoute un bouton "Passer Pro". Côté serveur (route API), crée
  une transaction FedaPay en mode sandbox de 2000 XOF et redirige vers
  le lien de paiement. Ajoute une route webhook qui, à la confirmation,
  passe la colonne plan de l'utilisateur à "pro" dans Supabase.
  Contraintes : clé secrète uniquement côté serveur (variable d'env).
  Vérification : explique comment tester avec un numéro de test.
  ```

> 💡 Pourquoi le webhook ? Si l'utilisateur ferme son navigateur juste après avoir payé, le retour sur ton site n'arrive jamais. Le webhook, lui, arrive toujours. C'est exactement ce que fait la plateforme FORGE IA pour tes propres paiements.

## La méthode de débogage du pro

1. **Lis l'erreur en entier.** La ligne importante est souvent la première ou celle qui cite **ton** fichier.
2. **Reproduis** : quelles étapes exactes déclenchent le bug ?
3. **Isole** : est-ce le navigateur (console F12), le serveur (terminal / logs de l'hébergeur) ou la base (Supabase) ?
4. **Demande petit** : consigne n° 5 (« explique la cause, propose la plus petite correction, dis comment vérifier »).
5. **Vérifie et commit.** Si 3 tentatives échouent : nouvelle conversation, avec ce que tu as appris.

## Mise en ligne du SaaS

- Pousse sur GitHub → importe sur Vercel → ajoute les **variables d'environnement** (Supabase, FedaPay) dans les réglages du projet.
- Mets à jour l'adresse du **webhook** dans FedaPay avec ton adresse en ligne.
- Teste le parcours complet **en ligne** avec un numéro de test.

## Fixer ton prix (15 min)

- Combien coûte le problème à ton client aujourd'hui (temps, argent) ?
- Ton prix doit être **une fraction claire** de ce coût.
- Propose **2 offres** maximum : gratuite limitée + payante. Exemple : « Gratuit jusqu'à 20 rendez-vous/mois, puis 2 000 F/mois. »

## Checklist de fin de séance

- [ ] Un paiement test FedaPay aboutit
- [ ] Le compte passe en « Pro » automatiquement (webhook)
- [ ] Le SaaS est en ligne avec ses variables d'environnement
- [ ] Mon prix est fixé et justifié

## Pour aller plus loin

- Envoie une notification WhatsApp ou e-mail au paiement réussi.
- Affiche l'historique des paiements de l'utilisateur.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e2000000-0000-4000-8000-000000000071', 'c0000000-0000-4000-8000-000000000002', 71, $forge$Défi — Séance 7 : chasse aux bugs en binôme (40 min)$forge$, 'défi', $forge$40 min$forge$, $forge$## L'énoncé

En **binôme**, échangez vos SaaS. Chacun devient **le testeur** de l'autre pendant 15 minutes, puis **le développeur** de son propre SaaS pendant 25 minutes.

## Phase 1 — Le testeur (15 min)

Essaie de casser le SaaS de ton binôme :
- inscription avec un e-mail invalide, un mot de passe trop court ;
- formulaires vides ou avec des textes très longs ;
- deux comptes : l'un peut-il voir les données de l'autre ?
- paiement test interrompu (tu fermes la page FedaPay) ;
- affichage à 375 px.

Note chaque bug dans un tableau : **où / quoi / comment le reproduire / gravité**.

## Phase 2 — Le développeur (25 min)

Reçois la liste de ton binôme et corrige **les bugs les plus graves d'abord**, avec la méthode de débogage du pro. Un commit par correction.

## Critères de réussite

- ✅ Au moins 5 bugs trouvés chez l'autre, bien décrits.
- ✅ Au moins 3 bugs corrigés chez toi, dont le plus grave.
- ✅ Aucune fuite de données entre deux comptes.

## Ce qu'on retient

Tester le produit d'un autre t'apprend à **penser comme un utilisateur** — et c'est exactement ce qui te manque quand tu testes ton propre produit.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e2000000-0000-4000-8000-000000000072', 'c0000000-0000-4000-8000-000000000002', 72, $forge$Quiz — Séance 7 : paiement, débogage et mise en ligne$forge$, 'test', $forge$10 min$forge$, $forge$FedaPay, webhook, méthode de débogage, variables d'environnement et prix.

- 10 questions, 10 minutes
- Note minimale : 70 %
- Chaque réponse est expliquée à la fin

Clique sur « Passer le quiz » : il se valide dans l'onglet **Tests**.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e2000000-0000-4000-8000-000000000073', 'c0000000-0000-4000-8000-000000000002', 73, $forge$Recherche — Semaine 7 : ton offre commerciale et 5 prospects$forge$, 'recherche', $forge$2h$forge$, $forge$## Ta mission

Préparer **ce que tu vas vendre** — ton SaaS, et tes services de création de sites — et **à qui**.

## Partie 1 — Ton offre SaaS (45 min)

```
Mon SaaS aide [cible précise] à [résultat] sans [douleur actuelle].
Offre gratuite : ...
Offre payante : ... F/mois — inclut ...
Pourquoi maintenant : ...
```

## Partie 2 — Ton offre de services (30 min)

Grâce aux projets 1 et 2, tu sais créer des landings et des sites vitrines. Définis :
- **Pack Landing** : ce qui est inclus, délai, prix.
- **Pack Site vitrine** : pages incluses, formulaire, WhatsApp, référencement, délai, prix.
- Ce qui est **en option** (nom de domaine, maintenance, textes, photos).

> 💡 Regarde les prix pratiqués autour de toi. Ne te brade pas : ton délai et ta qualité sont des arguments.

## Partie 3 — 5 prospects (45 min)

Liste **5 personnes ou structures** à contacter (pour le SaaS ou pour les services) : nom, besoin supposé, comment les contacter. Prépare un **message WhatsApp** court et personnalisé (pas un copier-coller générique).

## Ce que tu livres

`notes/offre.md` avec les 3 parties.

## Critères

- ✅ Offre SaaS en une phrase claire + prix.
- ✅ 2 packs de services avec prix et délais.
- ✅ 5 prospects réels + un message personnalisé.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e2000000-0000-4000-8000-000000000080', 'c0000000-0000-4000-8000-000000000002', 80, $forge$Séance 8 — Demo Day : présente ton SaaS, choisis ta stack, reçois ton certificat$forge$, 'séance', $forge$4h30$forge$, $forge$## Objectifs de la séance

- Finaliser et **présenter ton SaaS** en 5 minutes devant un jury.
- Présenter ton **offre commerciale**.
- Choisir **ta stack IA** pour la suite selon ton budget et tes projets.
- Faire le **bilan** de ta progression et repartir avec un plan.

## Déroulé (4 h 30)

| Heure | Moment | Ce qu'on fait |
|---|---|---|
| 9h00 | Finitions (90 min) | Dernières corrections, répétition de la démo, dépôt du projet 3. |
| 10h30 | Atelier « ta stack » (20 min) | Choisir ses outils (tableau ci-dessous). |
| 10h50 | Pause (10 min) | |
| 11h00 | **Demo Day** (100 min) | 5 min de démo + 2 min de questions par apprenant. |
| 12h40 | Quiz final (20 min) | 20 questions sur toute la formation. |
| 13h00 | Bilan & certificats (30 min) | Retours du jury, remise des certificats, et après ? |

## Ta démo en 5 minutes (le plan qui marche)

1. **Le problème** (30 s) : une histoire vraie, une personne réelle.
2. **La solution** (30 s) : ton SaaS en une phrase.
3. **La démo** (3 min) : le **parcours principal en direct**, du début à la fin — inscription, fonctionnalité cœur, paiement test. Pas de tour de toutes les pages.
4. **L'offre** (45 s) : prix, cible, premiers retours d'utilisateurs.
5. **La suite** (15 s) : la prochaine étape.

**Plan B obligatoire** : une courte vidéo de ta démo (enregistrement d'écran) au cas où Internet tombe.

## Atelier « ta stack » : quels outils après la formation ?

| Profil | Stack conseillée | Budget |
|---|---|---|
| Je démarre, budget serré | FORGEIA CODE + Antigravity (offre gratuite) + VS Code | 0 F |
| Je fais des sites pour des clients | Cursor (retouches rapides) + Antigravity (vérification) | ~20 $/mois |
| Je construis des produits complexes | Claude Code (gros chantiers) + Cursor (finitions) | ~20 à 40 $/mois |

**Ce qui ne change pas, quel que soit l'outil** : la méthode ADAPT, Git avant chaque demande, plan avant code, vérification, et ta bibliothèque de consignes.

## Le jury évalue avec la grille du projet 3

Problème & valeur · Fonctionnalité cœur · Données & connexion · Paiement · Interface · Mise en ligne & sécurité · Démo & offre. (Voir la leçon des grilles.)

## Le certificat FORGE IA

Délivré si : **3 projets validés** et **moyenne aux quiz ≥ 70 %**. Si un projet n'est pas encore validé, tu as **2 semaines** après le Demo Day pour le compléter avec les retours du jury.

## Et après ?

- **Contacte tes 5 prospects** dans la semaine.
- Montre le **projet 2 à ton client cible**.
- Continue d'enrichir ta **bibliothèque de consignes**.
- Reste dans la **communauté FORGE IA** : entraide, missions, nouvelles techniques.

Bravo — tu ne sais pas seulement « utiliser l'IA » : tu sais **livrer avec**. 🎓
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;
insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('e2000000-0000-4000-8000-000000000082', 'c0000000-0000-4000-8000-000000000002', 82, $forge$Quiz final — Toute la formation$forge$, 'test', $forge$20 min$forge$, $forge$20 questions sur la méthode ADAPT, les outils IA et tes 3 projets.

- 20 questions, 20 minutes
- Note minimale : 70 %
- Chaque réponse est expliquée à la fin

Clique sur « Passer le quiz » : il se valide dans l'onglet **Tests**.
$forge$) on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;

-- Quiz
delete from public.formation_quizzes where id not in ('f0000000-0000-4000-8000-000000000001', 'f0000000-0000-4000-8000-000000000002', 'f0000000-0000-4000-8000-000000000003', 'f0000000-0000-4000-8000-000000000004', 'f0000000-0000-4000-8000-000000000005', 'f0000000-0000-4000-8000-000000000006', 'f0000000-0000-4000-8000-000000000007', 'f0000000-0000-4000-8000-000000000008');
insert into public.formation_quizzes (id, lesson_id, title, description, duration_minutes, passing_score, active) values ('f0000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000012', $forge$Quiz — Séance 1 : ton atelier IA$forge$, $forge$Git, la méthode ADAPT et l'anatomie d'une bonne consigne.$forge$, 10, 70, true) on conflict (id) do update set lesson_id = excluded.lesson_id, title = excluded.title, description = excluded.description, duration_minutes = excluded.duration_minutes, passing_score = excluded.passing_score, active = excluded.active;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000001001', 'f0000000-0000-4000-8000-000000000001', 1, $forge$Que signifie le premier « A » de la méthode ADAPT ?$forge$, $forge$["Automatiser le déploiement","Ajouter des animations","Analyser le code","Acquérir un template et vérifier sa licence"]$forge$::jsonb, 3, $forge$A = Acquérir : on trouve le bon point de départ (UI8, Figma, WordPress) et on vérifie qu'on a le droit de l'utiliser.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000001002', 'f0000000-0000-4000-8000-000000000001', 2, $forge$Pourquoi faire un commit Git AVANT chaque demande à l'IA ?$forge$, $forge$["Pour accélérer l'IA","Pour pouvoir revenir instantanément en arrière si l'IA casse quelque chose","Pour que l'IA comprenne mieux le projet","Parce que GitHub l'exige"]$forge$::jsonb, 1, $forge$Le commit est ton filet de sécurité : `git restore .` te ramène à l'état propre en 2 secondes.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000001003', 'f0000000-0000-4000-8000-000000000001', 3, $forge$Quelle consigne est la mieux construite ?$forge$, $forge$["« Fais un beau site »","« Tu es intégrateur. Dans @index.html, change le bouton principal en #791d3e, ne touche à rien d'autre, puis liste les lignes modifiées. »","« Change les couleurs comme tu veux »","« Améliore la page »"]$forge$::jsonb, 1, $forge$Elle contient rôle, contexte, tâche précise, contrainte et vérification.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000001004', 'f0000000-0000-4000-8000-000000000001', 4, $forge$Dans FORGEIA CODE, à quoi sert le mode Plan ?$forge$, $forge$["À réfléchir et proposer sans modifier les fichiers","À planifier les séances","À exécuter les commandes plus vite","À dessiner des maquettes"]$forge$::jsonb, 0, $forge$En Plan, l'agent analyse et propose ; tu valides, puis tu passes en Act pour exécuter.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000001005', 'f0000000-0000-4000-8000-000000000001', 5, $forge$Que permet le symbole @ dans une demande à l'agent ?$forge$, $forge$["Envoyer un e-mail","Mentionner un collègue","Accélérer le modèle","Ajouter un fichier, un dossier ou une doc comme contexte"]$forge$::jsonb, 3, $forge$@fichier donne à l'IA le contexte exact : meilleur résultat, moins d'inventions.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000001006', 'f0000000-0000-4000-8000-000000000001', 6, $forge$Quelle commande enregistre tes modifications dans l'historique Git ?$forge$, $forge$["git push","git commit -m \"message\"","npm run dev","git init"]$forge$::jsonb, 1, $forge$git commit enregistre une étape dans l'historique local ; git push envoie cet historique sur GitHub.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000001007', 'f0000000-0000-4000-8000-000000000001', 7, $forge$À quoi sert le fichier .clinerules à la racine d'un projet ?$forge$, $forge$["À stocker les mots de passe","À configurer GitHub","À lister les bugs","À donner des règles permanentes à l'agent (stack, conventions, interdits)"]$forge$::jsonb, 3, $forge$L'agent relit ces règles à chaque demande : tu n'as plus à te répéter.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000001008', 'f0000000-0000-4000-8000-000000000001', 8, $forge$Que dois-tu faire si l'agent propose une commande terminal que tu ne comprends pas ?$forge$, $forge$["Supprimer le projet","L'approuver, il sait ce qu'il fait","Redémarrer l'ordinateur","Lui demander d'abord d'expliquer la commande"]$forge$::jsonb, 3, $forge$On n'approuve jamais une commande qu'on ne comprend pas, surtout si elle supprime ou force quelque chose.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000001009', 'f0000000-0000-4000-8000-000000000001', 9, $forge$Quelle information ne dois-tu JAMAIS coller dans une conversation avec l'IA ?$forge$, $forge$["Un message d'erreur","Une capture d'écran du design","Une clé secrète ou un mot de passe","Le contenu d'un fichier HTML"]$forge$::jsonb, 2, $forge$Les secrets vont dans .env, jamais dans une conversation ni dans le code commité.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000001010', 'f0000000-0000-4000-8000-000000000001', 10, $forge$Quel est le rythme de travail enseigné en séance 1 ?$forge$, $forge$["Demande → commit → vérifie","Demande → push → commit","Vérifie → demande → push","Commit → demande → vérifie → commit"]$forge$::jsonb, 3, $forge$Commit avant, demande, vérification, puis commit de la version qui marche.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
delete from public.formation_quiz_questions where quiz_id = 'f0000000-0000-4000-8000-000000000001' and id not in ('f1000000-0000-4000-8000-000000001001', 'f1000000-0000-4000-8000-000000001002', 'f1000000-0000-4000-8000-000000001003', 'f1000000-0000-4000-8000-000000001004', 'f1000000-0000-4000-8000-000000001005', 'f1000000-0000-4000-8000-000000001006', 'f1000000-0000-4000-8000-000000001007', 'f1000000-0000-4000-8000-000000001008', 'f1000000-0000-4000-8000-000000001009', 'f1000000-0000-4000-8000-000000001010');
insert into public.formation_quizzes (id, lesson_id, title, description, duration_minutes, passing_score, active) values ('f0000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000022', $forge$Quiz — Séance 2 : décortiquer un design$forge$, $forge$Figma, design tokens, composants, Tailwind et Cursor.$forge$, 10, 70, true) on conflict (id) do update set lesson_id = excluded.lesson_id, title = excluded.title, description = excluded.description, duration_minutes = excluded.duration_minutes, passing_score = excluded.passing_score, active = excluded.active;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000002001', 'f0000000-0000-4000-8000-000000000002', 1, $forge$Que sont les « design tokens » ?$forge$, $forge$["Des jetons pour payer les templates","Les images du design","Les valeurs de base d'un design : couleurs, typographies, espacements, rayons","Les mots de passe Figma"]$forge$::jsonb, 2, $forge$Les tokens sont les valeurs de référence ; les donner à l'IA garantit un résultat fidèle et cohérent.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000002002', 'f0000000-0000-4000-8000-000000000002', 2, $forge$Dans Figma, quel panneau donne les tailles, couleurs et polices exactes d'un élément ?$forge$, $forge$["Le menu Fichier","Le panneau Inspect / mode Dev","Le panneau Prototype","Le panneau Commentaires"]$forge$::jsonb, 1, $forge$Inspect (ou le mode Dev) affiche les valeurs précises à transmettre à l'IA.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000002003', 'f0000000-0000-4000-8000-000000000002', 3, $forge$Pourquoi découper une page en composants AVANT de coder ?$forge$, $forge$["Pour que la page soit plus lourde","Parce que Figma l'impose","Pour repérer ce qui se répète et faire des demandes petites et vérifiables","Pour éviter Git"]$forge$::jsonb, 2, $forge$Chaque élément répété devient un composant réutilisable, et chaque composant = une demande claire à l'IA.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000002004', 'f0000000-0000-4000-8000-000000000002', 4, $forge$Que signifie la classe Tailwind `md:grid-cols-3` ?$forge$, $forge$["3 colonnes sur tous les écrans","Une grille de 3 pixels","3 colonnes à partir de la taille tablette","3 lignes en mobile"]$forge$::jsonb, 2, $forge$Le préfixe md: applique la classe à partir de la largeur tablette ; en dessous, la grille reste sur une colonne.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000002005', 'f0000000-0000-4000-8000-000000000002', 5, $forge$Dans Cursor, quel geste est le plus adapté pour changer la couleur d'un seul bouton ?$forge$, $forge$["Sélectionner le code puis Ctrl+K","Lancer l'Agent sur tout le projet","Créer un nouveau projet","Réinstaller Cursor"]$forge$::jsonb, 0, $forge$Ctrl+K est l'outil chirurgical : rapide, ciblé, sans effet de bord.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000002006', 'f0000000-0000-4000-8000-000000000002', 6, $forge$Où placer les règles de projet dans Cursor ?$forge$, $forge$["Dans le dossier .cursor/rules/","Dans le fichier package.json","Dans un e-mail","Dans .env"]$forge$::jsonb, 0, $forge$Les règles dans .cursor/rules/ sont appliquées à chaque demande et versionnées avec le projet.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000002007', 'f0000000-0000-4000-8000-000000000002', 7, $forge$Quelle demande donne le résultat le plus fidèle à un design ?$forge$, $forge$["« Fais un titre joli »","« Titre 48 px, Inter Bold, #171D17, 24 px de marge en dessous »","« Comme sur l'image à peu près »","« Un grand titre »"]$forge$::jsonb, 1, $forge$Des valeurs exactes plutôt que des adjectifs : l'IA n'a rien à deviner.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000002008', 'f0000000-0000-4000-8000-000000000002', 8, $forge$Que fait `npx create-next-app@latest projet-1 --typescript --tailwind --app` ?$forge$, $forge$["Crée un nouveau projet Next.js avec TypeScript et Tailwind","Met le site en ligne","Installe Figma","Supprime le projet 1"]$forge$::jsonb, 0, $forge$C'est la commande qui crée la base de ton projet 1.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000002009', 'f0000000-0000-4000-8000-000000000002', 9, $forge$Rappel séance 1 — Que doit contenir une bonne consigne, en plus de la tâche ?$forge$, $forge$["Rôle, contexte, contraintes et vérification","Des émojis","Uniquement la tâche","Le mot « vite »"]$forge$::jsonb, 0, $forge$Rôle, contexte, tâche, contraintes, vérification : les 5 éléments d'une consigne efficace.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000002010', 'f0000000-0000-4000-8000-000000000002', 10, $forge$Rappel séance 1 — Quelle commande ramène le projet à l'état du dernier commit ?$forge$, $forge$["npm install","git push","git restore .","git init"]$forge$::jsonb, 2, $forge$git restore . annule les modifications non commitées : ton filet de sécurité.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
delete from public.formation_quiz_questions where quiz_id = 'f0000000-0000-4000-8000-000000000002' and id not in ('f1000000-0000-4000-8000-000000002001', 'f1000000-0000-4000-8000-000000002002', 'f1000000-0000-4000-8000-000000002003', 'f1000000-0000-4000-8000-000000002004', 'f1000000-0000-4000-8000-000000002005', 'f1000000-0000-4000-8000-000000002006', 'f1000000-0000-4000-8000-000000002007', 'f1000000-0000-4000-8000-000000002008', 'f1000000-0000-4000-8000-000000002009', 'f1000000-0000-4000-8000-000000002010');
insert into public.formation_quizzes (id, lesson_id, title, description, duration_minutes, passing_score, active) values ('f0000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000032', $forge$Quiz — Séance 3 : vérifier et livrer$forge$, $forge$Responsive, checklist du pro, mise en ligne et mode Plan.$forge$, 10, 70, true) on conflict (id) do update set lesson_id = excluded.lesson_id, title = excluded.title, description = excluded.description, duration_minutes = excluded.duration_minutes, passing_score = excluded.passing_score, active = excluded.active;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000003001', 'f0000000-0000-4000-8000-000000000003', 1, $forge$Quelles largeurs d'écran vérifies-tu au minimum ?$forge$, $forge$["1024 px uniquement","Seulement 375 px","375 px, 768 px et 1440 px","Seulement 1440 px"]$forge$::jsonb, 2, $forge$Téléphone, tablette et ordinateur : les trois tailles de la checklist du pro.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000003002', 'f0000000-0000-4000-8000-000000000003', 2, $forge$Où vois-tu les erreurs JavaScript d'une page ?$forge$, $forge$["Dans le README","Dans les paramètres Wi-Fi","Dans Figma","Dans la console du navigateur (F12)"]$forge$::jsonb, 3, $forge$F12 → Console : aucune ligne rouge ne doit rester avant la livraison.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000003003', 'f0000000-0000-4000-8000-000000000003', 3, $forge$Une fois le projet relié à Vercel ou Netlify, comment mets-tu le site à jour ?$forge$, $forge$["Impossible de le mettre à jour","En faisant un git push : le site se met à jour automatiquement","En recréant le projet","En renvoyant les fichiers par e-mail"]$forge$::jsonb, 1, $forge$Chaque push sur GitHub déclenche une nouvelle mise en ligne.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000003004', 'f0000000-0000-4000-8000-000000000003', 4, $forge$Que vérifie `npm run build` ?$forge$, $forge$["Le nombre de commits","Que le projet se compile sans erreur pour la mise en ligne","La vitesse de ta connexion","Que le design est beau"]$forge$::jsonb, 1, $forge$Si le build échoue en local, la mise en ligne échouera aussi.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000003005', 'f0000000-0000-4000-8000-000000000003', 5, $forge$Pourquoi relire le plan dans le mode Plan de Cursor avant de lancer ?$forge$, $forge$["Parce que corriger un plan coûte 30 secondes, corriger 20 fichiers coûte une heure","Pour changer de modèle","Parce que Cursor l'interdit sinon","Pour perdre du temps"]$forge$::jsonb, 0, $forge$Le plan est le moment le moins cher pour corriger l'IA.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000003006', 'f0000000-0000-4000-8000-000000000003', 6, $forge$Dans un diff, que signifie une ligne en rouge ?$forge$, $forge$["Un commentaire","Une ligne supprimée","Une erreur de syntaxe","Une ligne ajoutée"]$forge$::jsonb, 1, $forge$Rouge = supprimé, vert = ajouté. Une suppression inattendue doit être refusée.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000003007', 'f0000000-0000-4000-8000-000000000003', 7, $forge$Quel élément fait partie de la checklist « Qualité » ?$forge$, $forge$["Le code est en anglais","Le site a 50 pages","Il y a une vidéo","Chaque image a un texte alternatif"]$forge$::jsonb, 3, $forge$Le texte alternatif sert à l'accessibilité et au référencement.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000003008', 'f0000000-0000-4000-8000-000000000003', 8, $forge$Comment décrire un bug pour qu'il soit facile à corriger ?$forge$, $forge$["Où, quoi, et comment le reproduire","Une capture floue sans texte","En majuscules","« Ça marche pas »"]$forge$::jsonb, 0, $forge$Un bug bien décrit est un bug à moitié corrigé — pour toi comme pour l'IA.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000003009', 'f0000000-0000-4000-8000-000000000003', 9, $forge$Rappel séance 2 — Que fais-tu des éléments qui se répètent dans un design ?$forge$, $forge$["J'en fais un composant réutilisable","Je les supprime","Je les mets en image","Je les copie-colle"]$forge$::jsonb, 0, $forge$Un composant réutilisable = moins de code, et une seule correction pour tous les endroits.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000003010', 'f0000000-0000-4000-8000-000000000003', 10, $forge$Rappel séance 1 — Que faire si tu bloques plus de 15 minutes ?$forge$, $forge$["Tout recommencer","Demander de l'aide","Changer de projet","Abandonner"]$forge$::jsonb, 1, $forge$Règle du jeu n° 4 : on demande et on partage.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
delete from public.formation_quiz_questions where quiz_id = 'f0000000-0000-4000-8000-000000000003' and id not in ('f1000000-0000-4000-8000-000000003001', 'f1000000-0000-4000-8000-000000003002', 'f1000000-0000-4000-8000-000000003003', 'f1000000-0000-4000-8000-000000003004', 'f1000000-0000-4000-8000-000000003005', 'f1000000-0000-4000-8000-000000003006', 'f1000000-0000-4000-8000-000000003007', 'f1000000-0000-4000-8000-000000003008', 'f1000000-0000-4000-8000-000000003009', 'f1000000-0000-4000-8000-000000003010');
insert into public.formation_quizzes (id, lesson_id, title, description, duration_minutes, passing_score, active) values ('f0000000-0000-4000-8000-000000000004', 'e1000000-0000-4000-8000-000000000042', $forge$Quiz — Séance 4 : WordPress → code et Claude Code$forge$, $forge$Analyse d'un thème, inspecteur, licences et Claude Code.$forge$, 10, 70, true) on conflict (id) do update set lesson_id = excluded.lesson_id, title = excluded.title, description = excluded.description, duration_minutes = excluded.duration_minutes, passing_score = excluded.passing_score, active = excluded.active;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000004001', 'f0000000-0000-4000-8000-000000000004', 1, $forge$Quel outil du navigateur permet de lire la police, la taille et la couleur d'un élément ?$forge$, $forge$["L'inspecteur (clic droit → Inspecter)","L'historique","Le gestionnaire de téléchargements","Les favoris"]$forge$::jsonb, 0, $forge$L'inspecteur (onglet Éléments, pipette, onglet Réseau) révèle les styles d'un site existant.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000004002', 'f0000000-0000-4000-8000-000000000004', 2, $forge$Qu'est-ce qu'un « gabarit » dans l'analyse d'un site ?$forge$, $forge$["Une structure de page partagée par plusieurs pages","Une image de fond","Un plugin WordPress","Un mot de passe"]$forge$::jsonb, 0, $forge$Repérer les gabarits permet de créer une mise en page commune au lieu de répéter le code.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000004003', 'f0000000-0000-4000-8000-000000000004', 3, $forge$Avec un thème GPL, que ne dois-tu PAS réutiliser tel quel pour un client ?$forge$, $forge$["La structure de la page","Les images, logos et textes de la démo","Le plan du site","Les idées de mise en page"]$forge$::jsonb, 1, $forge$Les images et textes de démo ont souvent leur propre licence : remplace-les toujours.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000004004', 'f0000000-0000-4000-8000-000000000004', 4, $forge$Que crée la commande `/init` dans Claude Code ?$forge$, $forge$["Un nouveau projet Next.js","Un fichier CLAUDE.md qui sert de mémoire du projet","Une base de données","Un compte GitHub"]$forge$::jsonb, 1, $forge$CLAUDE.md est relu à chaque session : stack, commandes, conventions, pièges.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000004005', 'f0000000-0000-4000-8000-000000000004', 5, $forge$Comment passer en mode plan dans Claude Code ?$forge$, $forge$["Shift+Tab jusqu'au mode plan","Taper « plan » dans Google","Ctrl+K","F12"]$forge$::jsonb, 0, $forge$Shift+Tab fait défiler les modes : normal, acceptation automatique, plan.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000004006', 'f0000000-0000-4000-8000-000000000004', 6, $forge$Que fait la touche Échap pendant que Claude Code travaille ?$forge$, $forge$["Elle lance le build","Elle interrompt l'agent pour que tu puisses le recadrer","Elle ferme l'ordinateur","Elle supprime le projet"]$forge$::jsonb, 1, $forge$Interromps tôt quand l'agent part dans une mauvaise direction.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000004007', 'f0000000-0000-4000-8000-000000000004', 7, $forge$Pourquoi un site recodé peut-il être plus rentable qu'un WordPress pour un petit commerce ?$forge$, $forge$["Il est obligatoire","Il est léger, rapide et peut être hébergé gratuitement sans maintenance de plugins","Il est plus lourd","Il ne peut pas être modifié"]$forge$::jsonb, 1, $forge$Moins de maintenance, plus de vitesse, hébergement gratuit : un vrai argument de vente.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000004008', 'f0000000-0000-4000-8000-000000000004', 8, $forge$Pour un client, combien de licences ThemeForest faut-il en général ?$forge$, $forge$["Une licence par client / projet final","Dix","Aucune","Une seule pour tous les clients"]$forge$::jsonb, 0, $forge$La licence ThemeForest standard couvre un projet final : un client = une licence.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000004009', 'f0000000-0000-4000-8000-000000000004', 9, $forge$Rappel séance 3 — Que vérifie-t-on dans la console du navigateur ?$forge$, $forge$["Les commits","Qu'il n'y a aucune erreur","Le nombre de visiteurs","La couleur du site"]$forge$::jsonb, 1, $forge$Une console sans erreur fait partie de la checklist du pro.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000004010', 'f0000000-0000-4000-8000-000000000004', 10, $forge$Rappel séance 2 — Que contient le fichier design-tokens.md ?$forge$, $forge$["Les mots de passe","La liste des bugs","Les couleurs, typographies et espacements du design","Les textes du client"]$forge$::jsonb, 2, $forge$Les tokens sont la source de vérité visuelle que l'IA doit respecter.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
delete from public.formation_quiz_questions where quiz_id = 'f0000000-0000-4000-8000-000000000004' and id not in ('f1000000-0000-4000-8000-000000004001', 'f1000000-0000-4000-8000-000000004002', 'f1000000-0000-4000-8000-000000004003', 'f1000000-0000-4000-8000-000000004004', 'f1000000-0000-4000-8000-000000004005', 'f1000000-0000-4000-8000-000000004006', 'f1000000-0000-4000-8000-000000004007', 'f1000000-0000-4000-8000-000000004008', 'f1000000-0000-4000-8000-000000004009', 'f1000000-0000-4000-8000-000000004010');
insert into public.formation_quizzes (id, lesson_id, title, description, duration_minutes, passing_score, active) values ('f0000000-0000-4000-8000-000000000005', 'e2000000-0000-4000-8000-000000000052', $forge$Quiz — Séance 5 : un site qui travaille$forge$, $forge$Formulaire, WhatsApp, référencement, vitesse et commandes Claude Code.$forge$, 10, 70, true) on conflict (id) do update set lesson_id = excluded.lesson_id, title = excluded.title, description = excluded.description, duration_minutes = excluded.duration_minutes, passing_score = excluded.passing_score, active = excluded.active;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000005001', 'f0000000-0000-4000-8000-000000000005', 1, $forge$Quelle est la forme d'un lien WhatsApp avec message pré-rempli ?$forge$, $forge$["https://wa.me/229XXXXXXXX?text=Bonjour","whatsapp://appel","mailto:229XXXXXXXX","https://facebook.com/whatsapp"]$forge$::jsonb, 0, $forge$wa.me + numéro au format international + paramètre text encodé.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000005002', 'f0000000-0000-4000-8000-000000000005', 2, $forge$À quoi servent les métadonnées Open Graph ?$forge$, $forge$["À afficher un titre, une description et une image quand on partage le lien","À accélérer le serveur","À protéger le site","À traduire le site"]$forge$::jsonb, 0, $forge$C'est l'aperçu qui apparaît dans WhatsApp, Facebook ou LinkedIn.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000005003', 'f0000000-0000-4000-8000-000000000005', 3, $forge$Quelle taille d'image est recommandée pour un aperçu de partage ?$forge$, $forge$["4000 x 4000","1200 x 630","100 x 100","640 x 1136"]$forge$::jsonb, 1, $forge$1200 x 630 est le format standard des aperçus.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000005004', 'f0000000-0000-4000-8000-000000000005', 4, $forge$Quel outil gratuit mesure la performance d'une page ?$forge$, $forge$["Excel","Photoshop","PageSpeed Insights","WhatsApp"]$forge$::jsonb, 2, $forge$pagespeed.web.dev donne un score et des pistes d'amélioration.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000005005', 'f0000000-0000-4000-8000-000000000005', 5, $forge$Quelle action améliore souvent le plus la vitesse d'un site vitrine ?$forge$, $forge$["Compresser et redimensionner les images (WebP)","Ajouter des polices","Ajouter des vidéos","Mettre plus d'animations"]$forge$::jsonb, 0, $forge$Les images trop lourdes sont la première cause de lenteur.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000005006', 'f0000000-0000-4000-8000-000000000005', 6, $forge$Où crée-t-on une commande personnalisée dans Claude Code ?$forge$, $forge$["Dans Figma","Dans package.json","Dans un fichier Markdown du dossier .claude/commands/","Dans .env"]$forge$::jsonb, 2, $forge$Un fichier .md dans .claude/commands/ devient une commande /nom.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000005007', 'f0000000-0000-4000-8000-000000000005', 7, $forge$À quoi sert un sous-agent ?$forge$, $forge$["À payer moins cher l'abonnement","À remplacer Git","À confier une sous-tâche dans un contexte séparé pour garder la conversation principale propre","À créer un compte"]$forge$::jsonb, 2, $forge$Le sous-agent travaille à part et ne rapporte que le résultat.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000005008', 'f0000000-0000-4000-8000-000000000005', 8, $forge$Pourquoi chaque page doit-elle avoir son propre titre et sa description ?$forge$, $forge$["Ce n'est pas utile","Pour le référencement et pour que chaque page soit bien présentée dans Google","Pour faire joli dans le code","Pour le formulaire"]$forge$::jsonb, 1, $forge$Des titres et descriptions uniques aident Google à comprendre et afficher chaque page.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000005009', 'f0000000-0000-4000-8000-000000000005', 9, $forge$Rappel séance 4 — Que contient le fichier CLAUDE.md ?$forge$, $forge$["Les images","Les mots de passe","La mémoire du projet : stack, commandes, conventions, pièges","Les factures"]$forge$::jsonb, 2, $forge$Un bon CLAUDE.md vaut mieux que 100 prompts parfaits.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000005010', 'f0000000-0000-4000-8000-000000000005', 10, $forge$Rappel séance 3 — Comment un site relié à Vercel se met-il à jour ?$forge$, $forge$["À chaque git push","Une fois par mois","Jamais","En appelant le support"]$forge$::jsonb, 0, $forge$Push = mise en ligne automatique.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
delete from public.formation_quiz_questions where quiz_id = 'f0000000-0000-4000-8000-000000000005' and id not in ('f1000000-0000-4000-8000-000000005001', 'f1000000-0000-4000-8000-000000005002', 'f1000000-0000-4000-8000-000000005003', 'f1000000-0000-4000-8000-000000005004', 'f1000000-0000-4000-8000-000000005005', 'f1000000-0000-4000-8000-000000005006', 'f1000000-0000-4000-8000-000000005007', 'f1000000-0000-4000-8000-000000005008', 'f1000000-0000-4000-8000-000000005009', 'f1000000-0000-4000-8000-000000005010');
insert into public.formation_quizzes (id, lesson_id, title, description, duration_minutes, passing_score, active) values ('f0000000-0000-4000-8000-000000000006', 'e2000000-0000-4000-8000-000000000062', $forge$Quiz — Séance 6 : données, connexion et Antigravity$forge$, $forge$Modèle de données, Supabase, RLS, clés et Antigravity.$forge$, 10, 70, true) on conflict (id) do update set lesson_id = excluded.lesson_id, title = excluded.title, description = excluded.description, duration_minutes = excluded.duration_minutes, passing_score = excluded.passing_score, active = excluded.active;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000006001', 'f0000000-0000-4000-8000-000000000006', 1, $forge$Que faut-il faire AVANT de demander du code pour les données d'un SaaS ?$forge$, $forge$["Acheter un nom de domaine","Écrire le pitch","Choisir les couleurs","Décrire les tables, leurs colonnes et leurs liens"]$forge$::jsonb, 3, $forge$Décrire ses données d'abord rend les demandes à l'IA précises et évite les refontes.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000006002', 'f0000000-0000-4000-8000-000000000006', 2, $forge$À quoi servent les règles RLS dans Supabase ?$forge$, $forge$["À sauvegarder la base","À traduire les tables","À accélérer la base","À garantir que chaque utilisateur ne voit et ne modifie que ses propres lignes"]$forge$::jsonb, 3, $forge$Sans RLS, n'importe qui disposant de la clé publique peut lire tes tables.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000006003', 'f0000000-0000-4000-8000-000000000006', 3, $forge$Où doit se trouver la clé secrète service_role de Supabase ?$forge$, $forge$["Dans le README","Sur GitHub","Dans le code du navigateur","Uniquement côté serveur, dans une variable d'environnement"]$forge$::jsonb, 3, $forge$La clé service_role contourne toutes les règles : jamais côté navigateur, jamais commitée.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000006004', 'f0000000-0000-4000-8000-000000000006', 4, $forge$Comment vérifier que tes règles de sécurité fonctionnent ?$forge$, $forge$["En faisant un git push","En redémarrant l'ordinateur","En testant avec deux comptes différents","En regardant le design"]$forge$::jsonb, 2, $forge$Chaque compte ne doit voir que ses propres données.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000006005', 'f0000000-0000-4000-8000-000000000006', 5, $forge$Quel fichier ne doit JAMAIS être envoyé sur GitHub ?$forge$, $forge$["page.tsx","README.md","package.json",".env.local"]$forge$::jsonb, 3, $forge$.env.local contient tes clés : vérifie qu'il est dans .gitignore.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000006006', 'f0000000-0000-4000-8000-000000000006', 6, $forge$Dans Antigravity, que sont les « Artifacts » ?$forge$, $forge$["Des bugs","Des templates payants","Des mots de passe","Les productions de l'agent : plan, liste de tâches, captures, enregistrements, résultats"]$forge$::jsonb, 3, $forge$Tu peux commenter les Artifacts comme un document partagé pour guider l'agent.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000006007', 'f0000000-0000-4000-8000-000000000006', 7, $forge$Quand lancer plusieurs agents en parallèle dans le Manager d'Antigravity ?$forge$, $forge$["Sur le même fichier","Jamais","Pour chaque ligne de code","Sur des parties indépendantes du projet"]$forge$::jsonb, 3, $forge$Deux agents sur le même fichier = conflits. 2 à 3 agents sur des parties indépendantes, c'est l'idéal.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000006008', 'f0000000-0000-4000-8000-000000000006', 8, $forge$Quelle est la meilleure façon de corriger un plan d'Antigravity ?$forge$, $forge$["Fermer l'application","Tout réécrire","Attendre qu'il finisse","Commenter directement l'étape du plan concernée"]$forge$::jsonb, 3, $forge$Commenter l'Artifact ajuste le plan sans repartir de zéro.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000006009', 'f0000000-0000-4000-8000-000000000006', 9, $forge$Rappel séance 5 — Quel est souvent le bouton le plus cliqué d'un site de commerce local ?$forge$, $forge$["Le pied de page","Le bouton WhatsApp","Le logo","Le bouton « À propos »"]$forge$::jsonb, 1, $forge$Le contact direct par WhatsApp est le réflexe de la plupart des clients.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000006010', 'f0000000-0000-4000-8000-000000000006', 10, $forge$Rappel séance 4 — Que fait Échap Échap dans Claude Code ?$forge$, $forge$["Revenir à un message précédent de la conversation","Changer de modèle","Supprimer le projet","Fermer le terminal"]$forge$::jsonb, 0, $forge$Tu reviens en arrière dans la conversation pour repartir sur une meilleure direction.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
delete from public.formation_quiz_questions where quiz_id = 'f0000000-0000-4000-8000-000000000006' and id not in ('f1000000-0000-4000-8000-000000006001', 'f1000000-0000-4000-8000-000000006002', 'f1000000-0000-4000-8000-000000006003', 'f1000000-0000-4000-8000-000000006004', 'f1000000-0000-4000-8000-000000006005', 'f1000000-0000-4000-8000-000000006006', 'f1000000-0000-4000-8000-000000006007', 'f1000000-0000-4000-8000-000000006008', 'f1000000-0000-4000-8000-000000006009', 'f1000000-0000-4000-8000-000000006010');
insert into public.formation_quizzes (id, lesson_id, title, description, duration_minutes, passing_score, active) values ('f0000000-0000-4000-8000-000000000007', 'e2000000-0000-4000-8000-000000000072', $forge$Quiz — Séance 7 : paiement, débogage et mise en ligne$forge$, $forge$FedaPay, webhook, méthode de débogage, variables d'environnement et prix.$forge$, 10, 70, true) on conflict (id) do update set lesson_id = excluded.lesson_id, title = excluded.title, description = excluded.description, duration_minutes = excluded.duration_minutes, passing_score = excluded.passing_score, active = excluded.active;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000007001', 'f0000000-0000-4000-8000-000000000007', 1, $forge$Où crée-t-on la transaction FedaPay ?$forge$, $forge$["Dans le README","Côté serveur (route API), avec la clé secrète","Dans le navigateur de l'utilisateur","Dans Figma"]$forge$::jsonb, 1, $forge$La clé secrète FedaPay ne doit jamais être exposée dans le navigateur.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000007002', 'f0000000-0000-4000-8000-000000000007', 2, $forge$Pourquoi utiliser un webhook pour confirmer un paiement ?$forge$, $forge$["Parce que le retour du navigateur peut ne jamais arriver (page fermée), alors que le webhook arrive toujours","Pour envoyer des e-mails","Parce que c'est plus joli","Pour payer moins de frais"]$forge$::jsonb, 0, $forge$C'est le serveur qui doit valider le paiement, pas le navigateur.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000007003', 'f0000000-0000-4000-8000-000000000007', 3, $forge$Quelle est la PREMIÈRE étape de la méthode de débogage du pro ?$forge$, $forge$["Tout réécrire","Supprimer le fichier","Lire l'erreur en entier","Changer d'outil IA"]$forge$::jsonb, 2, $forge$La réponse est souvent dans l'erreur : première ligne ou ligne qui cite ton fichier.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000007004', 'f0000000-0000-4000-8000-000000000007', 4, $forge$Que faire après 3 tentatives de correction ratées avec l'IA ?$forge$, $forge$["Insister encore 10 fois","Supprimer Git","Ouvrir une nouvelle conversation avec ce que tu as appris","Abandonner le projet"]$forge$::jsonb, 2, $forge$Une conversation qui dérive pollue le contexte : repartir propre est plus efficace.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000007005', 'f0000000-0000-4000-8000-000000000007', 5, $forge$Où renseigner les clés Supabase et FedaPay pour le SaaS en ligne ?$forge$, $forge$["Dans le titre de la page","Dans les variables d'environnement de l'hébergeur (Vercel)","Dans le code source","Dans un commentaire"]$forge$::jsonb, 1, $forge$Les variables d'environnement de l'hébergeur remplacent .env.local en production.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000007006', 'f0000000-0000-4000-8000-000000000007', 6, $forge$Que faut-il mettre à jour dans FedaPay après la mise en ligne ?$forge$, $forge$["Rien","Le logo","L'adresse du webhook avec l'adresse en ligne du site","Le mot de passe"]$forge$::jsonb, 2, $forge$Sinon FedaPay continue d'appeler une adresse locale inaccessible.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000007007', 'f0000000-0000-4000-8000-000000000007', 7, $forge$Comment fixer un prix pertinent pour ton SaaS ?$forge$, $forge$["Le moins cher possible","Une fraction claire de ce que le problème coûte au client","Au hasard","Le même prix que Netflix"]$forge$::jsonb, 1, $forge$Le prix se justifie par la valeur : temps ou argent économisé.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000007008', 'f0000000-0000-4000-8000-000000000007', 8, $forge$Combien d'offres proposer au lancement ?$forge$, $forge$["2 maximum : gratuite limitée + payante","Une dizaine","Une par client","Aucune"]$forge$::jsonb, 0, $forge$Simple à comprendre = simple à acheter.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000007009', 'f0000000-0000-4000-8000-000000000007', 9, $forge$Rappel séance 6 — Quel fichier ne doit jamais aller sur GitHub ?$forge$, $forge$["page.tsx",".env.local","tailwind.config","README.md"]$forge$::jsonb, 1, $forge$Il contient tes clés secrètes.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000007010', 'f0000000-0000-4000-8000-000000000007', 10, $forge$Rappel séance 6 — À quoi servent les règles RLS ?$forge$, $forge$["À limiter chaque utilisateur à ses propres données","À changer la couleur des tables","À traduire les textes","À accélérer le site"]$forge$::jsonb, 0, $forge$Sans RLS, les données de tous les utilisateurs sont exposées.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
delete from public.formation_quiz_questions where quiz_id = 'f0000000-0000-4000-8000-000000000007' and id not in ('f1000000-0000-4000-8000-000000007001', 'f1000000-0000-4000-8000-000000007002', 'f1000000-0000-4000-8000-000000007003', 'f1000000-0000-4000-8000-000000007004', 'f1000000-0000-4000-8000-000000007005', 'f1000000-0000-4000-8000-000000007006', 'f1000000-0000-4000-8000-000000007007', 'f1000000-0000-4000-8000-000000007008', 'f1000000-0000-4000-8000-000000007009', 'f1000000-0000-4000-8000-000000007010');
insert into public.formation_quizzes (id, lesson_id, title, description, duration_minutes, passing_score, active) values ('f0000000-0000-4000-8000-000000000008', 'e2000000-0000-4000-8000-000000000082', $forge$Quiz final — Toute la formation$forge$, $forge$20 questions sur la méthode ADAPT, les outils IA et tes 3 projets.$forge$, 20, 70, true) on conflict (id) do update set lesson_id = excluded.lesson_id, title = excluded.title, description = excluded.description, duration_minutes = excluded.duration_minutes, passing_score = excluded.passing_score, active = excluded.active;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008001', 'f0000000-0000-4000-8000-000000000008', 1, $forge$Que signifie le « D » de ADAPT ?$forge$, $forge$["Dessiner","Décortiquer","Dupliquer","Déployer"]$forge$::jsonb, 1, $forge$Décortiquer : analyser structure, composants et styles avant de demander du code.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008002', 'f0000000-0000-4000-8000-000000000008', 2, $forge$Que signifie le « P » de ADAPT ?$forge$, $forge$["Personnaliser","Publier","Programmer","Payer"]$forge$::jsonb, 0, $forge$Personnaliser : marque, textes, images et fonctionnalités du projet.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008003', 'f0000000-0000-4000-8000-000000000008', 3, $forge$Quel est le réflexe n° 1 avant toute demande à l'IA ?$forge$, $forge$["Fermer le navigateur","Changer de modèle","Redémarrer l'éditeur","Faire un commit Git"]$forge$::jsonb, 3, $forge$Le commit est le filet de sécurité qui rend l'expérimentation sans risque.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008004', 'f0000000-0000-4000-8000-000000000008', 4, $forge$Quel outil choisir pour une retouche visuelle très précise ?$forge$, $forge$["FedaPay","Supabase","Cursor Ctrl+K ou FORGEIA CODE","Antigravity Manager avec 3 agents"]$forge$::jsonb, 2, $forge$Pour le chirurgical, l'édition ciblée est la plus rapide.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008005', 'f0000000-0000-4000-8000-000000000008', 5, $forge$Quel outil est le plus adapté pour lancer plusieurs chantiers en parallèle ?$forge$, $forge$["Le bloc-notes","GitHub","Figma","Antigravity (Manager)"]$forge$::jsonb, 3, $forge$Le Manager d'Antigravity supervise plusieurs agents à la fois.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008006', 'f0000000-0000-4000-8000-000000000008', 6, $forge$Quel fichier sert de mémoire du projet pour Claude Code ?$forge$, $forge$["memory.json","index.html",".env","CLAUDE.md"]$forge$::jsonb, 3, $forge$CLAUDE.md est relu à chaque session.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008007', 'f0000000-0000-4000-8000-000000000008', 7, $forge$Pourquoi donner des valeurs exactes plutôt que des adjectifs à l'IA ?$forge$, $forge$["Ça ne change rien","Parce que les adjectifs sont interdits","Pour aller plus lentement","Pour qu'elle n'ait rien à deviner et respecte le design"]$forge$::jsonb, 3, $forge$« 48 px, #171D17 » ne laisse aucune place à l'interprétation.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008008', 'f0000000-0000-4000-8000-000000000008', 8, $forge$Que livre-t-on au projet 1 ?$forge$, $forge$["Une landing page issue d'un template UI8/Figma, en ligne","Un thème WordPress","Une application mobile","Un SaaS"]$forge$::jsonb, 0, $forge$Projet 1 = template transformé en landing page en ligne.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008009', 'f0000000-0000-4000-8000-000000000008', 9, $forge$Que livre-t-on au projet 2 ?$forge$, $forge$["Un logo","Une vidéo","Un tableur","Un site vitrine recodé à partir d'un thème WordPress"]$forge$::jsonb, 3, $forge$Projet 2 = analyse d'un thème WordPress puis site moderne de plusieurs pages.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008010', 'f0000000-0000-4000-8000-000000000008', 10, $forge$Quels éléments sont indispensables au projet 3 ?$forge$, $forge$["Une vidéo de présentation uniquement","Données, connexion des utilisateurs et paiement test","Un blog","Animations 3D"]$forge$::jsonb, 1, $forge$Le SaaS doit enregistrer des données, gérer des comptes et encaisser.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008011', 'f0000000-0000-4000-8000-000000000008', 11, $forge$Où vérifie-t-on les erreurs JavaScript d'une page ?$forge$, $forge$["WhatsApp","Figma","Console du navigateur (F12)","PageSpeed"]$forge$::jsonb, 2, $forge$Une console propre fait partie de la checklist du pro.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008012', 'f0000000-0000-4000-8000-000000000008', 12, $forge$Pour une licence ThemeForest standard, un client =$forge$, $forge$["Une licence","Dix licences","Aucune licence","Une licence pour toute la vie"]$forge$::jsonb, 0, $forge$Une licence par projet final.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008013', 'f0000000-0000-4000-8000-000000000008', 13, $forge$Que garantissent les règles RLS de Supabase ?$forge$, $forge$["Que le design est fidèle","Que le site est rapide","Que chaque utilisateur ne voit que ses données","Que les paiements sont gratuits"]$forge$::jsonb, 2, $forge$Elles protègent les données au niveau de chaque ligne.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008014', 'f0000000-0000-4000-8000-000000000008', 14, $forge$Où la clé secrète FedaPay doit-elle être utilisée ?$forge$, $forge$["Côté serveur uniquement","Dans un fichier public","Dans le navigateur","Dans le titre de la page"]$forge$::jsonb, 0, $forge$Une clé secrète exposée permet à n'importe qui d'agir sur ton compte.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008015', 'f0000000-0000-4000-8000-000000000008', 15, $forge$Pourquoi un webhook pour confirmer un paiement ?$forge$, $forge$["Il est obligatoire pour le design","Il arrive même si l'utilisateur ferme son navigateur","Il est plus joli","Il remplace Supabase"]$forge$::jsonb, 1, $forge$Seul le serveur peut confirmer un paiement de façon fiable.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008016', 'f0000000-0000-4000-8000-000000000008', 16, $forge$Quelle est la bonne réaction après 3 corrections ratées par l'IA ?$forge$, $forge$["Tout supprimer","Nouvelle conversation, demande reformulée","Continuer encore et encore","Changer d'ordinateur"]$forge$::jsonb, 1, $forge$Un contexte pollué produit de mauvaises réponses.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008017', 'f0000000-0000-4000-8000-000000000008', 17, $forge$Comment décrire un bug efficacement ?$forge$, $forge$["Où, quoi, comment le reproduire","« Ça marche pas »","Avec un émoji","En une capture floue"]$forge$::jsonb, 0, $forge$La reproduction précise est la moitié de la solution.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008018', 'f0000000-0000-4000-8000-000000000008', 18, $forge$Qu'est-ce qui fait un bon SaaS au lancement ?$forge$, $forge$["Le plus de fonctionnalités possible","Une seule fonctionnalité cœur très bien faite pour une cible précise","Un nom en anglais","Un logo animé"]$forge$::jsonb, 1, $forge$Simple, ciblé, utile : c'est ce qui se vend.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008019', 'f0000000-0000-4000-8000-000000000008', 19, $forge$Dans la démo du Demo Day, que montre-t-on en priorité ?$forge$, $forge$["Toutes les pages une par une","Le parcours principal en direct, du début à la fin","Le code source","Les réglages"]$forge$::jsonb, 1, $forge$Le jury veut voir la valeur : le parcours principal, qui fonctionne.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('f1000000-0000-4000-8000-000000008020', 'f0000000-0000-4000-8000-000000000008', 20, $forge$Quelle règle reste vraie quel que soit l'outil IA ?$forge$, $forge$["Tu restes le chef de projet : l'IA propose, tu décides et tu vérifies","L'IA a toujours raison","Plus le prompt est long, mieux c'est","Il ne faut jamais lire le code"]$forge$::jsonb, 0, $forge$C'est le cœur de la méthode : diriger, découper, vérifier.$forge$) on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
delete from public.formation_quiz_questions where quiz_id = 'f0000000-0000-4000-8000-000000000008' and id not in ('f1000000-0000-4000-8000-000000008001', 'f1000000-0000-4000-8000-000000008002', 'f1000000-0000-4000-8000-000000008003', 'f1000000-0000-4000-8000-000000008004', 'f1000000-0000-4000-8000-000000008005', 'f1000000-0000-4000-8000-000000008006', 'f1000000-0000-4000-8000-000000008007', 'f1000000-0000-4000-8000-000000008008', 'f1000000-0000-4000-8000-000000008009', 'f1000000-0000-4000-8000-000000008010', 'f1000000-0000-4000-8000-000000008011', 'f1000000-0000-4000-8000-000000008012', 'f1000000-0000-4000-8000-000000008013', 'f1000000-0000-4000-8000-000000008014', 'f1000000-0000-4000-8000-000000008015', 'f1000000-0000-4000-8000-000000008016', 'f1000000-0000-4000-8000-000000008017', 'f1000000-0000-4000-8000-000000008018', 'f1000000-0000-4000-8000-000000008019', 'f1000000-0000-4000-8000-000000008020');

-- Calendrier : 8 séances × 2 classes (samedi = classe 1, dimanche = classe 2)
delete from public.formation_sessions;
insert into public.formation_sessions (title, session_date, hours, location, schedule, lesson_id) values ($forge$Séance 1 — Ton atelier IA et ton premier « remix »$forge$, '2026-10-31', $forge$9h – 13h30$forge$, $forge$Présentiel — lieu à confirmer$forge$, 'saturday', 'e1000000-0000-4000-8000-000000000010');
insert into public.formation_sessions (title, session_date, hours, location, schedule, lesson_id) values ($forge$Séance 1 — Ton atelier IA et ton premier « remix »$forge$, '2026-11-01', $forge$9h – 13h30$forge$, $forge$Présentiel — lieu à confirmer$forge$, 'sunday', 'e1000000-0000-4000-8000-000000000010');
insert into public.formation_sessions (title, session_date, hours, location, schedule, lesson_id) values ($forge$Séance 2 — Décortiquer un design et démarrer ton projet 1$forge$, '2026-11-07', $forge$9h – 13h30$forge$, $forge$Présentiel — lieu à confirmer$forge$, 'saturday', 'e1000000-0000-4000-8000-000000000020');
insert into public.formation_sessions (title, session_date, hours, location, schedule, lesson_id) values ($forge$Séance 2 — Décortiquer un design et démarrer ton projet 1$forge$, '2026-11-08', $forge$9h – 13h30$forge$, $forge$Présentiel — lieu à confirmer$forge$, 'sunday', 'e1000000-0000-4000-8000-000000000020');
insert into public.formation_sessions (title, session_date, hours, location, schedule, lesson_id) values ($forge$Séance 3 — Vérifier, mettre en ligne et livrer le projet 1$forge$, '2026-11-14', $forge$9h – 13h30$forge$, $forge$Présentiel — lieu à confirmer$forge$, 'saturday', 'e1000000-0000-4000-8000-000000000030');
insert into public.formation_sessions (title, session_date, hours, location, schedule, lesson_id) values ($forge$Séance 3 — Vérifier, mettre en ligne et livrer le projet 1$forge$, '2026-11-15', $forge$9h – 13h30$forge$, $forge$Présentiel — lieu à confirmer$forge$, 'sunday', 'e1000000-0000-4000-8000-000000000030');
insert into public.formation_sessions (title, session_date, hours, location, schedule, lesson_id) values ($forge$Séance 4 — Transformer un thème WordPress en site moderne$forge$, '2026-11-21', $forge$9h – 13h30$forge$, $forge$Présentiel — lieu à confirmer$forge$, 'saturday', 'e1000000-0000-4000-8000-000000000040');
insert into public.formation_sessions (title, session_date, hours, location, schedule, lesson_id) values ($forge$Séance 4 — Transformer un thème WordPress en site moderne$forge$, '2026-11-22', $forge$9h – 13h30$forge$, $forge$Présentiel — lieu à confirmer$forge$, 'sunday', 'e1000000-0000-4000-8000-000000000040');
insert into public.formation_sessions (title, session_date, hours, location, schedule, lesson_id) values ($forge$Séance 5 — Un site qui travaille pour son client (et livraison du projet 2)$forge$, '2026-11-28', $forge$9h – 13h30$forge$, $forge$Présentiel — lieu à confirmer$forge$, 'saturday', 'e2000000-0000-4000-8000-000000000050');
insert into public.formation_sessions (title, session_date, hours, location, schedule, lesson_id) values ($forge$Séance 5 — Un site qui travaille pour son client (et livraison du projet 2)$forge$, '2026-11-29', $forge$9h – 13h30$forge$, $forge$Présentiel — lieu à confirmer$forge$, 'sunday', 'e2000000-0000-4000-8000-000000000050');
insert into public.formation_sessions (title, session_date, hours, location, schedule, lesson_id) values ($forge$Séance 6 — Ton SaaS : interface, données et connexion$forge$, '2026-12-05', $forge$9h – 13h30$forge$, $forge$Présentiel — lieu à confirmer$forge$, 'saturday', 'e2000000-0000-4000-8000-000000000060');
insert into public.formation_sessions (title, session_date, hours, location, schedule, lesson_id) values ($forge$Séance 6 — Ton SaaS : interface, données et connexion$forge$, '2026-12-06', $forge$9h – 13h30$forge$, $forge$Présentiel — lieu à confirmer$forge$, 'sunday', 'e2000000-0000-4000-8000-000000000060');
insert into public.formation_sessions (title, session_date, hours, location, schedule, lesson_id) values ($forge$Séance 7 — Ton SaaS encaisse : paiement Mobile Money, débogage et mise en ligne$forge$, '2026-12-12', $forge$9h – 13h30$forge$, $forge$Présentiel — lieu à confirmer$forge$, 'saturday', 'e2000000-0000-4000-8000-000000000070');
insert into public.formation_sessions (title, session_date, hours, location, schedule, lesson_id) values ($forge$Séance 7 — Ton SaaS encaisse : paiement Mobile Money, débogage et mise en ligne$forge$, '2026-12-13', $forge$9h – 13h30$forge$, $forge$Présentiel — lieu à confirmer$forge$, 'sunday', 'e2000000-0000-4000-8000-000000000070');
insert into public.formation_sessions (title, session_date, hours, location, schedule, lesson_id) values ($forge$Séance 8 — Demo Day : présente ton SaaS, choisis ta stack, reçois ton certificat$forge$, '2026-12-19', $forge$9h – 13h30$forge$, $forge$Présentiel — lieu à confirmer$forge$, 'saturday', 'e2000000-0000-4000-8000-000000000080');
insert into public.formation_sessions (title, session_date, hours, location, schedule, lesson_id) values ($forge$Séance 8 — Demo Day : présente ton SaaS, choisis ta stack, reçois ton certificat$forge$, '2026-12-20', $forge$9h – 13h30$forge$, $forge$Présentiel — lieu à confirmer$forge$, 'sunday', 'e2000000-0000-4000-8000-000000000080');

-- Liste de préparation
update public.formation_todos set active = false where id not in ('a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000005');
insert into public.formation_todos (id, title, sort_order, active) values ('a1000000-0000-4000-8000-000000000001', $forge$Lire la leçon « Bienvenue » et les 4 guides de la boîte à outils IA$forge$, 1, true) on conflict (id) do update set title = excluded.title, sort_order = excluded.sort_order, active = true;
insert into public.formation_todos (id, title, sort_order, active) values ('a1000000-0000-4000-8000-000000000002', $forge$Installer VS Code, Git et Node.js (version LTS)$forge$, 2, true) on conflict (id) do update set title = excluded.title, sort_order = excluded.sort_order, active = true;
insert into public.formation_todos (id, title, sort_order, active) values ('a1000000-0000-4000-8000-000000000003', $forge$Créer ton compte GitHub$forge$, 3, true) on conflict (id) do update set title = excluded.title, sort_order = excluded.sort_order, active = true;
insert into public.formation_todos (id, title, sort_order, active) values ('a1000000-0000-4000-8000-000000000004', $forge$Installer FORGEIA CODE et le brancher sur la passerelle (Ressources → Environnement développeur IA)$forge$, 4, true) on conflict (id) do update set title = excluded.title, sort_order = excluded.sort_order, active = true;
insert into public.formation_todos (id, title, sort_order, active) values ('a1000000-0000-4000-8000-000000000005', $forge$Venir à chaque séance avec ton ordinateur portable chargé$forge$, 5, true) on conflict (id) do update set title = excluded.title, sort_order = excluded.sort_order, active = true;

commit;
