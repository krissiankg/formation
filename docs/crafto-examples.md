# Catalogue d’exemples FORGEIA

Les deux collections publiées regroupent 2 013 pages et exemples, dont 140 sites complets, dans 1 491 archives ZIP. Les 619 entrées de la première collection sont conservées avec les 1 394 entrées de la deuxième.

Le pack Crafto 4.0 fourni contient 619 pages HTML, dont 60 démos principales et la variante Digital Agency RTL, soit 61 sites. Les pages sont regroupées en 242 archives : chaque page d’un site télécharge le projet correspondant, avec ses pages associées.

Les sources originales sont conservées. Les vignettes de sites proviennent du pack ; les autres aperçus sont des captures des pages fournies. Les photographies des vignettes ne sont pas incluses dans les sources : les étudiants personnalisent les emplacements prévus. Les services externes et formulaires nécessitent leur propre configuration.

## Accès

- Étudiants : `/espace/ressources`, collection « Sites HTML » dans la Bibliothèque de ressources.
- Administrateur : `/admin/exemples`.
- API de catalogue : `/api/ressources/exemples`.
- API de téléchargement : `/api/ressources/exemples/[id]/download`.

Le catalogue et les téléchargements demandent une session étudiant ou administrateur. Les comptes suspendus sont refusés. Les aperçus restent gratuits. Les ZIP se débloquent avec le portefeuille de coins, selon le même barème de poids que les archives Drive. Le serveur calcule le prix à partir du catalogue et exige la confirmation du coût affiché. Une archive commune à plusieurs pages utilise un seul droit permanent (`html:<collection>:<archive>`), conservé entre les publications. Le téléchargement signé exige ce droit, sauf pour l’administration.

Les aperçus utilisent une origine CloudFront distincte : `https://derguiqj76le8.cloudfront.net`. Ils ne reçoivent pas les cookies de l’application. Les envois de formulaires y sont bloqués et aucun PHP n’y est exécuté.

## Stockage AWS

Bucket existant : `forgeia-uploads-555968473975-eu-west-3`.

| Préfixe | Accès |
| --- | --- |
| `website-examples/previews/<release>/` | CloudFront OAC, uniquement les aperçus et leurs fichiers statiques |
| `website-examples/downloads/<release>/` | Privé ; URL S3 signée pendant 120 secondes après authentification |
| `website-examples/catalog/current.json` | Lecture par le rôle ECS, cache serveur d’une minute |
| `website-examples/staging/<release>/` | ZIP source privé, transfert vérifié par SHA-256 |

Le manifeste `current.json` est écrit après tous les fichiers. L’onglet étudiant apparaît seulement lorsque le manifeste complet est disponible. Les préfixes d’archives privées restent hors du chemin public `/uploads/*` de l’application.

## Publication

Le workflow `publish-examples.yml` utilise le rôle OIDC GitHub existant. Le ZIP source reste sur S3. La destination d’envoi temporaire est chiffrée avec une clé locale ; elle n’est pas publiée dans les journaux ou dans un artefact lisible.

1. Créer une paire de clés avec `scripts/crafto/upload.mjs key <dossier-local>`.
2. Lancer `scripts/crafto/dispatch.mjs prepare <dossier-local> <zip-original>`.
3. Télécharger l’artefact `crafto-upload-target` dans un dossier local.
4. Envoyer le ZIP avec `scripts/crafto/upload.mjs put <dossier-local> <zip-original> <artefact-chiffré>`.
5. Lancer `scripts/crafto/dispatch.mjs publish <dossier-local> <zip-original> <origine-cloudfront>`.

La première publication utilisait `crafto-v1`. Le script de lancement utilise désormais `forgeia-sites-v2` par défaut et accepte la release cible et la release source en derniers arguments. Pour une nouvelle version de sources, choisir une nouvelle release : les URL des aperçus sont mises en cache comme fichiers immuables.

Le mode `assets` complète les fichiers statiques d’une release existante (par exemple les curseurs des sliders), sans recréer les ZIP, les vignettes ou le manifeste. Utiliser une nouvelle release si le contenu d’un fichier existant change.

L’import ignore les métadonnées Mac et refuse les chemins sortant de l’archive. Les images externes de remplacement `placehold.co` deviennent des SVG locaux. Les compilations HTML/CSS/JS fournies restent utilisables directement. Chaque ZIP possède un `index.html`, les dépendances et un guide français ; le Gulp du pack reçoit son export `build` manquant.

Les captures utilisent Chrome avec un profil temporaire, sans connexion à des comptes personnels. Les requêtes externes sont bloquées pendant le rendu des vignettes. Le rapport et des captures représentatives sont disponibles dans l’artefact `crafto-preview-review`.

## Présentation FORGEIA

Les logos fournis par l’administrateur sont conservés dans `assets/website-branding/`. Le traitement `scripts/crafto/brand.py` applique les variantes noire et blanche, l’icône couleur, les titres et les liens de présentation. Les logos carrés gardent un format carré. Les identifiants CSS, JavaScript, les éléments HTML `canvas` et les fichiers de licence conservent leur fonction.

Les vignettes sont toutes recapturées après ce traitement. Les ZIP incluent les fichiers `forgeia-brand/`, le guide FORGEIA et les crédits séparés dans `LICENCES-SOURCES.txt`. Les commentaires de licence d’origine sont conservés.

La release de présentation est `forgeia-sites-v2`. Le ZIP source peut être réutilisé depuis `crafto-v1` avec le champ `source_release` du workflow. Exemple : `dispatch.mjs publish <dossier-local> <zip-original> https://derguiqj76le8.cloudfront.net forgeia-sites-v2 crafto-v1`.

## Deuxième collection

Le pack Canvas 7.3 fourni contient 1 394 pages principales, dont 79 pages d’accueil de démos, regroupées en 1 249 ZIP. L’import est pris en charge par `canvas.py`, sans migration vers une autre version du thème. Ses identifiants API commencent par `f2-` pour préserver ceux de la première collection. Les pages et leurs vignettes appartiennent à `forgeia-2`, avec un filtre de collection dans la galerie.

Pour l’importer, créer le ZIP source privé avec `bundle-source.py <source> <zip>`, puis ajouter les arguments `<release> <source_release> canvas` aux commandes `dispatch.mjs prepare` et `publish`. La release initiale est `forgeia-collection-2-v1`. Le manifeste de transfert contient la taille et le SHA-256 calculés pendant la création du ZIP ; AWS vérifie cette somme lors de l’envoi et de la récupération.

Les polices Revicons et le module Whiteboard absents de leur chemin attendu sont récupérés dans le pack. Le module LetMeScroll est fourni avec sa licence MIT. Le style Magazine absent est reconstitué. Les références aux images de casse incorrecte sont corrigées, les images absentes reçoivent des emplacements à personnaliser et les sources vidéo absentes sont retirées en conservant leurs posters. Les sources originales ne sont pas modifiées.

Les archives sont construites à partir d’un noyau partagé et des pages, médias et dépendances du projet choisi. Elles sont envoyées une à une vers S3 puis retirées de l’espace temporaire du job pour limiter l’espace disque. Les aperçus gardent tous les fichiers statiques utilisables ; PHP reste désactivé sur leur hébergement.

Les dépendances du noyau sont analysées une seule fois. Pour reprendre une publication interrompue avec les mêmes sources et la même release encore inactive, activer `resume_archives` dans le workflow. Les ZIP complets déjà sur S3 sont conservés ; les nouvelles archives portent le SHA-256 du pack dans leurs métadonnées. Si certains exemples ont reçu une correction, renseigner leurs identifiants d’archive dans `rebuild_archives` pour les reconstruire. Cette option refuse une release utilisée par le catalogue actif. Le mode `audit`, accessible aussi par `dispatch.mjs audit`, lit le catalogue et des points de contrôle S3 sans modifier les fichiers.

Les bibliothèques JavaScript et CSS provenant des CDN du pack sont regroupées dans `forgeia-vendor/`, avec leurs sources et empreintes. Les cinq fragments HTML chargés par AJAX gardent leur format d’origine et disposent d’aperçus autonomes séparés. Le fichier HTML minifié reçoit un en-tête explicite pour le titre et le favicon FORGEIA.

La publication fusionne les collections après l’envoi de tous les fichiers. Chaque entrée conserve sa propre release : les téléchargements et aperçus de la première collection continuent d’utiliser `forgeia-sites-v2`. L’ancien manifeste est sauvegardé dans `website-examples/catalog/history/` avant son remplacement. Republier une collection remplace uniquement les entrées de cette collection, sans modifier les autres. Le schéma accepte jusqu’à 5 000 entrées.

Validation : tests Vitest de l’authentification, des identifiants et des téléchargements ; tests Python du contenu et des chemins des ZIP ; capture des pages et vérification de la présence de chaque vignette et archive avant activation. Le workflow de déploiement de l’application ignore les modifications des seuls outils Crafto.

## Transactions du portefeuille

La migration `20261027103715_atomic_wallet.sql` doit être appliquée avant le déploiement du déblocage payant. Elle ajoute deux fonctions réservées à `service_role` : `unlock_resource_with_coins` (solde, droit et journal dans une seule transaction) et `credit_wallet_coins` (crédit atomique, recharges FedaPay idempotentes). Le verrou porte uniquement sur le portefeuille de l’apprenant. Les tables du portefeuille restent inaccessibles directement aux clients publics.

Le workflow « Tests du portefeuille » utilise PostgreSQL 17 isolé, sans données de production. Il vérifie les achats simultanés, le refus du solde insuffisant, le rollback d’un journal en erreur et les notifications de recharge répétées.
