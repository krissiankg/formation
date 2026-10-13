---
id: d0000000-0000-4000-8000-000000000005
module: bienvenue
order: 5
title: "Boîte à outils IA #4 — Google Antigravity"
type: outil
duration: 25 min
---

## À quoi il sert

**Antigravity** est l'environnement de développement « agent d'abord » de Google. Il a deux faces :
- l'**Éditeur** : un éditeur de code classique avec un agent dans la barre latérale ;
- le **Manager** : une « tour de contrôle » où tu lances et supervises **plusieurs agents en parallèle**, chacun sur sa tâche.

Sa particularité : les agents produisent des **Artifacts** — liste de tâches, plan d'implémentation, captures d'écran, enregistrements du navigateur, résultats de tests — que tu peux **commenter comme un document partagé**. Et l'agent peut **ouvrir un navigateur, cliquer dans ton site et vérifier lui-même** que ça marche.

**Quand le choisir :** pour lancer plusieurs chantiers en parallèle (un agent sur la page d'accueil, un autre sur le tableau de bord), et pour tout ce qui demande une **vérification visuelle** dans le navigateur.

## Installation et coût

- Téléchargement sur le site officiel **Google Antigravity** (Windows, macOS, Linux), connexion avec un compte Google.
- **Coût** : Google a proposé un accès gratuit avec des quotas sur ses modèles Gemini (et d'autres modèles au choix). Les conditions évoluent : vérifie la page officielle. C'est souvent **l'option la plus généreuse gratuitement** pour un débutant.
- Installe l'extension navigateur proposée au premier lancement : c'est elle qui permet à l'agent de piloter Chrome pour tester ton site.

## Les gestes de base

1. **Ouvre ton projet** (un dossier = un espace de travail).
2. Dans le **Manager**, démarre une conversation et choisis le mode **Planning** (l'agent planifie avant d'agir) pour les tâches importantes, ou un mode rapide pour les petites.
3. L'agent produit un **plan d'implémentation** : **lis-le et commente-le** avant de le laisser continuer.
4. Pendant qu'il travaille, bascule dans l'**Éditeur** pour voir les fichiers apparaître.
5. À la fin, consulte les **Artifacts** : captures, enregistrement du navigateur, résumé des changements.

## Les méthodes pro

1. **Commente les Artifacts au lieu de réécrire ta demande.** « Dans le plan, étape 3 : utilise Supabase, pas Firebase » directement sur le plan — l'agent ajuste sans repartir de zéro.
2. **Parallélise intelligemment** : 2 à 3 agents maximum, sur des parties **indépendantes** du projet (pages différentes). Deux agents sur le même fichier = conflits.
3. **Exige la preuve visuelle** : « Ouvre la page dans le navigateur à 375 px et 1440 px de large et fais une capture de chaque. » Tu vérifies en 10 secondes au lieu de tester toi-même.
4. **Reproduire un bug** : « Ouvre la page d'inscription, remplis le formulaire avec des données de test, clique sur Envoyer et enregistre ce qui se passe. » L'enregistrement montre exactement où ça casse.
5. **Règle les autorisations** : laisse l'agent lire et écrire les fichiers, mais **garde la validation manuelle des commandes du terminal**, et interdis les commandes destructrices.
6. **Utilise-le comme relecteur** d'un travail fait ailleurs (Cursor, FORGEIA CODE) : « Vérifie ce projet comme un client exigeant : liste tout ce qui ne va pas, captures à l'appui. »

## Pièges et sécurité

- ⚠️ Les agents en parallèle **consomment vite les quotas**. Réserve le mode multi-agents aux vrais gros chantiers.
- ⚠️ Un agent qui « vérifie lui-même » peut se tromper : regarde toujours les captures, ne te contente pas du message « tout fonctionne ».
- ❌ Comme partout : aucune clé secrète dans la conversation.

## Mini-exercice (5 min)

Ouvre ta landing de test dans Antigravity :
> « Ouvre la page dans le navigateur, fais une capture en largeur mobile (375 px) et liste 3 problèmes d'affichage, sans rien corriger. »

Compare sa liste avec ce que tu vois toi-même. Puis demande-lui de corriger **un seul** des problèmes.
