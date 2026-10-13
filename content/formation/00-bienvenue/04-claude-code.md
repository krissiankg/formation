---
id: d0000000-0000-4000-8000-000000000004
module: bienvenue
order: 4
title: "Boîte à outils IA #3 — Claude Code"
type: outil
duration: 25 min
---

## À quoi il sert

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
