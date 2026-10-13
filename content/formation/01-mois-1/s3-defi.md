---
id: e1000000-0000-4000-8000-000000000031
module: mois-1
order: 31
title: "Défi — Séance 3 : la chasse aux 5 bugs (40 min)"
type: défi
duration: 40 min
---

## L'énoncé

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
