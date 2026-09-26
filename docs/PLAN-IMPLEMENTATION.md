# Creezio-D1R2 — plan d'implémentation

26 septembre 2026. Plan proposé, avant implémentation. **Creezio est un nouveau CMS nativement serverless ; les services externes sont des extensions, pas des composants du socle.**

## 1. Résultat attendu

Un dépôt autonome, prêt à démarrer sur GPT Sites avec un backend, un back-office Creezio et un front de départ. Une application dérivée conserve cette base, remplace son front et ajoute ses extensions. Sur GPT Sites, ses mises à jour sont demandées par l'utilisateur ou une tâche GPT planifiée, exécutées puis vérifiées. Sur un hébergement Docker, elles peuvent être déclenchées depuis son administration. Les deux parcours préservent les personnalisations et les données.

La preuve finale comprend deux nouveaux GPT Sites réellement utilisables :

- **Site A : Creezio original**, issu de `creezio/Creezio-D1R2` ; installation standard, capacités du socle et extensions communes.
- **Site B : Creezio Lab**, issu d'un véritable fork GitHub ; front personnalisé, extension propre et données indépendantes. Une évolution du socle est ensuite appliquée à B sur demande dans GPT, puis vérifiée.

Un seul déploiement applicatif par application, quel que soit le nombre de ses utilisateurs ou espaces de données. Les extensions déterminent les règles métier. La démonstration précède la construction d'applications métier supplémentaires.

Le produit doit également permettre de **développer en Docker avec Miniflare, puis publier Creezio ou son fork entièrement sur le compte Cloudflare de l'utilisateur** : backend/API/back-office/front sur Workers avec Static Assets, bases D1 et fichiers R2 distants. Le local est un environnement de développement/test ; la production Cloudflare ne dépend plus de lui. Ce parcours complète la validation obligatoire sur deux GPT Sites.

**Invariants d'interface :** préserver toutes les fonctionnalités et interactions de l'administration Creezio, notamment son workspace à onglets et son chat standard. Les applications clientes ne recodent pas leur chat métier dans l'administration. Leur liberté de design et les thèmes concernent le front applicatif.

## 2. Frontière entre socle et extensions

### Socle serverless

- Initialisation, configuration, versions et registre des extensions.
- Identités, sessions adaptées à l'hébergement, permissions, séparation administration/application.
- Contrat d'opérations partagé entre API, MCP, back-office, front et widgets.
- Modèles de données, initialisation D1, stockage R2, résolution des espaces de données.
- Back-office Creezio : configuration, utilisateurs, droits, données autorisées, extensions, connexions, journaux, état et mises à jour.
- Conversations persistantes, protocole de chat et de widgets, interface de départ et composants réutilisables.
- Contrats de fournisseurs IA, recherche, exécution de tâches et événements ; état durable des travaux asynchrones, sans boucle résidente.
- Journal d'audit, erreurs, diagnostics et export des événements.

### Extensions et services externes

Meilisearch, Hermes, n8n, fournisseurs IA, messagerie, navigateurs distants, agents de développement et autres intégrations sont des extensions. Chaque extension apporte son connecteur, sa configuration, ses opérations, ses permissions, ses surfaces UI et, si pertinent, ses widgets.

L'extension Meili déclare et maintient les index externes. L'extension Hermes dialogue avec un service Hermes externe. L'extension n8n pilote un n8n externe. Creezio ne les installe ni ne les lance dans son runtime. Leur absence ne bloque ni le démarrage ni l'administration du socle.

**Un module fournit une intégration prête à l'emploi, pas un connecteur laissé à programmer.** L'administrateur l'installe, renseigne les accès nécessaires puis utilise ses fonctionnalités. Le module enregistre ses API, outils MCP, permissions, événements, écrans et widgets sans ajout de routes ou de code d'intégration dans l'application cliente. Les contrats techniques ci-dessous servent à construire ces modules complets ; ils ne transfèrent pas ce travail à chaque client.

Les fonctions du produit sont décrites dans la [matrice](MATRICE-CAPACITES.md). Chaque capacité appartient au socle ou à un module identifié, avec un scénario de validation.

### Front applicatif

Le front de départ est livré et fonctionnel ; il peut être remplacé entièrement. Il consomme les API publiques autorisées, jamais les composants privés du back-office ou les identifiants des fournisseurs. Les composants couvrent conversations, navigation, pièces jointes, panneaux, formulaires et widgets. Chaque intégration annoncée opérationnelle doit avoir été testée avec son service réel.

Le socle conserve **une administration standardisée**, avec ses onglets, navigation, panneaux, chat, états et interactions. L'externalisation d'un moteur technique ne supprime pas sa surface fonctionnelle : le module correspondant la raccorde au service externe. Toute impossibilité démontrée doit être traitée explicitement ; elle ne justifie pas une version simplifiée de l'interface.

Le front propose initialement un thème standard et un thème **« ChatGPT-like »**. Un thème fournit dispositions, composants, navigation et style ; il respecte les contrats d'identité, de conversation, d'opérations et de widgets. L'application peut les personnaliser ou les remplacer sans modifier le back-office. Les thèmes ne changent pas les règles d'autorisation du backend.

## 3. Architecture proposée

```text
Front de l'application                 Back-office Creezio /admin
         |                                  |
         +---------- API autorisées --------+
                            |
               Opérations + permissions + contexte
                     /                 \
              Socle serverless      Extensions installées
                |       |             |        |
               D1      R2        API externes  Widgets/MCP
                                Meili, Hermes,
                                n8n, IA, mails...
```

Base proposée : TypeScript, React, routage et build issus du starter GPT Sites actuel, avec Vinext/Vite si ce starter le confirme lors de l'implémentation. API fondée sur les interfaces Web Request/Response ; schémas validés à l'exécution et exposables en JSON Schema ; modèles D1 conçus directement pour le produit et requêtes préparées. Les versions seront figées dans un lockfile et vérifiées sur Sites avant d'accumuler des fonctionnalités.

Les services métier ne dépendront ni du framework UI ni d'un serveur Node persistant. Le runtime serverless utilise ses bindings de données ; le déploiement Docker fournit les adaptateurs de stockage local persistant ou d'accès au Cloudflare de l'utilisateur. Les détails internes de l'implémentation locale, notamment SQLite et fichiers sur disque, restent dans l'adaptateur et les volumes, sans changer les modèles métier. Les services externes ne sont pas lancés par le socle. Les éventuels clients desktop sont des consommateurs externes des API.

```text
app/                       Entrées HTTP, pages, raccordement au runtime Sites
core/                      Identités, droits, opérations, données, événements
admin/                     Back-office Creezio
ui/                        Composants réutilisables et moteur de widgets
themes/                    Thèmes de front prêts à utiliser, dont ChatGPT-like
extensions/common/         Extensions communes livrées/versionnées séparément
application/frontend/      Front de départ, appartenant ensuite à l'application
application/extensions/    Extensions propres à l'application
application/config/        Choix, branding du front, composition de l'application
adapters/sites/            Auth, bindings D1/R2 et conventions GPT Sites
adapters/docker/           Runtime autonome et cycle de vie du déploiement
adapters/cloudflare/       Worker, assets, bindings et publication directe
adapters/storage/          Sites natif, D1/R2 locaux, compte Cloudflare distant
data/                      Modèles actuels, initialisation et accès D1/R2
scripts/                   Setup, validation, build, publication et mise à jour
docs/                      Contrats, installation, exploitation et recette
```

Le dépôt contient les sources nécessaires au démarrage. Des frontières de propriété explicites séparent les fichiers maintenus par Creezio de ceux appartenant à l'application. Les extensions optionnelles sont exclues du bundle serveur lorsqu'elles ne sont pas sélectionnées. Un adaptateur d'hébergement Docker peut exécuter la même application sans devenir une dépendance du socle serverless.

## 4. Installation prête à l'emploi sur GPT Sites

Le parcours cible est : récupérer le dépôt ou le forker, enregistrer un nouveau Site, renseigner sa configuration d'hébergement, publier, ouvrir l'assistant initial. Les commandes documentées orchestrent ces étapes ; aucune modification manuelle de code n'est nécessaire.

Le socle démarre avec ses données de configuration, un back-office et un front utilisable. L'IA ou les services tiers non configurés sont signalés clairement, sans fausses réponses ou simulation silencieuse. L'assistant d'installation permet de connecter les extensions ultérieurement.

Pour Sites : conserver son plugin de build, produire l'entrée Worker attendue et utiliser les bindings logiques D1/R2 déclarés dans `.openai/hosting.json`. L'identité d'un Site, ses secrets et ses données ne doivent pas être hérités par un nouveau fork. Le mécanisme d'enregistrement génère les métadonnées propres au nouveau déploiement ; il conserve ces identifiants lors des publications suivantes.

GitHub reste la source du projet et de sa filiation. Le dépôt source géré par Sites est un transport de publication distinct. Une livraison enregistre le SHA GitHub, le SHA publié, la version et l'identifiant de déploiement. Deux Sites ne doivent jamais partager accidentellement cette identité.

Les nouveaux Sites commencent privés. L'accès public, un domaine ou l'ajout d'autres personnes ne sont pas nécessaires pour prouver le démarrage et ne sont pas modifiés implicitement.

## 5. Données, identités et sécurité

### D1/R2 natifs

Les parcours de base sont **GPT Sites avec ses D1/R2 natifs**, **développement local Docker avec Miniflare et D1/R2 locaux persistants**, puis **publication de l'application complète avec ses données/fichiers sur Cloudflare**. L'application restant dans Docker peut également se connecter aux ressources Cloudflare ; cette variante ne remplace pas la publication complète. Les modules ne réimplémentent pas ces transports. Le [dossier de stockage et hébergement](STOCKAGE-ET-HEBERGEMENT.md) détaille Miniflare, workerd, Wrangler, Vinext et les étapes de transfert/publication. Miniflare sert au développement/test ; aucune certification de son usage en production n'est recherchée.

Concevoir les modèles pour D1 dès l'origine : tables, relations, contraintes, index SQL, pagination, requêtes préparées et mutations bornées. Utiliser JSON pour les champs réellement structurés, sans convertir toute l'application en documents opaques. R2 conserve les fichiers ; D1 conserve leurs métadonnées, propriétaires et autorisations.

Chaque opération reçoit un contexte serveur obligatoire : utilisateur, permissions, application et espace de données résolu. Aucun identifiant fourni par le front ne suffit à choisir une base ou à obtenir un droit. Aucun binding mutable global ne doit laisser passer une requête dans l'espace d'une autre.

Sur GPT Sites, le cas de départ utilise les bindings D1/R2 fournis nativement au Site ; aucune clé Cloudflare personnelle n'est nécessaire. Sur Docker, le stockage local doit être disponible sans compte Cloudflare, avec volumes persistants ; l'utilisateur peut choisir ses ressources Cloudflare via la connexion native fournie. Le contrat permet également des espaces physiquement distincts. La capacité de GPT Sites à exposer plusieurs ressources devra être vérifiée séparément. Si un accès distant requiert une API HTTPS dédiée, l'adaptateur natif s'en charge ; aucun développement spécifique n'est demandé à l'application cliente. Un simple filtre `tenant_id` ne vaut pas preuve d'isolation physique. Aucun de ces choix ne multiplie les déploiements applicatifs par client.

En production entièrement sur Cloudflare, l'application Worker utilise directement ses bindings D1/R2. La première publication copie de façon contrôlée les données et fichiers locaux de cette installation vers ses ressources de production. Les publications suivantes conservent les données de production ; elles ne réimportent pas automatiquement le jeu de développement. Cette copie à modèles identiques est une opération de livraison, pas un script de transformation de base dans un module.

Le projet définit directement ses modèles actuels et initialise une base neuve. Un module décrit les entités et relations dont il a besoin ; il ne fournit pas de chaîne de transformations entre versions de bases. L'installation prépare les structures nécessaires sans effacer les données présentes. La mise à jour vérifie la compatibilité du code avec les données : elle ne réinitialise pas une base existante et bloque une évolution incompatible plutôt que d'altérer silencieusement les données. Le traitement d'une future évolution incompatible devra être conçu explicitement si ce besoin apparaît.

D1/R2 et les services externes ne partagent pas une transaction globale : utiliser idempotence, états intermédiaires, compensations et événements durables. L'index de recherche n'est pas la source de vérité ; le résultat final et les actions restent soumis aux droits du backend.

### Identités et droits

Un utilisateur applicatif n'obtient pas l'administration Creezio. Les mêmes restrictions sont appliquées au routage UI, aux API, au MCP et aux actions du chat. Le premier administrateur est associé à une identité explicitement autorisée, jamais au premier visiteur quelconque.

Sur Sites, examiner et utiliser son mécanisme d'authentification fourni, puis le rattacher aux identités internes Creezio. Vérifier les parcours de comptes/mots de passe via un fournisseur d'authentification adapté. L'identité Sites est propre à chaque Site ; l'email seul n'est pas une clé d'autorisation. Hors du proxy de confiance Sites, un en-tête d'identité fourni par un navigateur ne doit jamais être accepté comme preuve.

Secrets uniquement côté serveur et dans le stockage de secrets approprié ; références opaques dans la configuration. Clés d'extension, connexions R2 et mots de passe ne figurent ni dans Git, ni dans le chat, ni dans les bundles UI, ni dans les journaux. Chaque fork configure ses propres accès.

## 6. Contrat unique des extensions

Chaque extension doit déclarer les éléments suivants, avec schéma et validation automatiques :

| Élément | Contenu du contrat |
|---|---|
| Identité | Identifiant stable, version, compatibilité Creezio, dépendances, éditeur, empreinte de livraison. |
| Configuration | Champs publics, références de secrets, connexions externes, diagnostic et état de disponibilité. |
| Données | Modèles actuels, entités, relations, validation, propriétaires des données, besoins d'initialisation, export et conservation. |
| Opérations | Entrées/sorties typées, droits, contexte, lecture/écriture, idempotence, effets externes et erreurs. |
| API | Routes et documentation dérivées du registre d'opérations ; aucun contournement des règles métier. |
| MCP | Outils et ressources exposables, autorisation et portée ; même exécution que l'API. |
| Recherche | Documents/projections, champs indexables, filtres d'accès, synchronisation et reconstruction ; fournisseur sélectionné, dont Meili en extension. |
| UI | Pages administrateur éventuelles, composants front, navigation, onboarding et état non configuré. |
| Widgets | Type et version, données de rendu, lectures/actions autorisées, compatibilité des messages anciens. |
| Événements | Événements émis/reçus, webhooks signés, reprise, déduplication et politique de nouvelles tentatives. |
| Cycle de vie | Installation, activation, désactivation, mise à jour, désinstallation explicite et sort des données. |
| Validation | Tests de contrat, permissions, initialisation, conservation des données, isolation et intégration réelle du service externe. |

Une extension est du code de confiance revu et livré avec l'application ; le contrat n'est pas une sandbox garantissant l'isolation de code malveillant. L'ajout de nouveau code nécessite un build et une publication selon le parcours de l'hébergement : demande dans GPT sur Sites, déclenchement possible depuis l'administration sur Docker. Une extension déjà incluse et compatible peut être activée et configurée directement. On ne télécharge pas du JavaScript arbitraire pour l'exécuter dans le Worker en production.

L'API d'extension reste identique qu'elle provienne du catalogue Creezio ou du client. Exemples communs : catalogue produits, Stripe, Meili, n8n, Hermes. Exemples propres à un client : objets et parcours de son métier.

### Deux modules de référence : n8n et Stripe

| | Module n8n | Module Stripe |
|---|---|---|
| Installation | Sélectionner le module, renseigner URL et clé du service, vérifier la connexion. | Sélectionner le module, renseigner les accès Stripe en mode test ou production, vérifier la connexion. |
| Fonctions livrées | Catalogue des workflows autorisés, consultation, déclenchement selon le type de workflow, suivi des exécutions, résultats et erreurs ; gestion couverte par l'API du fournisseur. | Catalogue/prix, clients, sessions de paiement, abonnements et suivi des paiements selon le périmètre publié du module. |
| API Creezio et MCP | Opérations déjà déclarées, typées et autorisées ; utilisables immédiatement depuis l'application et l'assistant. | Même principe ; aucune réintégration du SDK Stripe dans chaque application. |
| Événements | Raccordement guidé des déclencheurs, callbacks/webhooks authentifiés, reprise et déduplication. | Webhooks vérifiés par signature, rapprochement des événements avec l'état du paiement, idempotence. |
| Interface et chat | Configuration, choix des workflows accessibles, lancement et widget de suivi d'exécution. | Configuration, état des paiements et widget approprié ; validation serveur des montants et droits avant action. |
| Preuve | Depuis une application fraîche : configurer, appeler par API puis MCP, exécuter un workflow de test et afficher le résultat sans modifier le code de l'application. | Depuis une application fraîche : configurer, créer un paiement de test, recevoir l'événement et consulter son état via API/MCP/widget sans modifier le code de l'application. |

Le périmètre des opérations disponibles est explicite et versionné ; « prêt à l'emploi » ne veut pas dire exposer sans contrôle toutes les méthodes du fournisseur. La clé est vérifiée et conservée côté serveur. Si le fournisseur exige aussi une URL, un secret de webhook, des droits spécifiques ou une validation dans sa console, le module automatise ce qui est possible et guide précisément le reste. Une connexion réussie ne remplace pas la vérification d'un parcours réel.

## 7. Chat et widgets

Le socle fournit conversations, messages, pièces jointes, flux de réponse, rendu des widgets et journal des actions. Les modèles IA sont des fournisseurs configurables par extensions. Un message peut afficher un composant interactif déclaré par une extension : fiche, liste, formulaire, suivi d'exécution ou action métier.

Deux interfaces utilisent ces services : le chat administrateur standard de Creezio et le chat applicatif librement dessiné dans le front. Partager un moteur n'implique pas de partager les conversations, les outils accessibles ou les droits. Le contexte d'administration ne doit pas être transmis au chat d'un client. Une app peut personnaliser son rendu sans copier le backend des conversations ni remplacer le chat de l'administration.

Le modèle choisit un type de widget autorisé et des données validées ; il ne produit pas du code exécutable. Le widget appelle l'opération serveur déclarée. Le backend revérifie l'utilisateur, l'espace de données, les droits et la version de l'objet au moment du clic. Une confirmation supplémentaire dépend de l'effet réel de l'action.

Tester le rafraîchissement, la réouverture d'une ancienne conversation, les droits retirés, les objets supprimés, les clics répétés et les résultats d'action périmés. La version du widget est conservée dans le message ; les versions anciennes ont une compatibilité ou un rendu de repli explicite. WebMCP, si disponible dans le navigateur, est un adaptateur supplémentaire ; il ne remplace pas MCP distant et ne donne aucun droit supplémentaire.

## 8. Exécution asynchrone et intégrations

L'état des travaux, demandes et événements est durable. Leur exécution utilise les mécanismes serverless réellement disponibles ou une extension d'exécution externe. Aucun `setInterval` ou processus laissé vivant ne constitue un ordonnanceur fiable.

Les extensions doivent annoncer leurs besoins : HTTPS, webhooks, déclencheur planifié, service d'exécution ou stockage externe. La disponibilité de tâches planifiées ou de files dans Sites est à vérifier avant d'en dépendre. Des tâches longues, agents Hermes, automatisations n8n ou navigateurs distants vivent dans leurs services respectifs ; Creezio reçoit progression, résultat et erreurs.

La messagerie conserve notamment boîte d'envoi durable, reprises, pièces jointes, réception et webhooks. Les transports SMTP/IMAP dépendant de connexions non disponibles sur Sites passent par un fournisseur ou une passerelle externe. Une intégration ne sera pas déclarée validée sur la seule base de réponses simulées.

## 9. GitHub, fork et mises à jour

### Filiation réelle

Le premier dérivé sera créé avec l'API de fork GitHub, avec vérification de `fork`, `parent` et de l'ancêtre Git commun. Une copie par template ne répond pas à ce jalon. Le propriétaire actuel est le compte personnel `creezio` ; l'organisation accessible `Creez-io` est une destination candidate à vérifier pour un fork privé. Vérifier droits, politique et nom disponible au début, avant de dépendre de cette destination. Ne pas transférer le dépôt pour contourner une restriction sans décision explicite.

### Propriété des fichiers

Les versions du socle, du contrat et des extensions sont enregistrées dans un manifeste de livraison. Les répertoires de l'application lui appartiennent. Les évolutions du front de départ deviennent disponibles à comparaison ; elles ne remplacent pas le front personnalisé.

Pour les fichiers communs, comparer version d'origine, état local et nouvelle version. Une modification locale incompatible produit un conflit explicite et bloque l'application automatique ; elle n'est pas écrasée. Composer les dépendances et le lockfile en respectant les modules et modèles de données de l'application.

### GPT Sites : demande et exécution dans GPT

L'utilisateur demande la mise à jour, ou une tâche GPT explicitement configurée porte cette demande. GPT prépare la version, contrôle les personnalisations, vérifie données et dépendances, exécute les tests, publie sur le même Site puis vérifie le résultat. L'utilisateur dispose du compte rendu et peut contrôler son application. Aucune tâche n'est créée par ce plan.

Le back-office affiche la version et les informations utiles. Il ne déclenche pas la publication Sites ; aucun pont de publication depuis l'application n'est à développer ou à rechercher pour cette cible. Ce parcours s'applique aussi à l'ajout de modules qui nécessitent du nouveau code.

### Docker : déclenchement depuis le back-office

Le back-office local doit proposer **Publier sur Cloudflare** : connecter le compte avec les droits nécessaires, préparer les ressources de l'application, construire Worker/assets, transférer D1/R2, raccorder bindings/secrets et auth, publier puis vérifier. L'exécuteur local orchestre ces opérations ; un simple `wrangler deploy` ne copie pas le contenu local des bases et buckets. Tester interruption/reprise et production fonctionnelle après arrêt du local. Le parcours détaillé et les sources officielles sont dans le [dossier d'hébergement](STOCKAGE-ET-HEBERGEMENT.md).

Un module de livraison permet à l'administrateur de demander la mise à jour. Un exécuteur d'hébergement limité à cette application prépare et teste la version, construit ou récupère l'image, contrôle les personnalisations, remplace le déploiement et vérifie son état. Le back-office suit l'opération et son résultat ; le runtime applicatif ne reçoit pas un accès Docker général.

Tester la reprise après échec et le retour à une image compatible. Les secrets et les ressources D1/R2 restent séparés de l'image. Le retour au code précédent ne doit pas être présenté comme une restauration des données. Les sauvegardes et leur restauration sont vérifiées séparément.

## 10. Lots d'implémentation et critères de sortie

| Lot | Travail | Preuve nécessaire avant la suite |
|---|---|---|
| 0 — Spécification et contraintes | Détailler capacités et interactions ; vérifier Miniflare pour le développement local, builds Sites/Workers, bindings et transfert D1/R2, auth par hébergement, ressources multiples et destination du fork privé. | Spécification et grille complètes. Preuve initiale de démarrage/persistance sur les cibles ; chemin local → Cloudflare vérifié avant généralisation. Les points non résolus restent explicites. |
| 1 — Socle démarrable | Structure du dépôt, runtime serverless, build, configuration, assistant initial, D1/R2 et premier back-office. | Premier Site A : démarrage depuis le dépôt, donnée créée puis relue après nouvelle session, fichier R2 relu avec droits. Aucune dépendance Meili/Hermes/n8n/Docker. Réutiliser ensuite ce Site. |
| 2 — Sécurité et opérations | Identités, rôles, contextes de données, modèles et initialisation, registre d'opérations, audit, API et MCP. | Même opération et mêmes permissions depuis les différents canaux ; refus prouvés, absence de fuite entre contextes, installation sur base neuve et conservation des données après republication. |
| 3 — Contrats d'extensions | Manifestes, validation, SDK, cycle de vie, événements, projections, configuration et diagnostics. | Extension minimale installée, versionnée et désactivée sans perte de données ; incompatibilité bloquée ; code optionnel absent du socle minimal. |
| 4 — Interfaces et chat | Construire le back-office Creezio et son workspace/chat complets ; front remplaçable, thèmes standard et ChatGPT-like, composants réutilisables, conversations, fournisseur IA et widgets. | Toutes les interactions administratives spécifiées vérifiées ; thème du front interchangeable sans modification de l'admin ; utilisateur applicatif exclu de l'administration ; widget réel lisant/modifiant un objet avec trace serveur ; conversation persistante et réouverture cohérente. |
| 5 — Capacités et extensions communes | Construire les fonctions par groupes : données/configuration ; productivité/chat ; connecteurs/agents ; exploitation/développement externe. Construire n8n et Stripe comme deux modules de référence prêts à configurer, puis Meili et les autres modules selon la matrice. | Installation + accès fournisseur suffisent pour obtenir les API, MCP, événements et widgets prévus, sans intégration spécifique dans l'app. Chaque ligne de la matrice dispose d'une preuve ou d'une dépendance externe précisément identifiée. Aucun composant incompatible ne rentre dans le bundle du socle. Les fonctions annoncées opérationnelles sont testées réellement. |
| 6 — Distribution et mises à jour | Manifeste de release et protection front/extensions/données. Parcours GPT pour Sites. Depuis Docker local : publication Workers + assets + D1/R2, puis mise à jour du code conservant les données de production. Livraison de l'hébergement Docker si utilisé. | Site A mis à jour dans GPT. Recette Cloudflare direct : données/fichiers copiés, application indépendante du local, interruption/reprise et données créées en production conservées après mise à jour. Recette Docker distincte pour son propre déploiement. |
| 7 — Release et véritable fork | Stabiliser l'original, publier une release, créer le fork Creezio Lab et enregistrer Site B ; personnaliser le front et développer l'extension « demandes ». | Deux URLs actives, filiation GitHub vérifiée, persistance et identités de déploiement indépendantes ; démarrage du fork par le parcours standard. |
| 8 — Recette comparative | Nouvelle release sur A, demande de mise à jour de B dans GPT, publication et vérifications ci-dessous. | Socle de B actualisé ; front, extension, modèles propres et données préservés ; compte rendu avec versions et preuves. |
| 9 — Validation utilisateur | Présenter les deux Sites et la démonstration reproductible, ainsi que la recette du parcours Docker. | Validation avant la construction d'autres applications métier. |

Chaque lot produit du code, sa documentation, des vérifications pertinentes et un état des limites. Les tests locaux de contrat ne remplacent pas la recette hébergée. Les deux Sites sont réutilisés ; pas de multiplication des déploiements et copies de travail à chaque essai.

## 11. Première application dérivée : Creezio Lab

Proposition de métier volontairement neutre : des demandes contenant titre, description, statut et pièce jointe. Une extension cliente apporte les modèles de données, API, outils MCP et un widget permettant de consulter puis modifier une demande selon les droits.

Le front du fork utilise le thème ChatGPT-like, avec son propre écran d'accueil et son organisation conversationnelle. Son administration reste Creezio, avec le même chat et le même comportement d'onglets que l'original. Une extension commune de recherche Meili, si configurée, indexe les demandes avec les droits ; le même contrat fonctionne sans cette extension et annonce clairement l'absence de recherche Meili.

Cette application prouve simultanément : ajout d'une extension cliente, réutilisation d'une extension commune, remplacement du front, persistance D1/R2, API/MCP/widget partagés, distinction administrateur/utilisateur et compatibilité avec les mises à jour.

## 12. Recette obligatoire sur les deux Sites

| Scénario | Résultat exigé |
|---|---|
| Installation de l'original et du fork | A et B démarrent par le processus documenté, sans réparation manuelle des sources. |
| Absence de services optionnels | Le socle, les données et l'administration fonctionnent sans Meili, Hermes ou n8n. Les fonctionnalités nécessitant une extension absente sont explicites. |
| Administration distincte | Un compte applicatif ne peut accéder aux écrans ou opérations d'administration, même en appelant directement l'API. Tester avec une identité réellement distincte quand l'accès Sites nécessaire est disponible. |
| Conservation de l'interface admin | Réexécuter les scénarios d'onglets, navigation, état des panneaux et chat établis depuis l'original. Même administration standard sur A et B ; aucune fonctionnalité retirée silencieusement. |
| Thèmes et chats | Passer du thème standard au thème ChatGPT-like, conserver conversations et droits ; les personnalisations du chat client ne modifient pas le chat Creezio de l'administration. |
| Persistance | Données et fichiers demeurent après rafraîchissement, nouvelle session et nouvelle publication ; sauvegarde/restauration éprouvée sur données de test. |
| Docker local autonome | Sans compte Cloudflare : initialisation, lecture/écriture, fichiers, arrêt/redémarrage et recréation du conteneur conservant ses volumes ; intégrité et restauration testées. |
| Production Cloudflare complète | Depuis le local, publier original et fork avec identités propres : Worker, front/back-office, D1 et R2. Vérifier contenu transféré, droits, URL de production, indépendance du local et conservation des données de production lors de la mise à jour suivante. |
| Docker avec Cloudflare | Connexion guidée, sélection des ressources, mêmes opérations et droits ; données réellement dans le compte choisi ; erreur explicite si accès révoqué, sans repli sur une autre base. |
| Isolation entre A et B | Ressources de données, accès, secrets et fichiers indépendants ; mêmes identifiants d'objets dans les deux Sites sans fuite. |
| Espaces isolés dans une application | Une extension utilise deux ressources réellement distinctes si cette capacité est déclarée validée ; les deux Sites seuls ne prouvent pas ce scénario. Aucune substitution par simple partition logique. |
| Extension cliente | Modèles, entités, relations, permissions, API, MCP et widget réellement utilisables sur B. |
| Extension commune | n8n et Stripe configurés sans modification de code de l'application ; API/MCP/widget disponibles ; workflow et paiement de test réellement exécutés ; diagnostic d'échec et retrait sans corruption. |
| Chat | Fournisseur réel configuré pour la recette IA ; outil puis widget, action autorisée et trace d'audit ; aucun HTML/JS arbitraire du modèle. |
| Concurrence et reprises | Clic doublé, requête rejouée, version périmée, service externe indisponible, tâche interrompue : erreurs et reprises correctes. |
| Mise à jour Sites | Nouvelle release Creezio sur A ; demande dans GPT pour B ; publication puis vérification ; extension cliente toujours présente, front personnalisé et données intacts. |
| Mise à jour Docker | Déclenchement depuis le back-office, remplacement du déploiement, vérification et compte rendu ; données et personnalisations préservées. Recette distincte des deux Sites. |
| Échec de mise à jour | Conflit de personnalisation ou incompatibilité avec les données détecté avant application ; aucun succès annoncé avant publication vérifiée ; procédure de reprise testée. |
| Poids/runtime | Build minimal sans code des services externes ; démarrage et routes critiques testés dans les contraintes réelles Workers/Sites. |

Pour chaque preuve : URL, versions, SHA, date, acteur, données de test, résultat attendu/obtenu et limites. Une capture d'écran seule, une CI verte, un healthcheck ou une réponse mockée ne suffisent pas à valider un parcours complet.

## 13. Pré requis à traiter au moment utile

- Destination GitHub autorisée pour le fork privé ; aucune recréation par template présentée comme équivalente.
- Accès au compte Sites courant pour deux nouvelles installations.
- Identité administrateur et, pour la recette de séparation des rôles hébergée, seconde identité de test autorisée.
- Secrets de test pour les extensions effectivement démontrées : IA, Meili ou autres fournisseurs. Ne pas réutiliser implicitement des secrets de production.
- Possibilité d'accès à plusieurs ressources D1/R2 ; environnement Docker de test pour son parcours de mise à jour. Une limitation reste visible tant qu'elle n'est pas résolue.
- Compte Cloudflare et accès de test autorisés pour publier Workers/assets et ressources D1/R2, vérifier le transfert et l'indépendance de la production. Docker local avec Miniflare doit fonctionner pour le développement sans ces accès.

Ces points ne demandent pas de redéfinir le métier des applications. L'absence d'un secret d'extension ne bloque pas le développement du socle ; elle empêche de déclarer cette intégration validée en conditions réelles.

## 14. Références et limites de cette conception

Le runtime, les bindings D1/R2, l'authentification et la publication utilisent les capacités effectivement disponibles dans GPT Sites. Les vérifications de plateforme du lot 0 restent nécessaires. La publication Sites est effectuée dans le parcours GPT, hors du runtime de l'application.

Sources techniques primaires :

- [Compatibilité Node dans Workers](https://developers.cloudflare.com/workers/runtime-apis/nodejs/) et [flags de compatibilité](https://developers.cloudflare.com/workers/configuration/compatibility-flags/) : ne pas assimiler présence d'un module à capacité d'exécuter un processus système.
- [API Web du runtime Workers](https://developers.cloudflare.com/workers/runtime-apis/web-standards/) : contraintes de code dynamique et choix de compilation des extensions.
- [Limites D1](https://developers.cloudflare.com/d1/platform/limits/) : requêtes et paramètres bornés ; les limites réellement disponibles sur Sites restent à vérifier.
- [Accès applicatif à D1 par API Worker](https://developers.cloudflare.com/d1/tutorials/build-an-api-to-access-d1/) : distinguer API de données et API administrative de gestion Cloudflare.
- [Forks GitHub](https://docs.github.com/en/pull-requests/reference/forks) et [API de création de fork](https://docs.github.com/en/rest/repos/forks) : filiation et contraintes des dépôts privés.

**État à la rédaction :** dépôt documentaire créé ; plan proposé ; aucune implémentation, aucun fork applicatif et aucun nouveau Site créé dans ce lot de conception.
