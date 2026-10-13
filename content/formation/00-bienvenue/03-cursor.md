---
id: d0000000-0000-4000-8000-000000000003
module: bienvenue
order: 3
title: "Boîte à outils IA #2 — Cursor"
type: outil
duration: 25 min
---

## À quoi il sert

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
