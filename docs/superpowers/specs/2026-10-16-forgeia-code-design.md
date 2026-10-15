# FORGEIA CODE — conception

**Date :** 2026-10-16 · **Échéance :** utilisable et installable avant le 31 octobre 2026 · **Clés IA :** branchées en dernier.

## Objectif

Donner à chaque apprenant un assistant de code IA du niveau de Cursor / Antigravity, **sans abonnement** : l'IA est financée par une part de ses frais de formation (budget IA par apprenant), contrôlée par la plateforme, et l'outil reste utilisable après la formation.

## Architecture

```
VS Code (gratuit)
 ├─ FORGEIA CODE (notre extension, dossier extension/ du dépôt)
 │    connexion FORGE IA · modes ADAPT + coach · budget dans la barre d'état
 │    exercice du jour · modèles de projets · aperçu navigateur · guide de démarrage
 │    └─ configure ↓
 └─ Kilo Code (moteur d'agent open source MIT, installé automatiquement comme dépendance)
      lit ~/.config/kilo/kilo.jsonc (fournisseur « forgeia ») et ~/.config/kilo/agent/*.md (modes)
           │  HTTPS, clé apprenant signée
           ▼
Plateforme forgeia.guelichweb.store (Next.js, AWS)
 └─ passerelle /api/ia/v1 (déjà en place) + comptage des tokens + budget par apprenant
      └─ fournisseur : NVIDIA NIM aujourd'hui, DeepSeek ensuite (variable IA_PROVIDER)
```

Choix : **on ne copie pas Kilo Code**. Kilo v7 se construit avec un moteur compilé pour 8 systèmes ; le maintenir nous-mêmes en 15 jours est trop risqué. Notre extension pilote Kilo par ses fichiers de configuration documentés et profite de ses mises à jour.

## Décisions

- **Identité de l'extension :** `guelichweb.forgeia-code`, nom « FORGEIA CODE », version 2.0.0, dépendance obligatoire `kilocode.kilo-code` (si Kilo manque, VS Code propose lui-même de l'installer ; FORGEIA CODE ne s'active pas sans lui), VS Code ≥ 1.105.
- **Budget :** en FCFA. Défaut 5 000 F par apprenant (`formation.iaBudgetFcfa`), modifiable par l'admin pour chaque apprenant (`enrollments.ia_budget_fcfa`). Dépensé = somme des coûts enregistrés. Restant ≤ 0 → la passerelle refuse (HTTP 402, message en français).
- **Coût :** calculé par alias de modèle avec un tarif en $ par million de tokens (entrée hors cache, entrée en cache, sortie), converti à 600 F/$. Tarifs de référence DeepSeek V4.1 Flash (heures pleines) : 0,30 / 0,006 / 1,20 ; V4 Pro : 1,32 / 0,044 / 3,96. Appliqués aussi sur NVIDIA pour tester les quotas.
- **Comptage :** la passerelle ajoute `stream_options.include_usage` aux requêtes en streaming et lit le bloc `usage` final (formats OpenAI `prompt_tokens_details.cached_tokens` et DeepSeek `prompt_cache_hit_tokens`). Sans bloc `usage` (flux coupé), estimation à 4 caractères par token.
- **Recharge :** l'apprenant convertit des coins en crédit IA (1 coin = 50 F, comme les packs de coins).
- **Connexion de l'extension :** bouton sur la plateforme → jeton signé (10 min) créé au clic → lien `vscode://guelichweb.forgeia-code/connect?token=…` → l'extension échange le jeton contre la clé apprenant et écrit toujours l'adresse officielle de la passerelle. Secours : coller la clé à la main. À la déconnexion, le modèle par défaut personnel de l'apprenant est restauré.
- **Modes ADAPT** (agents Kilo, fichiers `forgeia-*.md`) : Acquérir (explique, n'édite pas), Décortiquer (lit et explique le code avant toute modification), Assigner (planifie puis code), Personnaliser (adapte un modèle à la marque de l'apprenant), Tester (vérifie dans le navigateur et écrit des tests), Coach (guide par questions, ne donne pas la solution, n'édite pas).
- **Modèles de projets :** les 3 projets de la formation (landing page, site vitrine, SaaS Supabase + FedaPay), chacun avec un `AGENTS.md` de règles ADAPT et un point de départ minimal.
- **Distribution :** le `.vsix` est construit en CI à chaque déploiement et servi sur `/downloads/forgeia-code-<version>.vsix` ; `/api/extension/version` lit la version dans `extension/package.json`.

## Hors périmètre (plus tard)

Copie complète de Kilo avec notre marque dans l'interface, publication sur le Marketplace VS Code, fournisseurs autres que NVIDIA / DeepSeek, budget par période.
