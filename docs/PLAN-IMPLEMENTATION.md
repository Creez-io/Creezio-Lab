# Creezio-D1R2 — plan d'implémentation

26 septembre 2026. Plan de construction et de qualification. **Creezio est un nouveau CMS nativement serverless ; les services externes sont des extensions, pas des composants du socle.** SQL central généré, comptes applicatifs natifs, ouverture publique, [licence MIT](../LICENSE) pour le cœur/SDK/starter et destination du futur fork `Creez-io/Creezio-Lab` sont des décisions acquises. Les preuves hébergées sont suivies dans [Qualification Sites](QUALIFICATION-SITES.md).

## 1. Résultat attendu

Les modules sont nativement compatibles avec l'écosystème de plugins ChatGPT : outils MCP, widgets MCP Apps, skills et distribution standard, au-dessus des mêmes données et opérations Creezio. Le [contrat ChatGPT](COMPATIBILITE-CHATGPT.md) complète celui des extensions. La recette doit exercer un vrai widget et son skill dans ChatGPT, en plus des interfaces Creezio et des deux Sites.

Un dépôt autonome, prêt à démarrer sur GPT Sites avec un backend, un back-office Creezio et un front de départ. Une application dérivée conserve cette base, remplace son front et ajoute ses extensions. Sur GPT Sites, ses mises à jour sont demandées par l'utilisateur ou une tâche GPT planifiée, exécutées puis vérifiées. Sur un hébergement Docker, elles peuvent être déclenchées depuis son administration. Les deux parcours préservent les personnalisations et les données.

La preuve finale comprend deux GPT Sites distincts réellement utilisables :

- **Site A : Creezio original**, issu de `creezio/Creezio-D1R2` ; installation standard, capacités du socle et extensions communes.
- **Site B : Creezio Lab**, issu du véritable fork GitHub public `Creez-io/Creezio-Lab`, à créer après structuration et validation du socle ; front personnalisé, extension propre et données indépendantes. Une évolution du socle est ensuite appliquée à B sur demande dans GPT, puis vérifiée.

Un seul déploiement applicatif par application, quel que soit le nombre de ses utilisateurs ou espaces de données. Les extensions déterminent les règles métier. La démonstration précède la construction d'applications métier supplémentaires.

Le produit doit également permettre de **développer en Docker avec Miniflare, puis publier Creezio ou son fork entièrement sur le compte Cloudflare de l'utilisateur** : backend/API/back-office/front sur Workers avec Static Assets, bases D1 et fichiers R2 distants. Le local est un environnement de développement/test ; la production Cloudflare ne dépend plus de lui. Ce parcours complète la validation obligatoire sur deux GPT Sites.

**Invariants d'interface :** préserver toutes les fonctionnalités et interactions de l'administration Creezio, notamment son workspace à onglets et son chat standard. Les applications clientes ne recodent pas leur chat métier dans l'administration. Leur liberté de design et les thèmes concernent le front applicatif.

## 2. Frontière entre socle et extensions

### Socle serverless

- Initialisation, configuration, versions et registre des extensions.
- Identités, comptes et sessions natifs Creezio, permissions, séparation administration/application ; la porte d'accès de l'hébergement reste une couche distincte.
- Contrat d'opérations partagé entre API, MCP, back-office, front et widgets.
- Modèles de données, initialisation D1, stockage R2, résolution des espaces de données.
- Back-office Creezio : configuration, utilisateurs, droits, données autorisées, extensions, connexions, journaux, état et mises à jour.
- Conversations persistantes, protocole de chat et de widgets, interface de départ et composants réutilisables.
- Contrats de fournisseurs IA, recherche, opérations et événements ; persistance des travaux et résultats. La planification et les relances automatiques appartiennent aux services externes, sans scheduler intégré au socle.
- Journal d'audit, erreurs, diagnostics et export des événements.
- Capacités fonctionnelles fournies d'origine : tâches humaines et suivi du travail, boîtes/brouillons de messagerie, support, CRM, navigation configurable, landing éditable, analytics et validation des demandes de travail. Elles peuvent être organisées en modules natifs, mais ne deviennent pas des fonctions à racheter ou réintégrer. Les transports et moteurs externes se raccordent séparément.

### Extensions et services externes

Meilisearch, Hermes, n8n, fournisseurs IA, transports de messagerie, moteurs de navigation distante, agents de développement et autres intégrations externes sont des extensions. Chaque extension apporte son connecteur, sa configuration, ses opérations, ses permissions, ses surfaces UI et, si pertinent, ses widgets. Les capacités natives de tâches, messagerie, support ou CRM restent livrées d'origine : sans Hermes, les tâches humaines fonctionnent ; sans transport mail, les brouillons et données restent consultables et l'envoi est explicitement indisponible.

L'extension Meili déclare et maintient les index externes. L'extension Hermes dialogue avec un service Hermes externe. L'extension n8n pilote un n8n externe. Creezio ne les installe ni ne les lance dans son runtime. Leur absence ne bloque ni le démarrage ni l'administration du socle.

**Aucune prise en charge du cycle de vie de ces applications tierces :** Creezio ne les fournit, ne les déploie, ne les héberge, ne les met à jour et ne gère pas leurs sauvegardes. L'utilisateur obtient ses accès auprès du fournisseur ou d'une instance qu'il gère séparément. Le plugin configure seulement la connexion à ce service déjà existant et expose ses fonctions autorisées. La publication Cloudflare d'une application Creezio ou d'une démo de plugin n'embarque jamais n8n, Hermes ou Meili. La mise à jour du plugin concerne son code de connexion, pas le logiciel du fournisseur.

**Un module fournit une intégration prête à l'emploi, pas un connecteur laissé à programmer.** L'administrateur l'installe, renseigne les accès nécessaires puis utilise ses fonctionnalités. Le module enregistre ses API, outils MCP, permissions, événements, écrans et widgets sans ajout de routes ou de code d'intégration dans l'application cliente. Les contrats techniques ci-dessous servent à construire ces modules complets ; ils ne transfèrent pas ce travail à chaque client.

**Les appels entrants font partie du socle.** n8n, un autre orchestrateur ou un client MCP peut appeler les opérations autorisées de Creezio depuis l'extérieur, sans navigateur et sans installer le plugin n8n. Le plugin n8n ajoute le pilotage et l'intégration de ce fournisseur depuis Creezio ; il n'est pas requis pour qu'un client externe utilise l'API native. La clé fournisseur n8n utilisée par Creezio et le jeton Creezio utilisé par n8n sont deux accès distincts.

| Responsabilité | Propriétaire |
|---|---|
| Comptes, permissions, API/MCP, logique métier et modèles | Creezio |
| Administration, onglets, chat, widgets, tâches humaines et approbations | Creezio |
| États d'exécution, échéances, brouillons, boîte d'envoi, résultats et journaux | Creezio |
| Calendrier, récurrences et relances automatiques | n8n ou un autre service externe déjà disponible |
| Travail prolongé d'un workflow, agent ou navigateur | Le service externe correspondant ; Creezio expose les actions bornées et conserve le suivi |
| Connexion, adaptation des API, écrans et widgets du fournisseur | Le plugin Creezio correspondant |

Les fonctions du produit sont décrites dans la [matrice](MATRICE-CAPACITES.md). Chaque capacité appartient au socle ou à un module identifié, avec un scénario de validation.

### Front applicatif

Le front de départ est livré et fonctionnel ; il peut être remplacé entièrement. Il consomme les API publiques autorisées, jamais les composants privés du back-office ou les identifiants des fournisseurs. Les composants couvrent conversations, navigation, pièces jointes, panneaux, formulaires et widgets. Chaque intégration annoncée opérationnelle doit avoir été testée avec son service réel.

Le socle conserve **une administration standardisée**, avec ses onglets, navigation, panneaux, chat, états et interactions. L'externalisation d'un moteur technique ne supprime pas sa surface fonctionnelle : le module correspondant la raccorde au service externe. Toute impossibilité démontrée doit être traitée explicitement ; elle ne justifie pas une version simplifiée de l'interface.

Le front propose initialement un thème standard et un thème **« ChatGPT-like »**. Un thème fournit dispositions, composants, navigation et style ; il respecte les contrats d'identité, de conversation, d'opérations et de widgets. L'application peut les personnaliser ou les remplacer sans modifier le back-office. Les thèmes ne changent pas les règles d'autorisation du backend. Un SDK headless fournit le raccordement aux API, identités, conversations et widgets pour construire aussi un front entièrement indépendant. Les personnalisations restent séparées des fichiers du thème commun.

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

Le workspace monte les vues administratives dans des **panneaux React stables** identifiés par vue et objet, alimentés par les opérations API Creezio. Chaque panneau possède sa localisation, son historique, son état et son activité ; le routeur hôte assure URL, liens directs, hydratation et navigation entre surfaces. Les modules passent par le SDK de navigation et ne lisent pas l'URL globale pour déterminer l'objet d'un panneau inactif. Distinguer paramètres d'identité d'une fiche et filtres d'une même vue.

La tranche initiale réemploie en priorité les composants et scénarios déjà qualifiés qui satisfont ces contrats. Reprendre conservation des vues, localisation par panneau, activité des sous-vues et tests ; isoler le raccordement au routeur dans l'adaptateur d'hébergement. Les preuves locales existantes servent de base à une recette ciblée sur le runtime figé et le Site cible, sans entraîner une réécriture générale. Un composant incompatible ou défaillant n'est repris qu'après correction et vérification du cas concerné.

La conservation du montage doit préserver brouillons, scroll, focus, panneaux et interactions du chat. Les portails et effets des vues inactives respectent leur état d'activité ; une mutation externe actualise les données sans effacer silencieusement un brouillon. Éviction, restauration après rechargement, révocation et changement de session ont des règles explicites. La mémoire React conservée pendant une navigation ne remplace pas la persistance des conversations ou brouillons à récupérer après rechargement.

**Risque à qualifier :** un shim de contexte privé Next peut se résoudre sous Vinext sans piloter son véritable arbre de rendu. Le SDK n'expose donc aucun contexte privé Next/Vinext. Si une vue nécessite un pont de rendu interne, le limiter à l'adaptateur d'hébergement, figer sa compatibilité et bloquer lors d'une incompatibilité ; aucun patch silencieux de `node_modules`. Un prototype léger vérifie deux fiches, transitions interrompues, query seule, cible froide, scroll, portails, widgets et révocations dans le navigateur, puis sur le build Worker. Cette compatibilité n'est pas encore validée ; elle ne justifie aucune suppression d'interaction.

Prévoir deux profils de build explicites, Sites et Cloudflare direct, avec le même code applicatif, le même lockfile et l'authentification native Creezio. Le profil Sites conserve ses conventions de packaging ; le profil Cloudflare possède ses propres identifiants de ressources, routes, secrets et paramètres de session, sans porte ChatGPT d'hébergement. Aucun identifiant de démonstration, mock d'auth ou binding placeholder ne doit entrer dans la production. Le build vérifie aussi les imports incompatibles, le poids du Worker et le démarrage réel des routes avec les modules sélectionnés.

Les services métier ne dépendront ni du framework UI ni d'un serveur Node persistant. Le runtime serverless utilise ses bindings de données ; le déploiement Docker fournit les adaptateurs de stockage local persistant ou d'accès au Cloudflare de l'utilisateur. Les détails internes de l'implémentation locale, notamment SQLite et fichiers sur disque, restent dans l'adaptateur et les volumes, sans changer les modèles métier. Les services externes ne sont pas lancés par le socle. Les éventuels clients desktop sont des consommateurs externes des API.

```text
app/                       Entrées HTTP, pages, raccordement au runtime Sites
core/                      Identités, droits, opérations, données, événements
admin/                     Back-office Creezio
ui/                        Composants réutilisables et moteur de widgets
themes/                    Thèmes de front prêts à utiliser, dont ChatGPT-like
extensions/common/         Extensions communes livrées/versionnées séparément
sdk/                       Contrats d'extension, client headless et validation
catalog/                   Métadonnées des extensions et thèmes référencés
application/frontend/      Front de départ, appartenant ensuite à l'application
application/extensions/    Extensions propres à l'application
application/config/        Choix, branding du front, composition de l'application
adapters/sites/            Auth, bindings D1/R2 et conventions GPT Sites
adapters/docker/           Développement local persistant et exécuteur de livraison
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

La cible et la recette sont des Sites publics, conformément au choix utilisateur : front accessible directement puis connexion native Creezio pour les fonctions protégées. L'initialisation sécurise l'administration avant l'ouverture ; aucun premier visiteur ne devient administrateur. La visibilité publique de l'hébergement ne rend pas les données ni l'administration publiques. Les contrôles applicatifs sont exercés sans connexion GPT.

## 5. Données, identités et sécurité

### D1/R2 natifs

Les parcours de base sont **GPT Sites avec ses D1/R2 natifs**, **développement local Docker avec Miniflare et D1/R2 locaux persistants**, puis **publication de l'application complète avec ses données/fichiers sur Cloudflare**. L'application restant dans Docker peut également se connecter aux ressources Cloudflare ; cette variante ne remplace pas la publication complète. Les modules ne réimplémentent pas ces transports. Le [dossier de stockage et hébergement](STOCKAGE-ET-HEBERGEMENT.md) détaille Miniflare, workerd, Wrangler, Vinext et les étapes de transfert/publication. Miniflare sert au développement/test ; aucune certification de son usage en production n'est recherchée.

Concevoir les modèles pour D1 dès l'origine : tables, relations, contraintes, index SQL, pagination, requêtes préparées et mutations bornées. Utiliser JSON pour les champs réellement structurés, sans convertir toute l'application en documents opaques. R2 conserve les fichiers ; D1 conserve leurs métadonnées, propriétaires et autorisations.

Chaque opération reçoit un contexte serveur obligatoire : acteur (utilisateur ou compte de service), mode d'authentification, permissions, application et espace de données résolu. Le serveur rattache le jeton machine à ses opérations et contextes autorisés. Aucun identifiant fourni par le front ou le client externe ne suffit à choisir une base ou à obtenir un droit. Aucun binding mutable global ne doit laisser passer une requête dans l'espace d'une autre.

Sur GPT Sites, un seul couple D1/R2 natif est partagé par l'application, sans clé Cloudflare personnelle. Comme dans un SaaS, le serveur applique le contexte autorisé et les droits à chaque opération, conversation et fichier ; les préfixes R2 ne remplacent pas ces vérifications. L'isolation physique de plusieurs bases/buckets dans un même Site est retirée du périmètre, pas laissée comme une qualification en attente.

Sur Docker, le stockage local reste disponible sans compte Cloudflare avec volumes persistants ; l'utilisateur peut choisir ses ressources Cloudflare via la connexion native. L'application/extensions peut sélectionner des ressources D1/R2 physiquement distinctes via le résolveur serveur. Si un accès distant nécessite une API HTTPS dédiée, l'adaptateur l'encapsule. Qualifier cette possibilité sur Docker séparément du stockage partagé Sites. Aucun de ces choix ne multiplie les déploiements applicatifs par client.

En production entièrement sur Cloudflare, l'application Worker utilise directement ses bindings D1/R2. La première publication copie de façon contrôlée les données et fichiers locaux de cette installation vers ses ressources de production. Les publications suivantes conservent les données de production ; elles ne réimportent pas automatiquement le jeu de développement. Cette copie à modèles identiques est une opération de livraison, pas un script de transformation de base dans un module.

Le projet définit directement ses modèles actuels et initialise une base neuve. Un module décrit les entités et relations dont il a besoin ; il ne fournit pas de chaîne de transformations SQL. L'installation prépare les structures nécessaires sans effacer les données présentes. La mise à jour vérifie la compatibilité du code avec les données : elle ne réinitialise pas une base existante et bloque une évolution incompatible ou destructive non résolue plutôt que d'altérer silencieusement les données.

**Décision acquise : matérialisation et évolution SQL centralisées.** La chaîne de publication génère et inspecte le SQL nécessaire à partir des modèles, le versionne avec la source et suit son application. Le parcours Sites documenté appelle ces artefacts « migrations Drizzle » et les applique avant le code. Ils sont centralisés dans l'outillage de livraison ; les auteurs de modules n'écrivent pas de scripts de transformation. Une publication vérifie l'état déjà appliqué et la compatibilité du code précédent et suivant. Les opérations appliquées ne sont pas réécrites ou rejouées pour revenir au code précédent.

D1/R2 et les services externes ne partagent pas une transaction globale : utiliser idempotence, états intermédiaires, compensations et événements durables. L'index de recherche n'est pas la source de vérité ; le résultat final et les actions restent soumis aux droits du backend.

### Identités et droits

Un utilisateur applicatif n'obtient pas l'administration Creezio. Les mêmes restrictions sont appliquées au routage UI, aux API, au MCP et aux actions du chat. Le premier administrateur est associé à une identité explicitement autorisée, jamais au premier visiteur quelconque.

Creezio fournit ses comptes, identifiants de connexion et sessions applicatives natifs. Les mots de passe sont stockés uniquement sous forme de dérivation sécurisée ; les sessions sont gérées et révocables côté serveur. Cette authentification fonctionne sur Sites, en développement local et sur Cloudflare direct, avec les mêmes droits et parcours front/administration.

Sur les Sites publics retenus, le visiteur accède au front sans compte GPT. Les actions du navigateur utilisent une session native Creezio autorisée ; les appels externes utilisent un jeton API ou une autorisation MCP valide, sans cookie de navigateur. Les deux chemins appliquent les mêmes opérations, contextes et droits. Les webhooks fournisseurs utilisent leur propre contrat signé. Une identité ChatGPT, ses headers ou son email ne créent automatiquement ni compte, ni session, ni permission Creezio. La recette privée avec une porte GPT n'est pas un objectif de ce projet.

Les accès machine sont limités par opérations et contextes, expirables, révocables et auditables ; ils ne donnent pas des droits administrateur par défaut. Une autorisation préalable permet les appels sans intervention interactive à chaque exécution, selon le protocole du client. Révoquer l'accès ou retirer un droit doit bloquer la prochaine action. Un compte de service ne peut usurper une validation réservée à un approbateur humain. API, MCP et UI transmettent un acteur vérifié au même exécuteur d'opérations ; un jeton machine n'est jamais converti en session navigateur pour accéder aux handlers. Filtrer la découverte des outils ne remplace pas le contrôle lors de chaque exécution et au moment de l'écriture.

Conserver invitations, activation, expiration/révocation des sessions, restrictions par compte (autorisé/interdit/hérité) et impersonation administrateur explicite/auditée. Le changement d'hébergement ne doit pas attribuer les comptes à partir d'un email ni copier des sessions locales actives. Qualifier la transmission des cookies, headers et corps par le dispatcher Sites, ainsi que deux comptes Creezio distincts. Le fonctionnement de la porte ChatGPT seule ne valide pas l'authentification native ; les résultats figurent dans [Qualification Sites](QUALIFICATION-SITES.md).

Les mutations métier protègent aussi les champs : montants calculés, snapshots, états dérivés et décisions de paiement ne sont pas modifiables par un CRUD générique, même depuis l'administration. Revérifier les droits au moment de l'écriture atomique lorsqu'une opération a attendu un service externe. Les entrées publiques et webhooks signés ont un contrat distinct de la session utilisateur : signature du corps brut, âge, idempotence, correspondance test/production et périmètre des effets.

Secrets uniquement côté serveur et dans le stockage de secrets approprié ; références opaques dans la configuration. Clés d'extension, connexions R2 et mots de passe ne figurent ni dans Git, ni dans le chat, ni dans les bundles UI, ni dans les journaux. Chaque fork configure ses propres accès.

## 6. Contrat unique des extensions

Chaque extension doit déclarer les éléments suivants, avec schéma et validation automatiques :

| Élément | Contenu du contrat |
|---|---|
| Identité | Identifiant stable, version, compatibilité Creezio, dépendances, éditeur, empreinte de livraison. |
| Configuration | Champs publics, références de secrets, connexions externes, diagnostic et état de disponibilité. |
| Données | Modèles actuels, entités, relations, validation, propriétaires des données, besoins d'initialisation, export et conservation. |
| Opérations | Schémas complets d'entrée/sortie publiés et validés, acteur utilisateur ou machine, droits, contexte, lecture/écriture, idempotence, effets externes et erreurs ; pagination ou références autorisées pour les résultats volumineux. |
| API | Routes et documentation dérivées du registre d'opérations ; aucun contournement des règles métier. |
| MCP | Outils et ressources exposables, schémas découvrables, autorisation et portée ; même exécution que l'API, réponses JSON structurées et compatibilité protocolaire testée. |
| Recherche | Documents/projections, champs indexables, filtres d'accès, synchronisation et reconstruction ; fournisseur sélectionné, dont Meili en extension. |
| Sources assistant | Sources d'entités, contexte courant, relations et outils autorisés ; déclarations liées aux opérations existantes, sans second jeu de handlers métier. |
| UI | Pages administrateur éventuelles, composants front, navigation, onboarding et état non configuré. |
| Widgets | Type et version, données de rendu, lectures/actions autorisées, compatibilité des messages anciens. |
| Événements | Événements émis/reçus, webhooks signés, état persistant, déduplication et opérations de reprise appelables de l'extérieur ; les relances automatiques sont exécutées par le fournisseur/orchestrateur externe. |
| Cycle de vie | Installation, activation, désactivation, mise à jour, désinstallation explicite et sort des données. |
| Validation | Tests de contrat, permissions, initialisation, conservation des données, isolation et intégration réelle du service externe. |

Le contrat de données distingue champs persistés, calculés côté serveur et snapshots en lecture seule ; relations, règles de suppression et projections de lecture restent explicites. Les déclarations d'index servent aux listes/recherches natives ou aux fournisseurs configurés. La recherche de base reste utile sans moteur externe. Meili ajoute ses fonctions avancées ; son indexation est incrémentale, bornée, reprenable et inclut suppressions et reconstruction par génération. Les droits sont appliqués avant résultats, compteurs et facettes.

Une extension est du code de confiance revu et livré avec l'application ; le contrat n'est pas une sandbox garantissant l'isolation de code malveillant. L'ajout de nouveau code nécessite un build et une publication selon le parcours de l'hébergement : demande dans GPT sur Sites, déclenchement possible depuis l'administration sur Docker. Une extension déjà incluse et compatible peut être activée et configurée directement. On ne télécharge pas du JavaScript arbitraire pour l'exécuter dans le Worker en production.

L'API d'extension reste identique qu'elle provienne du catalogue Creezio ou du client. Exemples communs : catalogue produits, Stripe, Meili, n8n, Hermes. Exemples propres à un client : objets et parcours de son métier.

### Écosystème et dépôt de départ

La proposition détaillée est dans [Extensions, thèmes et écosystème](EXTENSIONS-THEMES-ECOSYSTEME.md). GitHub porte sources et contributions ; des paquets compatibles npm portent les versions distribuées ; le catalogue Creezio porte découverte, compatibilité, configuration et mises à jour. Chaque module et thème possède son identité d'éditeur et son origine vérifiée, en plus de sa version. Les modules privés sont pris en charge au même titre que les modules officiels.

Prévoir un dépôt de départ d'extension, utilisable par fork : modèles, opérations, API/MCP, permissions, écran admin, vue front, widget, tests de contrat et documentation. Le même code produit un paquet installable et une démo fondée sur le vrai Creezio, publiable avec ses D1/R2 sur Cloudflare. Une extension installée s'intègre au déploiement de l'application ; le starter n'impose pas un Worker séparé pour chaque module. Le développement d'une extension n'exige pas de forker tout le CMS.

L'objectif public et open source du cœur, du SDK, du starter et du catalogue est confirmé. Le dépôt `creezio/Creezio-D1R2` est public depuis le 26 septembre 2026 et sa [licence MIT](../LICENSE) est matérialisée. MIT est approuvée pour le cœur, le SDK et le starter ; leurs futurs paquets conserveront licence et mentions applicables. La distribution de ces paquets et le produit complet restent à réaliser. Les applications et extensions clientes peuvent rester privées. La filiation du premier fork applicatif public est un jalon distinct du mode de création des dépôts de plugins.

### Deux modules de référence : n8n et Stripe

| | Module n8n | Module Stripe |
|---|---|---|
| Installation | Sélectionner le module, renseigner URL et clé du service, vérifier la connexion. | Sélectionner le module, renseigner les accès Stripe en mode test ou production, vérifier la connexion. |
| Fonctions livrées | Catalogue des workflows autorisés, consultation, déclenchement selon le type de workflow, suivi des exécutions, résultats et erreurs ; gestion couverte par l'API du fournisseur. | Catalogue/prix, clients, sessions de paiement, abonnements et suivi des paiements selon le périmètre publié du module. |
| API Creezio et MCP | Opérations déjà déclarées, typées et autorisées ; utilisables immédiatement depuis l'application et l'assistant. | Même principe ; aucune réintégration du SDK Stripe dans chaque application. |
| Événements | Raccordement guidé des déclencheurs, callbacks/webhooks authentifiés, reprise et déduplication. | Webhooks vérifiés par signature, rapprochement des événements avec l'état du paiement, idempotence. |
| Interface et chat | Configuration, choix des workflows accessibles, lancement et widget de suivi d'exécution. | Configuration, état des paiements et widget approprié ; validation serveur des montants et droits avant action. |
| Preuve | Configurer puis piloter un workflow depuis Creezio ; dans l'autre sens, une planification n8n appelle une opération Creezio sans navigateur par accès machine autorisé, avec résultat et état consultables. Aucun code spécifique ajouté à l'application. | Depuis une application fraîche : configurer, créer un paiement de test, recevoir l'événement et consulter son état via API/MCP/widget sans modifier le code de l'application. |

Le périmètre des opérations disponibles est explicite et versionné ; « prêt à l'emploi » ne veut pas dire exposer sans contrôle toutes les méthodes du fournisseur. La clé est vérifiée et conservée côté serveur. Si le fournisseur exige aussi une URL, un secret de webhook, des droits spécifiques ou une validation dans sa console, le module automatise ce qui est possible et guide précisément le reste. Une connexion réussie ne remplace pas la vérification d'un parcours réel.

Pour n8n, distinguer l'API de gestion des workflows et leurs déclencheurs : la clé de gestion ne suffit pas nécessairement à invoquer un webhook, qui peut avoir sa propre authentification. Les accès éventuellement transmis à n8n font l'objet d'un choix explicite et limité par connexion, avec rotation/révocation ; ne pas synchroniser tout le coffre automatiquement.

Dans le sens **n8n → Creezio**, n8n conserve sa planification et appelle les opérations métier, de traitement par lot ou de reprise autorisées avec un accès Creezio dédié. Le calendrier reste exécuté dans n8n. API et MCP natifs sont disponibles pour les autres clients compatibles selon le même contrat ; aucun scheduler Sites, serveur de cron ou plugin n8n obligatoire dans le socle. La recette distingue bien connexion au fournisseur et autorisation du fournisseur à agir dans Creezio.

**MCP entrant :** viser la spécification publiée **2026-07-28**, sans session de transport obligatoire, avec métadonnées par requête et en-têtes de routage/version conformes. Les opérations bornées peuvent répondre en JSON ; les abonnements et notifications progressives sont des capacités distinctes. Utiliser l'adaptateur Web Request/Response du SDK TypeScript, version figée et validée sous workerd, avec compatibilité stateless testée pour les clients 2025 encore utilisés. Ne pas imposer un canal SSE permanent pour appeler un outil. [Spécification Streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http)

Le handler SDK reçoit uniquement une identité déjà vérifiée : son champ `authInfo` ne valide pas le bearer à la place de Creezio. Contrôler jeton, audience, permissions et contexte avant l'exécution, puis les droits à l'écriture. Valider l'origine lorsqu'elle est présente ; un appel machine sans `Origin` reste possible. CORS concerne les clients navigateur interorigines et ne remplace jamais l'autorisation. Fixer des limites de corps/résultats et un validateur de schéma compatible workerd. Les résultats JSON restent valides et complets dans leur page ; aucun découpage silencieux de la chaîne JSON. [Contrat du handler SDK](https://ts.sdk.modelcontextprotocol.io/v2/api/@modelcontextprotocol/server/server/createMcpHandler.html)

Un client auquel un bearer Creezio a déjà été remis n'a pas besoin d'un consentement interactif à chaque appel. Pour les clients MCP OAuth, fournir découverte de la ressource protégée et du serveur d'autorisation, consentement natif Creezio, PKCE S256 annoncé dans les métadonnées, validation de l'issuer, de la ressource/audience et des redirections, consommation atomique du code, renouvellement/révocation, politiques par client et audit. Prévoir préinscription et Client ID Metadata Documents ; garder l'enregistrement dynamique DCR pour les clients qui en ont besoin, avec limites et protections appropriées. Les outils de navigation/UI s'exécutent dans un client actif autorisé ; les opérations de données restent serveur. Jeton Creezio, secret d'un client OAuth, clé fournisseur et session utilisateur sont distincts. [Autorisation MCP](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)

La recette n8n qualifie sa version réelle : appel HTTP avec bearer, puis nœud MCP Client compatible ; le sous-nœud MCP Client Tool d'un agent se teste séparément s'il est utilisé. Les credentials MCP n8n proposent encore DCR par défaut ou un client préinscrit : vérifier ces parcours sans supposer que tous les clients utilisent déjà le même protocole ou CIMD. Le refus, la révocation et le renouvellement sont testés avec les mêmes permissions applicatives. [Credentials MCP n8n](https://docs.n8n.io/integrations/builtin/credentials/mcp/)

Les callbacks sont exposés sur le Site public et protégés par leur contrat applicatif : autorisation MCP, clé limitée ou signature fournisseur. Ils ne demandent aucune session GPT ni session de navigateur. Tester les fournisseurs réels, la signature, le rejeu et les droits ; l'accès à un Site privé est retiré des points à qualifier. Les résultats de la sonde figurent dans [Qualification Sites](QUALIFICATION-SITES.md).

## 7. Chat et widgets

Le socle fournit conversations, messages, pièces jointes, flux de réponse, rendu des widgets et journal des actions. Le LLM est fourni par le **module OpenAI activé**, avec sa **clé API configurée côté serveur** et le modèle choisi dans sa configuration. L'administrateur active et configure le module ; les utilisateurs autorisés du front ou du chat admin passent par les opérations Creezio, jamais directement par la clé fournisseur. Sans module actif ou clé valide, l'état de configuration est explicite et aucune réponse IA n'est simulée. Le contrat permet d'autres fournisseurs par extensions sans les rendre nécessaires au démarrage du socle.

Un message peut afficher un composant interactif déclaré par une extension : fiche, liste, formulaire, suivi d'exécution ou action métier. Qualifier séparément l'appel réel OpenAI et le transport progressif Worker → front ; une sonde SSE synthétique ne valide ni ne remplace l'intégration du LLM.

Le module OpenAI adapte Responses au contrat fournisseur Creezio : événements typés, appels/résultats d'outils associés, erreurs et état terminal. Les schémas communs sont projetés et validés selon les contraintes du fournisseur, notamment le mode strict ; les collisions de noms et dépassements de limites ne suppriment pas silencieusement des outils. Creezio revalide chaque action proposée par le modèle, ses arguments, ses droits et ses approbations. Les résultats volumineux sont paginés ou référencés. Fixer limites d'entrée/sortie, tours, durée et concurrence ; propager l'annulation avec un signal jusqu'à l'appel fournisseur et persister son état sans annoncer un effet non confirmé. Une interruption du flux ne prouve pas l'arrêt immédiat de tout traitement fournisseur. [Function calling OpenAI](https://developers.openai.com/api/docs/guides/function-calling) · [Streaming Responses](https://developers.openai.com/api/docs/guides/streaming-responses)

**Preuve actuelle limitée :** la sonde Sites a réussi deux appels réels à Responses, une demande forcée de l'outil `qualification_bindings` puis une réponse en mode stream, avec clé configurée en secret d'environnement côté serveur. Le navigateur reçoit les événements SSE synthétiques groupés ; une autre sonde vérifie que des lectures concurrentes des étapes persistées dans D1 permettent de suivre un appel encore en cours. Prévoir cet adaptateur de transport avec écritures groupées, curseur, autorisations et consultation bornée depuis le client actif. Ce n'est pas un ordonnanceur serveur. Le module Creezio complet, ses chats admin/front, widgets, annulation et reprise restent à implémenter et tester. Les résultats détaillés restent dans [Qualification Sites](QUALIFICATION-SITES.md).

Deux interfaces utilisent ces services : le chat administrateur standard de Creezio et le chat applicatif librement dessiné dans le front. Partager un moteur n'implique pas de partager les conversations, les outils accessibles ou les droits. Le contexte d'administration ne doit pas être transmis au chat d'un client. Une app peut personnaliser son rendu sans copier le backend des conversations ni remplacer le chat de l'administration.

Le modèle choisit un type de widget autorisé et des données validées ; il ne produit pas du code exécutable. Le widget appelle l'opération serveur déclarée. Le backend revérifie l'utilisateur, l'espace de données, les droits et la version de l'objet au moment du clic. Une confirmation supplémentaire dépend de l'effet réel de l'action.

Le widget prévoit une ressource MCP Apps portable et son raccordement au chat Creezio ; les particularités ChatGPT restent dans l'adaptateur d'hôte. Les skills du module accompagnent les outils et le paquet de plugin. OAuth délégué relie ChatGPT aux comptes Creezio pour les données protégées ; ne pas remplacer ce parcours par la clé du module OpenAI ou par un token machine demandé au client ChatGPT. Voir le [contrat de compatibilité](COMPATIBILITE-CHATGPT.md) pour les métadonnées, ressources, droits, formats de paquet et critères de publication.

Tester le rafraîchissement, la réouverture d'une ancienne conversation, les droits retirés, les objets supprimés, les clics répétés et les résultats d'action périmés. La version du widget est conservée dans le message ; les versions anciennes ont une compatibilité ou un rendu de repli explicite. WebMCP, si disponible dans le navigateur, est un adaptateur supplémentaire ; il ne remplace pas MCP distant et ne donne aucun droit supplémentaire.

Le SDK de front fournit les états de conversation et d'action, indépendamment du thème : brouillon, historique, recherche, archivage/restauration, pièces jointes, streaming, erreurs et reprise. Les parcours à étapes conservent progression, correction, pause/reprise et validations humaines. Le widget distingue snapshot du message et état actuel de l'objet. Les panneaux contextuels, liens profonds et retour au chat ne perdent pas la page ou la conversation active. Les thèmes ne réimplémentent ni l'orchestration ni les autorisations.

Version de schéma du widget, révision de son état interactif et version de l'objet métier sont distinctes. Les anciens messages ne sont pas réécrits à chaque mutation. Les résultats volumineux d'outils sont paginés ou consultables par référence autorisée ; une troncature silencieuse ne vaut pas résultat complet. Les caches et stockages de navigateur sont séparés par utilisateur, surface admin/front et espace de données, puis invalidés lors d'une révocation ou déconnexion.

## 8. Appels externes, suivi et intégrations

**Décision acquise : la planification est externe.** n8n ou un autre service déjà disponible gère calendriers, récurrences et relances, puis appelle Creezio par API avec jeton ou par MCP autorisé. Le socle n'embarque aucun scheduler, daemon, cron ni boucle de polling pour se réveiller seul. Rechercher un Cron Trigger ou une Queue native Sites n'est pas un prérequis du produit. Cette séparation reste la même sur Docker et Cloudflare direct.

Creezio reçoit l'appel, vérifie l'acteur et les droits, exécute une opération bornée et conserve son résultat. Données des tâches, dates d'échéance, demandes, approbations, boîte d'envoi, progression et journaux restent natifs. Un traitement long s'effectue dans le service concerné, ou progresse par appels bornés successifs du client externe avec état enregistré. Une nouvelle tentative arrive par un nouvel appel externe, un callback ou une action explicite autorisée ; une simple ligne en attente ne promet pas un réveil autonome.

Les exécutions sont identifiées, reprenables et dédupliquées ; les mécanismes de concurrence, expiration et annulation protègent les appels reçus. Un `Map`/`Set` en mémoire ne constitue pas l'état d'une exécution. Les appels de reprise vérifient l'état courant avant de reprendre un travail interrompu. Le flux de chat transmet des événements dont la progression persistée peut être relue après reconnexion. Retirer le scheduler ne retire ni la persistance ni les garanties des opérations.

Vérifier le résultat du claim atomique : seule la requête ayant effectivement acquis le travail peut déclencher l'effet externe. Utiliser une clé d'idempotence fournisseur lorsqu'elle existe. Après une rupture sur un envoi, paiement ou déclenchement n8n, conserver un état incertain et réconcilier avant de recommencer. La déduplication D1 ne garantit pas à elle seule qu'un fournisseur n'a pas déjà exécuté l'action.

Les extensions annoncent leurs besoins : HTTPS, webhooks, service de planification/exécution externe ou stockage externe. Des tâches longues, agents Hermes, automatisations n8n ou navigateurs distants vivent dans leurs services respectifs ; Creezio reçoit progression, résultat et erreurs. Si aucun service externe n'est configuré, tâches humaines, brouillons et suivi restent utilisables ; seule l'automatisation qui en dépend est indisponible explicitement.

La messagerie conserve notamment boîte d'envoi durable, reprises, pièces jointes, réception et webhooks. Les transports SMTP/IMAP dépendant de connexions non disponibles sur Sites passent par un fournisseur ou une passerelle externe. Une intégration ne sera pas déclarée validée sur la seule base de réponses simulées.

Envoi différé, reprise de la boîte d'envoi et reconstruction/indexation volumineuse exposent des opérations bornées appelables par l'orchestrateur externe ; ils ne recréent pas un moteur central qui les planifie. Les mutations venues de l'extérieur sont visibles dans les conversations, widgets et vues à leur actualisation/reconnexion. Ouvrir un onglet, afficher une notification ou garder une session UI active n'est jamais nécessaire pour exécuter une opération métier machine. Les validations humaines déjà requises restent vérifiées côté serveur.

## 9. GitHub, fork et mises à jour

### Filiation réelle

Le dépôt original `creezio/Creezio-D1R2` est public et sous [licence MIT](../LICENSE). Le premier dérivé sera le véritable fork GitHub public **`Creez-io/Creezio-Lab`**, destination approuvée. Il sera créé seulement après structuration et validation du socle, puis vérifié par `fork`, `parent` et l'ancêtre Git commun. Aucun fork n'est encore créé. Une copie par template ne répond pas à ce jalon. L'original reste sous `creezio` ; aucun transfert ni changement d'offre ou de politique d'organisation n'est demandé.

Un fork GitHub d'un dépôt public reste public. Une application cliente dont les sources doivent rester privées utilise donc un dépôt indépendant, qui conserve explicitement l'origine Creezio, la version du socle, la composition et le parcours de mise à jour. Cette filiation documentée n'est pas présentée comme un vrai fork GitHub. La preuve sur deux Sites conserve le véritable fork public de test demandé. Les Sites A et B sont publics par choix utilisateur ; les droits et données applicatifs restent protégés indépendamment de la visibilité des sources.

### Propriété des fichiers

Les versions du socle, du contrat et des extensions sont enregistrées dans un manifeste de livraison. Les répertoires de l'application lui appartiennent. Les évolutions du front de départ deviennent disponibles à comparaison ; elles ne remplacent pas le front personnalisé.

Pour les fichiers communs, comparer version d'origine, état local et nouvelle version. Une modification locale incompatible produit un conflit explicite et bloque l'application automatique ; elle n'est pas écrasée. Composer les dépendances et le lockfile en respectant les modules et modèles de données de l'application.

### Mises à jour individuelles

Une extension ou un thème peut être mis à jour séparément : sélectionner sa version, vérifier origine/compatibilité/dépendances, fixer la résolution, construire et publier l'application complète, puis vérifier les opérations concernées. Les versions non concernées restent inchangées ; les dépendances transitives indispensables sont présentées. Une version exigeant un nouveau socle ne le met pas à jour silencieusement. Ce parcours ne remplace pas la mise à jour du socle du fork ; les deux sont testés.

Le catalogue distingue présence du paquet, activation, configuration et fonctionnement. Activer un module déjà inclus n'est pas installer une nouvelle version. La désactivation conserve ses données ; la désinstallation ne les efface pas implicitement. L'origine effective du code, workspace ou paquet verrouillé, est unique et visible. Les hooks et emplacements de composants documentés évitent de modifier les fichiers internes du CMS.

### GPT Sites : demande et exécution dans GPT

L'utilisateur demande la mise à jour, ou une tâche GPT explicitement configurée porte cette demande. GPT prépare la version, contrôle les personnalisations, vérifie données et dépendances, exécute les tests, publie sur le même Site puis vérifie le résultat. L'utilisateur dispose du compte rendu et peut contrôler son application. Aucune tâche n'est créée par ce plan.

Le back-office affiche la version et les informations utiles. Il ne déclenche pas la publication Sites ; aucun pont de publication depuis l'application n'est à développer ou à rechercher pour cette cible. Ce parcours s'applique aussi à l'ajout de modules qui nécessitent du nouveau code.

### Docker : déclenchement depuis le back-office

Le back-office local doit proposer **Publier sur Cloudflare** : connecter le compte avec les droits nécessaires, préparer les ressources de l'application, construire Worker/assets, transférer D1/R2, raccorder bindings/secrets et auth, publier puis vérifier. L'exécuteur local orchestre ces opérations ; un simple `wrangler deploy` ne copie pas le contenu local des bases et buckets. Tester interruption/reprise et production fonctionnelle après arrêt du local. Le parcours détaillé et les sources officielles sont dans le [dossier d'hébergement](STOCKAGE-ET-HEBERGEMENT.md).

Le parcours obligatoire utilise Docker comme environnement local de développement et de publication. Une application conservée dans Docker avec données Cloudflare constitue une variante distincte ; le remplacement d'images Docker de production ne doit pas retarder ni se substituer à la preuve local → Workers. L'interface administrateur locale n'obtient pas un accès Docker général. Tester échec/reprise et retour à une version de code compatible ; le retour au code précédent ne restaure pas les données.

## 10. Lots d'implémentation et critères de sortie

| Lot | Travail | Preuve nécessaire avant la suite |
|---|---|---|
| 0 — Spécification et contraintes | Détailler capacités et interactions ; formaliser SQL central généré, comptes natifs, licence MIT et filiation publique/privée. Définir les prototypes et vérifier les contrats Sites/Workers. | Décisions acquises traduites en contrats ; MIT matérialisée, destination du futur fork `Creez-io/Creezio-Lab` approuvée. Les preuves de qualification sont consignées séparément et ne valent pas validation du socle complet. |
| 1 — Socle démarrable et qualification | Structure, profils de build, identité, modèles, D1/R2 et première interface ; prototype de panneaux React stables avec routeur isolé, puis local, Site A et Workers direct, transfert et auth. | Même tranche fonctionnelle réellement exécutée sur les cibles avant extension du socle ; deux fiches, brouillons, scroll, historiques, navigation interrompue et révocation qualifiés ; donnée/fichier persistés, copie contrôlée et production indépendante du local. Réutiliser les environnements. |
| 2 — Sécurité et opérations | Identités, rôles, contextes de données, modèles et initialisation, registre d'opérations, audit, API et MCP moderne avec compatibilité des clients retenus. | Même opération et mêmes permissions depuis les différents canaux sans fabriquer de session machine ; schémas, pagination JSON et OAuth qualifiés avec clients réels ; refus prouvés, absence de fuite entre contextes, installation sur base neuve et conservation des données après republication. |
| 3 — Contrats et développement d'extensions | Manifestes, validation, SDK, cycle de vie, événements, projections, configuration, catalogue et diagnostics. Préparer le starter avec paquet et démo fondée sur le même code. | Extension créée à partir de la documentation, installée sans recoder API/MCP/chat, versionnée et désactivée sans perte de données ; incompatibilité bloquée ; code optionnel absent du socle minimal. |
| 4 — Interfaces et chat | Construire le back-office Creezio et son workspace/chat complets ; front remplaçable, thèmes standard et ChatGPT-like, composants réutilisables, conversations, fournisseur IA et widgets. | Toutes les interactions administratives spécifiées vérifiées ; thème du front interchangeable sans modification de l'admin ; utilisateur applicatif exclu de l'administration ; widget réel lisant/modifiant un objet avec trace serveur ; conversation persistante et réouverture cohérente. |
| 5 — Capacités et extensions communes | Construire les fonctions par groupes : données/configuration ; productivité/chat ; connecteurs/agents ; exploitation/développement externe. Construire n8n et Stripe comme deux modules de référence prêts à configurer, puis Meili et les autres modules selon la matrice. | Installation + accès fournisseur suffisent pour obtenir les API, MCP, événements et widgets prévus, sans intégration spécifique dans l'app. Chaque ligne de la matrice dispose d'une preuve ou d'une dépendance externe précisément identifiée. Aucun composant incompatible ne rentre dans le bundle du socle. Les fonctions annoncées opérationnelles sont testées réellement. |
| 6 — Distribution et mises à jour | Manifeste de release, propriété des fichiers et identité des déploiements. Parcours GPT pour Sites ; depuis Docker local, publication Workers + assets + D1/R2 puis mises à jour préservant la production. | Site A mis à jour dans GPT. Cloudflare direct : reprise des transferts, absence de collision des ressources, conflit d'édition explicite, données de production conservées. |
| 7 — Release et véritable fork | Après validation du socle, stabiliser l'original, publier une release, créer le fork public `Creez-io/Creezio-Lab` et enregistrer Site B ; personnaliser le front et développer l'extension « demandes ». | Deux URLs actives, filiation GitHub vérifiée, persistance et identités de déploiement indépendantes ; démarrage du fork par le parcours standard. |
| 8 — Recette comparative et écosystème | Nouvelle release sur A, mise à jour de B dans GPT. Puis nouvelle version d'une seule extension et mise à jour ciblée ; installation dans B du paquet issu du starter. | Socle puis module de B actualisés séparément ; autres versions, front, extension privée, modèles et données préservés. Démo du starter publiée sur Cloudflare et même paquet exercé dans B ; compte rendu avec versions et preuves. |
| 9 — Validation utilisateur | Présenter les deux Sites et la démonstration reproductible, ainsi que le parcours de développement Docker → production Cloudflare. | Validation avant la construction d'autres applications métier. |

Chaque lot produit du code, sa documentation, des vérifications pertinentes et un état des limites. Les tests locaux de contrat ne remplacent pas la recette hébergée. Les deux Sites sont réutilisés ; pas de multiplication des déploiements et copies de travail à chaque essai.

## 11. Première application dérivée : Creezio Lab

Proposition de métier volontairement neutre : des demandes contenant titre, description, statut et pièce jointe. Une extension cliente apporte les modèles de données, API, outils MCP et un widget permettant de consulter puis modifier une demande selon les droits.

Le front du fork utilise le thème ChatGPT-like, avec son propre écran d'accueil et son organisation conversationnelle. Son administration reste Creezio, avec le même chat et le même comportement d'onglets que l'original. Une extension commune de recherche Meili, si configurée, indexe les demandes avec les droits ; le même contrat fonctionne sans cette extension et annonce clairement l'absence de recherche Meili.

Cette application prouve simultanément : ajout d'une extension cliente, réutilisation d'une extension commune, remplacement du front, persistance D1/R2, API/MCP/widget partagés, distinction administrateur/utilisateur et compatibilité avec les mises à jour.

## 12. Recette obligatoire sur les deux Sites

| Scénario | Résultat exigé |
|---|---|
| Installation de l'original et du fork | A et B démarrent par le processus documenté, sans réparation manuelle des sources. |
| Site public et accès autorisés | Front accessible sans compte GPT ; opérations et données protégées exigent selon le canal une session utilisateur, un accès API/MCP machine ou une signature fournisseur valide. Absence de cookie compatible avec un appel machine autorisé ; aucun accès anonyme implicite. |
| Absence de services optionnels | Le socle, les données et l'administration fonctionnent sans Meili, Hermes ou n8n. Les fonctionnalités nécessitant une extension absente sont explicites. |
| Administration distincte | Un compte applicatif ne peut accéder aux écrans ou opérations d'administration, même en appelant directement l'API. Tester avec deux comptes Creezio réellement distincts sur Site public. |
| Conservation de l'interface admin | Réexécuter les scénarios d'onglets, navigation, état des panneaux et chat établis depuis l'original. Même administration standard sur A et B ; aucune fonctionnalité retirée silencieusement. |
| Conservation des vues et routeur | Panneaux React stables : deux objets du même module, filtre/query, montage et brouillon conservés, scroll/focus, cible froide et transition interrompue. Portails inactifs neutralisés, données actualisées après widget, caches vidés à la révocation/changement de session. Aucun contexte privé de routeur exposé au SDK ; vérifier navigateur et build Worker. |
| Thèmes et chats | Passer du thème standard au thème ChatGPT-like, conserver conversations et droits ; les personnalisations du chat client ne modifient pas le chat Creezio de l'administration. |
| Persistance | Données et fichiers demeurent après rafraîchissement, nouvelle session et nouvelle publication ; sauvegarde/restauration éprouvée sur données de test. |
| Docker local autonome | Sans compte Cloudflare : initialisation, lecture/écriture, fichiers, arrêt/redémarrage et recréation du conteneur conservant ses volumes ; intégrité et restauration testées. |
| Production Cloudflare complète | Depuis le local, publier original et fork avec identités propres : Worker, front/back-office, D1 et R2. Vérifier contenu transféré, droits, URL de production, indépendance du local et conservation des données de production lors de la mise à jour suivante. |
| Docker avec Cloudflare | Connexion guidée, sélection des ressources, mêmes opérations et droits ; données réellement dans le compte choisi ; erreur explicite si accès révoqué, sans repli sur une autre base. |
| Isolation entre A et B | Ressources de données, accès, secrets et fichiers indépendants ; mêmes identifiants d'objets dans les deux Sites sans fuite. |
| Cloisonnement dans un Site | Deux contextes applicatifs partagent le même D1/R2 ; droits serveur, conversations, requêtes, fichiers et actions empêchent tout accès croisé. Aucun provisionnement de ressources supplémentaires. |
| Ressources distinctes sur Docker | Une extension sélectionne deux ressources D1/R2 réellement distinctes avec les droits attendus, tout en conservant un runtime applicatif commun. Recette séparée du stockage partagé Sites. |
| Extension cliente | Modèles, entités, relations, permissions, API, MCP et widget réellement utilisables sur B. |
| Extension commune | n8n et Stripe configurés sans modification de code de l'application ; API/MCP/widget disponibles ; workflow et paiement de test réellement exécutés ; diagnostic d'échec et retrait sans corruption. |
| Fonctions natives sans moteur externe | Tâches humaines, brouillons, tickets, CRM, landing et navigation utilisables d'origine ; seule une action qui nécessite un fournisseur absent est indisponible. |
| MCP et entrées publiques | Réponses JSON avec client moderne et clients 2025 retenus ; schémas complets, pagination et limites vérifiés. Bearer natif et OAuth testés : découverte, PKCE, issuer/audience, consentement, préinscription/DCR selon client, renouvellement, révocation et refus de rejeu. Webhook brut signé accessible sans session navigateur, rapprochement test/live et rejeu contrôlé. |
| Planification externe | Une tâche n8n planifiée appelle une opération Creezio réelle sans navigateur ouvert ; API avec jeton et client MCP compatible vérifiés, mêmes droits/contextes, résultat persisté puis visible au retour dans l'UI. Refus après révocation ou portée incorrecte, rejeu sans double effet. L'accès entrant natif fonctionne sans plugin n8n installé ; aucun scheduler Creezio lancé. |
| Modèles et droits fins | CRUD générique incapable de modifier les champs calculés ; droits revérifiés lors de l'écriture ; compatibilité des données contrôlée avant publication. |
| Chat | Module OpenAI activé avec clé API serveur et appel LLM réel dans les chats admin/front ; progression navigateur mesurée, annulation et état final vérifiés ; outil puis widget, action autorisée et refus d'action interdite, trace d'audit. Schémas et résultats structurés valides ; configuration absente/invalide signalée, aucun HTML/JS arbitraire du modèle. Les deux appels réussis de la sonde ne suffisent pas à cette recette. |
| Concurrence et reprises | Clic doublé, requête rejouée, version périmée, service externe indisponible, tâche interrompue : erreurs et reprises correctes. |
| Mise à jour Sites | Nouvelle release Creezio sur A ; demande dans GPT pour B ; publication puis vérification ; extension cliente toujours présente, front personnalisé et données intacts. |
| Mise à jour d'un plugin | Seule la version sélectionnée et ses dépendances nécessaires évoluent ; contrôle de compatibilité et d'origine ; API/MCP/widget exercés après republication, autres versions et données inchangées. |
| Starter communautaire | Développer depuis le dépôt de départ, publier sa démo Cloudflare, installer le même paquet dans le fork et le mettre à jour sans modifier les fichiers internes du CMS. |
| Thèmes et headless | Personnalisation conservée à la mise à jour du thème ; front distinct utilisant SDK/API avec ses droits ; backend et administration communs. |
| Déclenchement local | Depuis le back-office local, publication et mise à jour de la cible Cloudflare, vérification et compte rendu ; aucune dépendance de la production au Docker local. |
| Échec de mise à jour | Conflit de personnalisation ou incompatibilité avec les données détecté avant application ; aucun succès annoncé avant publication vérifiée ; procédure de reprise testée. |
| Poids/runtime | Build minimal sans code des services externes ; démarrage et routes critiques testés dans les contraintes réelles Workers/Sites. |

Pour chaque preuve : URL, versions, SHA, date, acteur, données de test, résultat attendu/obtenu et limites. Une capture d'écran seule, une CI verte, un healthcheck ou une réponse mockée ne suffisent pas à valider un parcours complet.

## 13. Pré requis à traiter au moment utile

- Au jalon prévu, vérifier les droits de création et la disponibilité du nom approuvé `Creez-io/Creezio-Lab`, puis créer le vrai fork public après validation du socle. La destination et la licence MIT ne sont plus des questions ouvertes ; aucun transfert de l'original n'est prévu.
- Accès au compte Sites courant pour deux installations distinctes ; réutiliser le Site de qualification pour A si adapté, créer B au jalon du fork.
- Comptes Creezio de test administrateur et utilisateur distincts ; Sites publics, sans connexion GPT.
- Clé API OpenAI de qualification déjà configurée côté serveur dans la sonde ; configurer explicitement les accès propres aux futurs Sites A/B et aux autres extensions démontrées, sans recopier implicitement le secret de la sonde ni des secrets de production.
- Environnement Docker de test, notamment pour ressources D1/R2 distinctes et parcours de mise à jour. Aucune capacité multiressource requise sur GPT Sites.
- Compte Cloudflare et accès de test autorisés pour publier Workers/assets et ressources D1/R2, vérifier le transfert et l'indépendance de la production. Docker local avec Miniflare doit fonctionner pour le développement sans ces accès.

Ces points ne demandent pas de redéfinir le métier des applications. L'absence d'un secret d'extension ne bloque pas le développement du socle ; elle empêche de déclarer cette intégration validée en conditions réelles.

## 14. Références et limites de cette conception

Le runtime, les bindings D1/R2, l'authentification et la publication utilisent les capacités effectivement disponibles dans GPT Sites. Les vérifications de plateforme du lot 0 restent nécessaires. La publication Sites est effectuée dans le parcours GPT, hors du runtime de l'application.

Sources techniques primaires :

- [Compatibilité Node dans Workers](https://developers.cloudflare.com/workers/runtime-apis/nodejs/) et [flags de compatibilité](https://developers.cloudflare.com/workers/configuration/compatibility-flags/) : ne pas assimiler présence d'un module à capacité d'exécuter un processus système.
- [API Web du runtime Workers](https://developers.cloudflare.com/workers/runtime-apis/web-standards/) : contraintes de code dynamique et choix de compilation des extensions.
- [Limites D1](https://developers.cloudflare.com/d1/platform/limits/) : requêtes et paramètres bornés ; les limites réellement disponibles sur Sites restent à vérifier.
- [Accès applicatif à D1 par API Worker](https://developers.cloudflare.com/d1/tutorials/build-an-api-to-access-d1/) : distinguer API de données et API administrative de gestion Cloudflare.
- [Forks GitHub](https://docs.github.com/en/pull-requests/reference/forks) et [API de création de fork](https://docs.github.com/en/rest/repos/forks) : filiation, propriétaires et règles de visibilité.

**État de construction :** le socle complet et le fork applicatif de recette restent à construire. La qualification technique isolée est suivie dans [Qualification Sites](QUALIFICATION-SITES.md) avec ses résultats et limites ; sa réussite éventuelle ne remplace pas la recette des deux applications complètes.
