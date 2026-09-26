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
7. **Configurer et publier.** Raccorder les bindings D1/R2 et les secrets de production, configurer l'authentification hors Sites, publier le Worker et ses assets. Démarrer sur une URL workers.dev, puis un domaine personnalisé si demandé.
8. **Vérifier la production.** Connexion, droits, onglets, chat, modules, lecture/écriture D1 et accès R2. Présenter l'URL, la version et le résultat. Arrêter le runtime local de test pour prouver l'indépendance de la production.

L'application reste protégée pendant la préparation ; le compte rendu ne déclare pas une publication réussie tant que les vérifications finales ne passent pas. Un échec conserve les données locales et l'état du transfert pour reprendre sans dupliquer les ressources ni effacer la destination.

Ce mécanisme copie une installation Creezio vers son hébergement de production. Il ne transforme pas un autre modèle de données et n'ajoute aucun script de transformation entre versions dans les modules.

## Première publication et mises à jour

La première publication comprend explicitement application, données et fichiers de cette installation. Une publication de code seule ne copie pas automatiquement le contenu D1/R2 : le parcours Creezio doit orchestrer ces opérations séparées.

Une fois la production utilisée, elle devient la référence pour ses données. Une mise à jour de code conserve les données de production et ne réimporte pas aveuglément le jeu local de développement. Les personnalisations du fork, la configuration et les accès restent propres à l'application. Toute incompatibilité détectée bloque la mise à jour automatique.

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

## Sources de transfert et publication

- [Déploiement full-stack](https://developers.cloudflare.com/workers/static-assets/get-started/) : code Worker, assets et URL de publication.
- [Commandes D1](https://developers.cloudflare.com/d1/wrangler-commands/) : export local, import/exécution distant et destination de persistance locale.
- [Import/export D1](https://developers.cloudflare.com/d1/best-practices/import-export-data/) : modalités et limites de copie des données.
- [Commandes R2](https://developers.cloudflare.com/r2/reference/wrangler-commands/) : lecture/écriture des objets locaux et distants.
- [Données locales](https://developers.cloudflare.com/workers/local-development/local-data/) : persistance des ressources de développement.

État : vérification documentaire uniquement. Aucun déploiement, transfert de données ou accès Cloudflare créé au titre de ce document.
