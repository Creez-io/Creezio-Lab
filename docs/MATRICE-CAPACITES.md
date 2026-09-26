# Creezio-D1R2 — capacités et critères de validation

Spécification du produit, proposée avant implémentation. Chaque capacité doit être vérifiée dans son environnement réel. Une intégration sans accès fournisseur reste identifiée comme non vérifiée.

## Socle serverless

| Domaine | Fonctionnalités | Preuve attendue |
|---|---|---|
| Installation | Configuration initiale, identité administrateur, modèles actuels et initialisation D1/R2. | Démarrage sur une base neuve depuis le dépôt ; republication sans perte de données. |
| Modes de stockage natifs | Sites : bindings fournis. Docker : D1/R2 locaux persistants sans compte Cloudflare, ou connexion au compte Cloudflare de l'utilisateur. | Même logique métier dans les trois modes ; volumes locaux résistant aux redémarrages et accès distants vérifiés. Voir [stockage et hébergement](STOCKAGE-ET-HEBERGEMENT.md). |
| Production Cloudflare | Depuis le local dev/test Miniflare, publier backend/API/back-office/front sur Workers avec assets, données sur D1 et fichiers sur R2. | Original et fork publiables avec identités propres, copie du contenu vérifiée, production fonctionnelle après arrêt du local ; mises à jour conservant les données de production. |
| Identités et accès | Sessions, comptes, rôles, permissions, séparation administration/application. | Refus cohérents depuis UI, API, MCP et widgets ; identité administrateur explicitement autorisée. |
| Opérations | Entrées/sorties typées, validation, autorisations, idempotence, erreurs et audit. | Une même opération est utilisée par les différents canaux sans duplication métier. |
| Données | Entités, relations, index, vues, CRUD autorisé, export et contexte de données obligatoire. | Isolation des espaces, validation serveur, pagination et absence de contournement via l'administration des données. |
| Fichiers | Stockage R2, métadonnées D1, pièces jointes et accès privés. | Création, lecture et suppression autorisées ; pas de fuite entre utilisateurs ou espaces. |
| Modules | Registre, configuration, dépendances, compatibilité, activation/désactivation, diagnostics et versions. | Module installé et configuré sans intégration à recoder dans l'application. Désactivation conservant les données. |
| API et MCP | Exposition des opérations et ressources autorisées, portées, documentation et journaux. | Contrats valides, refus d'accès et effets cohérents entre interfaces. |
| Conversations | Messages, pièces jointes, flux de réponse, modes Chat/Work, modèles, outils et traces. | Persistance, reprise de consultation, streaming, droits et appels d'outils vérifiés. |
| Widgets | Types versionnés, rendu déclaré, données validées, actions utilisant les opérations serveur. | Droits revérifiés au clic, objets périmés gérés, clics répétés contrôlés. |
| Événements | État durable, idempotence et contrats de progression/résultat. | Reprise après interruption sans dépendance à un processus permanent. |
| Recherche | Contrat de projections et recherche autorisée ; fournisseurs en modules. | Contrôle des droits avant restitution et absence de dépendance à Meili pour démarrer. |
| Secrets | Références opaques, accès serveur et configuration des fournisseurs. | Aucun secret dans le front, Git ou les journaux ; ressources propres à chaque application. |
| Diagnostics | Audit, erreurs, état des connexions et versions. | Traces corrélées et résultats réels, sans annoncer un succès avant vérification. |

## Administration standardisée Creezio

Le back-office conserve une identité et des comportements communs à toutes les applications. Les modules y ajoutent leurs surfaces prévues par contrat. Les personnalisations du front ne remplacent ni le workspace ni le chat administrateur.

| Surface | Fonctionnalités à vérifier |
|---|---|
| Onglets | Ouverture, activation, fermeture, dashboard épinglé, verrouillage, navigation depuis un onglet protégé, réorganisation et gestion des doublons. |
| Navigation | Historique propre à chaque onglet, précédent/suivant, URL et paramètres, liens directs, sidebar, titres, métadonnées et fil d'Ariane. |
| État des vues | Conservation de l'état au changement d'onglet, restauration de session, invalidation après modification, cloisonnement à la déconnexion. |
| Disposition | Panneaux, modes plein écran, commandes, adaptation aux tailles d'écran et interactions définies dans la spécification détaillée. |
| Chat administrateur | Conversations, Chat/Work, choix de modèle, pièces jointes, streaming, outils, traces et widgets ; contexte réservé aux acteurs autorisés. |
| Administration des données | Modèles, relations, vues, recherche, édition autorisée, export et journal des accès. |
| Configuration | Comptes, droits, ressources D1/R2, modules, connexions, navigation, API/MCP et onboarding. |
| Modules | Installation, configuration guidée, vérification des accès et écrans d'utilisation ; états absent, non configuré, disponible, indisponible et interdit. |
| Exploitation | État de l'application, événements, journaux, versions, diagnostic, export d'observabilité et support. |

## Front libre et thèmes

- Front de départ immédiatement utilisable et entièrement remplaçable.
- Bibliothèque de composants : navigation, formulaires, listes, panneaux, pièces jointes, chat et widgets.
- Thème standard et thème ChatGPT-like, avec personnalisation propre à l'application.
- Chat applicatif utilisant les services communs avec ses propres conversations et droits.
- Changement de thème sans altérer données, autorisations ou administration.
- Pages de présentation, onboarding, paramètres et parcours apportés par les modules.

## Modules prêts à configurer

Chaque module fournit les modèles utiles, ses opérations, API/MCP, droits, événements, écrans, widgets et diagnostics selon son périmètre. Les accès sont configurés côté serveur. Le service externe reste indépendant du runtime Creezio.

| Module | Fonctions livrées | Validation réelle |
|---|---|---|
| n8n | URL/clé, workflows autorisés, déclenchement selon leur type, exécutions, résultats, erreurs, événements et widgets de suivi. | Configurer les accès, exécuter un workflow de test via les opérations prévues et consulter son résultat sans changer le code de l'app. |
| Stripe | Accès test/production, clients, catalogue/prix, sessions de paiement, abonnements, webhooks signés et suivi idempotent. | Paiement de test, réception d'événement et état consultable par API/MCP/widget. |
| Meili | Connexion, index et projections déclarés par les modules, synchronisation, reconstruction, recherche et filtres de droits. | Indexer, rechercher, modifier et retirer un objet sans fuite entre contextes. |
| Hermes | Connexion, capacités, soumission, progression, résultat, validation humaine et annulation/reprise selon protocole. | Exécution externe réelle, progression persistée et retour au chat autorisé. |
| IA et voix | Fournisseurs, modèles, streaming, appels d'outils et capacités vocales configurées. | Réponse réelle et exécution d'outil contrôlée ; état explicite si fournisseur absent. |
| Catalogue | Produits, catégories, fichiers, droits, opérations, recherche déclarative et widgets. | Parcours CRUD, fichiers et actions du chat via la même logique métier. |
| Messagerie | Boîtes, composition, pièces jointes, HTML sûr, envoi durable, reprises, réception et webhooks. Fournisseur HTTP ou passerelle externe selon transport. | Envoi vers un destinataire de test autorisé, réception, reprise et consultation sans simulation. |
| Tâches | Kanban, exécutions, journaux, quotas, validation humaine et suivi des exécuteurs configurés. | Reprise de consultation après fermeture du navigateur et isolation des acteurs. |
| Automatisations | Règles, événements sur données, webhooks, déclencheurs disponibles, déduplication et reprises. | Un événement produit l'effet autorisé sans double exécution indésirable. |
| Navigateur | Sessions, profils, navigation, actions et visualisation via service externe ; relais du navigateur utilisateur comme capacité distincte. | Transport réel, droits et cycle de vie des sessions vérifiés. |
| Granola | Notes, transcriptions, dossiers, réception signée, déduplication, synchronisation et consultation. | Compte fournisseur connecté et parcours réel vérifié. |
| Agents de développement | Projets et modèles autorisés, demandes, exécutions, journaux, artefacts, annulation et outils MCP. | Service externe connecté, aucun lancement de processus dans le socle. |
| Support et CRM | Tickets, messages, statuts, prospects, vues de suivi et permissions. | Parcours complets et séparation des accès. |
| Produits et développement | Intentions, spécifications, cycle de vie des modules, génération, vérifications et artefacts par exécuteur externe. | Code produit puis validé hors du runtime, livré par le parcours de l'hébergement. |
| Observabilité | Export, agrégation et analyse via services configurés. | Événement corrélé exporté sans secrets. |
| Desktop et infrastructure | Client desktop, commandes autorisées, état des ressources et outils externes optionnels. | Protocole authentifié, capacités annoncées vérifiées, aucune dépendance du démarrage web. |
| Démonstrations | Parcours et jeux de données explicitement identifiés par module. | Une démo ne remplace pas la preuve d'une intégration avec un service réel. |
| Livraison Docker | Déclenchement administrateur, préparation, vérifications, remplacement du déploiement et suivi. | Mise à jour demandée depuis le back-office, échec récupérable, retour à une image compatible et données intactes. |

## Installation et mises à jour

Les modèles décrivent les données actuelles du produit. L'installation initialise les structures nécessaires sur une base neuve. Les modules ne contiennent pas de scripts de transformation de bases entre versions. Une mise à jour conserve les données présentes et bloque une incompatibilité détectée.

| Hébergement | Déclenchement | Preuve |
|---|---|---|
| GPT Sites | Demande de l'utilisateur dans GPT, ou tâche GPT explicitement planifiée. Préparation, publication puis vérification dans ce parcours. | Deux Sites : original puis véritable fork ; mise à jour du fork préservant son front, ses modules et ses données. Aucun bouton de publication Sites dans Creezio. |
| Docker | Demande dans le back-office, traitée par le module de livraison et un exécuteur limité à l'application. | Déploiement effectif, contrôle de santé, conservation des personnalisations et procédure de reprise vérifiée. |
| Cloudflare direct | Demande depuis le back-office local, exécution de la publication complète par l'outillage local et vérification de l'URL distante. | Worker/assets, D1/R2 transférés, accès vérifiés, production indépendante de Miniflare ; reprise après interruption. |

Aucune tâche GPT n'est créée par cette spécification. Les versions, accès et identités de déploiement restent propres à chaque application.

## Suivi de validation

Chaque capacité recevra une spécification détaillée, ses tests, ses dépendances et ses preuves. Statuts : spécifié, implémenté, testé localement, testé dans l'hébergement cible, accès fournisseur manquant, point à résoudre. À la rédaction, aucun runtime Creezio-D1R2 n'est implémenté.
