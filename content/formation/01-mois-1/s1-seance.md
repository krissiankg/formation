---
id: e1000000-0000-4000-8000-000000000010
module: mois-1
order: 10
title: "Séance 1 — Ton atelier IA et ton premier « remix »"
type: séance
duration: 4h30
session: 1
---

## Objectifs de la séance

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
