# Développement local et publication de Creezio

Vérification documentaire du 26 septembre 2026. Ces parcours font partie du produit. La faisabilité des composants est documentée ; leur intégration dans Creezio reste à réaliser et tester.

## Parcours d'hébergement

| Parcours | Application | Données et fichiers | Accès |
|---|---|---|---|
| GPT Sites | Runtime du Site, backend/back-office/front | D1 et R2 fournis nativement au Site | Compte Sites ; aucune clé Cloudflare personnelle nécessaire. |
| Développement local Docker | Worker exécuté localement avec Miniflare/workerd | D1/R2 locaux persistants dans des volumes | Aucun compte Cloudflare nécessaire. Ce parcours sert au développement et aux tests. |
| Production Cloudflare | Backend, API, back-office et front sur Workers avec Static Assets | D1 et R2 dans le compte Cloudflare choisi | Connexion Cloudflare guidée, jeton avec droits nécessaires et identifiant de compte. |

Le parcours principal depuis Docker est **développer et tester localement, puis publier l'application entière avec ses données et ses fichiers sur Cloudflare**. La production ainsi publiée ne dépend plus du Docker local ; son arrêt ne doit pas interrompre le service.

L'accès depuis une application restant dans Docker à des D1/R2 Cloudflare demeure une possibilité distincte. Il ne constitue pas à lui seul le passage en production complet demandé et ne doit pas remplacer ce dernier dans la recette.

Le code métier, les modèles, les modules et les contrats restent communs. Les adaptateurs encapsulent les différences d'hébergement. Les clés et identités du compte de développement ne sont pas intégrées au code livré à chaque fork.

Les profils de build Sites et Cloudflare direct partagent une source, un lockfile et l'authentification native Creezio. Leurs conventions de packaging, portes d'accès d'hébergement, ressources et déclencheurs restent distinctes. La présence de D1/R2 sur les deux plateformes ne prouve pas l'équivalence de ces capacités. Qualifier une tranche fonctionnelle sur chaque cible avant de développer toutes les interfaces ; consulter [Qualification Sites](QUALIFICATION-SITES.md) pour les preuves et limites hébergées.

## Authentification native et porte d'accès Sites

Creezio fournit ses propres comptes et sessions pour le front et l'administration, avec droits distincts. La politique d'audience de Sites constitue une couche préalable indépendante :

- **Site privé :** l'utilisateur franchit la porte ChatGPT de l'hébergement, atteint le front, puis se connecte à son compte Creezio pour les fonctions protégées.
- **Site public :** l'utilisateur atteint directement le front, puis utilise la même connexion native Creezio.
- **Docker local et Cloudflare direct :** la connexion native Creezio protège les fonctions applicatives ; aucune identité ChatGPT n'est requise par le produit.

Une identité ChatGPT ou ses headers ne créent jamais automatiquement un compte, une session ni des permissions Creezio. Le Site peut rester privé ; il n'est pas nécessaire de le rendre public pour implémenter des comptes applicatifs. Pour les clients machine, qualifier séparément l'accès à l'hébergement et l'autorisation API/MCP ou la signature de webhook, sans distribuer un accès technique global au navigateur.

## SQL central de création et d'évolution

Décision acquise : l'outillage central génère et inspecte le SQL de création et d'évolution à partir des modèles déclarés, le versionne avec la source et suit son application. Sur Sites, ces artefacts sont ceux du parcours Drizzle documenté, appliqués avant le code. Ils ne sont pas des scripts confiés aux modules. L'installation neuve et les mises à jour sont testées séparément ; aucune republication ne réinitialise les données. Une évolution incompatible ou destructive non résolue bloque la livraison. Revenir au code précédent ne réécrit pas l'historique SQL appliqué.

Les services tiers connectés par plugins, notamment n8n/Hermes/Meili, ne font pas partie des ressources à déployer. Creezio ne gère ni leur hébergement ni leur maintenance ; le compte utilisateur fournit les accès à un service existant.

## Projets officiels et capacités vérifiées

- [Miniflare dans cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk/tree/main/packages/miniflare) : exécution locale avec implémentations D1/R2 et persistance. Son rôle dans Creezio est le développement/test, conformément à la présentation officielle.
- [cloudflare/workerd](https://github.com/cloudflare/workerd) : runtime JavaScript/Wasm des Workers utilisé notamment par Miniflare.
- [Wrangler dans cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler) : publication du Worker et gestion des ressources Cloudflare.
- [cloudflare/vinext](https://github.com/cloudflare/vinext) : prise en charge des applications React avec API Next.js et intégration Workers ; [adaptateur Cloudflare](https://github.com/cloudflare/vinext/tree/main/packages/cloudflare).

Cloudflare documente l'hébergement d'applications full-stack : code serveur Worker et ressources statiques du front sont publiés ensemble. D1/R2 sont raccordés au Worker par bindings natifs. Une production entièrement sur Cloudflare n'a donc pas besoin d'une passerelle HTTP supplémentaire simplement pour accéder à ses propres D1/R2.

Sources : [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/), [applications full-stack](https://developers.cloudflare.com/workers/static-assets/routing/full-stack-application/), [Vinext](https://github.com/cloudflare/vinext).

## Action « Publier sur Cloudflare » depuis l'environnement local

Le back-office local propose un parcours guidé, traité par un exécuteur local de livraison. Il ne demande pas au développeur de recoder le déploiement dans chaque fork.

1. **Connecter le compte.** Renseigner un jeton Cloudflare adapté et choisir le compte cible. Vérifier les droits nécessaires à Workers, D1 et R2 ; ajouter ceux du domaine seulement si cette option est choisie. Les droits utiles à la création de ressources ne sont pas déduits de la seule présence d'une clé.
2. **Préparer la destination.** Définir l'identité de l'application et ses ressources propres ; afficher la destination et ce qui sera créé/utilisé. Un fork reçoit ses propres identifiants. Ne pas écraser une installation existante en réutilisant silencieusement un nom.
3. **Préparer une copie cohérente.** Stabiliser les écritures locales pendant la capture des données et fichiers. Inventorier les ressources, objets, tailles et empreintes ; conserver une trace de progression pour reprendre un transfert interrompu.
4. **Construire l'application.** Produire le Worker et les ressources du front/back-office depuis une révision précise et vérifier le build. Docker et les outils locaux ne sont pas envoyés comme runtime de production.
5. **Transférer D1.** Exporter les modèles et données de l'installation locale Creezio, puis les importer dans une base cible neuve prévue pour cette publication. Les commandes D1 officielles permettent l'export local et l'exécution/import distant. Vérifier relations, volumes et contenu ; adapter le découpage aux limites documentées.
6. **Transférer R2.** Lire les objets via les interfaces de stockage, envoyer les fichiers dans le bucket cible et conserver clés, métadonnées et références D1. Vérifier tailles et empreintes. Ne pas copier directement le répertoire interne Miniflare en supposant qu'il constitue un bucket Cloudflare.
7. **Configurer et publier.** Raccorder les bindings D1/R2 et les secrets de production, configurer les comptes et sessions natifs Creezio pour la destination, publier le Worker et ses assets. Démarrer sur une URL workers.dev, puis un domaine personnalisé si demandé.
8. **Vérifier la production.** Connexion, droits, onglets, chat, modules, lecture/écriture D1 et accès R2. Présenter l'URL, la version et le résultat. Arrêter le runtime local de test pour prouver l'indépendance de la production.

L'application reste protégée pendant la préparation ; le compte rendu ne déclare pas une publication réussie tant que les vérifications finales ne passent pas. Un échec conserve les données locales et l'état du transfert pour reprendre sans dupliquer les ressources ni effacer la destination.

### Données, identités et secrets à transférer

Le manifeste de publication distingue données applicatives, fichiers, paramètres et états transitoires. Préserver les identifiants internes et les relations ; exclure sessions actives, codes OAuth, consentements/jetons liés à un environnement, travaux de démonstration et exécutions en cours non transférables. Une copie SQL brute de toutes les tables n'est pas une politique suffisante. La recette vérifie chaque catégorie exclue ou transférée.

Les utilisateurs gardent leur identité interne Creezio ; les paramètres de session de production sont propres à la destination. Ne pas rattacher automatiquement des comptes par adresse email ou identité ChatGPT ni accepter en production des en-têtes d'identité de développement. L'administrateur de production utilise un parcours d'activation contrôlé ; aucune identité de démonstration ne devient propriétaire par défaut.

Le coffre peut contenir des secrets chiffrés avec une clé locale : copier seulement ses lignes ne suffit pas. Prévoir sélection des connexions à transférer et rechiffrement avec une clé propre à la destination, ou saisie guidée des accès de production. Ne pas copier indistinctement les accès de test. Les clés de chiffrement restent hors du dump applicatif. Les accès Cloudflare permettant de publier restent dans l'exécuteur local et ne deviennent pas des secrets utilisables par le Worker de l'application.

Le transfert R2 vérifie clé, taille, empreinte du contenu et métadonnées ; un ETag n'est pas supposé être universellement une empreinte du contenu. Le journal de reprise identifie source, destination et capture cohérente. Une ressource cible non vide inattendue provoque un arrêt explicite ; reprendre n'autorise pas à remplacer ses données. La gestion des échecs entre D1, R2, secrets et code n'est pas une transaction unique.

Ce mécanisme copie une installation Creezio vers son hébergement de production. Il ne transforme pas un autre modèle de données et n'ajoute aucun script de transformation entre versions dans les modules.

## Première publication et mises à jour

La première publication comprend explicitement application, données et fichiers de cette installation. Une publication de code seule ne copie pas automatiquement le contenu D1/R2 : le parcours Creezio doit orchestrer ces opérations séparées.

Une fois la production utilisée, elle devient la référence pour ses données. Une mise à jour de code conserve les données de production et ne réimporte pas aveuglément le jeu local de développement. Les personnalisations du fork, la configuration et les accès restent propres à l'application. Toute incompatibilité détectée bloque la mise à jour automatique.

Mettre à jour une seule extension change sa résolution et ses dépendances nécessaires, puis republie l'application complète. Cela ne remet pas les données à zéro et ne met pas à jour les services tiers. Le starter d'extension suit le même parcours pour sa démo ; le paquet distribuable reste distinct de cette installation.

Les commandes de déploiement s'exécutent dans l'environnement local ou un exécuteur explicitement configuré. Le Worker hébergé ne reçoit pas une chaîne de compilation ni un droit général d'auto-publication. Aucun pont de publication depuis le back-office GPT Sites n'est requis : Sites conserve le parcours demande utilisateur/tâche GPT, publication puis vérification.

Si l'application est conservée dans un hébergement Docker, le déclenchement de sa mise à jour depuis le back-office reste pris en charge par l'exécuteur de cet hébergement. Miniflare local n'est pas présenté comme sa distribution de production.

## Connexion à des données Cloudflare depuis Docker

Cette variante utilise les mêmes modèles et opérations, mais un transport différent des bindings Worker natifs :

- **D1** : la documentation recommande une API Worker authentifiée pour un trafic applicatif externe ; l'API REST Cloudflare convient surtout à l'administration. Le connecteur Creezio prend en charge le raccordement, sans intégration métier à refaire.
- **R2** : API compatible S3, endpoint du compte et identifiants adaptés ; configuration guidée et secrets côté serveur.

Sources : [D1 depuis une application externe](https://developers.cloudflare.com/d1/tutorials/build-an-api-to-access-d1/), [API R2](https://developers.cloudflare.com/r2/api/), [authentification R2](https://developers.cloudflare.com/r2/api/tokens/).

## Recette requise

- GPT Sites original et véritable fork : démarrage, D1/R2 natifs, interfaces et mise à jour via GPT toujours requis.
- Local : démarrage sans clé Cloudflare, données persistantes après redémarrage du conteneur et fonctions métier identiques.
- Cloudflare direct : application originale puis fork publiables avec identités propres ; backend, back-office et front réellement servis par Workers.
- Passage local → Cloudflare : données, relations, fichiers et métadonnées vérifiés, accès de production configurés ; interruption/reprise contrôlée et aucune altération de l'installation locale.
- Indépendance : production fonctionnelle après arrêt de Docker local.
- Mise à jour : créer aussi des données directement en production, publier une évolution du code, vérifier qu'elles sont conservées ainsi que les personnalisations du fork.
- Sécurité fonctionnelle : clés invalides, permissions insuffisantes, ressources déjà existantes, URLs de fichiers privées et absence de fuite interapplications.
- Identités/secrets : connexion native Creezio après publication, sessions locales inutilisables, coffre lisible avec la clé de destination et absence d'accès de publication dans le Worker. Sur Sites privé, l'accès GPT seul ne vaut jamais session Creezio ; ne pas modifier l'audience pour réaliser ce test.

## Capacités Sites restant à qualifier

- Plusieurs D1/R2 physiquement distincts pour un même Site, au-delà du couple natif fourni au démarrage.
- Accès machine aux webhooks et endpoints MCP d'un Site privé, sans session ChatGPT dans le navigateur.
- Déclencheurs durables disponibles pour tâches, indexation et boîte d'envoi lorsque l'utilisateur ferme son navigateur.
- Transport des comptes/sessions natifs Creezio à travers le dispatcher Sites : cookies, bearer applicatif et révocation qualifiés sur la sonde machine privée ; parcours navigateur, comptes complets, cache et expiration restent à éprouver. La porte GPT et la session applicative restent distinctes ; le choix d'une authentification native est acquis.
- Matérialisation et évolution des modèles : ajout SQL généré conservant les données D1/R2 qualifié sur la sonde ; chaîne du produit, mises à jour de modules et reprise après échec restent à éprouver. La chaîne SQL centrale est acceptée ; aucun script SQL de transformation n'est confié aux modules.
- Progression du chat : événements SSE reçus groupés sur le chemin machine privé testé, y compris avec un second client. Qualifier le parcours navigateur et le transport retenu sans déduire une parité de la simple réception du contenu complet.

Les résultats et limites sont détaillés dans [Qualification Sites](QUALIFICATION-SITES.md). Les points restants donnent lieu à des prototypes et résultats mesurés, pas à des fonctionnalités présumées disponibles. Les identifiants de déploiement ne sont jamais codés dans le starter générique.

## Sources de transfert et publication

- [Déploiement full-stack](https://developers.cloudflare.com/workers/static-assets/get-started/) : code Worker, assets et URL de publication.
- [Commandes D1](https://developers.cloudflare.com/d1/wrangler-commands/) : export local, import/exécution distant et destination de persistance locale.
- [Import/export D1](https://developers.cloudflare.com/d1/best-practices/import-export-data/) : modalités et limites de copie des données.
- [Commandes R2](https://developers.cloudflare.com/r2/reference/wrangler-commands/) : lecture/écriture des objets locaux et distants.
- [Données locales](https://developers.cloudflare.com/workers/local-development/local-data/) : persistance des ressources de développement.

État : vérification documentaire uniquement. Aucun déploiement, transfert de données ou accès Cloudflare créé au titre de ce document.
