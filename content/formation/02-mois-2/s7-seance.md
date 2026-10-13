---
id: e2000000-0000-4000-8000-000000000070
module: mois-2
order: 70
title: "Séance 7 — Ton SaaS encaisse : paiement Mobile Money, débogage et mise en ligne"
type: séance
duration: 4h30
session: 7
---

## Objectifs de la séance

- Brancher **FedaPay en mode test** : créer un paiement, rediriger l'utilisateur, **débloquer l'accès** après paiement.
- Comprendre la **confirmation automatique** (webhook) : pourquoi on ne fait jamais confiance au seul retour du navigateur.
- **Déboguer avec l'IA** comme un pro : lire une erreur, les logs, isoler, corriger petit.
- **Mettre le SaaS en ligne** avec ses variables d'environnement.
- Fixer ton **prix**.
- Atelier outil : **Antigravity** — vérification dans le navigateur et débogage.

## Déroulé (4 h 30)

| Heure | Moment | Ce qu'on fait |
|---|---|---|
| 9h00 | Rappel flash (15 min) | Tables, RLS, connexion, clés. |
| 9h15 | Code-along (45 min) | Paiement FedaPay de bout en bout sur la démo. |
| 10h00 | Pratique guidée (50 min) | Le paiement dans ton SaaS. |
| 10h50 | Atelier outil IA (20 min) | Antigravity : tester le parcours de paiement dans le navigateur. |
| 11h10 | Pause (15 min) | |
| 11h25 | Défi (40 min) | Chasse aux bugs en binôme. |
| 12h05 | Atelier projet (70 min) | Mise en ligne + finitions. |
| 13h15 | Bilan (15 min) | Mission : ton offre commerciale. |

## Code-along : le parcours de paiement

```
1. L'utilisateur clique « Passer à l'offre Pro (2 000 F/mois) »
2. Ton serveur crée une transaction FedaPay (mode test) et reçoit un lien de paiement
3. L'utilisateur paie sur la page FedaPay (numéros de test fournis par FedaPay)
4. FedaPay revient sur ton site ET prévient ton serveur (webhook)
5. Ton serveur vérifie le paiement et passe le compte en « Pro » dans Supabase
```

- Crée un compte FedaPay et récupère tes **clés de test** (bac à sable).
- Clés dans `.env.local` : `FEDAPAY_SECRET_KEY` (jamais dans le navigateur).
- Consigne :
  ```
  Contexte : SaaS Next.js + Supabase. Doc FedaPay : [coller le lien de la doc].
  Tâche : ajoute un bouton "Passer Pro". Côté serveur (route API), crée
  une transaction FedaPay en mode sandbox de 2000 XOF et redirige vers
  le lien de paiement. Ajoute une route webhook qui, à la confirmation,
  passe la colonne plan de l'utilisateur à "pro" dans Supabase.
  Contraintes : clé secrète uniquement côté serveur (variable d'env).
  Vérification : explique comment tester avec un numéro de test.
  ```

> 💡 Pourquoi le webhook ? Si l'utilisateur ferme son navigateur juste après avoir payé, le retour sur ton site n'arrive jamais. Le webhook, lui, arrive toujours. C'est exactement ce que fait la plateforme FORGE IA pour tes propres paiements.

## La méthode de débogage du pro

1. **Lis l'erreur en entier.** La ligne importante est souvent la première ou celle qui cite **ton** fichier.
2. **Reproduis** : quelles étapes exactes déclenchent le bug ?
3. **Isole** : est-ce le navigateur (console F12), le serveur (terminal / logs de l'hébergeur) ou la base (Supabase) ?
4. **Demande petit** : consigne n° 5 (« explique la cause, propose la plus petite correction, dis comment vérifier »).
5. **Vérifie et commit.** Si 3 tentatives échouent : nouvelle conversation, avec ce que tu as appris.

## Mise en ligne du SaaS

- Pousse sur GitHub → importe sur Vercel → ajoute les **variables d'environnement** (Supabase, FedaPay) dans les réglages du projet.
- Mets à jour l'adresse du **webhook** dans FedaPay avec ton adresse en ligne.
- Teste le parcours complet **en ligne** avec un numéro de test.

## Fixer ton prix (15 min)

- Combien coûte le problème à ton client aujourd'hui (temps, argent) ?
- Ton prix doit être **une fraction claire** de ce coût.
- Propose **2 offres** maximum : gratuite limitée + payante. Exemple : « Gratuit jusqu'à 20 rendez-vous/mois, puis 2 000 F/mois. »

## Checklist de fin de séance

- [ ] Un paiement test FedaPay aboutit
- [ ] Le compte passe en « Pro » automatiquement (webhook)
- [ ] Le SaaS est en ligne avec ses variables d'environnement
- [ ] Mon prix est fixé et justifié

## Pour aller plus loin

- Envoie une notification WhatsApp ou e-mail au paiement réussi.
- Affiche l'historique des paiements de l'utilisateur.
