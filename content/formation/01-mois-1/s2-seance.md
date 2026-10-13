---
id: e1000000-0000-4000-8000-000000000020
module: mois-1
order: 20
title: "Séance 2 — Décortiquer un design et démarrer ton projet 1"
type: séance
duration: 4h30
session: 2
---

## Objectifs de la séance

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
