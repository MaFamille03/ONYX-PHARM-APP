# ONYX PHARM — Application de gestion intégrée

Socle technique de l'application (Étape 1 du projet).
Stack : **Next.js 14 + TypeScript + Tailwind CSS**, **Supabase** (base de
données + authentification), **Vercel** (hébergement), **GitHub** (code).

---

## Ce que contient cette étape 1

- Authentification complète : connexion, inscription, mot de passe oublié,
  réinitialisation, déconnexion — sécurisée via Supabase Auth
- Protection des routes : impossible d'accéder à l'application sans être
  connecté (middleware + double vérification côté serveur)
- Navigation complète de l'application (Stock, Ventes, Achats, Caisse,
  Tiers, Rapports, Import/Export, Utilisateurs, Historique, Paramètres),
  avec des pages "en construction" pour les modules qui arriveront aux
  étapes suivantes
- Interface responsive (mobile, tablette, ordinateur) avec menu latéral sur
  desktop et menu tiroir + barre d'onglets sur mobile
- Base PWA (l'application pourra être "installée" sur l'écran d'accueil du
  téléphone)

**Rien n'est encore branché à de vraies données métier** (articles, ventes,
stock...) : ça viendra aux étapes 2 à 10. Cette étape pose uniquement les
fondations techniques.

---

## PARTIE 1 — Créer les comptes (si pas déjà fait)

1. **GitHub** : allez sur [github.com](https://github.com), créez un compte
2. **Vercel** : allez sur [vercel.com](https://vercel.com), cliquez
   **Continue with GitHub** pour connecter directement les deux comptes
3. **Supabase** : allez sur [supabase.com](https://supabase.com), connectez-
   vous aussi avec GitHub si possible

---

## PARTIE 2 — Créer le dépôt GitHub et y déposer le code

### Étape 2.1 — Créer le dépôt

1. Sur GitHub, cliquez sur le bouton **+** en haut à droite → **New
   repository**
2. Nom du dépôt : `onyx-pharm-app`
3. Visibilité : **Private** (recommandé, car ce sera relié à vos vraies
   données d'entreprise)
4. Ne cochez **aucune** case (pas de README, pas de .gitignore — le projet
   les a déjà)
5. Cliquez **Create repository**

### Étape 2.2 — Installer GitHub Desktop

1. Téléchargez et installez **GitHub Desktop** :
   [desktop.github.com](https://desktop.github.com)
2. Connectez-le à votre compte GitHub

### Étape 2.3 — Déposer le code du projet

1. Dézippez le fichier `onyx-pharm-app.zip` que je vous ai fourni, dans un
   dossier de votre choix sur votre ordinateur (par exemple
   `Documents/onyx-pharm-app`)
2. Dans GitHub Desktop : **File > Add local repository**
3. Sélectionnez le dossier que vous venez de dézipper
4. GitHub Desktop va vous proposer de créer un dépôt Git local si ce n'est
   pas déjà fait — acceptez
5. En bas à gauche, dans **Current repository**, vérifiez que c'est bien
   `onyx-pharm-app`
6. Assurez-vous que le dépôt distant pointe vers celui créé à l'étape 2.1
   (**Repository > View on GitHub**, ou **Publish repository** si ce n'est
   pas encore fait)
7. Dans l'onglet **Changes**, vous verrez tous les fichiers du projet
   listés
8. En bas à gauche, écrivez un message de commit, par exemple :
   `Étape 1 : socle technique (auth, navigation, structure)`
9. Cliquez **Commit to main**
10. Cliquez **Publish repository** (ou **Push origin** si déjà publié)

Le code est maintenant sur GitHub.

---

## PARTIE 3 — Configurer Supabase

### Étape 3.1 — Créer le projet Supabase

1. Sur [supabase.com](https://supabase.com), cliquez **New project**
2. Choisissez votre organisation (ou créez-en une)
3. **Name** : `onyx-pharm`
4. **Database Password** : générez-en un fort et **conservez-le
   précieusement** dans un endroit sûr (gestionnaire de mots de passe) —
   vous en aurez besoin plus tard pour certaines opérations avancées
5. **Region** : choisissez une région proche, par exemple `Europe West
   (Ireland/London)` pour une meilleure latence depuis la Côte d'Ivoire
6. Cliquez **Create new project** (la création prend 1 à 2 minutes)

### Étape 3.2 — Récupérer les clés API

1. Une fois le projet créé, allez dans **Project Settings** (icône
   d'engrenage en bas à gauche) → **API**
2. Notez ces deux valeurs, vous en aurez besoin juste après :
   - **Project URL** (ressemble à `https://xxxxxxxxxxxx.supabase.co`)
   - **anon public** (une longue clé sous **Project API keys**)

### Étape 3.3 — Configurer l'authentification par e-mail

1. Dans le menu de gauche, allez dans **Authentication** → **Providers**
2. Vérifiez que **Email** est bien activé (il l'est par défaut)
3. Allez dans **Authentication** → **URL Configuration**
4. Renseignez pour l'instant :
   - **Site URL** : laissez `http://localhost:3000` pour le moment (on la
     changera dès que l'application sera en ligne sur Vercel, à l'étape 4.3
     ci-dessous)
   - **Redirect URLs** : ajoutez `http://localhost:3000/**`

*(Ces réglages seront à corriger une fois l'application déployée — voir
Partie 4, étape 4.3 plus bas. C'est normal de ne pas encore avoir l'URL
Vercel à ce stade.)*

---

## PARTIE 4 — Déployer sur Vercel

### Étape 4.1 — Importer le projet

1. Sur [vercel.com](https://vercel.com), cliquez **Add New** → **Project**
2. Dans la liste de vos dépôts GitHub, trouvez `onyx-pharm-app` et cliquez
   **Import**
3. Vercel détecte automatiquement qu'il s'agit d'un projet Next.js — ne
   changez rien aux réglages de build

### Étape 4.2 — Ajouter les variables d'environnement

Avant de cliquer sur Deploy :

1. Dépliez la section **Environment Variables**
2. Ajoutez :

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | la **Project URL** notée à l'étape 3.2 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la clé **anon public** notée à l'étape 3.2 |

3. Cliquez **Deploy**

Le déploiement prend 1 à 2 minutes. Vous obtenez une URL du type
`onyx-pharm-app.vercel.app`.

### Étape 4.3 — Finaliser la configuration Supabase avec l'URL réelle

Maintenant que vous avez l'URL Vercel :

1. Retournez sur Supabase → **Authentication** → **URL Configuration**
2. **Site URL** : remplacez par votre URL Vercel, par exemple
   `https://onyx-pharm-app.vercel.app`
3. **Redirect URLs** : ajoutez `https://onyx-pharm-app.vercel.app/**`
4. Sauvegardez

### Étape 4.4 — Tester

1. Ouvrez votre URL Vercel dans le navigateur
2. Vous devriez arriver sur la page **Connexion**
3. Cliquez **Créer un compte**, créez votre premier compte utilisateur
4. Un e-mail de confirmation arrive (vérifiez aussi les spams) — cliquez
   sur le lien
5. Reconnectez-vous : vous arrivez sur le **Tableau de bord**, avec le
   menu complet à gauche (ou en bas/menu ☰ sur mobile)

Si tout fonctionne, l'étape 1 est validée !

---

## PARTIE 5 — Utiliser l'application au quotidien (mises à jour futures)

À chaque nouvelle étape, je vous fournirai un nouveau zip. La procédure
sera toujours la même :

1. Dézippez le nouveau zip **par-dessus** votre dossier de projet existant
   (remplace les fichiers modifiés)
2. Ouvrez GitHub Desktop
3. Vérifiez les fichiers modifiés dans l'onglet **Changes**
4. Écrivez un message de commit décrivant l'étape (ex : `Étape 2 : base de
   données complète`)
5. **Commit to main** puis **Push origin**
6. Vercel redéploie automatiquement en 1 à 2 minutes — aucune autre action
   nécessaire

---

## Aide-mémoire : où retrouver quoi

| Élément | Où le trouver |
|---|---|
| Code source | GitHub → dépôt `onyx-pharm-app` |
| Application en ligne | URL Vercel (ex: `onyx-pharm-app.vercel.app`) |
| Base de données / utilisateurs | Supabase → **Table Editor** / **Authentication** |
| Variables d'environnement | Vercel → **Project Settings** → **Environment Variables** |
| Logs en cas d'erreur | Vercel → onglet **Deployments** → cliquez sur le déploiement → **Logs** |

---

## Développement local (optionnel, pour votre informaticien)

```bash
npm install
cp .env.local.example .env.local
# renseigner les clés Supabase dans .env.local
npm run dev
```

L'application est alors disponible sur `http://localhost:3000`.

---

## ÉTAPE 2 — Base de données complète

Cette étape ajoute l'intégralité des tables de la base de données dans
Supabase (articles, stocks, ventes, achats, caisse, historique, etc.).
**Aucune nouvelle page visible** dans l'application : c'est un travail en
coulisses qui prépare les étapes suivantes.

### Procédure

1. Dézippez ce nouveau zip par-dessus votre dossier de projet existant
2. Dans **GitHub Desktop**, faites un commit (`Étape 2 : base de données
   complète`) puis **Push origin** — cela met à jour le code sur GitHub
   (Vercel redéploiera, mais rien ne changera visuellement)
3. Ouvrez le dossier **supabase/** du projet et suivez précisément les
   instructions du fichier **supabase/README.md** : vous devrez copier-
   coller 4 scripts SQL dans l'éditeur SQL de Supabase, dans l'ordre

Une fois les 4 scripts exécutés, votre base de données Supabase contiendra
toutes les tables nécessaires à la gestion des articles, du stock, des
ventes, des achats, de la caisse et des rapports — prête à être connectée
aux pages de l'application dans les étapes suivantes.

### Vérification rapide

Dans Supabase → **Table Editor**, vous devez voir une trentaine de tables,
et la table `emplacements` doit déjà contenir **Bureau**, **Entrepôt** et
**Domicile de la patronne**.

---

## ÉTAPE 3 — Paramètres & données de référence

Cette étape rend fonctionnelles les premières vraies pages de
l'application (connectées à Supabase, avec de vraies données) :

- **Paramètres** : gestion des emplacements, des catégories/sous-
  catégories, et des listes configurables (statuts, modes de paiement,
  catégories de caisse)
- **Tiers > Clients** : création et modification des fiches clients
- **Tiers > Fournisseurs** : création et modification des fiches
  fournisseurs

### Procédure

1. Dézippez ce zip par-dessus votre dossier de travail
2. GitHub Desktop → commit (`Étape 3 : paramètres et données de
   référence`) → Push
3. **Aucune action Supabase nécessaire** cette fois-ci (la base a déjà été
   créée à l'étape 2)
4. Une fois Vercel redéployé (1-2 minutes), ouvrez votre application :
   les pages **Paramètres**, **Clients** et **Fournisseurs** sont
   maintenant utilisables

### À tester

- Paramètres > Emplacements : ajoutez un nouvel emplacement, désactivez-en
  un puis réactivez-le
- Paramètres > Catégories : créez une catégorie, ouvrez-la, ajoutez-y une
  sous-catégorie
- Tiers > Clients : créez un client, modifiez-le
- Tiers > Fournisseurs : créez un fournisseur, modifiez-le

---

## ÉTAPE 4 — Articles & Stock

Cette étape rend fonctionnels les modules centraux de la gestion des
stocks :

- **Stock > Articles** : fiche article complète (désignation, catégorie/
  sous-catégorie, marque, fournisseur, prix d'achat, prix de vente
  conseillé, stock minimum, numéro de lot, date d'expiration, statut,
  observations), avec possibilité de saisir un **stock initial par
  emplacement** à la création
- **Stock > Stocks** : tableau des quantités par article et par
  emplacement, avec **correction traçable** (chaque ajustement crée un
  mouvement de stock enregistré, jamais une modification silencieuse)
- **Stock > Alertes** : ruptures de stock, stocks faibles (sous le seuil
  minimum), produits expirés et produits proches de l'expiration

### Procédure

1. Dézippez ce zip par-dessus votre dossier de travail
2. GitHub Desktop → commit (`Étape 4 : articles et stock`) → Push
3. Aucune action Supabase nécessaire (les tables existent déjà depuis
   l'étape 2)

### À tester

1. Allez dans **Paramètres** et vérifiez qu'il existe au moins une
   catégorie (créez-en une si besoin, voir étape 3)
2. Allez dans **Stock > Articles** → **Nouvel article** : remplissez la
   fiche, renseignez un stock initial pour un ou deux emplacements,
   enregistrez
3. Allez dans **Stock > Stocks** : vérifiez que les quantités saisies
   apparaissent bien par emplacement
4. Cliquez sur une quantité pour l'ajuster : entrez une nouvelle valeur,
   validez
5. Créez un article avec un stock minimum élevé (ex : 100) et un stock
   initial faible (ex : 2) → allez dans **Stock > Alertes** : il doit
   apparaître dans « Stocks faibles »
6. Créez un article avec une date d'expiration passée → il doit
   apparaître dans « Produits expirés »

---

## ÉTAPE 5 — Mouvements, Transferts & Inventaires

Cette étape complète la gestion du stock avec trois nouveaux modules :

- **Stock > Mouvements** : journal complet de toutes les entrées/sorties
  de stock, avec filtres (type, emplacement, recherche)
- **Stock > Transferts** : déplacer une quantité d'un emplacement à un
  autre, avec **contrôle automatique du stock disponible** — impossible de
  transférer plus que ce qui est réellement en stock à la source
- **Stock > Inventaires** : lancez un inventaire sur un emplacement, les
  quantités théoriques se chargent automatiquement, saisissez les
  quantités réellement comptées, puis validez : le stock est ajusté et un
  mouvement est enregistré pour chaque écart constaté

**Important technique :** les transferts et la validation d'inventaire
passent par des fonctions spéciales directement dans la base de données
(et non par l'application), pour garantir qu'aucune erreur de stock ne
peut survenir même si plusieurs personnes travaillent en même temps.
Cela nécessite une nouvelle migration SQL à exécuter.

### Procédure

1. Dézippez ce zip par-dessus votre dossier de travail
2. GitHub Desktop → commit (`Étape 5 : mouvements, transferts et
   inventaires`) → Push
3. **Action Supabase requise** : ouvrez **SQL Editor** dans Supabase et
   exécutez le nouveau fichier `supabase/migrations/0005_transferts_inventaires_fonctions.sql`
   (copier-coller, comme pour les précédents — voir `supabase/README.md`)

### À tester

1. **Transferts** : créez un transfert d'un article que vous avez en
   stock, d'un emplacement vers un autre → vérifiez dans **Stock >
   Stocks** que les quantités ont bien bougé
2. Essayez de transférer **plus** que ce qui est disponible → le système
   doit refuser avec un message clair
3. **Mouvements** : vérifiez que le transfert apparaît bien dans le
   journal (une ligne sortie + une ligne entrée)
4. **Inventaires** : démarrez un inventaire sur un emplacement, modifiez
   quelques quantités réelles, cliquez « Valider l'inventaire » →
   vérifiez que le stock a été corrigé et qu'un mouvement d'ajustement
   apparaît dans le journal pour chaque écart

---

## ÉTAPE 6 — Achats

Cette étape met en place le cycle complet des achats fournisseurs :

- **Achats > Achats** : créez un achat multi-articles (fournisseur, date,
  lignes avec quantité/prix/emplacement de destination), validez-le, puis
  enregistrez des paiements partiels ou complets
- **Achats > Réceptions** : réceptionnez chaque ligne d'achat validée —
  la quantité entre alors réellement en stock à l'emplacement prévu
- **Achats > Paiements** : vue d'ensemble des dettes fournisseurs en
  cours, avec paiement rapide, et historique de tous les règlements
- **Achats > Retours** : enregistrez un retour vers un fournisseur (sortie
  de stock, avec contrôle de disponibilité)
- **Tiers > Dettes** : reprend la même vue que Achats > Paiements

Le montant payé et le statut d'un achat (Validé → Partiellement payé →
Payé) se mettent à jour **automatiquement** à chaque paiement enregistré.

### Procédure

1. Dézippez ce zip par-dessus votre dossier de travail
2. GitHub Desktop → commit (`Étape 6 : achats`) → Push
3. **Action Supabase requise** : exécutez le nouveau fichier
   `supabase/migrations/0006_achats_fonctions.sql` dans le SQL Editor

### À tester

1. Créez un achat avec 1-2 articles, choisissez une destination pour
   chaque ligne, enregistrez
2. Cliquez sur l'achat créé → **Valider l'achat**
3. Allez dans **Achats > Réceptions** → réceptionnez les lignes →
   vérifiez dans **Stock > Stocks** que les quantités ont bien augmenté
4. Retournez sur l'achat → **Enregistrer un paiement** partiel → vérifiez
   que le statut passe à « Partiellement payé » et que le reste dû est
   correct
5. Effectuez un second paiement pour solder → le statut doit passer à
   « Payé »
6. Vérifiez que la dette apparaît bien dans **Achats > Paiements** tant
   qu'elle n'est pas soldée
7. Testez un retour fournisseur depuis **Achats > Retours**

---

## ÉTAPE 7 — Ventes

L'étape la plus riche du projet : le cycle complet de vente.

- **Ventes > Devis** : créez une proposition commerciale multi-articles ;
  un devis peut être **converti en vente** en un clic
- **Ventes > Ventes** : vente multi-articles avec **prix personnalisable**
  (le prix conseillé de la fiche article est proposé par défaut, mais
  reste modifiable — l'ancien et le nouveau prix sont tous les deux
  affichés), remise éventuelle, et **calcul automatique de la marge**
  ligne par ligne
- **Ventes > Paiements** : créances clients en cours avec encaissement
  rapide, et historique des règlements
- **Ventes > Retours** : retour d'un client (entrée de stock)
- **Tiers > Créances** : reprend la même vue que Ventes > Paiements

**Point essentiel :** la validation d'une vente **vérifie et décrémente le
stock en une seule opération sécurisée** — impossible de vendre plus que
ce qui est réellement disponible, même avec plusieurs utilisateurs
simultanés (conforme à la section 40 du cahier des charges : interdiction
du stock négatif).

### Procédure

1. Dézippez ce zip par-dessus votre dossier de travail
2. GitHub Desktop → commit (`Étape 7 : ventes`) → Push
3. **Action Supabase requise** : exécutez le nouveau fichier
   `supabase/migrations/0007_ventes_fonctions.sql` dans le SQL Editor

### À tester

1. Créez une vente avec 1-2 articles ayant du stock disponible, modifiez
   le prix de vente d'une ligne, vérifiez que la marge s'actualise
2. Cliquez **Valider la vente** → vérifiez dans **Stock > Stocks** que
   les quantités ont bien diminué
3. Essayez de créer une vente avec une quantité **supérieure** au stock
   disponible et validez-la → le système doit refuser avec un message
   clair
4. Enregistrez un paiement partiel → le statut passe à « Partiellement
   payé » ; soldez → il passe à « Payé »
5. Vérifiez que la créance apparaît dans **Ventes > Paiements** tant
   qu'elle n'est pas soldée
6. Créez un devis, puis cliquez **Convertir en vente** → retrouvez la
   vente créée dans **Ventes > Ventes** (en brouillon, à finaliser)
7. Testez un retour client depuis **Ventes > Retours**

---

## ÉTAPE 8 — Caisse & liens automatiques

Cette étape connecte la caisse au reste de l'application :

- **Caisse > Encaissements** : toutes les sommes reçues — générées
  **automatiquement** à chaque paiement de vente enregistré (étape 7), et
  vous pouvez aussi ajouter une entrée manuelle (apport personnel, autre
  recette...)
- **Caisse > Décaissements** : toutes les sommes sorties — générées
  **automatiquement** à chaque paiement d'achat, plus la possibilité
  d'ajouter une dépense manuelle (loyer, électricité, etc.)
- **Caisse > Solde** : solde initial (modifiable) + encaissements −
  décaissements, avec filtre par période (aujourd'hui, cette semaine, ce
  mois, depuis le début)

**Point clé du cahier des charges (sections 50-51) :** vous n'avez
**jamais** à ressaisir manuellement en caisse un paiement de vente ou
d'achat déjà enregistré — l'application le fait automatiquement dès que
vous enregistrez le paiement dans Achats ou Ventes.

### Procédure

1. Dézippez ce zip par-dessus votre dossier de travail
2. GitHub Desktop → commit (`Étape 8 : caisse et liens automatiques`) →
   Push
3. **Action Supabase requise** : exécutez le nouveau fichier
   `supabase/migrations/0008_caisse_liaisons.sql` dans le SQL Editor

### À tester

1. Enregistrez un paiement sur une vente existante (Ventes > Ventes) →
   allez dans **Caisse > Encaissements** : le paiement doit apparaître
   automatiquement, sans action supplémentaire
2. Faites de même avec un paiement d'achat → vérifiez qu'il apparaît dans
   **Caisse > Décaissements**
3. Ajoutez un encaissement manuel (ex : « Apport personnel ») et un
   décaissement manuel (ex : « Loyer »)
4. Allez dans **Caisse > Solde** : vérifiez que le total encaissements,
   le total décaissements et le solde semblent corrects
5. Modifiez le **solde initial** (bouton en haut à droite, visible sur
   « Depuis le début ») et vérifiez que le solde se met à jour
6. Changez de période (Aujourd'hui / Cette semaine / Ce mois) et vérifiez
   que les totaux se filtrent correctement

---

## ÉTAPE 9 — Traçabilité, sécurité & annulations

Cette étape renforce la sécurité et la traçabilité de l'application :

- **Paramètres > Sécurité** : définissez un **second mot de passe**,
  distinct du mot de passe de connexion, partagé par tous les
  utilisateurs de l'application. Il protège les opérations sensibles.
- **Historique** : journal réel des actions importantes — pour l'instant,
  toute modification du prix d'achat ou du prix de vente conseillé d'un
  article, et toute annulation de vente/achat déjà validé, y sont
  automatiquement enregistrées avec l'utilisateur, la date, l'ancienne et
  la nouvelle valeur
- **Utilisateurs** : vous pouvez maintenant renseigner votre nom complet,
  affiché dans l'historique à la place de votre e-mail
- **Annulation sécurisée des ventes et achats déjà validés** : un nouveau
  bouton « Annuler la vente/l'achat » apparaît même après validation. Il
  **restitue automatiquement le stock concerné** et exige le second mot
  de passe. Un achat ne peut pas être annulé si le stock reçu a déjà été
  utilisé ailleurs (vendu, transféré...) — le système le détecte et
  refuse proprement.

**Aucune donnée n'est jamais supprimée silencieusement** : annuler une
opération change son statut en "Annulé" et conserve tout son historique,
conformément au cahier des charges.

### Procédure

1. Dézippez ce zip par-dessus votre dossier de travail
2. GitHub Desktop → commit (`Étape 9 : traçabilité, sécurité et
   annulations`) → Push
3. **Action Supabase requise** : exécutez le nouveau fichier
   `supabase/migrations/0009_securite_annulations.sql` dans le SQL Editor

### À tester

1. Allez dans **Paramètres > Sécurité** et définissez un second mot de
   passe
2. Allez dans **Utilisateurs** et renseignez votre nom complet
3. Modifiez le prix de vente conseillé d'un article (Stock > Articles) →
   allez dans **Historique** : la modification doit apparaître avec votre
   nom, l'ancien et le nouveau prix
4. Ouvrez une vente déjà validée → cliquez **Annuler la vente** → entrez
   le second mot de passe → vérifiez dans **Stock > Stocks** que la
   quantité a bien été restituée, et que l'annulation apparaît dans
   **Historique**
5. Essayez avec un mauvais mot de passe : le système doit refuser
   clairement
6. Faites de même avec un achat déjà réceptionné, puis essayez d'annuler
   un achat dont le stock reçu a déjà été vendu ailleurs : le système
   doit refuser avec un message explicite

---

## ÉTAPE 10 — Rapports, Import/Export & Tableau de bord final

Dernière étape du projet : elle relie toutes les données déjà saisies
dans une vue d'ensemble exploitable, et ajoute les outils d'échange de
données et de documents imprimables.

- **Tableau de bord** : maintenant connecté à de vraies données — chiffre
  d'affaires, marge, valeur du stock, encaissements/décaissements,
  créances, dettes, alertes de stock, ventes et achats récents — avec
  filtre par période (aujourd'hui / semaine / mois / tout)
- **Rapports** : 5 onglets (Stock, Ventes, Achats, Caisse, Créances/
  Dettes), chacun exportable en un clic vers Excel
- **Import/Export** :
  - Export Excel pour Articles, Ventes, Achats, Encaissements,
    Décaissements
  - Import d'articles depuis un modèle Excel téléchargeable, avec
    contrôle automatique des erreurs avant import (désignation vide,
    quantité/prix invalides, catégorie/fournisseur/emplacement
    inexistants, doublons, dates incorrectes) et aperçu ligne par ligne
- **Documents imprimables** : chaque vente, achat et devis validé
  dispose désormais d'un bouton **Imprimer**, qui ouvre un aperçu
  professionnel exportable directement en PDF via la fonction
  d'impression du navigateur (« Enregistrer au format PDF »)

### Procédure

1. Dézippez ce zip par-dessus votre dossier de travail
2. GitHub Desktop → commit (`Étape 10 : rapports, import/export et
   tableau de bord final`) → Push
3. **Aucune action Supabase nécessaire** — cette étape s'appuie
   entièrement sur les données déjà en place

### À tester

1. Ouvrez le **Tableau de bord** : vérifiez que les chiffres
   correspondent à vos données, changez de période
2. Allez dans **Rapports**, parcourez les 5 onglets, exportez-en un vers
   Excel et ouvrez le fichier téléchargé
3. Allez dans **Import/Export** → téléchargez le modèle → remplissez
   quelques lignes (avec une erreur volontaire sur l'une d'elles, par
   exemple un emplacement inexistant) → importez-le → vérifiez que
   l'erreur est bien détectée et que seules les lignes valides sont
   proposées à l'import
4. Ouvrez une vente validée → cliquez **Imprimer** → vérifiez l'aperçu →
   testez « Enregistrer au format PDF » depuis la fenêtre d'impression
   de votre navigateur
5. Faites de même pour un achat et un devis

---

## 🎉 Projet complet

Les 10 étapes du cahier des charges ONYX PHARM sont livrées. L'application
couvre l'intégralité du cycle métier : articles, stock, transferts,
inventaires, achats, ventes, caisse, créances, dettes, traçabilité,
sécurité, rapports et documents — le tout responsive, sécurisé et déployé
sur des services gratuits (GitHub, Vercel, Supabase).

Consultez `ETAPE.md` à tout moment pour un rappel de ce qui a été livré.

---

## ÉTAPE 11 — Audit global, catalogue réel & finalisation

Suite à votre demande d'audit complet, voici ce qui a été corrigé et ajouté.

### Le bug des permissions (403 / `permission denied`)

**Cause exacte :** les policies RLS (qui décident *qui* a le droit de lire/
écrire une ligne) avaient été correctement créées dès l'étape 2. Mais
PostgreSQL exige **en plus** un `GRANT` de base sur chaque table pour le
rôle `authenticated` — sans lui, la policy RLS ne sert à rien, la requête
est bloquée avant même d'être évaluée. C'est exactement ce que vous avez
rencontré sur `emplacements`, et cela touchait potentiellement toutes les
tables créées depuis l'étape 2.

La migration `0010_audit_privileges.sql` corrige ce point une fois pour
toutes : elle accorde les privilèges sur **toutes les tables existantes**,
et configure les **privilèges par défaut** pour qu'aucune table créée à
l'avenir ne reproduise ce problème. RLS reste actif partout — rien n'a été
désactivé pour "faire marcher" l'application.

### Ce qui a été ajouté

- **Logo officiel** ONYX PHARM extrait de votre catalogue, intégré partout
  (connexion, menu, favicon, factures/bons imprimés)
- **Catalogue réel** : les catégories et ~130 articles de votre catalogue
  2026 sont maintenant préchargés dans Stock > Articles (prix à compléter,
  puisque le catalogue ne les indique pas)
- **Présentation initiale** : les nouveaux comptes voient un écran de
  bienvenue présentant les modules ; revisible depuis Paramètres > Général
- **Formulaire Article élargi** sur ordinateur — la grille utilise
  maintenant toute la largeur disponible, avec une case à cocher claire
  pour marquer un article "Date d'expiration non applicable"
- **Paramètres réorganisés** en 7 onglets : Général, Emplacements,
  Catégories, Listes, Entrepôt (à compléter), Sécurité, Compte
- **Zone dangereuse** (Paramètres > Compte) : désactivation de compte
  (historique conservé, comme "Jean Kouassi — Compte désactivé") et
  suppression définitive (données personnelles anonymisées, documents
  commerciaux préservés), toutes deux protégées par le second mot de passe
  et une double confirmation

### Limite technique honnête à connaître

La "suppression définitive" anonymise vos données personnelles (nom) dans
l'application et désactive l'accès — c'est tout ce qu'une application
cliente peut faire en toute sécurité. La suppression complète du compte
d'authentification lui-même (l'entrée dans Supabase Auth) nécessite une
clé d'administration que je ne peux pas intégrer côté navigateur sans
créer une faille de sécurité majeure (n'importe qui pourrait alors
supprimer n'importe quel compte). Pour une suppression totale du compte
d'authentification, il faudra le faire une fois depuis le tableau de bord
Supabase (Authentication > Users), ce qui prend quelques secondes.

### Ce qui reste à faire de votre côté

- Les **prix d'achat et de vente** des ~130 articles importés sont à 0 —
  le catalogue ne les indiquait pas. À compléter progressivement dans
  Stock > Articles selon vos tarifs réels.
- Les **informations de l'entrepôt** (Paramètres > Entrepôt) sont vides,
  volontairement — à remplir dès que vous les aurez.
- Si vous avez un **logo plus récent ou en meilleure définition**,
  transmettez-le et je le remplacerai partout.

### Procédure

1. Dézippez ce zip par-dessus votre dossier de travail
2. GitHub Desktop → commit (`Étape 11 : audit, catalogue et finalisation`)
   → Push
3. **Action Supabase requise** : exécutez dans l'ordre les 3 nouveaux
   fichiers SQL du dossier `supabase/migrations/` :
   - `0010_audit_privileges.sql` (la correction critique — à exécuter en
     priorité)
   - `0011_catalogue_onyx_pharm.sql`
   - `0012_comptes_entreprise.sql`

### À tester

1. Essayez de créer un emplacement, une catégorie, un article : les
   erreurs 403 doivent avoir disparu
2. Allez dans **Stock > Articles** : le catalogue ONYX PHARM doit
   apparaître (environ 130 articles classés par catégorie)
3. Créez un **nouveau compte de test** : la présentation doit s'afficher
   automatiquement à la première connexion
4. Ouvrez **Stock > Articles > Nouvel article** sur un écran d'ordinateur :
   le formulaire doit utiliser toute la largeur, en 2 colonnes
5. Testez la case "Non applicable" sur la date d'expiration
6. Allez dans **Paramètres > Général** : le logo et les informations de
   l'entreprise doivent s'afficher
7. Testez la **zone dangereuse** (Paramètres > Compte) avec un compte de
   test — vérifiez qu'un compte désactivé ne peut plus se reconnecter et
   que l'historique reste lisible
