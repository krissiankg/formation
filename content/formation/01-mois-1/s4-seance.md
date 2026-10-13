---
id: e1000000-0000-4000-8000-000000000040
module: mois-1
order: 40
title: "Séance 4 — Transformer un thème WordPress en site moderne"
type: séance
duration: 4h30
session: 4
---

## Objectifs de la séance

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
