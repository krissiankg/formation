# Contenu de la formation

Le contenu de la formation (leçons, quiz, séances, liste de préparation) vit **uniquement dans la base de
données**. Il se modifie depuis le tableau de bord admin :

- **Admin → Programme** : modules, leçons (éditeur avec aperçu en direct et insertion d'images), ordre ↑ ↓
- **Admin → Tests** : quiz et questions
- **Admin → Séances** : calendrier des classes
- **Admin → Todos** : liste de préparation

La formation actuelle compte **6 séances**, du 14 novembre au 19 décembre 2026.

## Ancienne archive

Ce dossier contenait les fichiers Markdown et `quizzes.json` qui ont servi à remplir la base une seule fois
(octobre 2026, version à 8 séances). Ils ont été retirés le 2 novembre 2026 parce qu'ils ne correspondaient
plus au cours. Ils restent dans l'historique git :

```bash
git show 117ae7e:content/formation/01-mois-1/s1-seance.md
```

Ne réappliquez pas `supabase/migrations/006_formation_adapt.sql` : elle remettrait l'ancien programme et
écraserait les modifications faites dans l'admin.
