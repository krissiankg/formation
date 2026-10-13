---
id: e2000000-0000-4000-8000-000000000050
module: mois-2
order: 50
title: "Séance 5 — Un site qui travaille pour son client (et livraison du projet 2)"
type: séance
duration: 4h30
session: 5
---

## Objectifs de la séance

- Ajouter ce qui transforme un joli site en **outil commercial** : formulaire de contact, bouton WhatsApp, carte d'accès.
- Poser les bases du **référencement** : titres, descriptions, aperçu de partage sur les réseaux (Open Graph).
- Rendre le site **rapide** : images optimisées, polices, mesure avec un outil gratuit.
- **Livrer le projet 2** avec revue entre pairs.
- Atelier outil : **Claude Code** — commandes personnalisées, sous-agents, retour arrière.

## Déroulé (4 h 30)

| Heure | Moment | Ce qu'on fait |
|---|---|---|
| 9h00 | Rappel flash (15 min) | Analyse d'un thème, gabarits, GPL. |
| 9h15 | Code-along (45 min) | Formulaire + WhatsApp + référencement en direct. |
| 10h00 | Pratique guidée (50 min) | Les mêmes ajouts sur ton projet 2. |
| 10h50 | Atelier outil IA (20 min) | Claude Code : commandes perso et sous-agents. |
| 11h10 | Pause (15 min) | |
| 11h25 | Défi (40 min) | WhatsApp + aperçu de partage en 30 min. |
| 12h05 | Atelier projet (70 min) | Finitions, mise en ligne, dépôt, revue. |
| 13h15 | Bilan (15 min) | Mission : ton idée de SaaS. |

## Code-along : 3 ajouts qui font vendre

### 1. Le formulaire de contact
Pour un site vitrine sans serveur, le plus simple est un service de formulaires (par exemple Formspree ou Web3Forms, offres gratuites) ou une redirection vers WhatsApp avec le message pré-rempli.
```
Ajoute à la page contact un formulaire (nom, téléphone, message).
À l'envoi : ouvre WhatsApp vers le +229XXXXXXXX avec un message
pré-rempli contenant les champs. Valide les champs et affiche
un message clair en cas d'oubli.
```

### 2. Le bouton WhatsApp flottant
Un bouton rond en bas à droite, sur toutes les pages, avec un message pré-rempli : « Bonjour, je viens de votre site… ». C'est souvent **le bouton le plus cliqué** d'un site de commerce local.

### 3. Le référencement de base
```
Pour chaque page, ajoute un titre et une description uniques
(métadonnées Next.js), et une image d'aperçu de partage (Open Graph)
de 1200x630. Liste ensuite les titres et descriptions dans un tableau.
```
Teste l'aperçu : colle le lien dans WhatsApp → l'image et le titre doivent apparaître.

## Pratique guidée : vitesse et qualité

- Remplace les images par des versions **compressées** (format WebP, taille adaptée) et utilise le composant `Image` de Next.js.
- Mesure avec **PageSpeed Insights** (pagespeed.web.dev) : note la performance avant/après.
- Demande à l'IA : « Voici le rapport PageSpeed [coller]. Donne-moi les 3 corrections les plus rentables. »

## Atelier outil IA (20 min) — Claude Code (niveau 2)

- Crée `.claude/commands/verif-site.md` :
  ```
  Vérifie le site comme un client exigeant :
  1. npm run build doit passer
  2. chaque page a un titre et une description
  3. toutes les images ont un texte alternatif
  4. aucun lien mort
  Donne un tableau : élément / OK ou problème / correction proposée.
  ```
  Lance `/verif-site`.
- Démonstration des **sous-agents** : « Utilise un sous-agent pour rechercher tous les textes encore en anglais dans le projet. »
- **Échap Échap** : revenir à un état précédent de la conversation après une mauvaise direction.

## Livraison du projet 2

1. Mets à jour le site en ligne (push) et dépose-le dans **Mon espace → Projets**.
2. Revue par un pair avec la **grille du projet 2** : 2 points forts + 2 améliorations.

## Checklist de fin de séance

- [ ] Formulaire de contact fonctionnel
- [ ] Bouton WhatsApp sur toutes les pages
- [ ] Titres, descriptions et aperçu de partage sur chaque page
- [ ] Score PageSpeed noté avant/après
- [ ] Projet 2 déposé et revu

## Pour aller plus loin

- Montre le site à ton client cible. C'est peut-être ta **première vente**.
- Ajoute un fichier `sitemap` et `robots.txt` (demande à l'IA comment avec Next.js).
