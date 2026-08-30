# FORGE IA — Plateforme de formation

Application web (mobile + desktop) pour vendre et diriger une formation présentielle : landing, inscription avec FedaPay, espace apprenant, admin, notifications Telegram / WhatsApp.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Stockage local `.data/` pour démarrer sans backend (remplaçable par Supabase ensuite)
- FedaPay, Telegram, WhatsApp (stubs tant que les clés `.env` ne sont pas renseignées)

## Démarrer

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Rôle |
|-------|------|
| `/` | Landing conversion |
| `/inscription` | Formulaire + paiement 5 000 F |
| `/inscription/confirmation` | Confirmation après paiement |
| `/espace` | Espace apprenant (programme, outils, paiements) |
| `/admin` | Inscrits + publication de contenus (connexion requise) |
| `/admin/connexion` | Connexion administrateur |

## Config formation

Édite `src/lib/config/formation.ts` pour :
- nom de marque, dates, lieu
- tarifs et échéances
- texte programme / FAQ

## Intégrations

Copie `.env.example` → `.env.local` et renseigne :

1. **FedaPay** — `FEDAPAY_SECRET_KEY` (+ webhook vers `/api/webhooks/fedapay`)
2. **Telegram** — bot token + chat id (notif à chaque inscription / paiement)
3. **WhatsApp** — token Cloud API + phone number id (alertes apprenants)
4. **Admin** — `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET` (voir `deploy/admin-auth.md`)

Sans clés : mode démo (paiement simulé + logs console pour Telegram/WhatsApp).

## Suite prévue

- Auth réelle (Supabase) pour apprenants / admin
- Paiements des échéances 70k / 50k / solde
- Module tests / quiz
- Multi-cohortes / multi-formations
