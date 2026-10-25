# Domaine public FORGE IA

Adresse principale : **https://www.forgeia.site**.
Le domaine reste enregistré et géré chez LWS. L'application reste sur AWS.

## AWS configuré le 26 octobre 2026

- Distribution CloudFront : `E1F260F88E9LV8`.
- Destination DNS : `d2dy4o2jjophxh.cloudfront.net`.
- Certificat ACM (us-east-1) : `arn:aws:acm:us-east-1:555968473975:certificate/9e21732e-c9c5-4fb6-b1aa-2cd9193ff5bc`.
- Certificat émis, distribution déployée avec `forgeia.site`, `www.forgeia.site` et les trois anciens alias.
- Tests HTTPS avant modification DNS : `/api/health` sur le domaine nu renvoie `200 {"ok":true}` ; l'accueil sur `www` renvoie `200` depuis CloudFront.

Ces tests utilisent `curl --connect-to` : ils valident AWS et le certificat, sans prétendre que les DNS publics ont déjà basculé.

## Pointage à appliquer dans LWS

Modifier l'enregistrement existant ; ne pas ajouter un deuxième CNAME pour `www`.

| Type | Nom | Valeur | TTL conseillé |
| --- | --- | --- | --- |
| CNAME | www | d2dy4o2jjophxh.cloudfront.net. | 15 minutes |

Conserver les enregistrements A et AAAA du domaine nu sur l'hébergement LWS : il sert uniquement la redirection vers `www` et son certificat HTTPS. Conserver les enregistrements de validation ACM, de messagerie (MX, mail, SPF, DKIM, DMARC) et les serveurs NS.

Dans **Gestion du domaine → Redirection Web**, choisir **301 (Htaccess)** et configurer `forgeia.site` vers la destination exacte `https://www.forgeia.site`. L'option automatique « domaine vers www » testée chez LWS renvoie vers `http://www.forgeia.site` ; utiliser la destination HTTPS explicite. Le HTTPS fonctionne déjà sur le domaine nu chez LWS. Vérifier la conservation des chemins et paramètres avec un lien d'inscription avant d'activer la redirection des anciens domaines.

Aucune zone Route 53 ni compte Cloudflare n'est nécessaire pour cette configuration. Ne pas remplacer le domaine nu par un CNAME et ne pas copier des adresses IP temporaires de CloudFront dans un enregistrement A.

Les caches contenant l'ancien CNAME `www → @` peuvent durer jusqu'à son ancien TTL de 24 heures, même si le nouveau TTL est abaissé.

Le 26 octobre 2026, l'interrogation DNS directe de `ns17.lwsdns.com` confirme le CNAME `www → d2dy4o2jjophxh.cloudfront.net` avec un TTL de 900 secondes. Un ancien résultat vers LWS restait temporairement présent dans le cache local pendant les vérifications.

Après expiration de ce cache, les tests publics sans contournement DNS réussissent : `https://www.forgeia.site/api/health` renvoie `200 {"ok":true}`, et `https://forgeia.site/` renvoie une 301 vers `https://www.forgeia.site/`, puis l'accueil répond en 200. La redirection LWS conserve aussi les chemins et paramètres.

## Ordre de mise en service

1. Déployer la configuration CDK contenant les nouveaux domaines et le nouveau certificat. Garder `redirectLegacyDomains` à `false`.
2. Appliquer le CNAME et la redirection LWS ci-dessus.
3. Vérifier les accès publics, sans `--connect-to` : accueil et `/api/health` sur `www`, redirection HTTP et HTTPS du domaine nu, connexion admin, connexion élève, retour de paiement et téléversement S3.
4. Déployer les modifications de l'application utilisant `https://www.forgeia.site` pour les liens et métadonnées.
5. Après validation du nouveau domaine, passer `redirectLegacyDomains` à `true` dans `infra/cdk.json` et déployer. Les pages GET/HEAD des anciens domaines redirigeront vers `www` en conservant chemin et paramètres ; les API de paiement et OAuth continueront de recevoir les callbacks existants.
6. Mettre à jour les consoles FedaPay et Google OAuth lorsque leurs nouvelles URL ont été vérifiées. Conserver les anciennes URL pendant la transition.

Les sessions de connexion sont propres à chaque domaine : une reconnexion peut être nécessaire sur la nouvelle adresse.

## Retour arrière

Garder les anciens CNAME et alias CloudFront pendant toute la transition. Si la nouvelle adresse pose problème, désactiver `redirectLegacyDomains` et redéployer pour rétablir l'accès direct aux anciens domaines. Pour annuler seulement le pointage LWS, rétablir l'ancien CNAME `www → @` et retirer la redirection du domaine nu.
