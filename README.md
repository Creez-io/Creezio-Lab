# Creezio-D1R2

Refonte du socle Creezio. Le projet est au stade du cadrage ; l'architecture détaillée et le plan d'exécution restent à présenter à l'utilisateur. Aucun runtime applicatif n'est encore implémenté.

## Objectif

Un CMS et backend communs, un back-office conservant l'identité Creezio réservé à l'administrateur de l'application, et un front applicatif indépendant utilisant les API avec les permissions de ses utilisateurs.

Chaque application rassemble son administration et son front dans un seul projet/repo et un déploiement Docker commun. L'organisation des données est un choix applicatif : service de données commun ou espaces D1/R2 isolés par client, sans multiplier les instances de l'application.

## Exigences acquises

- Conserver les capacités natives du Creezio existant ; leur correspondance avec la nouvelle architecture doit être documentée et vérifiable.
- Concevoir le stockage pour D1 et R2. Meilisearch peut être utilisé comme service externe.
- Distinguer les capacités natives, les extensions communes installables (exemples : catalogue produits, Stripe) et les extensions propres à chaque application.
- Standardiser les données, schémas, migrations, API, MCP, permissions, index/projections de recherche et contributions UI de chaque extension.
- Ajouter au contrat d'extension les widgets interactifs affichables dans le chat, utilisant les mêmes opérations métier et permissions que le front.
- Fournir un front de départ entièrement remplaçable et des composants réutilisables ; Certivan V5 constitue une référence d'expérience conversationnelle.
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
3. Une fois le socle structuré et vérifié, créer une première application de test par fork de ce dépôt pour démontrer le fonctionnement complet.
4. Faire valider cette application avant d'engager la recréation de WinHub, Tempoflow ou d'autres applications existantes.

Le nom et le métier de l'application de test restent à définir dans le plan. Aucun dépôt existant ni environnement de production ne doit être modifié au titre de cette initialisation.
