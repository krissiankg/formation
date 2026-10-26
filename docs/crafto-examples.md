# Catalogue d’exemples Crafto

Le pack Crafto 4.0 fourni contient 619 pages HTML, dont 60 démos principales et la variante Digital Agency RTL, soit 61 sites. Les pages sont regroupées en 242 archives : chaque page d’un site télécharge le projet correspondant, avec ses pages associées.

Les sources originales sont conservées. Les vignettes de sites proviennent du pack ; les autres aperçus sont des captures des pages fournies. Les photographies des vignettes ne sont pas incluses dans les sources : les étudiants personnalisent les emplacements prévus. Les services externes et formulaires nécessitent leur propre configuration.

## Accès

- Étudiants : `/espace/ressources`, onglet « Exemples de sites ».
- Administrateur : `/admin/exemples`.
- API de catalogue : `/api/ressources/exemples`.
- API de téléchargement : `/api/ressources/exemples/[id]/download`.

Le catalogue et les téléchargements demandent une session étudiant ou administrateur. Les comptes suspendus sont refusés. Les ZIP sont gratuits provisoirement, sans débit de coins. Leur prix ne vient jamais d’un paramètre du navigateur. La tarification ultérieure nécessitera une règle de prix et de paiement côté serveur.

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

Le script de lancement utilise `crafto-v1` pour cette première publication. Pour une nouvelle version de sources, choisir une nouvelle release dans le workflow et adapter le script de lancement : les URL des aperçus sont mises en cache comme fichiers immuables.

Le mode `assets` complète les fichiers statiques d’une release existante (par exemple les curseurs des sliders), sans recréer les ZIP, les vignettes ou le manifeste. Utiliser une nouvelle release si le contenu d’un fichier existant change.

L’import ignore les métadonnées Mac et refuse les chemins sortant de l’archive. Les images externes de remplacement `placehold.co` deviennent des SVG locaux. Les compilations HTML/CSS/JS fournies restent utilisables directement. Chaque ZIP possède un `index.html`, les dépendances et un guide français ; le Gulp du pack reçoit son export `build` manquant.

Les captures utilisent Chrome avec un profil temporaire, sans connexion à des comptes personnels. Les requêtes externes sont bloquées pendant le rendu des vignettes. Le rapport et des captures représentatives sont disponibles dans l’artefact `crafto-preview-review`.

Validation : tests Vitest de l’authentification, des identifiants et des téléchargements ; tests Python du contenu et des chemins des ZIP ; capture des pages et vérification de la présence de chaque vignette et archive avant activation. Le workflow de déploiement de l’application ignore les modifications des seuls outils Crafto.
