# Extensions, thèmes et écosystème Creezio

Proposition d'architecture du 26 septembre 2026, avant implémentation. Les dépôts, paquets, domaines et catalogues supplémentaires décrits ici ne sont pas encore créés ou publiés. L'ouverture publique et la [licence MIT](../LICENSE) du cœur, du SDK et du starter d'extension sont décidées et la licence est présente dans ce dépôt.

## Responsabilités

La compatibilité native ChatGPT fait partie du contrat des modules : outils MCP, widgets MCP Apps, skills et paquet distribuable, avec mêmes données D1/R2 et opérations autorisées. Lire [Compatibilité ChatGPT](COMPATIBILITE-CHATGPT.md). Une interface dans le chat Creezio ne prouve pas à elle seule son fonctionnement dans ChatGPT.

| Élément | Responsabilité |
|---|---|
| Socle et modules natifs | Backend, administration Creezio, UI du chat, conversations persistantes, widgets et capacités fournies d'origine ; contrats communs et release cohérente pour les composants interdépendants. |
| Extension | Fonctionnalité complète : modèles, opérations, API/MCP, permissions, événements, configuration, recherche, écrans et widgets selon son périmètre. |
| Thème | Présentation du front, dispositions, styles et emplacements de composants. Il ne possède ni les données métier ni les autorisations. |
| Personnalisation d'application | Configuration du front, remplacements de composants et extensions privées ; fichiers conservés lors des mises à jour. |
| SDK headless | Client typé, authentification, opérations, fichiers, conversations, widgets et événements, utilisable avec un front entièrement indépendant. |
| Catalogue | Découverte, éditeur, versions, compatibilité, dépendances, documentation, état de maintenance et origine des paquets. |

Les extensions officielles, communautaires et privées utilisent le même contrat. Les points d'extension sont publics, typés et versionnés : événements après opérations, filtres de présentation, emplacements UI et registres de rendus. Un hook ne permet pas de désactiver les autorisations ni de contourner la validation des données.

Les API et MCP sont des capacités natives du socle. Un client externe, dont n8n, peut appeler les opérations autorisées avec un token API ou une autorisation MCP sans installer le module n8n. Ce module apporte le pilotage et l'intégration de n8n depuis Creezio ; il n'ouvre pas l'accès aux API du socle et ne devient pas un prérequis des autres clients.

La planification appartient à n8n ou à un autre service déjà hébergé. Creezio conserve tâches, boîte d'envoi, progression et résultats ; les appels entrants effectuent des traitements bornés, avec reprise par nouvel appel externe. Aucun scheduler, poller ou daemon central n'est à fournir ni à qualifier sur Sites. Les opérations des modules appliquent les mêmes droits, contextes, révocations et validations humaines aux utilisateurs et aux identités machine ; elles ne déduisent pas une approbation humaine de la présence d'un token valide.

Le chat utilise un **module OpenAI activé**, configuré avec une clé API conservée côté serveur. Ce module fournit les appels au LLM, le choix des modèles autorisés, le streaming et les appels d'outils selon les contrats Creezio. L'interface du chat, les conversations, leur persistance et les widgets restent natifs ; un thème ne réintègre pas OpenAI lui-même. L'administration standard et le front utilisent ces services communs avec leurs propres droits. Sans clé valide, l'indisponibilité du LLM est explicite ; le compte GPT qui publie le Site ne fournit pas implicitement l'accès API.

Sur Sites, chaque application utilise **un couple D1/R2 partagé**, avec cloisonnement logique par contextes et autorisations serveur. Les extensions déclarent leurs modèles et leurs besoins d'accès dans ce couple ; elles n'imposent pas une base ou un bucket natif supplémentaire par utilisateur ou espace. Docker conserve la possibilité de sélectionner des ressources distinctes via ses adaptateurs. Ce choix ne multiplie pas les instances de l'application.

Un plugin de service comme n8n ou Hermes est une intégration à un service déjà disponible. L'utilisateur fournit sa clé API et les autres paramètres nécessaires, dont l'URL pour une instance personnelle. Creezio n'est responsable ni de l'installation, ni de l'hébergement, ni des mises à jour, ni des sauvegardes du logiciel tiers. Le paquet et sa démonstration ne contiennent aucun installateur de ce service. Mettre à jour le plugin ne met pas à jour le service distant.

La distinction thèmes/plugins et les personnalisations séparées du thème parent reprennent des principes éprouvés de [WordPress](https://developer.wordpress.org/themes/getting-started/what-is-a-theme/) et de ses [thèmes enfants](https://developer.wordpress.org/themes/advanced-topics/child-themes/). L'objectif du SDK headless rejoint celui de [Faust](https://github.com/wpengine/faustjs) : éviter à chaque front de reconstruire son raccordement au CMS. Faust lui-même, conçu pour WordPress, n'est pas une dépendance de Creezio ; GraphQL n'est pas imposé.

## GitHub, paquets et catalogue

Ces trois outils sont complémentaires :

1. **GitHub** : sources, issues, contributions, versions et filiation des applications. Un développeur peut maintenir son extension dans son propre dépôt.
2. **Registre compatible npm** : distribution des extensions, thèmes et SDK sous forme de paquets versionnés, publics ou privés. Les scopes identifient les éditeurs. Aucun nom de scope n'est présumé disponible.
3. **Catalogue Creezio** : fiches produit référençant les paquets, leur éditeur et leurs versions compatibles. Une liste de métadonnées validée suffit au démarrage ; il n'est pas nécessaire de construire un registre de binaires.

Le manifeste d'une extension contient son identifiant qualifié par éditeur, sa version, son origine, sa compatibilité avec les contrats Creezio, ses dépendances et les capacités d'hébergement nécessaires. Son origine ne peut pas être remplacée par un paquet homonyme. Les accès aux registres privés sont réservés à la préparation des livraisons.

Chaque composant a une source effective unique : workspace local ou paquet résolu. Il n'existe pas simultanément une copie source supposée active et une autre version npm exécutée implicitement. La composition et le lockfile fixent les versions et l'intégrité utilisées. Une plage de compatibilité n'autorise pas une résolution différente à chaque démarrage.

Un véritable fork GitHub d'un dépôt public reste public. La première application de test sera `Creez-io/Creezio-Lab`, véritable fork public de `creezio/Creezio-D1R2`, à créer après structuration et validation du socle. Cette destination est approuvée ; le fork n'est pas encore créé. Pour garder le code d'une application ou d'une extension confidentiel, utiliser un dépôt indépendant privé, avec les versions et l'origine Creezio explicites ; ce dépôt n'est pas présenté comme un fork GitHub privé du socle public. Les mises à jour des composants communs restent possibles par les paquets et contrats versionnés.

La visibilité des sources et les droits applicatifs sont distincts. Tous les Sites de la recette sont publics, avec connexion native Creezio pour les fonctions protégées ; cette audience n'ouvre ni les données privées ni l'administration. Les secrets et données des applications n'entrent jamais dans un paquet ni dans les sources publiées.

Sources : [métadonnées de plugins WordPress](https://developer.wordpress.org/plugins/plugin-basics/header-requirements/), [scopes npm](https://docs.npmjs.com/about-scopes/), [visibilité npm](https://docs.npmjs.com/package-scope-access-level-and-visibility/), [lockfile](https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json/).

## Dépôt de départ pour développer une extension

Prévoir un dépôt distinct, nom proposé **Creezio-Extension-Starter**, utilisable par fork et pouvant aussi être marqué comme template GitHub. Il permet de commencer une extension complète à partir d'un exemple fonctionnel. Le choix fork/template de cet outil de développement ne change pas le jalon imposant un véritable fork de Creezio pour la première application de test.

Le dépôt fournit trois livrables à partir du même code :

- **Un paquet d'extension installable** dans une application Creezio, avec manifeste, modèles, relations, opérations, routes/API dérivées, outils MCP, permissions, événements, projection de recherche, configuration, écran d'administration, vue front et widget de chat.
- **Une application de démonstration**, utilisant une version fixée du vrai socle Creezio et cette même extension. Elle démarre localement avec D1/R2 persistants et peut être publiée entièrement sur Cloudflare : Worker, front, administration, D1/R2 et assets.
- **Un paquet de plugin ChatGPT/Codex**, contenant manifeste portable, configuration MCP et skills, relié au déploiement de l'application avec ressources UI MCP Apps. Sa publication et sa connexion sont qualifiées séparément ; aucune nouvelle application serveur n'est imposée par ce paquet.

Structure indicative :

```text
extension/       Sources du module et manifeste
demo/            Composition Creezio utilisant extension/ comme workspace
tests/           Contrats, accès, API/MCP, widget et installation réelle
docs/            Démarrage, configuration, publication et contribution
scripts/         Validation, packaging et publication de la démo
```

L'exemple propose un objet simple avec pièce jointe, lecture et mutation autorisées. API, MCP, écran et widget appellent les mêmes opérations. Les modèles déclarent les structures actuelles ; l'auteur ne programme pas de chaîne SQL de transformation dans son module. La génération SQL centrale à partir de ces modèles est acceptée. Les artefacts SQL et leurs métadonnées sont inspectés avant publication et restent immuables après application. Aucun script SQL de transformation entre versions n'est distribué par le module.

Le SDK et les commandes génèrent les points d'enregistrement : installer le paquet et l'inclure dans la composition ne demande pas de réécrire les routes, le chat ou les gardes d'accès de l'application. Les zones à personnaliser et celles fournies par le SDK sont explicitement documentées.

**Publier la démonstration sur Cloudflare et publier le paquet sont deux actions distinctes.** La première donne une URL de test ; la seconde rend une version disponible aux applications. Installer le paquet dans une application Creezio l'intègre à son propre Worker : cela ne crée pas un serveur supplémentaire par extension. Une extension utilisant un service distant, par exemple un moteur externe, déclare cette dépendance et son protocole séparément.

Les ressources Cloudflare, accès administrateur et secrets de démonstration appartiennent au développeur. Aucun compte partagé ou secret prérempli n'est livré. La démo conserve les mêmes droits que l'intégration réelle ; l'accès public éventuel à sa présentation n'ouvre pas son administration. Une démo fonctionnelle ne suffit pas à certifier le paquet : la recette inclut son installation dans une autre application Creezio et sa mise à jour.

L'archive distribuée contient uniquement l'extension et les éléments nécessaires à son fonctionnement, avec dépendances déclarées. Elle exclut `demo/`, les données de démonstration, les identifiants/configurations d'hébergement et toute copie embarquée du socle Creezio. Les contrats partagés sont des dépendances compatibles, pas un second runtime. La recette installe l'archive effectivement produite dans Creezio Lab, sans résolution implicite vers le workspace de développement.

Construire et publier la démo depuis la racine du starter : aucune dépendance à une copie voisine non fournie du CMS. Le bouton [Deploy to Cloudflare](https://developers.cloudflare.com/workers/platform/deploy-buttons/) pourra compléter le parcours du starter public ; il ne remplace ni la distribution du paquet ni la preuve du vrai fork GitHub. Le parcours Wrangler authentifié reste disponible, notamment pour les extensions maintenues dans des dépôts privés indépendants.

## Installation et cycle de vie

L'administration distingue les états : disponible au catalogue, présent dans la livraison, activé, configuré, opérationnel, indisponible et interdit. Ces états ne sont pas interchangeables.

- Activer une extension déjà incluse et compatible peut être immédiat.
- Installer un nouveau paquet ou modifier son code exige une compilation et une publication.
- Désactiver conserve les données et l'historique des conversations ; les widgets concernés présentent un état explicite.
- Désinstaller traite les dépendances et présente séparément la conservation/export ou suppression explicite des données. Un changement de thème ne supprime jamais ces données.

Sur Sites, le catalogue et l'administration présentent les informations ; l'installation ou la mise à jour nécessitant du code est demandée puis exécutée dans GPT. Le back-office ne prétend pas publier le Site. Depuis Docker local, l'exécuteur peut préparer et publier l'application sur Cloudflare à la demande de l'administrateur.

## Mise à jour d'une seule extension

Le socle, les extensions et les thèmes possèdent des versions distinctes. Les composants natifs interdépendants peuvent conserver une release commune. Exemple : mettre à jour le plugin n8n sans modifier la version de Stripe, du thème ou de l'extension privée de l'application.

1. Identifier précisément l'éditeur, le paquet, l'origine et la version cible.
2. Présenter les changements, dépendances nécessaires, droits supplémentaires, configuration et compatibilité des données.
3. Résoudre le graphe sans mettre à jour silencieusement le cœur ou les modules non concernés. Une dépendance transitive indispensable est indiquée.
4. Fixer la résolution, vérifier les contrats et inspecter le SQL généré centralement et ses métadonnées avant de construire une livraison complète de l'application avec ses modules sélectionnés. Ne jamais réécrire un artefact SQL déjà appliqué.
5. Publier selon l'hébergement, puis vérifier l'opération API/MCP/widget concernée, les autres versions et la conservation des données et personnalisations. Sur Sites, le SQL est appliqué avant l'envoi du Worker ; un échec ultérieur peut laisser ce SQL appliqué. Vérifier la compatibilité avec le code encore publié et la reprise de la livraison.
6. Conserver la référence du code précédent compatible. Revenir au code précédent n'annule pas le SQL déjà appliqué et ne restaure pas les données modifiées depuis.

Une mise à jour individuelle est donc un changement ciblé des versions, suivi d'une republication du Worker complet. Elle ne nécessite pas un téléchargement de JavaScript exécuté à chaud. Une incompatibilité de contrat ou de données bloque la livraison automatique.

Ce parcours s'inspire des [mises à jour ciblées WordPress](https://developer.wordpress.org/cli/commands/plugin/update/) en respectant le runtime serverless. Les modules déclarent leurs modèles actuels ; le mécanisme central génère et suit les artefacts SQL nécessaires à leur matérialisation. Il ne délègue pas aux modules des scripts de transformation de bases entre versions.

## Thèmes, personnalisation et front headless

Fournir un thème standard, un thème ChatGPT-like et des points de remplacement documentés : disposition, navigation, pages, composants, rendus des widgets et styles. Les fichiers personnalisés de l'application sont séparés des fichiers du thème commun. La mise à jour du thème ne les écrase pas.

Le SDK front fournit sessions, clients d'opérations, gestion des conversations, fichiers, événements, widgets et erreurs. Un développeur peut conserver tout le thème, remplacer seulement des composants ou construire son propre front avec ce SDK. Une prévisualisation de brouillons ou données privées exige toujours une autorisation explicite.

Les écrans d'administration apportés par les extensions se montent dans des panneaux React stables du workspace Creezio. Le SDK fournit identité de vue, localisation propre au panneau, navigation, activité et invalidation ; il n'expose pas les contextes privés Next/Vinext. Les vues utilisent les opérations autorisées pour leurs données. Un changement de route ou de thème ne doit pas mélanger les fiches, perdre un brouillon ou remplacer le chat standard. Les thèmes du front utilisent les contrats publics de conversation et de widgets, sans importer le workspace privé de l'administration.

La compatibilité du workspace avec le routeur et le build hôtes reste à tester sur leurs versions figées. Si un pont de rendu interne est nécessaire, il appartient exclusivement à l'adaptateur d'hébergement, avec contrôle de compatibilité explicite. La recette exerce navigation interrompue, deux objets du même module, portails inactifs, mutation depuis widget et changement de session ; un import qui compile ne constitue pas cette preuve.

Les Sites de la recette sont publics : le front est accessible directement sans compte GPT, puis la connexion native ouvre les fonctions autorisées de l'application. L'identité GPT ne crée aucune session, aucun compte ni aucun droit Creezio implicitement. Le SDK et les thèmes utilisent les sessions applicatives ; ils ne remplacent pas les permissions serveur par un en-tête d'identité GPT. La clé API du module OpenAI reste côté serveur et ne sert pas à identifier les utilisateurs. Voir [Qualification Sites](QUALIFICATION-SITES.md) pour les contraintes de plateforme et les recettes des appels machine.

Le contrat du canal distingue session utilisateur et identité machine autorisée : un client API/MCP externe n'a pas besoin d'un cookie ou d'un navigateur ouvert. Son token détermine les opérations et contextes accordés, avec expiration, révocation et audit ; il ne permet ni d'élargir ses droits depuis les paramètres de la requête ni de contourner les validations humaines. Le SDK front ne reçoit pas les tokens des automatisations externes.

Le front livré et l'administration restent publiables avec le backend dans une seule application. Un front headless hébergé séparément est une option de composition ; il utilise les mêmes API et un parcours d'identité/CORS explicitement configuré. Cela n'implique aucun backend distinct par utilisateur ou client.

## Développeurs et confiance

Livrer une documentation publique, un SDK versionné, le starter public, un exemple installé, des tests de conformité, une procédure de contribution, un changelog et une politique de compatibilité. Le catalogue distingue officiel, tiers et privé, ainsi que l'état de maintenance. Les dépôts et paquets privés conservent leurs contrôles d'accès.

Le paquet est vérifié avec ses dépendances transitives pour Workers et Sites. Les extensions incluses dans le Worker restent du code de confiance ; le manifeste de permissions n'isole pas du code malveillant. L'intégrité et, lorsque disponible, la [provenance npm](https://docs.npmjs.com/trusted-publishers/) complètent la revue sans la remplacer. Aucun mécanisme d'exécution arbitraire de code non approuvé n'est implicite.

Le cœur, le SDK et le starter sont placés sous [licence MIT](../LICENSE), choix approuvé. Les futures distributions de ces composants conservent le texte de licence et les mentions nécessaires ; les dépendances et contributions tierces conservent leurs propres mentions applicables. Cette ouverture ne rend publics ni les applications privées indépendantes, ni leurs extensions, secrets ou données, et n'implique aucun changement d'offre commerciale.

## Preuves de réussite

Le contrat de distribution sépare explicitement les exports serveur, client React, styles et assets. Le paquet publié déclare ses dépendances et peers ; ses fichiers réellement emballés contiennent les widgets, styles et ressources référencés. Le résolveur produit un manifeste d'assets pour le build hôte : aucun chemin vers le workspace du développeur ni import serveur depuis le navigateur n'est admis. Vérifier l'archive issue du packaging, puis l'installer dans l'application de recette sans lien workspace caché. La présence des sources dans un monorepo ne prouve pas qu'un module distribué fonctionne.

Une mise à jour ciblée sélectionne une version de module et ses dépendances nécessaires, contrôle les compatibilités et reconstruit la livraison complète de l'application. L'activation d'un module déjà présent peut changer une configuration ; ajouter ou remplacer son code demande un build et une publication. L'installation de plugins ne repose pas sur l'écriture de code exécutable dans le système de fichiers du Worker.

1. Un développeur suivant seulement le starter produit son extension avec API, MCP, écran et widget, sans modifier les fichiers internes du CMS.
2. Il publie sa démo sur Cloudflare ; elle fonctionne après arrêt du local.
3. Le même paquet est installé dans Creezio Lab, configuré et utilisé avec une identité et des données propres à cette app.
4. Une nouvelle version de ce seul paquet est publiée puis appliquée à l'application ; les autres versions, le front et les données sont conservés.
5. Une extension incompatible ou d'origine inattendue est refusée avant publication.
6. Changer ou mettre à jour un thème préserve les personnalisations, conversations et opérations ; l'administration reste Creezio.
7. Le SDK permet à un front distinct d'exercer une opération et un widget avec les droits de son utilisateur, sans importer l'administration.
8. Les deux Sites publics permettent d'atteindre le front et de se connecter à Creezio sans compte GPT ; les opérations protégées exigent une session utilisateur ou une identité machine autorisée selon leur contrat, ainsi que les droits et validations requis.
9. Le module OpenAI activé et configuré produit une réponse réelle, un appel d'outil autorisé puis un widget dans les interfaces natives ; aucune clé API n'atteint le navigateur.
10. Deux contextes de la même application Sites utilisent le même couple D1/R2 sans fuite de données, fichiers, résultats de recherche ou conversations.
11. Un n8n existant planifie une action Creezio exécutée navigateur fermé, sans module n8n installé dans Creezio ; son résultat ou callback est consultable après reconnexion. Les mauvais tokens, portées/contextes non autorisés, accès révoqués et rejeux non autorisés sont refusés ; une reprise idempotente autorisée ne répète aucun effet et ne contourne aucune validation humaine.
