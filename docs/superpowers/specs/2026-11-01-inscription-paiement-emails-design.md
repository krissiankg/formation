# Inscription avec mot de passe, paiement obligatoire et notifications par email

Date : 2026-11-01. Statut : à valider.

## Pourquoi

Les notifications WhatsApp ne sont pas fiables :
- Evolution API (non officiel) a déjà fait bloquer un numéro.
- L'API officielle de Meta refuse les numéros béninois encore enregistrés au format à 8 chiffres.

On abandonne donc toute notification WhatsApp. Conséquence utile : FORGE IA ne dépend plus du VPS, qui s'arrête fin novembre 2026.

## Ce que veut Christian

- Le formulaire d'inscription demande toujours le numéro WhatsApp, mais le site n'envoie plus aucun WhatsApp.
- L'élève crée son compte avec **email + mot de passe**.
- Il **paie la préinscription (2 500 F, FedaPay) avant d'accéder au tableau de bord**, avec un parcours professionnel.
- Une fois payé, le tableau de bord l'invite à **rejoindre le groupe WhatsApp FORGEIA**. Le lien n'est **jamais visible avant le paiement**.
- Les notifications partent **par email**, via **Brevo** (offre gratuite, 300 emails par jour).

Critère de réussite : un nouvel élève s'inscrit, paie et arrive sur son espace sans aide. Il reçoit ses emails sans qu'ils tombent en spam. Aucun élève non payé ne voit le contenu ni le lien du groupe. Les élèves déjà inscrits peuvent créer leur mot de passe.

## Parcours élève

Une barre de progression en 3 étapes s'affiche sur ces écrans : **1. Ton compte → 2. Paiement → 3. Bienvenue**.

1. **Ton compte** (`/inscription`) : nom, email, WhatsApp, créneau, mot de passe (8 caractères minimum, saisi deux fois), conditions.
   - À l'envoi, le compte est créé avec le mot de passe haché (`hashPassword` existant) et l'élève est **connecté** (cookie de session signé existant).
   - Si l'email existe déjà, le formulaire répond « Un compte existe déjà avec cet email : connecte-toi » avec un lien vers `/connexion`.
2. **Paiement** : redirection immédiate vers FedaPay (2 500 F). Au retour, FedaPay renvoie vers `/inscription/paiement`.
3. **Bienvenue** (`/inscription/paiement`, page réservée aux élèves connectés) :
   - **pas encore payé** : récapitulatif (créneau, montant), bouton « Payer ma préinscription » (nouvelle transaction FedaPay) et bouton de déconnexion ;
   - **retour de FedaPay, paiement en cours de validation** : message « Vérification du paiement… » ; la page se rafraîchit toutes les 3 s pendant 60 s au maximum, puis propose « Réessayer » ;
   - **payé** : « Paiement confirmé, bienvenue ! » et bouton « Accéder à mon espace ».

**Accès à l'espace** : toute page de `/espace` redirige vers `/inscription/paiement` tant que la préinscription n'est pas payée.
- Le choix de l'admin « accès complet » passe outre, par exemple pour un paiement en espèces marqué à la main.
- « Accès bloqué » garde son comportement actuel.
- Les règles d'ouverture des modules (`getCourseAccess`) ne changent pas.

Les anciens liens `/inscription/confirmation?id=…` (paiements commencés avant la mise en ligne) redirigent vers `/inscription/paiement`, qui demande de se connecter si besoin.

## Connexion et mot de passe

- `/connexion` : **email + mot de passe uniquement**. La connexion par numéro WhatsApp est supprimée : n'importe qui connaissant l'email et le numéro d'un élève pouvait entrer dans son compte.
- **Mot de passe oublié** (`/mot-de-passe-oublie`) :
  - L'élève saisit son email. La réponse est toujours « Si un compte existe, un email vient d'être envoyé », pour ne pas révéler quels emails sont inscrits.
  - L'email contient un lien `/mot-de-passe/nouveau?token=…`. Le jeton est signé avec le même secret HMAC que la session (`ADMIN_SESSION_SECRET`, préfixe `reset:`). Il contient l'identifiant de l'inscription, une expiration d'une heure et une empreinte du mot de passe actuel, ce qui le rend inutilisable une fois le mot de passe changé.
  - Après l'enregistrement du nouveau mot de passe, l'élève est connecté puis envoyé vers `/espace`.
- Le changement de mot de passe depuis le profil passe aussi à 8 caractères minimum (6 aujourd'hui).
- **Élèves déjà inscrits**, qui n'ont souvent pas de mot de passe :
  - la page de connexion indique « Première connexion depuis la mise à jour ? Crée ton mot de passe » (lien vers « mot de passe oublié ») ;
  - l'admin peut aussi leur envoyer ce lien depuis la ligne de l'inscrit.

## Groupe WhatsApp

- Le lien est enregistré dans la table existante `app_settings` (clé `whatsapp_group_url`). Une carte de l'admin permet de le saisir et de le changer. **Il n'est jamais écrit dans le dépôt**, qui est public.
- Il n'est lu que côté serveur, et seulement pour un élève dont la préinscription est payée (ou en accès complet forcé).
- Sur le tableau de bord, un bandeau dit « Rejoins le groupe WhatsApp FORGEIA » avec un bouton. Il disparaît quand l'élève clique « C'est fait » (mémorisé dans le navigateur). Le lien reste dans le menu de l'espace.
- Il figure aussi dans l'email « Paiement confirmé » de la préinscription.

## Emails (Brevo)

Envoi par l'API transactionnelle de Brevo (`POST https://api.brevo.com/v3/smtp/email`), expéditeur `FORGE IA <notifications@forgeia.site>`.
- Sans clé `BREVO_API_KEY`, l'envoi est seulement écrit dans les journaux, sans erreur.
- Les adresses de test `@forgeia.local` ne reçoivent rien.
- Un échec d'envoi est journalisé et **ne bloque jamais** l'action qui l'a déclenché (inscription, paiement…).
- Délai maximum de 8 s par appel.

| Email | Déclencheur | Contenu |
| --- | --- | --- |
| Compte créé | Inscription | Bienvenue, créneau, bouton « Finaliser ma préinscription » (`/inscription/paiement`) |
| Préinscription confirmée | Webhook FedaPay ou paiement marqué à la main | Merci, lien vers le reçu, **lien du groupe WhatsApp**, prochaines étapes |
| Paiement reçu | Tranches 30 000 F / 47 500 F (webhook ou manuel) | Montant, lien vers le reçu |
| Recharge de coins | Webhook FedaPay (coins) | Coins crédités, lien vers l'espace ressources |
| Rappels de l'admin | Bouton de la ligne inscrit | Préinscription en attente / échéance à régler / message libre / lien de création de mot de passe |
| Nouveau contenu | Publication avec notification | Titre, type, lien vers l'espace |
| Projet évalué | Évaluation dans l'admin | Statut, note, commentaire, lien vers l'espace |
| Mot de passe oublié | Demande de l'élève | Lien valable 1 h |

Pas d'email pour les résultats de test : ils restent visibles dans l'espace.

**Alertes pour Christian**, envoyées à `ADMIN_EMAIL` : nouvelle inscription, paiement reçu (préinscription, tranches, coins), projet soumis. Les messages Telegram existants restent en place.

Chaque email a une version HTML simple aux couleurs FORGE IA et une version texte.

## Ce qu'on retire

- Tout envoi WhatsApp : `notifyWhatsApp`, `notifyAdminWhatsApp`, l'intégration Evolution et l'ancien appel Meta dans `src/lib/integrations.ts`.
- La connexion par numéro WhatsApp (`findEnrollmentByCredentials`).
- Le lien « WhatsApp (Evolution) » de l'admin. La route `/api/admin/whatsapp/remind` est remplacée par une route de rappel par email.
- Dans le CDK : les variables `EVOLUTION_API_URL` et `EVOLUTION_API_INSTANCE`, et les clés de secret `EVOLUTION_API_KEY` et `ADMIN_WHATSAPP`.
- Le travail Meta non déployé est déjà mis de côté (`git stash`, « abandoned: WhatsApp Meta Cloud API »).

Le numéro WhatsApp reste demandé, enregistré, affiché dans l'admin et transmis à FedaPay.

## Configuration et mise en ligne

1. **Christian, côté Brevo** :
   - créer le compte ;
   - authentifier le domaine `forgeia.site` en ajoutant chez LWS les lignes DNS fournies par Brevo (code Brevo et DKIM ; le DMARC existe déjà) ;
   - créer une clé API et l'ajouter au secret AWS `forgeia/web/env` sous `BREVO_API_KEY`. Elle ne passe jamais par le chat.
2. **Code** : `EMAIL_FROM` est ajouté en variable non secrète dans le CDK. `BREVO_API_KEY` n'est ajoutée à `ENV_SECRET_KEYS` **qu'après** sa création dans le secret, sinon les tâches ECS ne démarrent pas.
3. **Mise en ligne en une fois, avant le 14 novembre 2026** : quand le mot de passe devient obligatoire, les élèves existants ont besoin de l'email « crée ton mot de passe ».
4. **Vérification en production** avec un compte de test :
   - inscription, redirection FedaPay, page `/inscription/paiement` bloquée ;
   - l'admin marque le paiement à la main, puis l'accès s'ouvre et le lien du groupe apparaît ;
   - « mot de passe oublié » ;
   - réception d'un vrai email sur la boîte de Christian.

## Tests

Tests unitaires (Vitest) :
- règle d'accès « préinscription payée ou accès forcé » ;
- validation du formulaire (mot de passe, confirmation, email déjà utilisé) ;
- création du compte avec session ;
- connexion par mot de passe uniquement ;
- jeton de réinitialisation (signature, expiration, inutilisable après changement de mot de passe) ;
- client Brevo (requête envoyée, pas d'envoi sans clé ni vers `@forgeia.local`, échec non bloquant) ;
- contenu des emails clés (lien du groupe présent seulement dans l'email de préinscription confirmée).

Plus un build Next complet avant le déploiement.
