# Creezio-D1R2 — plan d'implémentation

26 septembre 2026. Plan proposé, avant implémentation. Intègre la correction explicite : **Creezio est nativement serverless ; les services externes sont des extensions, pas des composants du socle.**

## 1. Résultat attendu

Un dépôt autonome, prêt à démarrer sur GPT Sites avec un backend, un back-office Creezio et un front de départ. Une application dérivée conserve cette base, remplace son front et ajoute ses extensions. Elle reçoit les mises à jour de Creezio depuis son administration en préservant ses personnalisations.

La preuve finale comprend deux nouveaux GPT Sites réellement utilisables :

- **Site A : Creezio original**, issu de `creezio/Creezio-D1R2` ; installation standard, capacités du socle et extensions communes.
- **Site B : Creezio Lab**, issu d'un véritable fork GitHub ; front personnalisé, extension propre et données indépendantes. Une évolution du socle est ensuite appliquée à B depuis son back-office.

Un seul déploiement applicatif par application, quel que soit le nombre de ses utilisateurs ou espaces de données. Les extensions déterminent les règles métier. Aucun remplacement de WinHub, Tempoflow ou Certivan avant validation de cette démonstration.

**Invariants d'interface :** préserver toutes les fonctionnalités et interactions de l'administration Creezio, notamment son workspace à onglets et son chat standard. Les applications clientes ne recodent pas leur chat métier dans l'administration. Leur liberté de design et les thèmes concernent le front applicatif.

## 2. Frontière entre socle et extensions

### Socle serverless

- Initialisation, configuration, versions et registre des extensions.
- Identités, sessions adaptées à l'hébergement, permissions, séparation administration/application.
- Contrat d'opérations partagé entre API, MCP, back-office, front et widgets.
- Schémas et accès D1, migrations, stockage R2, résolution des espaces de données.
- Back-office Creezio : configuration, utilisateurs, droits, données autorisées, extensions, connexions, journaux, état et mises à jour.
- Conversations persistantes, protocole de chat et de widgets, interface de départ et composants réutilisables.
- Contrats de fournisseurs IA, recherche, exécution de tâches et événements ; état durable des travaux asynchrones, sans boucle résidente.
- Journal d'audit, erreurs, diagnostics et export des événements.

### Extensions et services externes

Meilisearch, Hermes, n8n, fournisseurs IA, messagerie, navigateurs distants, agents de développement et autres intégrations sont des extensions. Chaque extension apporte son connecteur, sa configuration, ses opérations, ses permissions, ses surfaces UI et, si pertinent, ses widgets.

L'extension Meili déclare et maintient les index externes. L'extension Hermes dialogue avec un service Hermes externe. L'extension n8n pilote un n8n externe. Creezio ne les installe ni ne les lance dans son runtime. Leur absence ne bloque ni le démarrage ni l'administration du socle.

**Un module fournit une intégration prête à l'emploi, pas un connecteur laissé à programmer.** L'administrateur l'installe, renseigne les accès nécessaires puis utilise ses fonctionnalités. Le module enregistre ses API, outils MCP, permissions, événements, écrans et widgets sans ajout de routes ou de code d'intégration dans l'application cliente. Les contrats techniques ci-dessous servent à construire ces modules complets ; ils ne transfèrent pas ce travail à chaque client.

Les fonctions historiques sont conservées dans la cible appropriée, conformément à la [matrice](MATRICE-CAPACITES.md). Préserver une capacité n'impose ni de conserver son ancien déploiement ni de l'activer par défaut. Toute adaptation fonctionnelle est explicite.

### Front applicatif

Le front de départ est livré et fonctionnel ; il peut être remplacé entièrement. Il consomme les API publiques autorisées, jamais les composants privés du back-office ou les identifiants des fournisseurs. Les composants inspirés de Certivan V5 couvrent conversations, navigation, pièces jointes, panneaux, formulaires et widgets. Les simulations présentes dans Certivan ne deviennent pas des intégrations réputées opérationnelles.

Le socle conserve **une administration standardisée**, avec ses onglets, navigation, panneaux, chat, états et interactions. L'externalisation d'un moteur technique ne supprime pas sa surface fonctionnelle : le module correspondant la raccorde au service externe. Toute impossibilité démontrée doit être traitée explicitement ; elle ne justifie pas une version simplifiée de l'interface.

Le front propose initialement un thème standard et un thème **« ChatGPT-like » inspiré de Certivan V5**. Un thème fournit dispositions, composants, navigation et style ; il respecte les contrats d'identité, de conversation, d'opérations et de widgets. L'application peut les personnaliser ou les remplacer sans modifier le back-office. Les thèmes ne changent pas les règles d'autorisation du backend.

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

Base proposée : TypeScript, React, routage et build issus du starter GPT Sites actuel, avec Vinext/Vite si ce starter le confirme lors de l'implémentation. API fondée sur les interfaces Web Request/Response ; schémas validés à l'exécution et exposables en JSON Schema ; D1 avec migrations Drizzle et requêtes préparées. Les versions seront figées dans un lockfile et vérifiées sur Sites avant d'accumuler des fonctionnalités.

Les services métier ne dépendront ni du framework UI ni d'un serveur Node persistant. Aucun SQLite local de production, disque durable local, lancement de binaire ou worker métier permanent dans le socle. Les éventuels clients desktop sont des consommateurs externes des API.

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
migrations/                Migrations composées, ordonnées et immuables
scripts/                   Setup, validation, build, publication et mise à jour
docs/                      Contrats, installation, exploitation et recette
```

Le dépôt contient les sources nécessaires au démarrage : pas de dépendance à un ancien registre npm privé pour amorcer l'installation. Des frontières de propriété explicites séparent les fichiers maintenus par Creezio de ceux appartenant à l'application. Les extensions optionnelles sont exclues du bundle serveur lorsqu'elles ne sont pas sélectionnées.

## 4. Installation prête à l'emploi sur GPT Sites

Le parcours cible est : récupérer le dépôt ou le forker, enregistrer un nouveau Site, renseigner sa configuration d'hébergement, publier, ouvrir l'assistant initial. Les commandes documentées orchestrent ces étapes ; aucune modification manuelle de code n'est nécessaire.

Le socle démarre avec ses données de configuration, un back-office et un front utilisable. L'IA ou les services tiers non configurés sont signalés clairement, sans fausses réponses ou simulation silencieuse. L'assistant d'installation permet de connecter les extensions ultérieurement.

Pour Sites : conserver son plugin de build, produire l'entrée Worker attendue et utiliser les bindings logiques D1/R2 déclarés dans `.openai/hosting.json`. L'identité d'un Site, ses secrets et ses données ne doivent pas être hérités par un nouveau fork. Le mécanisme d'enregistrement génère les métadonnées propres au nouveau déploiement ; il conserve ces identifiants lors des publications suivantes.

GitHub reste la source du projet et de sa filiation. Le dépôt source géré par Sites est un transport de publication distinct. Une livraison enregistre le SHA GitHub, le SHA publié, la version et l'identifiant de déploiement. Deux Sites ne doivent jamais partager accidentellement cette identité.

Les nouveaux Sites commencent privés. L'accès public, un domaine ou l'ajout d'autres personnes ne sont pas nécessaires pour prouver le démarrage et ne sont pas modifiés implicitement.

## 5. Données, identités et sécurité

### D1/R2 natifs

Concevoir les modèles pour D1 dès l'origine : tables, relations, contraintes, index SQL, pagination, requêtes préparées et mutations bornées. Utiliser JSON pour les champs réellement structurés, sans convertir toute l'application en documents opaques. R2 conserve les fichiers ; D1 conserve leurs métadonnées, propriétaires et autorisations.

Chaque opération reçoit un contexte serveur obligatoire : utilisateur, permissions, application et espace de données résolu. Aucun identifiant fourni par le front ne suffit à choisir une base ou à obtenir un droit. Aucun binding mutable global ne doit laisser passer une requête dans l'espace d'une autre.

Le cas de départ utilise les bindings D1/R2 du Site. Le contrat permet également des espaces physiquement distincts. La capacité de GPT Sites à provisionner ou exposer plusieurs D1/R2 devra être vérifiée : on ne confond pas les capacités générales de Cloudflare avec celles offertes par Sites. Si nécessaire, une extension de ressources externes utilise une API HTTPS dédiée ; un simple filtre `tenant_id` ne vaut pas preuve d'isolation physique. Cette extension n'implique aucun déploiement applicatif par client.

Les migrations ont un propriétaire, une version, un journal et un ordre déterministe. Les migrations du socle et celles d'une extension cliente doivent coexister. Les migrations publiées ne sont jamais réécrites. Les traitements volumineux sont découpés, reprenables et séparés de la modification de schéma.

D1/R2 et les services externes ne partagent pas une transaction globale : utiliser idempotence, états intermédiaires, compensations et événements durables. L'index de recherche n'est pas la source de vérité ; le résultat final et les actions restent soumis aux droits du backend.

### Identités et droits

Un utilisateur applicatif n'obtient pas l'administration Creezio. Les mêmes restrictions sont appliquées au routage UI, aux API, au MCP et aux actions du chat. Le premier administrateur est associé à une identité explicitement autorisée, jamais au premier visiteur quelconque.

Sur Sites, examiner et utiliser son mécanisme d'authentification fourni, puis le rattacher aux identités internes Creezio. Vérifier séparément la possibilité de conserver les parcours historiques de comptes/mots de passe via un fournisseur d'authentification adapté. L'identité Sites est propre à chaque Site ; l'email seul n'est pas une clé d'autorisation. Hors du proxy de confiance Sites, un en-tête d'identité fourni par un navigateur ne doit jamais être accepté comme preuve.

Secrets uniquement côté serveur et dans le stockage de secrets approprié ; références opaques dans la configuration. Clés d'extension, connexions R2 et mots de passe ne figurent ni dans Git, ni dans le chat, ni dans les bundles UI, ni dans les journaux. Chaque fork configure ses propres accès.

## 6. Contrat unique des extensions

Chaque extension doit déclarer les éléments suivants, avec schéma et validation automatiques :

| Élément | Contenu du contrat |
|---|---|
| Identité | Identifiant stable, version, compatibilité Creezio, dépendances, éditeur, empreinte de livraison. |
| Configuration | Champs publics, références de secrets, connexions externes, diagnostic et état de disponibilité. |
| Données | Entités, relations, validation, propriétaires des tables, migrations, stratégie d'export et de conservation. |
| Opérations | Entrées/sorties typées, droits, contexte, lecture/écriture, idempotence, effets externes et erreurs. |
| API | Routes et documentation dérivées du registre d'opérations ; aucun contournement des règles métier. |
| MCP | Outils et ressources exposables, autorisation et portée ; même exécution que l'API. |
| Recherche | Documents/projections, champs indexables, filtres d'accès, synchronisation et reconstruction ; fournisseur sélectionné, dont Meili en extension. |
| UI | Pages administrateur éventuelles, composants front, navigation, onboarding et état non configuré. |
| Widgets | Type et version, données de rendu, lectures/actions autorisées, compatibilité des messages anciens. |
| Événements | Événements émis/reçus, webhooks signés, reprise, déduplication et politique de nouvelles tentatives. |
| Cycle de vie | Installation, activation, désactivation, mise à jour, désinstallation explicite et sort des données. |
| Validation | Tests de contrat, permissions, migrations, isolation et intégration réelle du service externe. |

Une extension est du code de confiance revu et livré avec l'application ; le contrat n'est pas une sandbox garantissant l'isolation de code malveillant. L'installation de nouveau code déclenche un build et une publication. On peut activer immédiatement une extension déjà incluse et compatible, mais on ne télécharge pas du JavaScript arbitraire pour l'exécuter dans le Worker en production.

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

Pour les fichiers communs, comparer version d'origine, état local et nouvelle version. Une modification locale incompatible produit un conflit explicite et bloque l'application automatique ; elle n'est pas écrasée. Composer les dépendances, le lockfile et les migrations du socle avec ceux de l'application, au lieu de recopier un journal de migrations par-dessus l'autre.

### Mise à jour depuis le back-office

1. Consulter version disponible, compatibilités, dépendances et migrations.
2. Préparer une proposition reproductible sur une révision précise, avec contrôle des personnalisations.
3. Vérifier migrations, droits, tests, build et configuration ; sauvegarder les données nécessaires au retour arrière.
4. Déclencher la publication par un exécuteur de livraison authentifié ; conserver un journal durable et une reprise idempotente.
5. Publier sur le même Site, vérifier l'état final et la recette minimale ; afficher le résultat réel dans Creezio.

**Point de faisabilité prioritaire :** les outils Sites disponibles à l'assistant ne sont pas automatiquement une API invocable depuis une application. Il faut établir un chemin de publication programmatique autorisé et durable pour le bouton du back-office. Un pont de livraison externe peut être nécessaire et relève d'une extension. Une publication manuelle par l'assistant n'est pas une preuve de mise à jour autonome depuis Creezio.

Les migrations Sites peuvent être appliquées avant l'envoi du code. Préférer les évolutions compatibles et les déploiements en étapes. Revenir au code précédent ne restaure pas automatiquement D1/R2. Documenter les sauvegardes, la compatibilité des anciennes versions et tester une restauration sur des données de test. Avec plusieurs espaces, suivre la progression des migrations sans fabriquer plusieurs versions de l'application.

## 10. Lots d'implémentation et critères de sortie

| Lot | Travail | Preuve nécessaire avant la suite |
|---|---|---|
| 0 — Inventaire et contraintes | Décomposer la matrice historique en comportements, routes, modèles et tests ; établir la référence d'interface onglets/chat/panneaux/états ; confirmer runtime Sites, auth, ressources multiples, déclencheurs, publication programmatique et destination du fork privé. | Décisions documentées et grille de non-régression de l'interface. Pas de promesse cachant une impossibilité de plateforme. Les points bloquants ont une solution vérifiée ou sont signalés comme non résolus. |
| 1 — Socle démarrable | Structure du dépôt, runtime serverless, build, configuration, assistant initial, D1/R2 et premier back-office. | Premier Site A : démarrage depuis le dépôt, donnée créée puis relue après nouvelle session, fichier R2 relu avec droits. Aucune dépendance Meili/Hermes/n8n/Docker. Réutiliser ensuite ce Site. |
| 2 — Sécurité et opérations | Identités, rôles, contextes de données, registre d'opérations, migrations, audit, API et MCP. | Même opération et mêmes permissions depuis les différents canaux ; refus prouvés, absence de fuite entre contextes, migrations cumulatives rejouables sur base neuve. |
| 3 — Contrats d'extensions | Manifestes, validation, SDK, cycle de vie, événements, projections, configuration et diagnostics. | Extension minimale installée, versionnée et désactivée sans perte de données ; incompatibilité bloquée ; code optionnel absent du socle minimal. |
| 4 — Interfaces et chat | Préserver le back-office Creezio et son workspace/chat ; construire le front remplaçable, les thèmes standard et ChatGPT-like, composants Certivan, conversations, fournisseur IA et widgets. | Parité des interactions administratives ; thème du front interchangeable sans modification de l'admin ; utilisateur applicatif exclu de l'administration ; widget réel lisant/modifiant un objet avec trace serveur ; conversation persistante et réouverture cohérente. |
| 5 — Capacités et extensions communes | Porter les fonctions historiques vers leur cible, par groupes : données/configuration ; productivité/chat ; connecteurs/agents ; exploitation/développement externe. Construire n8n et Stripe comme deux modules de référence prêts à configurer, puis Meili et les autres modules selon la matrice. | Installation + accès fournisseur suffisent pour obtenir les API, MCP, événements et widgets prévus, sans intégration spécifique dans l'app. Chaque ligne de la matrice dispose d'une preuve ou d'une dépendance externe précisément identifiée. Aucun composant incompatible ne rentre dans le bundle du socle. Les fonctions annoncées opérationnelles sont testées réellement. |
| 6 — Distribution et mises à jour | Manifeste de release, composition des migrations, protection du front/extensions, exécuteur de publication et état dans le back-office. | Mise à jour sur Site A, conflit détecté sans écrasement, panne récupérable et restauration documentée/testée. Chaîne de publication effectivement déclenchable par le back-office. |
| 7 — Release et véritable fork | Stabiliser l'original, publier une release, créer le fork Creezio Lab et enregistrer Site B ; personnaliser le front et développer l'extension « demandes ». | Deux URLs actives, filiation GitHub vérifiée, persistance et identités de déploiement indépendantes ; démarrage du fork par le parcours standard. |
| 8 — Recette comparative | Nouvelle release sur A, mise à jour de B depuis son administration, tests complets ci-dessous. | Socle de B actualisé ; front, extension, migrations propres et données préservés ; compte rendu avec versions et preuves. |
| 9 — Validation utilisateur | Présenter les deux Sites et la démonstration reproductible. | Validation avant de programmer une migration WinHub ou Tempoflow. |

Chaque lot produit du code, sa documentation, des vérifications pertinentes et un état des limites. Les tests locaux de contrat ne remplacent pas la recette hébergée. Les deux Sites sont réutilisés ; pas de multiplication des déploiements et copies de travail à chaque essai.

## 11. Première application dérivée : Creezio Lab

Proposition de métier volontairement neutre : des demandes contenant titre, description, statut et pièce jointe. Une extension cliente apporte les modèles, migrations, API, outils MCP et un widget permettant de consulter puis modifier une demande selon les droits.

Le front du fork utilise le thème ChatGPT-like, avec son propre écran d'accueil et son organisation conversationnelle. Son administration reste Creezio, avec le même chat et le même comportement d'onglets que l'original. Une extension commune de recherche Meili, si configurée, indexe les demandes avec les droits ; le même contrat fonctionne sans cette extension et annonce clairement l'absence de recherche Meili.

Cette application prouve simultanément : ajout d'une extension cliente, réutilisation d'une extension commune, remplacement du front, persistance D1/R2, API/MCP/widget partagés, distinction administrateur/utilisateur et compatibilité avec les mises à jour. Elle ne commence pas à reconstruire un restaurant ou WinHub.

## 12. Recette obligatoire sur les deux Sites

| Scénario | Résultat exigé |
|---|---|
| Installation de l'original et du fork | A et B démarrent par le processus documenté, sans réparation manuelle des sources. |
| Absence de services optionnels | Le socle, les données et l'administration fonctionnent sans Meili, Hermes ou n8n. Les fonctionnalités nécessitant une extension absente sont explicites. |
| Administration distincte | Un compte applicatif ne peut accéder aux écrans ou opérations d'administration, même en appelant directement l'API. Tester avec une identité réellement distincte quand l'accès Sites nécessaire est disponible. |
| Conservation de l'interface admin | Réexécuter les scénarios d'onglets, navigation, état des panneaux et chat établis depuis l'original. Même administration standard sur A et B ; aucune fonctionnalité retirée silencieusement. |
| Thèmes et chats | Passer du thème standard au thème ChatGPT-like, conserver conversations et droits ; les personnalisations du chat client ne modifient pas le chat Creezio de l'administration. |
| Persistance | Données et fichiers demeurent après rafraîchissement, nouvelle session et nouvelle publication ; sauvegarde/restauration éprouvée sur données de test. |
| Isolation entre A et B | Ressources de données, accès, secrets et fichiers indépendants ; mêmes identifiants d'objets dans les deux Sites sans fuite. |
| Espaces isolés dans une application | Une extension utilise deux ressources réellement distinctes si cette capacité est déclarée validée ; les deux Sites seuls ne prouvent pas ce scénario. Aucune substitution par simple partition logique. |
| Extension cliente | Entité, relation, migration, permissions, API, MCP et widget réellement utilisables sur B. |
| Extension commune | n8n et Stripe configurés sans modification de code de l'application ; API/MCP/widget disponibles ; workflow et paiement de test réellement exécutés ; diagnostic d'échec et retrait sans corruption. |
| Chat | Fournisseur réel configuré pour la recette IA ; outil puis widget, action autorisée et trace d'audit ; aucun HTML/JS arbitraire du modèle. |
| Concurrence et reprises | Clic doublé, requête rejouée, version périmée, service externe indisponible, tâche interrompue : erreurs et reprises correctes. |
| Mises à jour | Nouvelle release Creezio sur A ; déclenchement depuis B ; extension et migration clientes toujours présentes ; front personnalisé et données intacts. |
| Échec de mise à jour | Conflit de personnalisation ou migration incompatible détecté ; aucun succès annoncé avant publication vérifiée ; procédure de reprise testée. |
| Poids/runtime | Build minimal sans code des services externes ; démarrage et routes critiques testés dans les contraintes réelles Workers/Sites. |

Pour chaque preuve : URL, versions, SHA, date, acteur, données de test, résultat attendu/obtenu et limites. Une capture d'écran seule, une CI verte, un healthcheck ou une réponse mockée ne suffisent pas à valider un parcours complet.

## 13. Pré requis à traiter au moment utile

- Destination GitHub autorisée pour le fork privé ; aucune recréation par template présentée comme équivalente.
- Accès au compte Sites courant pour deux nouvelles installations ; les anciens Sites ne sont pas requis.
- Identité administrateur et, pour la recette de séparation des rôles hébergée, seconde identité de test autorisée.
- Secrets de test pour les extensions effectivement démontrées : IA, Meili ou autres fournisseurs. Ne pas réutiliser implicitement les secrets de production Tempoflow.
- Possibilités réelles de publication depuis une extension de livraison et d'accès à plusieurs ressources D1/R2. Une limitation reste visible tant qu'elle n'est pas résolue.

Ces points ne demandent pas de redéfinir le métier des applications. L'absence d'un secret d'extension ne bloque pas le développement du socle ; elle empêche de déclarer cette intégration validée en conditions réelles.

## 14. Références et limites de cette conception

Inventaire : Creezio `6bd6507`, Creezio Lite réparation `206f052`, WinHub `4c591d3`, WinHub Lite distant `ada646f` et corrections locales `a608f3c`, Certivan V5 local `4f9a6cf`. Ne pas modifier ces sources pendant la reconstruction du socle.

Les instructions du plugin Sites consultées décrivent le runtime Workers, les bindings D1/R2, l'authentification et la publication. Leur disponibilité dans l'outil ne constitue pas une API publique pour l'application. Les vérifications de plateforme du lot 0 restent nécessaires.

Sources techniques primaires :

- [Compatibilité Node dans Workers](https://developers.cloudflare.com/workers/runtime-apis/nodejs/) et [flags de compatibilité](https://developers.cloudflare.com/workers/configuration/compatibility-flags/) : ne pas assimiler présence d'un module à capacité d'exécuter un processus système.
- [API Web du runtime Workers](https://developers.cloudflare.com/workers/runtime-apis/web-standards/) : contraintes de code dynamique et choix de compilation des extensions.
- [Limites D1](https://developers.cloudflare.com/d1/platform/limits/) : requêtes, paramètres et migrations bornés ; les limites réellement disponibles sur Sites restent à vérifier.
- [Accès applicatif à D1 par API Worker](https://developers.cloudflare.com/d1/tutorials/build-an-api-to-access-d1/) : distinguer API de données et API administrative de gestion Cloudflare.
- [Forks GitHub](https://docs.github.com/en/pull-requests/reference/forks) et [API de création de fork](https://docs.github.com/en/rest/repos/forks) : filiation et contraintes des dépôts privés.

**État à la rédaction :** dépôt documentaire créé ; plan proposé ; aucune implémentation, aucun fork applicatif et aucun nouveau Site créé dans ce lot de conception.
