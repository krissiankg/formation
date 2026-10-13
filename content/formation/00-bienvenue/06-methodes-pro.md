---
id: d0000000-0000-4000-8000-000000000006
module: bienvenue
order: 6
title: "Les méthodes pro + ta bibliothèque de consignes"
type: outil
duration: 30 min
---

Les outils changent tous les 6 mois. **Ces méthodes, elles, fonctionnent avec tous les agents** (FORGEIA CODE, Cursor, Claude Code, Antigravity). C'est ce qui sépare quelqu'un qui « joue avec l'IA » de quelqu'un qui **livre**.

## Les 10 réflexes du pro

1. **Commit avant chaque demande.** `git add . && git commit -m "avant: header"`. Si l'IA casse tout : `git restore .` → retour à la situation propre en 2 secondes. C'est ton filet de sécurité.
2. **Plan avant code.** Pour toute tâche de plus de 2 fichiers : mode plan, tu lis, tu corriges, puis tu exécutes.
3. **Une demande = un résultat vérifiable.** Découpe : header, puis hero, puis cartes, puis footer. Jamais « fais tout le site ».
4. **Le contexte permanent dans un fichier** (`.clinerules`, `.cursor/rules/`, `CLAUDE.md`) : stack, conventions, couleurs, interdits. Tu l'écris une fois, l'IA le relit toujours.
5. **Des valeurs exactes, pas des adjectifs.** « Titre 48 px, Inter Bold, couleur #171D17, 24 px sous le titre » bat « un beau titre ».
6. **Montre au lieu de décrire** : une capture d'écran du design vaut 200 mots.
7. **Fais vérifier** : « lance le build », « ouvre la page à 375 px », « liste ce qui pourrait casser ». Un agent qui se vérifie est fiable ; un agent qui ne se vérifie pas te ment sans le savoir.
8. **Fais expliquer le diff** : « Explique-moi en 5 lignes ce que tu as changé et pourquoi. » Tu apprends, et tu repères les erreurs.
9. **Conversation neuve quand ça dérive.** Après 3 corrections ratées, ne t'acharne pas : nouvelle conversation, demande reformulée avec ce que tu as appris.
10. **Le bon modèle au bon moment** : modèle rapide et économique pour le répétitif ; modèle puissant pour planifier et déboguer.

## Quel outil pour quelle tâche ?

| Tâche | Outil conseillé |
|---|---|
| Retouche visuelle précise (couleur, marge, texte) | Cursor (Ctrl+K) ou FORGEIA CODE |
| Reconstruire une section à partir d'une capture | FORGEIA CODE, Cursor Agent, Antigravity |
| Fonctionnalité complète sur plusieurs fichiers | Claude Code (mode plan), Cursor Plan |
| Plusieurs chantiers en parallèle | Antigravity (Manager) |
| Vérifier visuellement / reproduire un bug | Antigravity (navigateur) |
| Bug mystérieux, erreur incompréhensible | Claude Code ou modèle puissant + logs complets |

## Ta bibliothèque de consignes (à copier et adapter)

### 1. Extraire les design tokens d'un design
```
Voici une capture du design [joindre l'image].
Extrais les design tokens dans un fichier design-tokens.md :
- couleurs (hex) avec leur rôle (fond, texte, accent, bordure…)
- typographies (famille, tailles, graisses, interlignes)
- espacements et rayons de bordure récurrents
N'écris aucun autre code.
```

### 2. Reconstruire un composant à partir d'une capture (le cœur d'ADAPT)
```
Rôle : tu es un intégrateur front-end senior.
Contexte : projet Next.js + Tailwind. Respecte design-tokens.md.
Tâche : reproduis ce composant [capture] dans components/Hero.tsx.
Contraintes :
- fidèle au design en largeur 1440 px ET lisible à 375 px
- textes en props pour pouvoir les changer
- n'installe aucune dépendance
- ne modifie aucun autre fichier
À la fin : liste les écarts éventuels avec le design.
```

### 3. Personnaliser pour un client
```
Remplace tous les textes de la page par ceux de content/client.md.
Garde exactement la structure et le style.
Remplace la couleur d'accent par #XXXXXX partout (via les tokens).
Liste les textes qui ne rentrent pas bien dans le design.
```

### 4. Relecture « client exigeant »
```
Relis ce projet comme un client exigeant et un développeur senior.
Liste, par ordre de gravité : bugs, problèmes mobile, lenteurs,
problèmes d'accessibilité, textes manquants. Ne corrige rien encore.
```

### 5. Déboguer proprement
```
Voici l'erreur complète : [coller l'erreur ENTIÈRE et le fichier concerné]
1. Explique la cause probable en 3 lignes.
2. Propose la correction la plus petite possible.
3. Dis-moi comment vérifier que c'est réglé.
N'applique rien avant que je valide.
```

### 6. Comprendre du code existant
```
Explique ce fichier comme à quelqu'un qui débute : à quoi il sert,
les 3 parties importantes, et ce que je peux modifier sans risque.
```

### 7. Préparer un commit
```
Résume les changements en cours et propose un message de commit
clair (une ligne + 3 puces), en français.
```

> 💡 **Ta mission permanente** : crée un fichier `mes-consignes.md` dans ton ordinateur. Chaque fois qu'une consigne marche très bien, ajoute-la. Dans 2 mois, cette bibliothèque vaudra de l'or.

## Les licences, en 2 minutes

| Source | Ce que tu peux faire en général | À vérifier |
|---|---|---|
| **UI8, ThemeForest** (achat) | Utiliser et modifier pour toi ou **un** client, selon le type de licence | Licence « standard » vs « étendue », nombre de projets, revente interdite |
| **Figma Community** | Dépend de l'auteur : souvent libre avec attribution | La mention de licence sur la page du fichier |
| **Thèmes WordPress GPL** | Utiliser, modifier, redistribuer le code | Les images et polices peuvent avoir leur propre licence |
| **Bibliothèque à coins FORGE IA** | **S'entraîner** (exercices, défis) | Pour un client ou ton SaaS : utilise un template dont tu as la licence |

Règle d'or : **si tu ne sais pas, tu demandes ou tu ne l'utilises pas pour un client.**
