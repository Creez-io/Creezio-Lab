# Conservation des capacités Creezio

26 septembre 2026 — inventaire initial de conception, **pas un procès-verbal de validation fonctionnelle**.

Source historique : Creezio main `6bd6507633b4c17bfc31206d82d1caa9a8af19af`, manifeste `packages/platform-core/kit-packages.json` : 34 packages communs, plus factory et propagation. La correspondance ci-dessous couvre les 36 packages ; le lot 0 doit la détailler en comportements, routes, opérations, modèles et tests. Le nom d'un package ne garantit pas à lui seul que tous ses comportements ont été inventoriés.

## Règle de transformation

Le socle est serverless. Conserver les possibilités historiques n'oblige pas à conserver leur ancien packaging. Meili, Hermes, n8n et les services externes sont des **modules optionnels complets** : configuration des accès, API Creezio, outils MCP, droits, événements et UI/widgets déjà intégrés. L'application cliente ne doit pas reprogrammer chaque fournisseur.

Les mécanismes de flotte, instances par client, lancement de processus locaux et rebranding du back-office sont remplacés conformément à la cible demandée. Leurs fonctions utiles sont relogées explicitement ; leur fonctionnement historique ne doit pas être réintroduit pour satisfaire artificiellement une parité de code.

Légende : **S** socle serverless ; **M** module optionnel ; **E** service/exécuteur externe derrière un module ; **D** outillage de développement ou client externe. Une ligne peut être scindée entre plusieurs destinations.

## Correspondance des 36 packages

| Package historique | Destination proposée | Capacités et preuve à détailler lors de l'implémentation |
|---|---|---|
| access-control | S | Droits, ressources, restrictions par acteur/contexte. Prouver les refus UI/API/MCP/widget et l'absence de contournement par CRUD générique. |
| admin | S + M | Administration de l'application et de ses ressources. CRM, roadmap, support et facturation restent disponibles dans des modules dédiés ; Stripe est un module. Remplacer l'administration de conteneurs par client par comptes/connexions/versions dans une app commune. |
| api-kernel | S | Routage, validation, erreurs et opérations. Une opération produit les mêmes droits et effets depuis ses interfaces autorisées. |
| app-runtime | S | Composition, contrats, entités, opérations, navigation, sources assistant, onboarding et migrations. Ajouter les widgets sans doubler les handlers métier. |
| assistant | S + M + E | Conversations, pièces jointes, flux et widgets dans le socle ; fournisseurs IA, voix et délégation Hermes en modules. Tester outils, historique, interruptions, droits et réponses réelles quand configurés. |
| auth | S + M | Identités, sessions et cycle des comptes. Adapter l'auth Sites ; maintenir une voie explicite pour les parcours historiques compatibles via fournisseur/module. Vérifier cookies, expiration et récupération au lieu de supposer la compatibilité. |
| automations | S + M + E | Contrat d'événements et état durable ; module d'automatisation et module n8n pour règles/workflows, exécutions, callbacks et reprise. Tester idempotence et progression après fermeture du navigateur. |
| brand-config | S | Identité configurable du front et configuration d'application. Le back-office reste Creezio. Tester que personnaliser le front ne renomme pas l'administration. |
| brand-spec | S + D | Schéma de configuration, validation, génération et documentation ; éviter des constantes métier ou secrets dans le bundle public. |
| browser-host | M + E | Navigation distante, sessions/profils, contrôle et visualisation via service navigateur externe. Un simple relais du DOM courant ne remplace pas Chromium distant ; tester explicitement les deux capacités si proposées. |
| cockpit | S + M | État de l'application, données, modules, erreurs et livraisons dans l'administration ; surfaces métier via front/module. Prouver que l'utilisateur applicatif n'accède pas au cockpit administrateur. |
| database | S + M | Schémas, relations, CRUD autorisé, vues, export et journaux dans le socle. Règles sur données, événements durables, webhooks et reprises via module d'automatisation. Pas de SQL arbitraire contournant les autorisations. |
| desktop-tooling | D + M + E | Outils de développement et interactions desktop disponibles dans un client/exécuteur externe, pas dans le Worker. Tester le protocole et l'auth avant de déclarer la capacité disponible. |
| electron-shell | D | Client desktop optionnel du même backend ; aucune dépendance du démarrage web à Electron. Inventorier les fonctions exclusives et leur raccordement, sans introduire une deuxième application serveur. |
| fleet | S + M + E | Registre des connexions et versions, exploitation et diagnostic. L'ancien pilotage de déploiements applicatifs par client est remplacé ; les opérations d'infrastructure éventuellement utiles deviennent un module externe optionnel. |
| granola | M | Module notes/transcriptions : configuration, réception signée, déduplication, récupération autorisée, dossiers, état de synchronisation et consultation. Test avec compte fournisseur pour l'intégration réelle. |
| grokbot | M + E | Module agents de développement : accès fournisseur, projets/modèles autorisés, exécutions, journaux, artefacts, annulation et outils MCP. Pas de lancement de processus ou d'agent dans le socle. |
| host-runtime | S + M + E + D | Garder uniquement les ports serverless nécessaires ; installation npm, binaires, lancement Hermes/n8n/Meili, navigateur et serveur local sortent du cœur. Les capacités utiles sont assurées par modules et outillage externes. |
| integrations | S + M | Registre, configuration, références de secrets et diagnostic dans le socle ; intégration concrète par fournisseur dans son module. Vérifier chiffrement, accès serveur, rotation et absence de fuite UI/logs. |
| interactive-demo | S + M | Contrat de parcours et démos des modules. Les données de démonstration sont identifiables ; aucun mock ne compte comme preuve d'intégration externe. |
| landing | S + D | Front initial et composants de présentation remplaçables. Prouver que le fork peut remplacer cette surface sans modifier l'admin. |
| mails | M + E | Module complet de messagerie : boîtes, composition, pièces jointes, HTML sûr, envoi durable/reprises et réception. Fournisseurs HTTP ou passerelle SMTP/IMAP externe selon runtime ; ne pas recopier un envoi uniquement synchrone de Lite. |
| mcp-facade | S | Exposition des opérations et ressources autorisées, authentification, portées et audit. Une connexion MCP n'accorde pas tous les droits d'administration. |
| nav | S | Contributions de navigation contrôlées par capacités et droits ; front et admin ont leurs espaces distincts. |
| observability | S + M + E | Audit et diagnostics natifs ; export/agrégation avancés via module externe. Corrélation des requêtes, erreurs et travaux sans données sensibles dans les logs. |
| onboarding | S + M | Installation initiale Creezio, puis onboarding apporté par chaque module. Le module configure ses routes/outils/widgets sans demander d'édition du code applicatif. |
| os-ui | S + M | Préserver toutes les fonctions et interactions administratives avec identité Creezio ; les surfaces des fournisseurs restent accessibles via leurs modules. Aucune simplification implicite du bureau, des onglets ou du chat. Les interfaces métier personnalisées sont dans le front. |
| platform-core | S | Versions, registre, validation, dépendances et composition des modules. Démarrage minimal sans module externe configuré ni dépendance aux binaires historiques. |
| product-hub | M + E | Cycle de vie des produits/modules, intentions, spécifications et préparation des livraisons ; exécution de génération/build/test dans un service externe. Code livré par pipeline, jamais exécuté arbitrairement dans le Worker. |
| search | S + M + E | Contrat de recherche/projections dans le socle ; Meilisearch comme module complet externe. Index, mises à jour, suppression, reconstruction et contrôle d'accès éprouvés ; absence de Meili ne bloque pas le CMS. |
| shell | S + M | Composition et cadre d'interface ; les fonctions liées à un système d'exploitation local deviennent des modules clients/exécuteurs externes. |
| shell-ui | S | Préserver la structure et les interactions de l'administration ; proposer en parallèle des composants réutilisables et des thèmes libres pour le front. Une personnalisation du front ne remplace pas le shell de l'admin. |
| support | M | Tickets, messages, statuts et permissions dans un module ; accès direct au backend commun, sans l'ancien polling de flottes applicatives. |
| tasks | M + E | Module tâches : kanban, exécutions, journaux, quotas, validation humaine, annulation/reprise. Hermes et autres exécuteurs se connectent par modules ; aucune exécution locale cachée. |
| factory | D + M + E | Fabrication d'applications/extensions et vérifications ; fonctions administratives exposées par module, builds/génération exécutés hors du Worker. La création d'un dérivé conserve sa filiation et son identité propre. |
| propagation | S + M + E | Manifeste et affichage des versions dans Creezio ; livraison via module/exécuteur externe. Préserver fichiers applicatifs, migrations clientes et données ; prouver une vraie publication depuis le back-office. |

## Modules à rendre autonomes et prêts à configurer

Cette liste ne signifie pas qu'il faille installer tous les services pour utiliser Creezio.

| Module | Ce que Creezio fournit après installation/configuration | Service requis pour une preuve réelle |
|---|---|---|
| n8n | URL/clé, vérification des droits, opérations de workflows et exécutions couvertes, API/MCP, événements, écrans et widgets de suivi. | Instance ou compte n8n accessible, workflow de test et accès adaptés. |
| Stripe | Accès test/production, paiements et abonnements couverts, API/MCP, webhooks signés, UI/widgets et traitement idempotent. | Compte Stripe de test et configuration des webhooks. |
| Meili | Connexion, schémas d'index déclarés par extensions, synchronisation/reconstruction, recherche autorisée, diagnostic. | Meilisearch externe accessible en HTTPS avec accès limités. |
| Hermes | Connexion, capacités disponibles, soumission, progression, résultat, reprise/annulation selon protocole, permissions et widgets. | Service Hermes externe avec protocole vérifié. |
| Fournisseur IA | Configuration, modèles disponibles, génération/streaming et appels d'outils validés ; aucun secret côté navigateur. | Fournisseur et clé de test valides. |
| Catalogue | Entités produits, catégories, fichiers, opérations, droits, index déclaratifs et widgets. | D1/R2 ; recherche externe seulement si module activé. |
| Messagerie | Boîtes, outbox, réception, pièces jointes, API/MCP et UI ; transports encapsulés par fournisseurs. | Fournisseur HTTP ou passerelle, déclencheur de reprise et destinataire de test autorisé. |
| Navigateur distant | Sessions, navigation, actions, progression et vues avec droits ; distinction explicite du relais de navigateur utilisateur. | Service navigateur externe et transport compatibles avec Sites. |
| Livraison | Préparation de version, build, publication, état et reprise depuis l'administration. | Exécuteur autorisé capable de publier sur Sites ; disponibilité à démontrer. |

## État des validations

### Référence obligatoire pour la non-régression des interfaces

Les sources historiques `packages/shell-ui/ui/workspace/` confirment notamment un espace à onglets, un onglet de dashboard épinglé, des onglets verrouillables, l'historique propre à chaque onglet, la réorganisation, la restauration de session et un mécanisme de conservation de l'état des vues. L'inventaire doit examiner tous ces comportements, pas seulement comparer des captures d'écran.

| Surface | Scénarios à établir depuis l'original puis reproduire |
|---|---|
| Onglets | Ouverture, activation, fermeture, protection du dashboard, verrouillage, navigation depuis un onglet protégé, réorganisation et absence de doublons indésirables. |
| Navigation | Historique précédent/suivant de chaque onglet, URL/query, liens directs, sidebar, titres, métadonnées et fil d'Ariane. |
| État des vues | Retour à une vue sans perte des états attendus, restauration de session, invalidation après modification et comportement à la déconnexion. |
| Disposition | Panneaux et modes plein écran présents dans l'original, redimensionnement ou raccourcis lorsqu'ils existent, comportement aux tailles d'écran prévues. |
| Chat administrateur | Conversations, modes Chat/Work, choix de modèle, pièces jointes, streaming, outils, traces et interactions présentes dans le code ; services externes raccordés par modules. |
| Modules | Navigation et écrans de configuration/utilisation des capacités externalisées ; états absents, configurés, indisponibles et interdits compréhensibles. |
| Chat applicatif | Présentation libre, mêmes services autorisés ; aucune exposition du contexte ou des outils réservés à l'administration. |
| Thèmes de front | Thème standard et ChatGPT-like ; changement de présentation sans changement des données ou permissions, sans altération de l'administration. |

Compléter cette grille avec les fonctionnalités repérées dans le code de référence et leur statut. Les comportements supplémentaires non encore vérifiés ne sont pas présentés comme déjà existants. Une fonction en attente d'adaptation reste visible dans le suivi ; « toutes les interfaces conservées » n'est pas validé tant que les scénarios correspondants ne passent pas.

Toutes les destinations ci-dessus sont **proposées**, aucune n'est déclarée implémentée dans Creezio-D1R2. Au cours du lot 0, ajouter pour chaque comportement : source précise, cible, test, dépendances, statut et preuve. Statuts distincts : inventorié, implémenté, testé localement, testé sur Sites, dépendance externe manquante, adaptation à arbitrer.

Ne jamais transformer une dépendance externe manquante en suppression silencieuse ou en validation par simulation. La recette du socle sans services optionnels et la recette réelle de chaque module sont deux preuves distinctes. Pour la démonstration finale, n8n et Stripe constituent les deux modules de référence d'une intégration prête à l'emploi.
