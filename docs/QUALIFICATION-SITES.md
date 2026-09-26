# Qualification de GPT Sites

26 septembre 2026. Vérification du contrat disponible et sonde technique publiée. Le CMS complet, les interfaces à onglets et le fork de recette ne sont pas encore implémentés ; les preuves ci-dessous ne les remplacent pas.

## Périmètre retenu

Les Sites du projet et de sa recette sont **publics**, par choix utilisateur. Le front est accessible sans connexion GPT ; les fonctions protégées utilisent selon leur canal une session native Creezio, une autorisation machine API/MCP ou un webhook signé, avec leurs droits propres. Un cookie de navigateur n'est pas exigé pour un client externe autorisé. Une identité GPT ne crée aucun compte, session ou droit applicatif. La [documentation Sites](https://learn.chatgpt.com/docs/sites) décrit le mode public de l'hébergement.

Chaque Site utilise **un couple D1/R2 natif commun à son application**, avec cloisonnement logique par contexte et autorisations serveur. Le provisionnement de plusieurs ressources dans un même Site est abandonné ; ce n'est plus une question ouverte. Docker conserve la possibilité de ressources D1/R2 distinctes, à éprouver dans son propre parcours. Les deux applications de recette sur A et B gardent chacune leurs ressources et secrets indépendants.

Le chat appelle son LLM via le **module OpenAI activé et configuré avec une clé API serveur**. Interface, conversations, outils et widgets restent Creezio. Les tests de transport ci-dessous ne sont pas encore un appel OpenAI ni une recette complète du chat.

La planification est **externe** : n8n ou un autre service appelle les opérations Creezio par API token/MCP sans navigateur. Les points à vérifier portent sur ces appels réels, les autorisations, les résultats et les reprises ; aucun scheduler ou Cron Trigger Sites n'est à rechercher. Les API/MCP entrants appartiennent au socle, sans dépendance obligatoire au plugin n8n.

## Ce qui a été vérifié sur un Site hébergé

Une sonde minimale a été publiée avec un Worker, une base D1 et un bucket R2. Elle ne contient aucun compte ni document métier. Initialement testée avec l'audience privée par défaut, elle a été passée en public conformément à la clarification utilisateur, puis retestée le 26 septembre à 12:29 UTC **sans aucun jeton d'accès GPT/Sites**. Le Worker publié est inchangé ; les opérations sensibles gardent leur protection applicative.

| Vérification | Résultat |
|---|---|
| Publication Worker et ressources natives | Publication réussie ; D1 `DB` et R2 `BUCKET` présents sans clé Cloudflare personnelle. |
| Front public | Requête anonyme sur la page de présentation : HTTP 200, sans connexion GPT ni jeton Sites. |
| Autorisation applicative | Requête sans clé applicative refusée avec HTTP 401 ; requête autorisée acceptée. Aucune identité GPT reçue pendant cette sonde. |
| Transport des sessions | `Set-Cookie` Secure/HttpOnly transmis ; retour du cookie accepté par l'application sans son bearer ; révocation vérifiée. |
| D1/R2 | Écriture et relecture indépendantes, correspondance des empreintes du contenu vérifiée. |
| Corps brut et signature | Requête HMAC correctement reçue sur le Site public, sans cookie ni bearer applicatif/GPT ; rejeu identifié et modification des octets refusée. |
| HTTP sortant | Requête HTTPS vers une documentation publique réussie depuis le Worker. |
| Streaming synthétique | Les événements arrivent, mais groupés après environ 4 secondes sur le chemin public testé. Le passage public ne suffit pas à valider leur affichage progressif. |

Ces tests qualifient les transports nécessaires à une authentification native. Ils ne remplacent pas la future recette de comptes Creezio : invitation/inscription, mot de passe, session navigateur, permissions, expiration et protection des actions. Aucun scaffold d'authentification GPT n'est utilisé comme identité applicative de substitution.

## Évolution SQL, continuation et streaming prolongé

Une seconde version a été publiée avec un champ nullable supplémentaire, produit par Drizzle depuis le modèle. Le nouveau champ est présent et l'enregistrement D1 ainsi que l'objet R2 créés avant la publication restent accessibles avec la même empreinte. Cette preuve couvre une évolution additive sur données synthétiques ; elle ne qualifie pas encore toutes les évolutions de modèles, la reprise après échec ou les mises à jour de plugins du futur produit.

Une continuation `waitUntil` a écrit en D1 après une réponse HTTP 202. Cette preuve concerne uniquement une tâche courte déclenchée par requête. La planification et les relances restent externes conformément au périmètre, sans besoin de qualification d'un ordonnanceur natif.

**L'affichage progressif du chat n'est pas validé.** Lors de la qualification privée initiale, cinq événements SSE espacés d'une seconde ont été reçus groupés après environ 5,4 secondes. Ajouter du remplissage (environ 20 Ko au total) a produit plusieurs fragments réseau, tous reçus en moins de 10 ms vers la fin de la réponse. Les en-têtes de non-transformation et d'encodage `identity` n'ont pas changé ce résultat. Un second client indépendant, `curl --no-buffer`, les a également reçus groupés. Après ouverture publique, le test Node sans jeton Sites reçoit encore le flux groupé en un fragment vers 4 secondes.

Ce constat concerne les trajets testés depuis ce poste, d'abord privés puis publics. Il ne peut plus être attribué à la seule porte GPT privée. La sonde émet les événements espacés côté Worker ; les mesures ne localisent pas le composant qui les regroupe et ne démontrent aucune impossibilité générale de Sites. La recette navigateur avec le module OpenAI réellement configuré doit conserver progression, annulation et reprise du chat avant d'en déclarer la parité. Un éventuel mécanisme de consultation périodique des événements persistés reste une solution à éprouver, pas une capacité déjà livrée.

## Capacités non établies par le contrat actuel

| Capacité | Limite de ce qui est vérifié | Conséquence de conception |
|---|---|---|
| Appels planifiés depuis l'extérieur | Les primitives HTTP autorisées fonctionnent ; le workflow n8n réel et le serveur MCP du produit restent à construire/tester. | Vérifier une planification externe appelant une opération sans navigateur, avec accès limité, état/résultat, rejeu sûr et révocation. Aucune recherche de scheduler Sites. |
| Connecteurs fournisseurs réels | L'entrée publique signée est vérifiée sans accès GPT ; les événements Stripe/n8n et leurs signatures exactes restent à tester lors de l'implémentation des modules. | L'accès à un Site privé n'est plus une contrainte du projet. Une sonde HMAC synthétique ne remplace pas la recette réelle de chaque connecteur. |
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
