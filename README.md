# Creezio-D1R2

CMS nativement serverless, conçu pour D1/R2. Le [plan d'implémentation](docs/PLAN-IMPLEMENTATION.md) et la [matrice des capacités](docs/MATRICE-CAPACITES.md) sont proposés pour validation. Aucun runtime applicatif n'est encore implémenté.

## Objectif

Un CMS et backend communs, un back-office conservant l'identité Creezio réservé à l'administrateur de l'application, et un front applicatif indépendant utilisant les API avec les permissions de ses utilisateurs.

Chaque application rassemble son administration et son front dans un seul projet/repo et un déploiement applicatif commun. GPT Sites est la cible principale ; le socle ne dépend ni de Docker ni de processus persistants. L'organisation des données est un choix applicatif : service de données commun ou espaces D1/R2 isolés par client, sans multiplier les instances de l'application.

## Exigences acquises

- GPT Sites avec ses D1/R2 natifs ; développement local Docker avec Miniflare/D1/R2 persistants ; publication de l'application complète sur le compte Cloudflare de l'utilisateur : Workers, front/back-office, D1 et R2. La production ne dépend plus du local. L'accès depuis Docker aux données Cloudflare reste aussi possible. Voir [stockage et hébergement](docs/STOCKAGE-ET-HEBERGEMENT.md).

- Fournir les capacités du produit dans le socle ou dans des modules complets, selon leur rôle et leurs besoins d'exécution.
- Concevoir le stockage pour D1 et R2. Meilisearch, Hermes, n8n et les services incompatibles avec le serverless deviennent des extensions optionnelles connectées à des services externes.
- Distinguer les capacités natives, les extensions communes installables (exemples : catalogue produits, Stripe) et les extensions propres à chaque application.
- Standardiser les modèles actuels, données, API, MCP, permissions, index/projections de recherche et contributions UI de chaque extension. L'installation initialise une base neuve ; les mises à jour préservent les données présentes.
- Ajouter au contrat d'extension les widgets interactifs affichables dans le chat, utilisant les mêmes opérations métier et permissions que le front.
- Fournir des modules prêts à configurer : n8n ou Stripe apportent déjà leurs API, outils MCP, droits, événements et interfaces/widgets. Chaque application ne doit pas réintégrer le fournisseur.
- Préserver toutes les fonctionnalités des interfaces d'administration, notamment les onglets et le chat standard Creezio. Les chats métier personnalisés appartiennent au front, pas à l'administration.
- Fournir un front de départ entièrement remplaçable et des composants réutilisables.
- Livrer des thèmes de front, dont un thème ChatGPT-like, sans modifier le back-office standardisé.
- Sur GPT Sites, effectuer les mises à jour sur demande de l'utilisateur ou d'une tâche GPT planifiée, puis les vérifier. La publication n'est pas déclenchée depuis le back-office.
- Sur Docker, permettre les mises à jour depuis le back-office via un module de livraison adapté à l'hébergement. Le socle serverless reste indépendant de Docker.
- Depuis le développement local, fournir l'action Publier sur Cloudflare : configurer les accès, envoyer application/données/fichiers, vérifier la production. Les mises à jour suivantes conservent les données de production.
- Garder le socle générique ; les règles de restaurants, points de vente ou autres métiers relèvent des extensions.

## Ordre de travail demandé

1. Présenter le plan complet, avec capacités, architecture, contrat d'extension, organisation du code et parcours de mise à jour par hébergement.
2. Structurer et construire le socle selon les décisions validées.
3. Faire fonctionner l'original sur un premier GPT Site. Une fois le socle structuré et vérifié, créer une première application de test par véritable fork et la faire fonctionner sur un second GPT Site indépendant. Le dépôt doit démarrer directement avec son front de départ, son back-office et sa persistance ; aucun assemblage manuel propre à la démo.
4. Valider le parcours de mise à jour Docker séparément, puis faire valider l'application de test avant de construire d'autres applications métier.

Le plan propose une application de test générique « Creezio Lab ». Aucun dépôt existant ni environnement de production ne doit être modifié au titre de cette initialisation.
