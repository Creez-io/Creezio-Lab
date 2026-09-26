# Instructions Creezio-D1R2

Lire `README.md`, `docs/PLAN-IMPLEMENTATION.md` et `docs/MATRICE-CAPACITES.md` avant intervention. Le périmètre confirmé par l'utilisateur prime.

- État initial : cadrage. La création du dépôt et de sa documentation est autorisée ; le plan complet doit précéder l'implémentation.
- Creezio est un produit neuf nativement serverless. Le dépôt contient uniquement sa conception et son code propres. Les modèles décrivent directement les données actuelles ; l'installation initialise une base neuve. Les modules ne contiennent pas de scripts de transformation de bases entre versions.
- Meili, Hermes, n8n, navigateur distant, exécution système et autres services incompatibles avec le runtime serverless sont des extensions optionnelles connectées à des services externes. Aucune dépendance de démarrage du socle à ces services, Docker ou un processus persistant.
- Séparer le back-office Creezio de l'interface des utilisateurs métier. Le front utilise les API autorisées du backend et des extensions.
- Un projet/repo et un déploiement applicatif commun par application ; pas de repo Admin de flotte séparé ni de runtime par client. GPT Sites est la cible principale ; Docker est un adaptateur d'hébergement, pas une dépendance du socle.
- Sur Sites, l'utilisateur ou une tâche GPT explicitement configurée demande la mise à jour dans GPT ; publication puis vérification dans ce parcours. Aucun bouton ou pont de publication Sites depuis l'application. Sur Docker, prévoir le déclenchement depuis le back-office via un module de livraison et un exécuteur limité. Aucune tâche GPT créée implicitement.
- Permettre données communes ou D1/R2 isolés selon l'application, sans imposer un métier au CMS.
- Trois modes de stockage natifs et obligatoires : bindings D1/R2 fournis par GPT Sites ; D1/R2 locaux persistants en Docker sans compte Cloudflare ; D1/R2 du compte Cloudflare de l'utilisateur depuis Docker via connexion guidée. Lire `docs/STOCKAGE-ET-HEBERGEMENT.md`. Même logique métier et mêmes contrats dans les trois modes. Miniflare/workerd sont les candidats officiels locaux ; qualifier leur persistance et exploitation durable, ne pas présenter le simulateur comme une distribution de production déjà validée.
- Extensions : contrat commun couvrant modèles actuels/données, API/MCP, droits, recherche, UI et widgets du chat. Les widgets ne créent pas une seconde logique métier. Une mise à jour ne réinitialise pas les données ; une incompatibilité bloque l'application automatique.
- Un module, notamment n8n ou Stripe, est une intégration prête à configurer : accès fournisseur puis API/MCP, événements, UI et widgets disponibles sans réintégration par l'app cliente.
- Fournir toutes les fonctionnalités et interactions spécifiées du back-office, notamment onglets/workspace et chat. L'admin reste standardisée Creezio ; ne pas y recoder un chat métier propre à chaque app. Personnalisation libre et thèmes (dont ChatGPT-like) uniquement dans le front applicatif, avec backend commun et droits distincts.
- Validation obligatoire sur deux nouveaux GPT Sites : original Creezio sur A, véritable fork personnalisé sur B après structuration et vérification du socle. Prouver une mise à jour du fork demandée dans GPT, conservant son front, ses extensions et ses données. Tester séparément le déclenchement Docker depuis le back-office.
- Ne pas modifier d'autres projets, bases ou déploiements sans mandat spécifique.
- Ne jamais committer de secrets, jetons, données utilisateur ou clés privées.

## Espace disque

Réutiliser les checkouts, dépendances et builds existants. Vérifier l'espace libre avant installation, copie ou build volumineux ; sous 20 Gio, traiter d'abord les temporaires connus et inutilisés du travail. Préserver sources, modifications non committées, bases, secrets et livrables. Conserver le build actif et les éléments nécessaires au retour arrière. Avant suppression récursive, vérifier confinement et absence de liens/jonctions et de processus utilisateurs ; sous Windows utiliser PowerShell et `Remove-Item -LiteralPath`. Ne laisser aucun serveur de test inutile.
