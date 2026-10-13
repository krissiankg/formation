---
id: e2000000-0000-4000-8000-000000000061
module: mois-2
order: 61
title: "Défi — Séance 6 : une table et son affichage en 40 minutes"
type: défi
duration: 40 min
---

## L'énoncé

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
