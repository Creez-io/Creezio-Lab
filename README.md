# Creezio-D1R2

CMS nativement serverless, conçu pour D1/R2. Le [plan d'implémentation](docs/PLAN-IMPLEMENTATION.md) et la [matrice des capacités](docs/MATRICE-CAPACITES.md) décrivent le produit à construire. Les décisions structurantes ci-dessous sont acquises ; la [qualification Sites](docs/QUALIFICATION-SITES.md) distingue les preuves techniques de la future recette du socle complet.

Le [dépôt GitHub](https://github.com/creezio/Creezio-D1R2) est public. Le socle complet reste à construire ; la licence open source reste à choisir et à ajouter.

Le dossier [Extensions, thèmes et écosystème](docs/EXTENSIONS-THEMES-ECOSYSTEME.md) propose le SDK communautaire, le catalogue, les mises à jour individuelles et un starter produisant une extension installable et sa démonstration Cloudflare.

## Objectif

Un CMS et backend communs, un back-office conservant l'identité Creezio réservé à l'administrateur de l'application, et un front applicatif indépendant utilisant les API avec les permissions de ses utilisateurs.

Chaque application rassemble son administration et son front dans un seul projet/repo et un déploiement applicatif commun. GPT Sites est la cible principale ; le socle ne dépend ni de Docker ni de processus persistants. L'organisation des données est un choix applicatif : service de données commun ou espaces D1/R2 isolés par client, sans multiplier les instances de l'application.

## Exigences acquises

- GPT Sites avec ses D1/R2 natifs ; développement local Docker avec Miniflare/D1/R2 persistants ; publication de l'application complète sur le compte Cloudflare de l'utilisateur : Workers, front/back-office, D1 et R2. La production ne dépend plus du local. L'accès depuis Docker aux données Cloudflare reste aussi possible. Voir [stockage et hébergement](docs/STOCKAGE-ET-HEBERGEMENT.md).

- Fournir les capacités du produit dans le socle ou dans des modules complets, selon leur rôle et leurs besoins d'exécution.
- Concevoir le stockage pour D1 et R2. Meilisearch, Hermes, n8n et les services incompatibles avec le serverless deviennent des extensions optionnelles connectées à des services externes.
- Distinguer les capacités natives, les extensions communes installables (exemples : catalogue produits, Stripe) et les extensions propres à chaque application.
- Standardiser les modèles actuels, données, API, MCP, permissions, index/projections de recherche et contributions UI de chaque extension. L'installation initialise une base neuve ; les mises à jour préservent les données présentes.
- Générer et inspecter le SQL de création et d'évolution dans la chaîne centrale de publication, puis le versionner avec la source. Les modules déclarent leurs modèles et ne fournissent aucun script de transformation SQL.
- Fournir les comptes et sessions natifs Creezio. Sur un Site privé, la porte ChatGPT de l'hébergement précède la connexion Creezio ; sur un Site public, le front est atteint directement, puis la connexion Creezio protège les fonctions privées. Une identité ChatGPT ne crée ni compte, ni session, ni permission Creezio automatiquement. Le Site peut rester privé.
- Ajouter au contrat d'extension les widgets interactifs affichables dans le chat, utilisant les mêmes opérations métier et permissions que le front.
- Fournir des modules prêts à configurer : n8n ou Stripe apportent déjà leurs API, outils MCP, droits, événements et interfaces/widgets. Chaque application ne doit pas réintégrer le fournisseur.
- Les applications tierces restent entièrement gérées hors de Creezio : aucun hébergement, installation ou mise à jour de n8n/Hermes/Meili. Le plugin reçoit les accès à un service existant ; sa mise à jour concerne uniquement l'intégration.
- Permettre des extensions officielles, communautaires ou privées, avec versions et mises à jour individuelles. GitHub pour les sources, paquets pour la distribution, catalogue pour la découverte et la compatibilité. Le cœur, le SDK et l'écosystème ont un objectif public et open source confirmé ; leur licence et la distribution des futurs paquets doivent être matérialisées.
- Créer la première app de test par véritable fork GitHub public. Les applications qui doivent rester privées utilisent des dépôts indépendants avec origine du socle, versions et mises à jour conservées. La visibilité du dépôt GitHub et l'audience du Site sont indépendantes.
- Préserver toutes les fonctionnalités des interfaces d'administration, notamment les onglets et le chat standard Creezio. Les chats métier personnalisés appartiennent au front, pas à l'administration.
- Fournir un front de départ entièrement remplaçable et des composants réutilisables.
- Livrer des thèmes de front, dont un thème ChatGPT-like, sans modifier le back-office standardisé.
- Fournir un SDK pour les fronts headless et un dépôt de départ de module, avec données/API/MCP/widgets/UI et démonstration déployable à partir du même paquet.
- Sur GPT Sites, effectuer les mises à jour sur demande de l'utilisateur ou d'une tâche GPT planifiée, puis les vérifier. La publication n'est pas déclenchée depuis le back-office.
- Sur Docker, permettre les mises à jour depuis le back-office via un module de livraison adapté à l'hébergement. Le socle serverless reste indépendant de Docker.
- Depuis le développement local, fournir l'action Publier sur Cloudflare : configurer les accès, envoyer application/données/fichiers, vérifier la production. Les mises à jour suivantes conservent les données de production.
- Garder le socle générique ; les règles de restaurants, points de vente ou autres métiers relèvent des extensions.

## Ordre de travail demandé

1. Présenter le plan complet, avec capacités, architecture, contrat d'extension, organisation du code et parcours de mise à jour par hébergement.
2. Structurer et construire le socle selon les décisions validées.
3. Faire fonctionner l'original sur un premier GPT Site. Une fois le socle structuré et vérifié, créer une première application de test par véritable fork et la faire fonctionner sur un second GPT Site indépendant. Le dépôt doit démarrer directement avec son front de départ, son back-office et sa persistance ; aucun assemblage manuel propre à la démo.
4. Valider le parcours de mise à jour Docker séparément, puis faire valider l'application de test avant de construire d'autres applications métier.

Le plan propose une application de test générique « Creezio Lab ». Le propriétaire personnel `creezio` ne peut pas posséder à la fois l'original et son fork ; `Creez-io` est une destination proposée pour le fork public de test. Cela n'autorise aucun transfert de l'original ni changement d'offre. Les applications et productions existantes restent préservées.
