# Evolution API — déploiement VPS

Fichiers de référence pour `/www/docker/evolution/` sur le serveur.

Le fichier `.env` avec les secrets reste **uniquement sur le VPS** (non versionné).

## Services

- API : `127.0.0.1:8080`
- Manager intégré : `http://127.0.0.1:8080/manager`
- Instance FORGE IA : `forgeia`

## DNS requis (LWS)

Ajouter un enregistrement **CNAME** :

| Nom | Type | Valeur |
|-----|------|--------|
| `evolution` | CNAME | `guelichweb.store` |

Puis SSL : `certbot certonly --webroot -w /www/wwwroot/evolution.guelichweb.store -d evolution.guelichweb.store`

## Variables FORGE IA (`.env.local`)

```
EVOLUTION_API_URL=http://127.0.0.1:8080
EVOLUTION_API_INSTANCE=forgeia
EVOLUTION_API_KEY=<clé sur le VPS dans /www/docker/evolution/.env>
ADMIN_WHATSAPP=22966368705
```
