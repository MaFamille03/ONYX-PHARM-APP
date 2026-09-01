# Suivi du projet ONYX PHARM

## Étape actuelle : 8 — Caisse & liens automatiques (livrée)

Ce projet est livré de façon **cumulative** : chaque nouveau zip
(`onyx-pharm-app-etape-N`) contient l'intégralité du code depuis l'étape 1,
plus les ajouts de l'étape N. Vous n'avez jamais besoin de fusionner
plusieurs zips entre eux — le plus récent contient toujours tout.

## Historique des étapes livrées

| Étape | Contenu | Statut |
|---|---|---|
| 1 | Socle technique : Next.js, authentification, navigation, déploiement Vercel | ✅ Livré |
| 2 | Base de données Supabase complète (tables, relations, sécurité) | ✅ Livré |
| 3 | Paramètres & données de référence : emplacements, catégories, clients, fournisseurs, listes configurables | ✅ Livré |
| 4 | Articles & Stock | ✅ Livré |
| 5 | Mouvements, Transferts & Inventaires | ✅ Livré |
| 6 | Achats | ✅ Livré |
| 7 | Ventes | ✅ Livré |
| 8 | Caisse & liens automatiques | ✅ Livré |
| 9 | Traçabilité, sécurité & annulations | À venir |
| 10 | Rapports, Import/Export & Tableau de bord | À venir |

## Comment mettre à jour votre dossier de travail à chaque étape

Votre dossier de travail (celui connecté à GitHub Desktop) peut garder son
nom d'origine (`onyx-pharm-app`) — inutile de le renommer à chaque fois,
cela compliquerait la connexion avec GitHub Desktop. Le numéro dans le nom
du zip (`onyx-pharm-app-etape-3`) sert uniquement à identifier clairement
**quelle version vous avez téléchargée et installée en dernier** — ce
fichier `ETAPE.md` fait foi une fois le zip installé : ouvrez-le à
n'importe quel moment pour vérifier où vous en êtes.

1. Dézippez le nouveau `onyx-pharm-app-etape-N.zip`
2. Copiez **tout le contenu** du dossier extrait par-dessus votre dossier
   de travail existant (remplacez les fichiers)
3. GitHub Desktop → Changes → message de commit `Étape N` → Commit → Push
4. Si l'étape contient des instructions SQL (dossier `supabase/`), suivez
   `supabase/README.md`
