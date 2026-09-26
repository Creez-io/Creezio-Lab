# Hébergement et stockage natifs Creezio

Vérification documentaire du 26 septembre 2026. Les trois modes ci-dessous sont des exigences du produit, pas des intégrations laissées à développer par chaque application. Aucun mode n'est encore validé par une exécution de Creezio-D1R2.

## Trois modes obligatoires

| Mode | Exécution | Données structurées | Fichiers | Configuration utilisateur |
|---|---|---|---|---|
| GPT Sites | Runtime du Site | Binding D1 fourni nativement par Sites | Binding R2 fourni nativement par Sites | Ressources rattachées au Site du compte Sites ; aucune clé Cloudflare personnelle nécessaire pour ce mode. |
| Docker local | Runtime compatible dans le déploiement Docker | Implémentation locale compatible D1 | Implémentation locale compatible R2 | Installation autonome avec volumes persistants ; aucun compte ou accès Cloudflare nécessaire. |
| Docker + Cloudflare | Application toujours dans Docker | D1 du compte Cloudflare de l'utilisateur | R2 du compte Cloudflare de l'utilisateur | Connexion Cloudflare guidée, accès serveur vérifiés, sélection des ressources et contrôle de compatibilité. |

Les modules, le chat, l'administration et le front conservent les mêmes contrats métier. Les différences de transport et de stockage sont encapsulées dans les adaptateurs natifs du produit. Le connecteur Cloudflare est fourni avec Creezio ; ce choix fondamental ne dépend pas de l'installation d'un module métier supplémentaire.

L'emplacement de l'application et celui des données sont indépendants. Passer d'une configuration à une autre n'est pas une promesse de copie automatique des données. Sélectionner une destination ne doit ni effacer les ressources de départ ni produire une synchronisation implicite. Le produit affiche clairement la destination active.

## Projets GitHub vérifiés

### Cloudflare Workers SDK / Miniflare

- Dépôt : [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk).
- Package actif : [packages/miniflare](https://github.com/cloudflare/workers-sdk/tree/main/packages/miniflare).
- [Documentation du package](https://github.com/cloudflare/workers-sdk/blob/main/packages/miniflare/README.md).

Miniflare exécute des Workers via workerd et fournit des implémentations locales des ressources D1/R2. Il permet de configurer les bindings et leur persistance. C'est le candidat officiel à qualifier pour fournir les interfaces de stockage locales de Creezio. Les ressources locales conservent réellement leurs données sur disque quand la persistance est configurée.

Cloudflare le présente comme un simulateur destiné au développement et aux tests. Cela ne constitue pas une certification de notre futur usage durable dans Docker. Il faut vérifier l'assemblage, les versions et les comportements de stockage effectivement utilisés par Creezio.

### Cloudflare workerd

- Dépôt : [cloudflare/workerd](https://github.com/cloudflare/workerd).
- [README et exécution en production](https://github.com/cloudflare/workerd/blob/main/README.md).

Runtime JavaScript/Wasm open source des Workers, documenté notamment pour l'auto-hébergement. Il peut exécuter le code Worker de l'application. Il ne suffit pas à lui seul à reproduire toute la plateforme D1/R2 gérée par Cloudflare : il faut aussi fournir les bindings de stockage et leur persistance.

### Conclusion de choix

Piste prioritaire : application Worker avec workerd et implémentations locales officielles issues de Miniflare, intégrées dans une distribution Docker maîtrisée. Aucune bifurcation des modèles métier et aucun service Cloudflare obligatoire en mode local. Le choix d'assemblage définitif sera fixé après qualification ; ne pas remplacer ce jalon par le seul constat que `wrangler dev` démarre.

Les garanties du service Cloudflare géré, comme la réplication de son infrastructure, ne sont pas implicitement disponibles sur un disque Docker local.

## Connexion Docker au Cloudflare de l'utilisateur

Le parcours produit est : choisir Cloudflare, fournir les accès nécessaires, sélectionner ou créer les ressources autorisées, vérifier la connexion, puis utiliser les mêmes fonctions Creezio. Aucun ajout de routes ou de SDK dans le code de l'application cliente.

Le formulaire doit guider l'utilisateur selon les accès réellement requis, sans promettre qu'une clé quelconque suffit : compte et droits Cloudflare, base D1, bucket R2 et authentification des accès aux données. Les secrets restent côté serveur et les accès peuvent être limités aux ressources choisies.

### D1 distant depuis Docker

L'API REST D1 existe, mais Cloudflare la recommande surtout pour l'administration à cause de sa limite d'appels globale. Pour les opérations applicatives, sa documentation propose une API Worker authentifiée devant D1. Le connecteur natif Creezio devra fournir et configurer ce chemin d'accès, avec les autorisations nécessaires, ou démontrer une autre solution durable adaptée. Une telle passerelle transporte l'accès aux données ; elle ne déplace pas le front ou le back-office hors de Docker et ne crée pas une application par client.

L'utilisateur doit connaître les ressources qui seront créées dans son compte. La configuration est gérée par Creezio, pas par un développement spécifique demandé au client. La gestion initiale des ressources et le trafic applicatif restent séparés ; ne pas conserver un jeton d'administration globale pour chaque requête métier si un accès limité suffit.

Source : [Accéder à D1 depuis une application externe](https://developers.cloudflare.com/d1/tutorials/build-an-api-to-access-d1/).

### R2 distant depuis Docker

R2 propose une API compatible S3 utilisable depuis une application externe. Le connecteur prend en charge l'endpoint, le bucket, les accès et la correspondance des opérations prises en charge par Creezio. L'authentification S3 emploie un Access Key ID et un Secret Access Key ; ces paramètres doivent être obtenus ou configurés selon les droits disponibles. Ne pas confondre automatiquement ces identifiants avec n'importe quel jeton de l'API Cloudflare.

Sources : [API R2](https://developers.cloudflare.com/r2/api/), [authentification R2](https://developers.cloudflare.com/r2/api/tokens/).

## Qualification requise avant généralisation du socle

1. Une même version des modèles et opérations crée puis relit données et fichiers sur les trois modes.
2. Docker local démarre sans identifiants Cloudflare ; une fois l'image disponible, ses fonctions de stockage local ne nécessitent pas de réseau. Les modules de fournisseurs externes conservent naturellement leurs propres besoins réseau.
3. Redémarrer et recréer le conteneur sans supprimer ses volumes conserve D1, R2 et leurs liens. Les données ne sont jamais stockées uniquement dans la couche éphémère de l'image.
4. Vérifier écritures concurrentes, limites de requêtes, batch, relations, pagination, métadonnées et opérations fichiers utilisées par Creezio. Ne pas annoncer une équivalence complète sur des fonctions non testées.
5. Vérifier arrêt brutal, intégrité au redémarrage, sauvegarde cohérente des métadonnées/fichiers et restauration sur un volume de test.
6. Tester la connexion au Cloudflare d'un compte autorisé : accès valide, accès révoqué, droits insuffisants, ressource indisponible et absence de repli silencieux vers une autre base.
7. Les mêmes droits, contextes et refus doivent fonctionner sur Sites, Docker local et Docker distant.
8. Une mise à jour conserve le stockage configuré et les données. Elle est demandée dans GPT sur Sites, et déclenchable dans le back-office pour Docker.

Les modèles décrivent directement les données actuelles. L'initialisation d'une nouvelle installation ne constitue pas une conversion de bases. Les modules ne contiennent pas de scripts de transformation entre versions de bases.

## Autres sources de vérification

- [Développement local D1](https://developers.cloudflare.com/d1/best-practices/local-development/) : prise en charge locale par l'outillage officiel.
- [Ressources locales et persistance](https://developers.cloudflare.com/workers/local-development/local-data/) : ressources D1/R2 locales et stockage sur disque.
- [Runtime et bindings locaux/distants](https://developers.cloudflare.com/workers/local-development/) : distinguer lieu d'exécution et lieu de stockage. Les bindings distants de développement ne sont pas, à eux seuls, la preuve d'un connecteur Docker de production.

Cette vérification porte sur les sources et les capacités documentées. Elle ne remplace pas les tests de la distribution Docker, du compte Cloudflare et des deux Sites exigés pour la recette du produit.
