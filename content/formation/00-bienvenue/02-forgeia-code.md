---
id: d0000000-0000-4000-8000-000000000002
module: bienvenue
order: 2
title: "Boîte à outils IA #1 — FORGEIA CODE (ton outil par défaut)"
type: outil
duration: 20 min
---

## À quoi il sert

**FORGEIA CODE** est l'extension VS Code de la formation : un **agent de code** qui lit ton projet, propose un plan, crée et modifie des fichiers et lance des commandes — en te demandant ton accord. Il est branché sur la **passerelle IA FORGE IA** (modèles DeepSeek et Kimi via NVIDIA), donc **tu n'as pas d'abonnement à payer** pendant la formation.

**Quand le choisir :** pour tout le travail de la formation, en classe comme chez toi. C'est l'outil commun à tous : quand on montre une manip en séance, tu peux la reproduire exactement.

## Installation (10 minutes)

1. Installe **VS Code** : [code.visualstudio.com](https://code.visualstudio.com).
2. Dans ton espace apprenant → **Ressources** → onglet **Environnement développeur IA** : télécharge le fichier `.vsix` de FORGEIA CODE.
3. Dans VS Code : panneau **Extensions** → menu `…` → **Install from VSIX…** → choisis le fichier.
4. Ouvre FORGEIA CODE dans la barre latérale → réglages du fournisseur :
   - **API Provider** : *OpenAI Compatible*
   - **Base URL** : `https://ia.guelichweb.store/v1`
   - **API Key** : ta **clé personnelle** (même onglet des Ressources — elle est à toi, ne la partage pas)
   - **Model** : `forgeia-coder` (ou `deepseek-v4-flash`)
5. Test : ouvre un dossier vide et demande « Crée un fichier `index.html` avec une page “Bonjour FORGE IA” centrée ». Si le fichier apparaît, tu es prêt.

## Les gestes de base

- **Deux modes** : **Plan** (l'agent réfléchit et propose, sans toucher aux fichiers) et **Act** (il exécute). **Commence toujours en Plan** pour une tâche de plus de 2 fichiers.
- **Mentionner du contexte** avec `@` : `@fichier`, `@dossier/`, une URL de doc, les **problèmes** affichés par VS Code ou le **terminal**. Plus le contexte est précis, meilleur est le résultat.
- **Approuver ou refuser** chaque action (écriture de fichier, commande). Lis ce qu'il propose avant d'approuver.
- **Checkpoints** : à chaque étape, tu peux comparer et revenir en arrière si le résultat ne te plaît pas.
- **Glisser une image** (capture d'écran d'un design) dans la conversation : l'agent s'en sert comme modèle.

## Les méthodes pro (ce qu'on ne voit pas dans les tutos)

1. **Un fichier de règles par projet.** Crée `.clinerules` à la racine du projet avec ta stack, tes conventions et tes interdits. Exemple :
   ```
   - Stack : Next.js (App Router), TypeScript, Tailwind CSS.
   - Couleurs et typographies : uniquement celles de design-tokens.md.
   - Un composant = un fichier dans components/.
   - Ne jamais installer de dépendance sans me demander.
   - Réponds en français, explique en 3 lignes ce que tu as changé.
   ```
   L'agent relit ces règles à chaque demande : tu n'as plus à te répéter.
2. **Une demande = un résultat vérifiable.** « Reproduis le header du design » ✅ — « Fais tout le site » ❌.
3. **Commit Git avant chaque demande.** Si l'agent casse quelque chose, `git restore .` et tu repars propre.
4. **Demande-lui de se relire** : « Relis tes modifications : qu'est-ce qui pourrait casser sur mobile ? »
5. **Conversation neuve par tâche.** Une conversation trop longue fait perdre le fil à l'agent (et coûte plus). Nouvelle tâche = nouvelle conversation.
6. **Limite l'auto-approbation** : autorise la lecture de fichiers automatiquement, mais garde la validation manuelle pour les commandes du terminal.

## Pièges et sécurité

- ❌ Ne colle **jamais** de mot de passe, de clé secrète ou de fichier `.env` dans la conversation.
- ❌ N'approuve pas une commande que tu ne comprends pas (surtout `rm`, `del`, `git push --force`). Demande d'abord : « Explique cette commande ».
- ⚠️ Le modèle peut inventer une fonction ou un paquet qui n'existe pas : si une erreur apparaît, colle-la telle quelle et demande la cause.

## Mini-exercice (5 min)

Dans un dossier `test-forgeia`, en mode **Plan** puis **Act** :
> « Crée une page HTML avec Tailwind (CDN) : un titre, un paragraphe et un bouton bordeaux #791d3e. Explique ensuite ce que tu as fait en 3 lignes. »

Ouvre la page dans ton navigateur. ✅ Ton atelier IA fonctionne.
