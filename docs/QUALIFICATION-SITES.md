# Qualification de GPT Sites

26 septembre 2026. Vérification du contrat disponible et sonde technique publiée. Le CMS complet, les interfaces à onglets et le fork de recette ne sont pas encore implémentés ; les preuves ci-dessous ne les remplacent pas.

## Deux niveaux d'accès indépendants

| Audience de l'hébergement | Accès au front | Accès aux fonctions protégées |
|---|---|---|
| Site privé | Contrôle d'accès ChatGPT de Sites | Connexion native Creezio, session et droits propres à l'application |
| Site public | Front accessible directement | Même connexion native Creezio, session et droits propres à l'application |

Une identité GPT ne crée aucun compte, aucune session ni permission Creezio automatiquement. L'audience peut rester privée. Une connexion applicative ne franchit pas à elle seule la protection préalable d'un Site privé. La [documentation Sites](https://learn.chatgpt.com/docs/sites) décrit l'audience et les fonctions d'identité fournies par la plateforme ; celles-ci restent distinctes des comptes de l'application.

## Ce qui a été vérifié sur un Site hébergé

Une sonde minimale a été publiée avec un Worker, une base D1 et un bucket R2. Elle ne contient aucun compte ni document métier. Son audience reste privée. Les tests machine utilisent l'accès technique de Sites pour franchir la protection de l'hébergement, puis des autorisations applicatives séparées. Ce jeton technique n'est ni une identité utilisateur ni une méthode de connexion à fournir au navigateur.

| Vérification | Résultat |
|---|---|
| Publication Worker et ressources natives | Publication réussie ; D1 `DB` et R2 `BUCKET` présents sans clé Cloudflare personnelle. |
| Protection de l'hébergement | Requête sans accès Sites refusée avec HTTP 401. |
| Autorisation applicative distincte | Après franchissement de la protection Sites, une requête sans clé applicative reste refusée. Aucune identité GPT injectée pendant cette sonde machine. |
| Transport des sessions | `Set-Cookie` Secure/HttpOnly transmis ; retour du cookie accepté par l'application sans son bearer ; révocation vérifiée. |
| D1/R2 | Écriture et relecture indépendantes, correspondance des empreintes du contenu vérifiée. |
| Corps brut et signature | Requête HMAC correctement reçue, rejeu identifié, modification des octets refusée. Le test passe par l'accès technique du Site privé. |
| HTTP sortant | Requête HTTPS vers une documentation publique réussie depuis le Worker. |
| Streaming court | Les trois événements arrivent, mais ont été reçus groupés dans cette mesure. Le test prolongé est traité séparément ci-dessous. |

Ces tests qualifient les transports nécessaires à une authentification native. Ils ne remplacent pas la future recette de comptes Creezio : invitation/inscription, mot de passe, session navigateur, permissions, expiration et protection des actions. Aucun scaffold d'authentification GPT n'est utilisé comme identité applicative de substitution.

## Évolution SQL, continuation et streaming prolongé

Une seconde version a été publiée avec un champ nullable supplémentaire, produit par Drizzle depuis le modèle. Le nouveau champ est présent et l'enregistrement D1 ainsi que l'objet R2 créés avant la publication restent accessibles avec la même empreinte. Cette preuve couvre une évolution additive sur données synthétiques ; elle ne qualifie pas encore toutes les évolutions de modèles, la reprise après échec ou les mises à jour de plugins du futur produit.

Une continuation `waitUntil` a écrit en D1 après une réponse HTTP 202. Il s'agit d'une tâche courte déclenchée par une requête : cela ne prouve aucun ordonnanceur durable, réveil autonome, retry ni travail long.

**L'affichage progressif du chat n'est pas validé.** Cinq événements SSE espacés d'une seconde ont été reçus groupés, après environ 5,4 secondes. Ajouter du remplissage (environ 20 Ko au total) a produit plusieurs fragments réseau, tous reçus en moins de 10 ms vers la fin de la réponse. Les en-têtes de non-transformation et d'encodage `identity` n'ont pas changé ce résultat. Un second client indépendant, `curl --no-buffer`, a reçu lui aussi les cinq événements en un seul fragment après environ 5,6 secondes.

Ce constat concerne le chemin testé : ce poste vers le Site privé avec accès technique machine. La sonde émet bien les événements espacés côté Worker ; ces mesures ne localisent pas le composant qui les regroupe. Elles ne prouvent ni une impossibilité générale du streaming sur Sites, ni le comportement du navigateur après connexion GPT, ni celui d'un Site public. La recette doit qualifier le parcours navigateur et un transport permettant de conserver la progression, l'annulation et la reprise du chat avant d'en déclarer la parité. Un éventuel mécanisme de consultation périodique des événements persistés reste une solution à éprouver, pas une capacité déjà livrée.

## Capacités non établies par le contrat actuel

| Capacité | Limite de ce qui est vérifié | Conséquence de conception |
|---|---|---|
| Plusieurs D1/R2 natifs par Site | Le starter et la sonde exposent un couple ; l'inspecteur sait représenter plusieurs bindings D1, mais aucun contrat de provisionnement multiple n'est disponible dans les outils consultés. | Conserver le résolveur extensible ; ne pas annoncer l'isolation physique de plusieurs clients comme déjà validée sur Sites. |
| Déclencheurs durables | Des planifications sont mentionnées dans les métadonnées Sites ; pas de contrat accessible précisant leur création et le réveil d'un handler Worker. | Ne pas promettre un Cron Trigger métier ni des garanties de reprise sur cette seule mention. |
| Queues et Durable Objects | Aucun contrat de configuration ou d'exécution établi dans le workflow inspecté. | Ne pas en faire des dépendances obligatoires du socle Sites. |
| Webhooks sur Site privé | Le test signé réussit après authentification technique Sites. Un fournisseur doit pouvoir atteindre cette entrée avec un mécanisme réellement accepté. | La compatibilité Stripe/n8n ne se déduit pas du test HMAC synthétique. Ne pas exposer le jeton d'accès Sites dans une URL ou dans le front. |
| MCP complet | Le connecteur Sites prévoit une URL MCP en HTTP streamable lorsque la publication est prête pour MCP. La sonde vérifie les transports HTTP, pas un serveur MCP/OAuth complet. | Recette distincte découverte/PKCE/consentement/portées/refresh/révocation, avec les comptes Creezio. |
| WebSocket, tâches longues | Pas de preuve hébergée réalisée. | Aucun engagement de durée ou d'exécution durable implicite. |

L'absence de contrat disponible n'est pas présentée comme une impossibilité de la plateforme. La publication Cloudflare directe dispose de sa propre qualification ; ses capacités ne doivent pas être attribuées automatiquement à Sites.

## Contraintes établies

- Le runtime Worker dispose de 128 Mo par isolate selon le profil Sites portable, partagés entre les requêtes concurrentes.
- Les sockets TCP bruts ne sont pas pris en charge par les Sites hébergés selon les instructions du fournisseur ; les connecteurs utilisent HTTPS.
- Les chemins `/signin-with-chatgpt`, `/signout-with-chatgpt` et `/callback` appartiennent au dispatcher. Les routes Creezio utilisent un préfixe distinct.
- Le SQL généré est appliqué avant l'upload Worker. Il faut conserver la compatibilité avec le code en service pendant la publication ; revenir au code précédent n'annule pas le SQL déjà appliqué.
- Les ressources, secrets et identités d'un Site ne sont pas incorporés au dépôt générique à forker.

## Portée de la validation

La sonde est un outil de qualification de l'hébergement, pas le Site A final du CMS ni l'application forkée. Son identité est conservée pour réutiliser cet environnement lors des prochaines qualifications. Pas de multiplication de Sites ni d'installations de dépendances pour chaque essai. Les productions et sources des applications existantes sont préservées.
