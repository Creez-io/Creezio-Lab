# Creezio-D1R2

Refonte nativement serverless du socle Creezio. Le [plan d'implémentation](docs/PLAN-IMPLEMENTATION.md) et la [matrice de conservation des capacités](docs/MATRICE-CAPACITES.md) sont proposés pour validation. Aucun runtime applicatif n'est encore implémenté.

## Objectif

Un CMS et backend communs, un back-office conservant l'identité Creezio réservé à l'administrateur de l'application, et un front applicatif indépendant utilisant les API avec les permissions de ses utilisateurs.

Chaque application rassemble son administration et son front dans un seul projet/repo et un déploiement applicatif commun. GPT Sites est la cible principale ; le socle ne dépend ni de Docker ni de processus persistants. L'organisation des données est un choix applicatif : service de données commun ou espaces D1/R2 isolés par client, sans multiplier les instances de l'application.

## Exigences acquises

- Conserver les possibilités du Creezio existant ; leur correspondance avec le socle ou des extensions doit être documentée et vérifiable. Les anciens packages ne sont pas tous destinés à rester natifs.
- Concevoir le stockage pour D1 et R2. Meilisearch, Hermes, n8n et les services incompatibles avec le serverless deviennent des extensions optionnelles connectées à des services externes.
- Distinguer les capacités natives, les extensions communes installables (exemples : catalogue produits, Stripe) et les extensions propres à chaque application.
- Standardiser les données, schémas, migrations, API, MCP, permissions, index/projections de recherche et contributions UI de chaque extension.
- Ajouter au contrat d'extension les widgets interactifs affichables dans le chat, utilisant les mêmes opérations métier et permissions que le front.
- Fournir des modules prêts à configurer : n8n ou Stripe apportent déjà leurs API, outils MCP, droits, événements et interfaces/widgets. Chaque application ne doit pas réintégrer le fournisseur.
- Préserver toutes les fonctionnalités des interfaces d'administration, notamment les onglets et le chat standard Creezio. Les chats métier personnalisés appartiennent au front, pas à l'administration.
- Fournir un front de départ entièrement remplaçable et des composants réutilisables ; Certivan V5 constitue une référence d'expérience conversationnelle.
- Livrer des thèmes de front, dont un thème ChatGPT-like inspiré de Certivan V5, sans modifier le back-office standardisé.
- Permettre les mises à jour du socle et des extensions depuis le back-office, en préservant les développements propres aux applications.
- Garder le socle générique ; les règles de restaurants, points de vente ou autres métiers relèvent des extensions.

## Références de conception

| Source | Référence | Rôle |
|---|---|---|
| Creezio | `6bd6507633b4c17bfc31206d82d1caa9a8af19af` | Capacités natives, back-office et contrat des modules à préserver. |
| Creezio Lite, réparation | `206f05290e8acffec4ac3f4b266fd816e2fc32d2` | Enseignements des adaptateurs D1/R2, contrats et navigation ; ne pas reprendre ses simplifications comme exigences. |
| WinHub, démo client | `4c591d3db3c07bc83e2b40a1eb4f6be76c7de0aa` | Centralisation applicative, opérations métier et widgets du chat. |
| Certivan V5, copie locale | `4f9a6cf27f1a6e6174957a328e695013af5fd579` | Front autonome, composants et parcours conversationnels. |

## Ordre de travail demandé

1. Présenter le plan complet, avec inventaire de conservation, architecture, contrat d'extension, organisation du code et stratégie de mise à jour.
2. Structurer et construire le socle selon les décisions validées.
3. Faire fonctionner l'original sur un premier GPT Site. Une fois le socle structuré et vérifié, créer une première application de test par véritable fork et la faire fonctionner sur un second GPT Site indépendant. Le dépôt doit démarrer directement avec son front de départ, son back-office et sa persistance ; aucun assemblage manuel propre à la démo.
4. Faire valider cette application avant d'engager la recréation de WinHub, Tempoflow ou d'autres applications existantes.

Le plan propose une application de test générique « Creezio Lab ». Aucun dépôt existant ni environnement de production ne doit être modifié au titre de cette initialisation.
