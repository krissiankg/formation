# Formation FORGE IA — Méthode ADAPT (2 mois) : conception

Date : 2026-10-13 · Statut : à valider par l'utilisateur

## 1. Intention

Former des personnes ayant des **bases numériques** (à l'aise avec l'ordinateur, éventuellement un site WordPress/Canva, mais ne codant pas) à **produire des sites et produits web professionnels en adaptant avec l'IA du design et du code existants** (templates UI8, kits Figma, thèmes WordPress), plutôt qu'en codant de zéro.

Livrables de chaque apprenant : **portfolio de 3 projets**, dont le 3ᵉ est **son propre SaaS** vendable (paiement Mobile Money).

## 2. Cadre

- **Durée** : 8 séances de 4 h 30, une par week-end, du **31 oct./1ᵉʳ nov. au 19/20 déc. 2026**.
- **2 classes**, contenu identique : samedi (classe 1) et dimanche (classe 2).
- **Travail personnel** : 2 à 3 h/semaine (quiz, défi, recherche, projet).
- **Outils IA** : FORGEIA CODE (extension VS Code + passerelle DeepSeek) par défaut ; Cursor présenté comme alternative.
- **Templates** : bibliothèque à coins pour les exercices et défis ; templates achetés par l'apprenant pour les projets commerciaux (projets 2 et 3) ; une leçon « lire une licence ».
- **Prix** : 5 000 F d'inscription (non remboursables) + 25 000 F au 1ᵉʳ jour de formation + 50 000 F la 1ʳᵉ semaine de décembre = **80 000 F**.

| Séance | Samedi | Dimanche |
|---|---|---|
| S1 | 2026-10-31 | 2026-11-01 |
| S2 | 2026-11-07 | 2026-11-08 |
| S3 | 2026-11-14 | 2026-11-15 |
| S4 | 2026-11-21 | 2026-11-22 |
| S5 | 2026-11-28 | 2026-11-29 |
| S6 | 2026-12-05 | 2026-12-06 |
| S7 | 2026-12-12 | 2026-12-13 |
| S8 | 2026-12-19 | 2026-12-20 |

## 3. Résultats visés (Stage 1 — Understanding by Design)

**Méthode ADAPT** : **A**cquérir (template + licence) · **D**écortiquer (structure, composants, styles) · **A**ssigner à l'IA (reconstruction composant par composant) · **P**ersonnaliser (marque, contenu, fonctionnalités) · **T**ester & mettre en ligne.

**Grandes idées (transférables)**
1. Un produit pro part rarement de zéro : on réutilise et adapte du design et du code existants.
2. L'IA est un collaborateur qu'on dirige : la qualité dépend des consignes et de la vérification humaine.
3. Un projet vendable = design + fonctionnement + licence propre + offre claire.

**Questions essentielles (récurrentes)** : « Qu'est-ce que je dois créer, et qu'est-ce que je peux réutiliser ? » · « Comment savoir si l'IA m'a donné un bon résultat ? » · « Pourquoi un client paierait-il pour ça ? »

**Compétences** : lire un design Figma ; découper une page en composants ; rédiger des consignes IA (rôle, contexte, contraintes, exemple) ; vérifier et corriger le code produit ; Git/GitHub ; mise en ligne gratuite (Netlify/Vercel) ; analyser un thème WordPress ; Next.js multipages ; formulaire, SEO de base ; Supabase (tables, auth, CRUD, sécurité des clés) ; FedaPay en mode test ; débogage avec l'IA ; tarification et pitch.

## 4. Évaluation (Stage 2 — conçue avant les séances)

| Preuve | Quand | Vérifie |
|---|---|---|
| Projet 1 — landing page (UI8/Figma → code) | S3 | lecture design, découpage, consignes IA, mise en ligne |
| Projet 2 — site vitrine (WordPress → code) | S5 | analyse d'existant, multipages, formulaire, SEO |
| Projet 3 — SaaS (kit dashboard + Supabase + FedaPay) | S8 (démo) | données, auth, paiement, débogage, offre |
| Quiz hebdomadaire (10 QCM dont rappels espacés) | S1–S7 | connaissances, rétention |
| Défi chronométré en séance (30–40 min) | S1–S7 | application autonome |
| Mission de recherche hebdomadaire | S1–S7 | autonomie, veille, regard pro |
| Quiz final (20 QCM) | S8 | synthèse |

Chaque projet a une **grille critériée** (4 niveaux par critère) publiée dès le début. Projets déposés et notés via le module « Projets » existant.

**Certificat** : 3 projets validés (≥ niveau « satisfaisant » à chaque critère essentiel) et moyenne aux quiz ≥ 70 %. Remise manuelle à la S8 (génération PDF hors périmètre).

## 5. Déroulé (Stage 3)

**Gabarit de séance (4 h 30)** : rappel flash 15 min → démo commentée 60 min → pratique guidée 45 min → pause 15 min → défi chronométré 40 min → atelier projet 60 min → bilan & mission 15 min.

**Mois 1 — Apprendre la méthode sur des sites**
- **S1 Ton atelier IA** : installation (VS Code, Git/GitHub, Node, FORGEIA CODE ; démo Cursor) ; ADAPT ; anatomie d'une consigne. Démo : landing de la bibliothèque modifiée en direct. Défi : couleurs + textes + nouvelle section en 30 min. Recherche : 3 templates de landing + licence → choix du template P1.
- **S2 Décortiquer un design** : Figma (inspect, frames, auto-layout, styles, export) ; découpage en composants ; lire HTML/Tailwind ; consignes par composant. Démarrage P1. Défi : reproduire une carte Figma en 30 min. Recherche : lire sa licence + analyser 3 landings concurrentes.
- **S3 Livrer** : responsive ; checklist de vérification du code IA ; Git push ; mise en ligne ; notions de domaine. **Livraison P1** + revue par les pairs. Défi : corriger 5 bugs cachés. Recherche : thème WordPress GPL + commerçant local cible.
- **S4 WordPress → code** : analyser un thème ; extraire contenus/styles (inspecteur) ; recréer en Next.js multipages ; GPL vs ThemeForest. Démarrage P2. Défi : page « À propos » en 40 min. Recherche : textes réels du client cible.

**Mois 2 — Construire et vendre son produit**
- **S5 Un site qui travaille** : formulaire + bouton WhatsApp ; SEO de base (titres, meta, Open Graph) ; images et vitesse. **Livraison P2** + revue. Défi : WhatsApp + Open Graph en 30 min. Recherche : 3 problèmes payants → fiche idée SaaS.
- **S6 SaaS : les données** : kit dashboard ; modèle de données ; Supabase (tables, auth, RLS notions) ; CRUD avec l'IA ; clés secrètes. Démarrage P3. Défi : une table + sa liste en 40 min. Recherche/perso : écrans principaux.
- **S7 SaaS : l'argent** : FedaPay sandbox + confirmation ; déboguer avec l'IA (erreurs, logs, méthode) ; mise en ligne ; prix. Défi : chasse aux bugs en binôme. Recherche : offre commerciale (prix, cible, 5 prospects).
- **S8 Demo Day** : finitions 1 h 30 ; **présentation P3** (5 min démo + offre) ; quiz final ; certificats.

**Différenciation** : défis bonus pour les avancés (animations, mode sombre, dashboard avancé) ; templates simplifiés, consignes IA à compléter et binômes pour ceux en difficulté.

## 6. Intégration dans l'application

- **Programme** : remplace le programme 3 mois (données d'exemple) par 2 modules, chacun avec, par séance : une leçon `séance` (contenu complet : objectifs, déroulé, ressources, checklist), une leçon `défi`, une leçon `recherche`, un quiz de 10 questions (avec explications) ; plus 3 leçons « grille d'évaluation » (projets 1–3) et le quiz final de 20 questions.
- **Nouveaux types de leçon** `défi` et `recherche` : contrainte SQL étendue, badges/icônes dans l'espace apprenant et l'admin.
- **Calendrier** : 16 séances (8 samedi, 8 dimanche) liées à leur leçon ; chaque apprenant voit celles de sa classe.
- **Préparation** (todos) : installer VS Code, créer un compte GitHub, installer FORGEIA CODE, apporter un ordinateur portable.
- **Configuration et site public** (`src/lib/config/formation.ts`) : 2 mois, dates, programme par mois, résultats visés, prix 80 000 F et échéancier 5 000 / 25 000 / 50 000. Les CGU et la page d'accueil se mettent à jour à partir de cette config.
- **Paiements** : le code qui crée l'échéancier d'un inscrit (actuellement 3 tranches fixes `start`/`month1`/`month3`) passe à 2 tranches ; les routes de paiement acceptent les nouvelles tranches.
- **Données** : migration SQL `006` (types, contenus, quiz, séances, todos), appliquée à la base de production, puis déploiement via push sur `main`.

## 7. Hors périmètre

Génération automatique du certificat PDF ; lien entre un dépôt de projet et un numéro de projet (P1/P2/P3) ; migration de la base hors du VPS (traitée séparément, échéance fin novembre).

## 8. Risques

- **Licences** : l'usage commercial de fichiers de la bibliothèque à coins expose l'apprenant et l'éditeur ; la répartition « bibliothèque = entraînement / templates achetés = commercial » et la leçon licences limitent ce risque sans l'éliminer.
- **Charge** : 3 projets en 8 séances est ambitieux pour des non-codeurs ; la différenciation et les templates simplifiés servent de soupape.
- **Base de données sur le VPS** jusqu'à sa migration : les séances de novembre en dépendent ; la migration doit intervenir avant fin novembre.
