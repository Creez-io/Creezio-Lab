# T37 — Première application Creezio Lab

État : sources Lab préparées dans le checkout de démonstration persistant ; CI et publication Site B restent à qualifier. Ce document distingue la provenance du fork et les recettes de l'original.

## Origines et versions

- Original A : `creezio/Creezio-D1R2`, main `eb97109493b3a945eaa882c216591bc468764014`, arbre `f5fe2e413944bfadeb907c1d9515ab3d927b187b`. La release source publique [`app/v0.0.0`](https://github.com/creezio/Creezio-D1R2/releases/tag/app/v0.0.0) porte une archive de 1 532 513 octets, SHA-256 `097a7eb02e5c955a048d014cd120f95672fac5e501c1e960998f13da18a717fb`. Le Site A a été qualifié sur cette base ; sa recette ne qualifie pas Site B.
- Fork B : vrai fork GitHub public [`Creez-io/Creezio-Lab`](https://github.com/Creez-io/Creezio-Lab), ID 1391532328, parent `creezio/Creezio-D1R2`, créé depuis ce main. Le commit propre, la PR et le Site B du Lab restent à établir. Les compositions portent l'archive de l'original comme provenance de leur base, tandis que le dépôt Git du Lab identifie le dérivé.
- Version applicative et `sdk.coreVersion` : `0.0.0`. SDK de composition et paquet installé : `1.1.0`, archive publique `sdk-v1.1.0` SHA-256 `f874f0ed29a41ec45b8f686884b5e2260b9600d9045588174fff8a7fcdd5eeec`. Module métier : `@creezio/purchase-requests` `0.1.0` de `module-v0.1.0`, archive SHA-256 `800c8e0e9eb61c3b8abeb04d98b4c6eea343bc4af9cc1cfe0be3f633dbafb85c`, validation détachée `4010b8a59ef9e8a02dc5b4f15e87ed3c24f97eca0e6ef65978996dbc730736ba`, reçu `a0cb2cdb16ba87d007cbdc21db1d209023af94c8d8758a08018ae42ed875b418`.

## Profils et installation

`configuration/composition.json` est le profil Docker local : `creezio.lab`, thème ChatGPT-like, module de demandes d'achat et Delivery pour l'opérateur local. `configuration/composition.sites.json` sélectionne le même front et module sans Delivery, transport indisponible sur Sites. Les deux verrous sont générés en vérifiant `configuration/module-inventory.json` et le reçu public :

```sh
node scripts/lab/bootstrap-public-packages.mjs
npm ci --ignore-scripts --no-audit --no-fund
node scripts/modules/lock.mjs --validation-receipt creezio.purchase-requests=.creezio/packages/manifest.json --write
node scripts/modules/lock.mjs --composition configuration/composition.sites.json --validation-receipt creezio.purchase-requests=.creezio/packages/manifest.json --write
```

Le bootstrap réutilise les quatre assets si leurs taille, empreinte et identité sont exactes ; une différence bloque l'installation. Ces fichiers ignorés par Git sont nécessaires avant `npm ci` dans un checkout neuf et restaurés par la CI et Docker. Le contrôle `scripts/lab/verify-public-sdk.mjs` vérifie ensuite le verrou npm, le paquet SDK public et le module 0.1.0 installés. L'agrégat de qualité conserve ses contrôles de composition, types, runtime et suites ; son étape SDK vérifie le paquet public au lieu de reconstruire le SDK local du socle.

La démo conserve ses données `.wrangler`, dépendances installées et fichiers `.creezio/demo-*` historiques. `configuration/composition.t30-demo.json` et son verrou restent des traces T30, pas des profils de livraison Lab. Aucun état D1/R2 ni secret du Site A n'est repris pour Site B. La version 0.1.1 du module et les mises à jour Core relèvent de T38.

## Qualification restante

Relire les changements Lab, obtenir un commit propre et une CI liée à ce SHA, vérifier l'installation fraîche et les parcours ciblés localement, puis publier et exercer Site B avec ses propres données, droits, URL et preuves. Le manifeste de source Docker portable doit être préparé depuis le commit Lab propre avant la construction de son image. Le présent état ne prouve ni cette image, ni le build Sites, ni une recette publique du Lab.
