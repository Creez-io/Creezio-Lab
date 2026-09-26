# Instructions Creezio-D1R2

Lire `README.md` avant intervention. Le périmètre confirmé par l'utilisateur prime sur les anciennes architectures des dépôts de référence.

- État initial : cadrage. La création du dépôt et de sa documentation est autorisée ; le plan complet doit précéder l'implémentation.
- Creezio est nativement serverless. Préserver les capacités historiques en distinguant le socle et les extensions ; cette conservation n'impose pas de conserver tous les anciens packages dans le cœur. Lire `docs/PLAN-IMPLEMENTATION.md` et `docs/MATRICE-CAPACITES.md`.
- Meili, Hermes, n8n, navigateur distant, exécution système et autres services incompatibles avec le runtime serverless sont des extensions optionnelles connectées à des services externes. Aucune dépendance de démarrage du socle à ces services, Docker ou un processus persistant.
- Séparer le back-office Creezio de l'interface des utilisateurs métier. Le front utilise les API autorisées du backend et des extensions.
- Un projet/repo et un déploiement applicatif commun par application ; pas de repo Admin de flotte séparé ni de runtime par client. GPT Sites est la cible principale. Docker ne fait pas partie du socle ; un hébergement VPS reste une possibilité ultérieure.
- Permettre données communes ou D1/R2 isolés selon l'application. Ne pas imposer le métier Tempoflow ou WinHub au cœur du CMS.
- Extensions : contrat commun couvrant schéma/données, migrations, API/MCP, droits, recherche, UI et widgets du chat. Les widgets ne créent pas une seconde logique métier.
- Un module, notamment n8n ou Stripe, est une intégration prête à configurer : accès fournisseur puis API/MCP, événements, UI et widgets disponibles sans réintégration par l'app cliente.
- Préserver toutes les fonctionnalités et interactions du back-office historique, notamment onglets/workspace et chat. L'admin reste standardisée Creezio ; ne pas y recoder un chat métier propre à chaque app. Personnalisation libre et thèmes (dont ChatGPT-like inspiré de Certivan V5) uniquement dans le front applicatif, avec backend commun et droits distincts.
- Validation obligatoire sur deux nouveaux GPT Sites : original Creezio sur A, véritable fork personnalisé sur B après structuration et vérification du socle. Prouver une mise à jour du fork conservant son front, ses extensions et ses données avant la recréation des applications existantes.
- Ne pas modifier les sources de référence, leurs bases ou leurs déploiements sans mandat spécifique.
- Ne jamais committer de secrets, jetons, données utilisateur ou clés privées.

## Espace disque

Réutiliser les checkouts, dépendances et builds existants. Vérifier l'espace libre avant installation, copie ou build volumineux ; sous 20 Gio, traiter d'abord les temporaires connus et inutilisés du travail. Préserver sources, modifications non committées, bases, secrets et livrables. Conserver le build actif et les éléments nécessaires au retour arrière. Avant suppression récursive, vérifier confinement et absence de liens/jonctions et de processus utilisateurs ; sous Windows utiliser PowerShell et `Remove-Item -LiteralPath`. Ne laisser aucun serveur de test inutile.
