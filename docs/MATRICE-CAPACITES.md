# Creezio-D1R2 — capacités et critères de validation

Spécification du produit, proposée avant implémentation. Chaque capacité doit être vérifiée dans son environnement réel. Une intégration sans accès fournisseur reste identifiée comme non vérifiée.

## Socle serverless

| Domaine | Fonctionnalités | Preuve attendue |
|---|---|---|
| Installation | Configuration initiale, identité administrateur, modèles actuels et initialisation D1/R2. | Démarrage sur une base neuve depuis le dépôt ; republication sans perte de données. |
| Modes de stockage natifs | Sites : bindings fournis. Docker : D1/R2 locaux persistants sans compte Cloudflare, ou connexion au compte Cloudflare de l'utilisateur. | Même logique métier dans les trois modes ; volumes locaux résistant aux redémarrages et accès distants vérifiés. Voir [stockage et hébergement](STOCKAGE-ET-HEBERGEMENT.md). |
| Production Cloudflare | Depuis le local dev/test Miniflare, publier backend/API/back-office/front sur Workers avec assets, données sur D1 et fichiers sur R2. | Original et fork publiables avec identités propres, copie du contenu vérifiée, production fonctionnelle après arrêt du local ; mises à jour conservant les données de production. |
| Identités et accès | Identité interne, fournisseurs, invitations, sessions, rôles, droits par compte autorisé/interdit/hérité, impersonation auditée, séparation administration/application. | Refus cohérents UI/API/MCP/widget, révocation et sortie d'impersonation ; premier admin autorisé explicitement, aucune confiance dans un email ou en-tête client. |
| Opérations | Entrées/sorties typées, validation, autorisations, idempotence, erreurs et audit. | Une même opération est utilisée par les différents canaux sans duplication métier. |
| Données | Entités, relations, index, vues, champs calculés/snapshots, règles de suppression, CRUD autorisé, export et contexte de données obligatoire. | Isolation, pagination, champs protégés même contre CRUD admin, garde d'accès au commit et mutations atomiques bornées. |
| Fichiers | Stockage R2, métadonnées D1, pièces jointes et accès privés. | Création, lecture et suppression autorisées ; pas de fuite entre utilisateurs ou espaces. |
| Modules | Registre, catalogue, éditeur/origine, dépendances, versions, compatibilité, activation/désactivation, configuration et diagnostic. | Paquet installé sans recoder l'intégration, mise à jour ciblée, désactivation conservant données et historique ; origine homonyme refusée. |
| API et MCP | Opérations/ressources, clés API à portées révocables, clients MCP, OAuth/PKCE, enregistrement, consentement, rotation, politiques et audit. | Client MCP réel en HTTP distant, cycle OAuth et révocation exercés ; cohérence des refus et absence de confusion avec clé fournisseur/session utilisateur. |
| Conversations | Messages, pièces jointes, flux de réponse, modes Chat/Work, modèles, outils et traces. | Persistance, reprise de consultation, streaming, droits et appels d'outils vérifiés. |
| Widgets | Schéma versionné, révision interactive et version de l'objet distinctes, rendu déclaré, données validées, actions utilisant les opérations serveur. | Droits au clic, objets périmés/supprimés, clics répétés, historique et module désactivé gérés. |
| Événements | État durable, idempotence, progression, bail d'exécution, expiration, annulation et reprise. | Concurrence et arrêt navigateur/Worker exercés ; véritable déclencheur adapté à l'hébergement, pas de dépendance à un timer ou Map mémoire. |
| Recherche | Listes/recherche natives, projections, filtres de droits ; moteurs externes optionnels. | Utilisable sans Meili ; droits avant résultats/compteurs/facettes, indexation externe bornée et reprenable. |
| Secrets | Références opaques, coffre chiffré, configuration serveur et publication vers un environnement indépendant. | Aucun secret dans front/Git/logs ; transfert sélectif et rechiffrement vérifiés, sessions et autorisations transitoires exclues. |
| Entrées publiques | Contrat distinct des sessions, signatures, corps brut, âge, périmètre, idempotence et correspondance test/production. | Appels réels Stripe/n8n/MCP sans session de navigateur ; accès au Site privé à qualifier, aucun contournement implicite. |
| Diagnostics | Audit, erreurs, état des connexions et versions. | Traces corrélées et résultats réels, sans annoncer un succès avant vérification. |

## Administration standardisée Creezio

Le back-office conserve une identité et des comportements communs à toutes les applications. Les modules y ajoutent leurs surfaces prévues par contrat. Les personnalisations du front ne remplacent ni le workspace ni le chat administrateur.

| Surface | Fonctionnalités à vérifier |
|---|---|
| Onglets | Ouverture, activation, fermeture, dashboard épinglé, verrouillage, navigation depuis un onglet protégé, réorganisation et gestion des doublons. |
| Navigation | Historique par onglet, précédent/suivant, URL/paramètres, liens directs, sidebar, titres, métadonnées, fil d'Ariane, badges et notifications vers onglets. |
| État des vues | Conservation formulaires/scroll/focus, restauration, invalidation après mutation, transitions interrompues, portails et panneaux inactifs ; nettoyage à la déconnexion. Qualifier le routeur avec les versions figées du framework. |
| Disposition | Panneaux, modes plein écran, commandes, adaptation aux tailles d'écran et interactions définies dans la spécification détaillée. |
| Chat administrateur | Conversations, Chat/Work, modèle/effort, voix selon fournisseur, fichiers, streaming, annulation, traces, demandes de précision, validation de spécification et recette humaine ; contexte réservé aux acteurs autorisés. |
| Administration des données | Modèles, relations, vues, recherche, édition autorisée, export et journal des accès. |
| Configuration | Comptes, droits, ressources D1/R2, modules, connexions, navigation administrable avec remise à zéro, API/MCP et onboarding reprenable. |
| Modules | Installation, configuration guidée, vérification des accès et écrans d'utilisation ; états absent, non configuré, disponible, indisponible et interdit. |
| Exploitation | État de l'application, événements, journaux, versions, diagnostic, export d'observabilité et support. |

## Capacités fonctionnelles natives

Ces capacités sont fournies d'origine et peuvent être organisées en modules natifs. L'externalisation de leur moteur ou de leur transport ne retire pas leurs données, écrans ou interactions du produit.

| Capacité | Fonctions et preuve attendue |
|---|---|
| Tâches et travail | Kanban, tâches humaines, demandes, exécutions, journaux, quotas, validation, annulation et consultation après reconnexion. Les tâches humaines fonctionnent sans exécuteur externe. |
| Messagerie | Boîtes, composition/brouillons, pièces jointes, HTML sûr, état d'envoi, reprises et réception. Brouillons consultables sans transport ; envoi/réception réellement vérifiés avec un transport configuré. |
| Support et CRM | Tickets, échanges, statuts, prospects, vues et droits. Parcours complets sans dépendance à un moteur d'agents. |
| Présentation et navigation | Éditeur landing, sections/media/SEO, navigation configurable et variantes résolues. Les pages ne sont pas réduites à un texte codé en dur. |
| Analytics et observabilité | Usage, productivité, tableaux de bord, audit et erreurs ; export externe facultatif. |
| Intentions et développement | Intentions, spécifications, clarifications, validation de travail, suivi des modules et artefacts ; la génération/exécution de code utilise un service externe configuré. |
| Automatisations | Règles, événements, déduplication, journal et reprise. Annoncer les déclencheurs réellement disponibles par hébergement ; une règle persistée seule ne prouve pas son exécution. |

## Front libre et thèmes

- Front de départ immédiatement utilisable et entièrement remplaçable.
- Bibliothèque de composants : navigation, formulaires, listes, panneaux, pièces jointes, chat et widgets.
- Thème standard et thème ChatGPT-like, avec personnalisation propre à l'application.
- Chat applicatif utilisant les services communs avec ses propres conversations et droits.
- Changement de thème sans altérer données, autorisations ou administration.
- Pages de présentation, onboarding, paramètres et parcours apportés par les modules.
- SDK headless : un front indépendant consomme les mêmes API sans importer le back-office.
- Personnalisations séparées du thème parent, préservées lors de sa mise à jour.
- Conversations : brouillons, recherche, renommage, archivage/restauration, pièces jointes, panneaux et liens profonds. Parcours guidés avec pause, correction, reprise et historique ; cache séparé par acteur/surface/espace.

## Extensions et services prêts à configurer

Chaque extension fournit les modèles utiles, ses opérations, API/MCP, droits, événements, écrans, widgets et diagnostics selon son périmètre. Les accès sont configurés côté serveur. Le service externe reste indépendant du runtime Creezio. Les fonctions natives décrites plus haut restent présentes même si un fournisseur n'est pas configuré.

Les services tiers sont obtenus et administrés hors de Creezio. Les plugins n8n/Hermes/Meili ne fournissent aucun hébergement, installateur, mise à jour ou gestion de sauvegarde de ces applications : ils reçoivent les accès d'un service existant. Leur propre mise à jour concerne uniquement l'intégration Creezio.

| Module | Fonctions livrées | Validation réelle |
|---|---|---|
| n8n | URL/clé, workflows autorisés, déclenchement selon leur type, exécutions, résultats, erreurs, événements et widgets de suivi. | Configurer les accès, exécuter un workflow de test via les opérations prévues et consulter son résultat sans changer le code de l'app. |
| Stripe | Accès test/production, clients, catalogue/prix, sessions de paiement, abonnements, webhooks signés et suivi idempotent. | Paiement de test, réception d'événement et état consultable par API/MCP/widget. |
| Meili | Connexion, index et projections déclarés par les modules, synchronisation, reconstruction, recherche et filtres de droits. | Indexer, rechercher, modifier et retirer un objet sans fuite entre contextes. |
| Hermes | Connexion, capacités, soumission, progression, résultat, validation humaine et annulation/reprise selon protocole. | Exécution externe réelle, progression persistée et retour au chat autorisé. |
| IA et voix | Fournisseurs, modèles, streaming, appels d'outils et capacités vocales configurées. | Réponse réelle et exécution d'outil contrôlée ; état explicite si fournisseur absent. |
| Catalogue | Produits, catégories, fichiers, droits, opérations, recherche déclarative et widgets. | Parcours CRUD, fichiers et actions du chat via la même logique métier. |
| Transports de messagerie | Connexion d'un fournisseur HTTP ou d'une passerelle existante, envoi/réception, accusés et webhooks raccordés aux boîtes et à l'outbox natives. | Envoi vers un destinataire de test autorisé, réception, réconciliation et reprise sans simulation. |
| Navigateur | Sessions, profils, navigation, actions et visualisation via service externe ; relais du navigateur utilisateur comme capacité distincte. | Transport réel, droits et cycle de vie des sessions vérifiés. |
| Granola | Notes, transcriptions, dossiers, réception signée, déduplication, synchronisation et consultation. | Compte fournisseur connecté et parcours réel vérifié. |
| Agents de développement | Projets et modèles autorisés, demandes, exécutions, journaux, artefacts, annulation et outils MCP. | Service externe connecté, aucun lancement de processus dans le socle. |
| Exécution de développement | Génération, vérifications, journaux et artefacts par exécuteur externe, raccordés aux intentions/spécifications et suivis natifs. | Code produit puis validé hors du runtime, livré par le parcours de l'hébergement. |
| Export d'observabilité | Export et analyse complémentaire via services configurés ; diagnostics et analytics natifs restent autonomes. | Événement corrélé exporté sans secrets. |
| Desktop et infrastructure | Client desktop, commandes autorisées, état des ressources et outils externes optionnels. | Protocole authentifié, capacités annoncées vérifiées, aucune dépendance du démarrage web. |
| Démonstrations | Parcours et jeux de données explicitement identifiés par module. | Une démo ne remplace pas la preuve d'une intégration avec un service réel. |
| Livraison locale | Déclenchement administrateur depuis Docker dev/test, préparation, publication Workers/assets/D1/R2 et vérification. | Production indépendante du local, interruption récupérable et mises à jour conservant les données distantes. Variante de mise à jour Docker traitée par son exécuteur dédié. |

## Communauté et développement d'extensions

Voir [le dossier écosystème](EXTENSIONS-THEMES-ECOSYSTEME.md). Livrer SDK, manifeste validé, documentation, catalogue et starter de module utilisable par fork. Le starter contient modèles, API, outils MCP, permissions, écran admin, vue front et widget ; il produit un paquet installable et une démo du même code publiable sur Cloudflare.

La recette exige une extension créée sans modifier les fichiers internes du CMS, sa démo en ligne, puis le même paquet installé dans le fork. Mettre à jour ce paquet seul et un thème séparément, vérifier les versions non concernées, les données et les personnalisations. Une incompatibilité ou origine inattendue bloque la livraison. GitHub, registre de paquets et catalogue ont des responsabilités distinctes ; visibilité et licence restent à décider.

## Installation et mises à jour

Les modèles décrivent les données actuelles du produit. L'installation initialise les structures nécessaires sur une base neuve. Les modules ne contiennent pas de scripts de transformation de bases entre versions. Une mise à jour conserve les données présentes et bloque une incompatibilité détectée.

Le parcours Sites documenté utilise des artefacts SQL générés pour matérialiser les modèles. Leur acceptation centralisée à la publication reste à trancher explicitement, sans introduire de chaînes SQL dans les modules. Une mise à jour de plugin cible sa version, mais reconstruit et republie la livraison Worker complète.

| Hébergement | Déclenchement | Preuve |
|---|---|---|
| GPT Sites | Demande de l'utilisateur dans GPT, ou tâche GPT explicitement planifiée. Préparation, publication puis vérification dans ce parcours. | Deux Sites : original puis véritable fork ; mise à jour du fork préservant son front, ses modules et ses données. Aucun bouton de publication Sites dans Creezio. |
| Docker | Demande dans le back-office, traitée par le module de livraison et un exécuteur limité à l'application. | Déploiement effectif, contrôle de santé, conservation des personnalisations et procédure de reprise vérifiée. |
| Cloudflare direct | Demande depuis le back-office local, exécution de la publication complète par l'outillage local et vérification de l'URL distante. | Worker/assets, D1/R2 transférés, accès vérifiés, production indépendante de Miniflare ; reprise après interruption. |

Aucune tâche GPT n'est créée par cette spécification. Les versions, accès et identités de déploiement restent propres à chaque application.

## Suivi de validation

Chaque capacité recevra une spécification détaillée, ses tests, ses dépendances et ses preuves. Statuts : spécifié, implémenté, testé localement, testé dans l'hébergement cible, accès fournisseur manquant, point à résoudre. À la rédaction, aucun runtime Creezio-D1R2 n'est implémenté.
