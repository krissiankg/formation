# Admin web — variables à ajouter sur le VPS (`.env.local` ou `.env`)

```
ADMIN_EMAIL=krissiankg@gmail.com
ADMIN_PASSWORD_HASH=<générer avec: node scripts/hash-admin-password.mjs "votre-mot-de-passe">
ADMIN_SESSION_SECRET=<chaîne aléatoire d'au moins 32 caractères>
```

## Générer le hash du mot de passe

Sur la machine locale ou le VPS (dans le dossier du projet) :

```bash
node scripts/hash-admin-password.mjs "votre-mot-de-passe"
```

Copier la sortie dans `ADMIN_PASSWORD_HASH`. Ne jamais committer le mot de passe en clair.

## Générer ADMIN_SESSION_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## URL de connexion

`https://forgeia.guelichweb.store/admin/connexion`

## Sécurité

- Le cookie de session est `httpOnly`, `sameSite=lax`, `secure` en production.
- Les routes `/admin/*` (sauf `/admin/connexion`) et `/api/admin/*` (sauf `/api/admin/auth/*`) exigent une session valide.
- Changez le mot de passe admin si il a été partagé en clair (chat, email, etc.).
