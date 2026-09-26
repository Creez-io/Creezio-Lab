# Éditions, activation premium et accompagnement

Décisions produit du 26 septembre 2026, avant implémentation. Ce document décrit la cible commerciale et technique ; il n'est pas une licence logicielle ni des conditions de vente. Le fichier [LICENSE](../LICENSE) actuellement publié reste le texte applicable au contenu qu'il couvre. Les licences et périmètres des futurs composants doivent être formalisés avant leur distribution ; ce document ne les remplace pas implicitement.

## Architecture décidée, politique commerciale différée

Creezio doit prévoir des éditions Community et premium/Enterprise, un compte central d'enregistrement, des droits activables par paiement et un service d'accompagnement. **La licence, les tarifs, la liste des fonctions payantes et l'autorisation des SaaS en Community ou seulement en premium sont expressément reportés par l'utilisateur.** L'accord intermédiaire autorisant gratuitement les SaaS n'est plus une politique acquise. L'architecture doit permettre ces deux choix sans réécrire les modules. Le dépôt, la documentation et la contribution communautaire restent accessibles ; un dépôt public ne signifie pas que chaque futur composant premium est sous licence permissive.

Le parcours d'inscription est présenté dès l'onboarding. Selon le choix approuvé, le développement local peut commencer hors ligne ; l'enregistrement avec propriétaire vérifié par GitHub ou email est obligatoire à la publication officielle. Le choix d'un compte central, la connexion native à l'application et l'identité de ses utilisateurs métier restent distincts.

Les éditions utilisent la même architecture, les mêmes contrats et la même logique métier. Une fonction commerciale disponible dépend de trois contrôles indépendants : capacité réelle de l'hébergement, droit d'usage premium applicable, permissions de l'acteur et du contexte. Payer ne crée pas des bindings D1 supplémentaires dans Sites et ne donne pas des droits administrateur dans une application.

## Inspiration n8n et différence nécessaire

n8n documente une Community utilisable sans clé, une Registered Community gratuite et des éditions Business/Enterprise payantes activées par clé. L'inscription chez n8n n'est donc pas une obligation générale pour exécuter sa Community. Creezio reprend la distinction édition/activation et conserve son propre parcours d'enregistrement approuvé. [Éditions n8n](https://docs.n8n.io/deploy/host-n8n/community-edition-features/).

La Sustainable Use License de n8n limite certains usages commerciaux et réserve les fichiers Enterprise à une licence distincte. Ces restrictions ne sont pas adoptées implicitement : les droits de commercialisation des apps Creezio restent à décider. Une licence à restrictions d'usage se distingue d'une licence open source permissive ; ne pas utiliser ces termes comme synonymes. [Licence n8n](https://github.com/n8n-io/n8n/blob/master/LICENSE.md), [licence Enterprise n8n](https://github.com/n8n-io/n8n/blob/master/LICENSE_EE.md).

La cible technique est **Community + fonctions Enterprise activables**, sans contrat commercial définitif. La licence initialement prévue pour tout le futur produit est remise à l'étude ; le fichier LICENSE actuel reste inchangé. Les textes et frontières seront arrêtés avec la politique choisie et les droits détenus. Ne pas publier par défaut le futur code premium sous MIT en attendant cet arrêt ; ne pas bloquer la conception technique sur cette décision différée.

Le contenu déjà publié sous MIT conserve ses notices et son historique ; aucune restriction rétroactive des copies précédentes n'est annoncée. Les reprises de code, contributions et dépendances nécessitent un inventaire d'origine et de droits : un dépôt sans fichier de licence n'est pas une permission générale de redistribution. Les futures conditions doivent préciser le traitement des contributions et des modules tiers sans s'approprier implicitement le code des applications clientes.

## Droits premium et facturation

Le service central conserve compte propriétaire, projets/installations, offres, état des abonnements et droits accordés. Il expose les opérations d'inscription, activation, synchronisation et suivi avec autorisations distinctes. Le paiement et ses événements vérifiés alimentent les droits ; un simple retour navigateur depuis une page de paiement n'active pas une offre.

Séparer les accès suivants :

- Token de déclaration d'installation : URL, dépôt éventuel, origine et versions.
- Justificatif de droits premium signé : projet/installation concernés, fonctions, dates et version du contrat.
- Connexion GitHub d'accompagnement : dépôts et opérations explicitement autorisés.
- Secrets fournisseurs : accès propres à OpenAI, Cloudflare, n8n ou aux autres intégrations de l'app.

La clé de signature privée reste dans le service central. Les apps vérifient le justificatif avec une clé publique, et contrôlent les droits côté serveur pour les API, outils MCP, widgets et opérations directes. Masquer un bouton ne constitue pas le contrôle premium. Une installation/fork n'hérite pas silencieusement des droits ou secrets d'une autre.

Les règles d'offre sont des politiques versionnées associant fonctions et modes d'usage déclarés aux droits requis. Prévoir notamment un mode personnel, entreprise interne et SaaS/client externe, sans décider maintenant lequel est payant. Une politique pourra autoriser un SaaS en Community ou exiger un droit Enterprise ; la résolution de cette politique reste séparée des opérations métier et de l'adaptateur d'hébergement. Une déclaration de mode ne prouve pas à elle seule la conformité réelle d'un usage ; le contrat commercial futur définira ses obligations.

L'activation, la publication et une synchronisation autorisée peuvent renouveler le justificatif. Il n'y a pas d'appel central bloquant à chaque requête métier ni de scheduler ajouté au socle. Un justificatif valide peut être vérifié localement pendant une panne réseau. Expiration, résiliation et révocation sont des états distincts ; une révocation distante ne peut être connue instantanément d'une app sans nouveau contact.

Chaque fonction premium doit documenter le comportement à l'expiration et la tolérance éventuelle avant sa vente. Préserver les données, l'export et les opérations déjà engagées ; ne jamais effacer ou fusionner automatiquement les bases d'une app lors d'une perte de licence. Une capacité d'hébergement absente reste indisponible même avec une licence valide. Une application modifiée peut tenter de retirer les contrôles : les conditions de licence et les services centraux complètent la vérification technique, sans promesse d'inviolabilité d'un code accessible.

La liste définitive des fonctions payantes, leurs quotas, tarifs, durée de validité et politique de tolérance reste à définir avant commercialisation. Le multiressource hors Sites est un candidat évoqué, pas une fonction déclarée payante ou déjà opérationnelle. Aucune capacité native promise n'est retirée silencieusement de Community lors de ce cadrage.

## Accompagnement avec accès au code

L'utilisateur peut demander une assistance et accorder à Creezio un accès à un dépôt choisi, ou fournir une copie sélectionnée s'il n'utilise pas GitHub. L'abonnement ou l'enregistrement ne donnent aucun accès implicite au code. Les périmètres lecture, création de branche et proposition de PR sont distincts ; toute capacité de fusion ou de déploiement exige son propre mandat.

Le parcours explique les intervenants autorisés, le périmètre, la durée et la révocation. Utiliser une autorisation GitHub limitée aux dépôts sélectionnés, avec journal des interventions. Les secrets, données métier et accès de production ne sont pas inclus par défaut. Le propriétaire conserve ses sources et choisit les modifications à intégrer. Une correction de son app n'est pas automatiquement une contribution publique au socle.

Les sessions d'assistance gardent les références de version et modifications nécessaires à la revue, limitent les copies de travail et définissent leur durée de conservation. Une révocation retire l'accès et termine les interventions dépendantes ; traiter les copies et traces selon les engagements convenus, sans promettre d'effacer à distance un historique déjà reçu par un tiers.

## Recette et éléments à finaliser

- Politiques : exercer deux configurations de test, SaaS autorisé en Community puis réservé à un droit premium, sans modifier les modules ; ces fixtures ne constituent pas une offre publiée. Inscription présentée au démarrage, local hors ligne et propriétaire vérifié avant publication officielle.
- Activation : paiement de test et événement signé → droits centralisés → justificatif vérifié → fonction accessible depuis UI/API/MCP uniquement avec les permissions requises.
- Refus : mauvaise installation, signature altérée, offre insuffisante, droit expiré et hébergement incompatible ; absence d'élévation administrative.
- Continuité : panne centrale, renouvellement, révocation connue puis inconnue hors ligne, perte de droit et reprise sans suppression de données.
- Assistance : dépôt explicitement choisi, lecture autorisée, branche/PR seulement si accordées, révocation effective et aucune publication de code privé.
- Distribution : frontières Community/Enterprise explicites dans les paquets et notices, licences des sources/contributions vérifiées et aucun composant premium annoncé gratuit par une licence globale contradictoire.

Les licences définitives et les règles de vente nécessitent une revue juridique adaptée avant la première distribution commerciale. Ce jalon porte sur des textes et périmètres concrets ; il ne suspend pas la conception des contrats techniques. Aucun paiement, abonnement, accès à un dépôt client ni changement du fichier LICENSE n'est réalisé par ce document.
