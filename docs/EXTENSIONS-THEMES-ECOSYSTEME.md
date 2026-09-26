# Extensions, thèmes et écosystème Creezio

Proposition d'architecture du 26 septembre 2026, avant implémentation. Les dépôts, paquets, domaines et catalogues supplémentaires décrits ici ne sont pas encore créés ou publiés. La visibilité publique et la licence restent à décider.

## Responsabilités

| Élément | Responsabilité |
|---|---|
| Socle et modules natifs | Backend, administration Creezio et capacités fournies d'origine ; contrats communs et release cohérente pour les composants interdépendants. |
| Extension | Fonctionnalité complète : modèles, opérations, API/MCP, permissions, événements, configuration, recherche, écrans et widgets selon son périmètre. |
| Thème | Présentation du front, dispositions, styles et emplacements de composants. Il ne possède ni les données métier ni les autorisations. |
| Personnalisation d'application | Configuration du front, remplacements de composants et extensions privées ; fichiers conservés lors des mises à jour. |
| SDK headless | Client typé, authentification, opérations, fichiers, conversations, widgets et événements, utilisable avec un front entièrement indépendant. |
| Catalogue | Découverte, éditeur, versions, compatibilité, dépendances, documentation, état de maintenance et origine des paquets. |

Les extensions officielles, communautaires et privées utilisent le même contrat. Les points d'extension sont publics, typés et versionnés : événements après opérations, filtres de présentation, emplacements UI et registres de rendus. Un hook ne permet pas de désactiver les autorisations ni de contourner la validation des données.

Un plugin de service comme n8n ou Hermes est une intégration à un service déjà disponible. L'utilisateur fournit sa clé API et les autres paramètres nécessaires, dont l'URL pour une instance personnelle. Creezio n'est responsable ni de l'installation, ni de l'hébergement, ni des mises à jour, ni des sauvegardes du logiciel tiers. Le paquet et sa démonstration ne contiennent aucun installateur de ce service. Mettre à jour le plugin ne met pas à jour le service distant.

La distinction thèmes/plugins et les personnalisations séparées du thème parent reprennent des principes éprouvés de [WordPress](https://developer.wordpress.org/themes/getting-started/what-is-a-theme/) et de ses [thèmes enfants](https://developer.wordpress.org/themes/advanced-topics/child-themes/). L'objectif du SDK headless rejoint celui de [Faust](https://github.com/wpengine/faustjs) : éviter à chaque front de reconstruire son raccordement au CMS. Faust lui-même, conçu pour WordPress, n'est pas une dépendance de Creezio ; GraphQL n'est pas imposé.

## GitHub, paquets et catalogue

Ces trois outils sont complémentaires :

1. **GitHub** : sources, issues, contributions, versions et filiation des applications. Un développeur peut maintenir son extension dans son propre dépôt.
2. **Registre compatible npm** : distribution des extensions, thèmes et SDK sous forme de paquets versionnés, publics ou privés. Les scopes identifient les éditeurs. Aucun nom de scope n'est présumé disponible.
3. **Catalogue Creezio** : fiches produit référençant les paquets, leur éditeur et leurs versions compatibles. Une liste de métadonnées validée suffit au démarrage ; il n'est pas nécessaire de construire un registre de binaires.

Le manifeste d'une extension contient son identifiant qualifié par éditeur, sa version, son origine, sa compatibilité avec les contrats Creezio, ses dépendances et les capacités d'hébergement nécessaires. Son origine ne peut pas être remplacée par un paquet homonyme. Les accès aux registres privés sont réservés à la préparation des livraisons.

Chaque composant a une source effective unique : workspace local ou paquet résolu. Il n'existe pas simultanément une copie source supposée active et une autre version npm exécutée implicitement. La composition et le lockfile fixent les versions et l'intégrité utilisées. Une plage de compatibilité n'autorise pas une résolution différente à chaque démarrage.

Les applications clientes et leurs extensions peuvent rester privées, indépendamment de l'ouverture du SDK, du cœur ou du catalogue. Les secrets et données des applications n'entrent jamais dans un paquet.

Sources : [métadonnées de plugins WordPress](https://developer.wordpress.org/plugins/plugin-basics/header-requirements/), [scopes npm](https://docs.npmjs.com/about-scopes/), [visibilité npm](https://docs.npmjs.com/package-scope-access-level-and-visibility/), [lockfile](https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json/).

## Dépôt de départ pour développer une extension

Prévoir un dépôt distinct, nom proposé **Creezio-Extension-Starter**, utilisable par fork et pouvant aussi être marqué comme template GitHub. Il permet de commencer une extension complète à partir d'un exemple fonctionnel. Le choix fork/template de cet outil de développement ne change pas le jalon imposant un véritable fork de Creezio pour la première application de test.

Le dépôt fournit deux livrables à partir du même code :

- **Un paquet d'extension installable** dans une application Creezio, avec manifeste, modèles, relations, opérations, routes/API dérivées, outils MCP, permissions, événements, projection de recherche, configuration, écran d'administration, vue front et widget de chat.
- **Une application de démonstration**, utilisant une version fixée du vrai socle Creezio et cette même extension. Elle démarre localement avec D1/R2 persistants et peut être publiée entièrement sur Cloudflare : Worker, front, administration, D1/R2 et assets.

Structure indicative :

```text
extension/       Sources du module et manifeste
demo/            Composition Creezio utilisant extension/ comme workspace
tests/           Contrats, accès, API/MCP, widget et installation réelle
docs/            Démarrage, configuration, publication et contribution
scripts/         Validation, packaging et publication de la démo
```

L'exemple propose un objet simple avec pièce jointe, lecture et mutation autorisées. API, MCP, écran et widget appellent les mêmes opérations. Les modèles déclarent les structures actuelles ; l'auteur ne programme pas de chaîne SQL de transformation dans son module. Le mécanisme central de matérialisation des modèles reste soumis à la décision identifiée dans le plan principal.

Le SDK et les commandes génèrent les points d'enregistrement : installer le paquet et l'inclure dans la composition ne demande pas de réécrire les routes, le chat ou les gardes d'accès de l'application. Les zones à personnaliser et celles fournies par le SDK sont explicitement documentées.

**Publier la démonstration sur Cloudflare et publier le paquet sont deux actions distinctes.** La première donne une URL de test ; la seconde rend une version disponible aux applications. Installer le paquet dans une application Creezio l'intègre à son propre Worker : cela ne crée pas un serveur supplémentaire par extension. Une extension utilisant un service distant, par exemple un moteur externe, déclare cette dépendance et son protocole séparément.

Les ressources Cloudflare, accès administrateur et secrets de démonstration appartiennent au développeur. Aucun compte partagé ou secret prérempli n'est livré. La démo conserve les mêmes droits que l'intégration réelle ; l'accès public éventuel à sa présentation n'ouvre pas son administration. Une démo fonctionnelle ne suffit pas à certifier le paquet : la recette inclut son installation dans une autre application Creezio et sa mise à jour.

L'archive distribuée contient uniquement l'extension et les éléments nécessaires à son fonctionnement, avec dépendances déclarées. Elle exclut `demo/`, les données de démonstration, les identifiants/configurations d'hébergement et toute copie embarquée du socle Creezio. Les contrats partagés sont des dépendances compatibles, pas un second runtime. La recette installe l'archive effectivement produite dans Creezio Lab, sans résolution implicite vers le workspace de développement.

Construire et publier la démo depuis la racine du starter : aucune dépendance à une copie voisine non fournie du CMS. Le bouton [Deploy to Cloudflare](https://developers.cloudflare.com/workers/platform/deploy-buttons/) pourra compléter ce parcours pour un dépôt public ; il ne remplace ni la distribution du paquet ni la preuve du vrai fork GitHub. Tant que le dépôt reste privé, prévoir le parcours Wrangler authentifié. Le bouton n'est pas une autorisation de rendre le dépôt public.

## Installation et cycle de vie

L'administration distingue les états : disponible au catalogue, présent dans la livraison, activé, configuré, opérationnel, indisponible et interdit. Ces états ne sont pas interchangeables.

- Activer une extension déjà incluse et compatible peut être immédiat.
- Installer un nouveau paquet ou modifier son code exige une compilation et une publication.
- Désactiver conserve les données et l'historique des conversations ; les widgets concernés présentent un état explicite.
- Désinstaller traite les dépendances et présente séparément la conservation/export ou suppression explicite des données. Un changement de thème ne supprime jamais ces données.

Sur Sites, le catalogue et l'administration présentent les informations ; l'installation ou la mise à jour nécessitant du code est demandée puis exécutée dans GPT. Le back-office ne prétend pas publier le Site. Depuis Docker local, l'exécuteur peut préparer et publier l'application sur Cloudflare à la demande de l'administrateur.

## Mise à jour d'une seule extension

Le socle, les extensions et les thèmes possèdent des versions distinctes. Les composants natifs interdépendants peuvent conserver une release commune. Exemple : mettre à jour n8n sans modifier la version de Stripe, du thème ou de l'extension privée de l'application.

1. Identifier précisément l'éditeur, le paquet, l'origine et la version cible.
2. Présenter les changements, dépendances nécessaires, droits supplémentaires, configuration et compatibilité des données.
3. Résoudre le graphe sans mettre à jour silencieusement le cœur ou les modules non concernés. Une dépendance transitive indispensable est indiquée.
4. Fixer la résolution, vérifier les contrats et construire une livraison complète de l'application avec ses modules sélectionnés.
5. Publier selon l'hébergement, puis vérifier l'opération API/MCP/widget concernée, les autres versions et la conservation des données et personnalisations.
6. Conserver la référence du code précédent compatible. Revenir au code précédent ne restaure pas des données modifiées depuis.

Une mise à jour individuelle est donc un changement ciblé des versions, suivi d'une republication du Worker complet. Elle ne nécessite pas un téléchargement de JavaScript exécuté à chaud. Une incompatibilité de contrat ou de données bloque la livraison automatique.

Ce parcours s'inspire des [mises à jour ciblées WordPress](https://developer.wordpress.org/cli/commands/plugin/update/) en respectant le runtime serverless. Les modèles de données actuels sont conservés ; la gestion technique des évolutions SQL reste un point de conception à trancher avant implémentation.

## Thèmes, personnalisation et front headless

Fournir un thème standard, un thème ChatGPT-like et des points de remplacement documentés : disposition, navigation, pages, composants, rendus des widgets et styles. Les fichiers personnalisés de l'application sont séparés des fichiers du thème commun. La mise à jour du thème ne les écrase pas.

Le SDK front fournit sessions, clients d'opérations, gestion des conversations, fichiers, événements, widgets et erreurs. Un développeur peut conserver tout le thème, remplacer seulement des composants ou construire son propre front avec ce SDK. Une prévisualisation de brouillons ou données privées exige toujours une autorisation explicite.

Le front livré et l'administration restent publiables avec le backend dans une seule application. Un front headless hébergé séparément est une option de composition ; il utilise les mêmes API et un parcours d'identité/CORS explicitement configuré. Cela n'implique aucun backend distinct par utilisateur ou client.

## Développeurs et confiance

Livrer documentation publique ou accessible aux partenaires selon le choix d'ouverture, SDK versionné, starter, exemple installé, tests de conformité, procédure de contribution, changelog et politique de compatibilité. Le catalogue distingue officiel, tiers et privé, ainsi que l'état de maintenance.

Le paquet est vérifié avec ses dépendances transitives pour Workers et Sites. Les extensions incluses dans le Worker restent du code de confiance ; le manifeste de permissions n'isole pas du code malveillant. L'intégrité et, lorsque disponible, la [provenance npm](https://docs.npmjs.com/trusted-publishers/) complètent la revue sans la remplacer. Aucun mécanisme d'exécution arbitraire de code non approuvé n'est implicite.

L'ouverture publique, les composants concernés et leur licence nécessitent une décision préalable. Le présent plan n'autorise ni publication d'un dépôt privé, ni création de comptes, ni changement d'offre commerciale.

## Preuves de réussite

1. Un développeur suivant seulement le starter produit son extension avec API, MCP, écran et widget, sans modifier les fichiers internes du CMS.
2. Il publie sa démo sur Cloudflare ; elle fonctionne après arrêt du local.
3. Le même paquet est installé dans Creezio Lab, configuré et utilisé avec une identité et des données propres à cette app.
4. Une nouvelle version de ce seul paquet est publiée puis appliquée à l'application ; les autres versions, le front et les données sont conservés.
5. Une extension incompatible ou d'origine inattendue est refusée avant publication.
6. Changer ou mettre à jour un thème préserve les personnalisations, conversations et opérations ; l'administration reste Creezio.
7. Le SDK permet à un front distinct d'exercer une opération et un widget avec les droits de son utilisateur, sans importer l'administration.
