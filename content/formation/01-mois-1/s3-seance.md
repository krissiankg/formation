---
id: e1000000-0000-4000-8000-000000000030
module: mois-1
order: 30
title: "Séance 3 — Vérifier, mettre en ligne et livrer le projet 1"
type: séance
duration: 4h30
session: 3
---

## Objectifs de la séance

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
