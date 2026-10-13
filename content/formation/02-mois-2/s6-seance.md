---
id: e2000000-0000-4000-8000-000000000060
module: mois-2
order: 60
title: "Séance 6 — Ton SaaS : interface, données et connexion"
type: séance
duration: 4h30
session: 6
---

## Objectifs de la séance

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
