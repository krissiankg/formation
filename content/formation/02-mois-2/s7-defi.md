---
id: e2000000-0000-4000-8000-000000000071
module: mois-2
order: 71
title: "Défi — Séance 7 : chasse aux bugs en binôme (40 min)"
type: défi
duration: 40 min
---

## L'énoncé

En **binôme**, échangez vos SaaS. Chacun devient **le testeur** de l'autre pendant 15 minutes, puis **le développeur** de son propre SaaS pendant 25 minutes.

## Phase 1 — Le testeur (15 min)

Essaie de casser le SaaS de ton binôme :
- inscription avec un e-mail invalide, un mot de passe trop court ;
- formulaires vides ou avec des textes très longs ;
- deux comptes : l'un peut-il voir les données de l'autre ?
- paiement test interrompu (tu fermes la page FedaPay) ;
- affichage à 375 px.

Note chaque bug dans un tableau : **où / quoi / comment le reproduire / gravité**.

## Phase 2 — Le développeur (25 min)

Reçois la liste de ton binôme et corrige **les bugs les plus graves d'abord**, avec la méthode de débogage du pro. Un commit par correction.

## Critères de réussite

- ✅ Au moins 5 bugs trouvés chez l'autre, bien décrits.
- ✅ Au moins 3 bugs corrigés chez toi, dont le plus grave.
- ✅ Aucune fuite de données entre deux comptes.

## Ce qu'on retient

Tester le produit d'un autre t'apprend à **penser comme un utilisateur** — et c'est exactement ce qui te manque quand tu testes ton propre produit.
