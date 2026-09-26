# Modules Creezio compatibles ChatGPT

Contrat de conception du 26 septembre 2026. La compatibilité ChatGPT fait partie du contrat natif des modules. Elle reste à implémenter et à vérifier dans ChatGPT ; l'existence d'API ou d'un serveur MCP ne suffit pas à la déclarer acquise.

## Un module, plusieurs interfaces

Le module décrit ses modèles D1, fichiers R2, opérations, permissions, vues, widgets et skills. Ces déclarations alimentent ses interfaces dans Creezio et son intégration ChatGPT. La logique métier et les contrôles restent uniques côté serveur. Le développeur n'écrit pas un second backend pour ChatGPT.

Sur Sites, les données des modules occupent des tables et espaces de fichiers déclarés dans le couple D1/R2 de l'application, avec droits et contextes contrôlés. Un widget n'obtient ni accès direct aux bindings ni secrets. L'état durable reste dans Creezio ; une sélection visuelle temporaire appartient au composant. La connexion ChatGPT n'attribue pas implicitement de compte ou de droits Creezio.

Le même composant métier peut alimenter un widget Creezio et une ressource MCP Apps au moyen d'adaptateurs d'hôte. Les layouts complets du back-office restent propres à l'administration. Prévoir un hôte MCP Apps dans le chat Creezio, un adaptateur ChatGPT et un contrat de rendu réutilisable dans le front ; démontrer cette portabilité sans maintenir deux logiques métier.

## Contrat UI et outils

Adopter MCP Apps pour les nouveaux widgets : ressource HTML `text/html;profile=mcp-app`, URI versionnée et liaison `_meta.ui.resourceUri`. Le pont `ui/*` échange avec l'hôte ; `window.openai` fournit seulement les capacités spécifiques détectées à l'exécution. Les outils doivent rester utiles sans composant. Séparer les opérations de données du rendu lorsque cela évite de remonter inutilement une interface. [UI MCP Apps dans ChatGPT](https://developers.openai.com/plugins/build/chatgpt-ui).

Déclarer schémas d'entrée/sortie, annotations, identité stable, droits et périmètre d'exposition. Retourner des résultats structurés utilisables par le modèle et l'UI, avec pagination. Les métadonnées réservées au composant ne sont jamais un coffre à secrets. Les domaines de ressources/connexion, l'origine du composant et ses capacités d'affichage font partie du profil d'hébergement. La soumission publique avec UI exige une origine dédiée unique au plugin : qualifier cette exigence pour chaque paquet exposé, sans imposer un Worker par module. [Référence UI](https://developers.openai.com/plugins/reference).

Les bundles de widgets sont construits et versionnés avec leurs styles/assets. Le Worker expose les ressources depuis le build ou les assets autorisés ; il ne lit pas un dossier Node local à l'exécution. Fixer ensemble les versions du SDK MCP et des helpers MCP Apps compatibles. Les exemples sont des références de composition ; un serveur Node de démonstration n'est pas le runtime serverless du produit. [Exemples officiels](https://github.com/openai/openai-apps-sdk-examples).

## Identité et appels

L'accès ChatGPT aux données protégées utilise OAuth délégué vers les comptes Creezio : découverte, PKCE, portées, audience, consentement, renouvellement et révocation. ChatGPT ne fournit pas une clé API personnalisée ni un grant `client_credentials` pour ce parcours. Déclarer les schémas de sécurité des outils et les erreurs de liaison attendues. Les appels d'automatisation compatibles conservent leurs tokens API ; les différents canaux utilisent les mêmes opérations autorisées. [Authentification Plugins](https://developers.openai.com/plugins/build/auth).

La clé du module OpenAI sert au LLM du chat intégré à Creezio. Elle n'est pas utilisée pour connecter un utilisateur de ChatGPT au MCP de l'application. Inversement, installer un plugin dans ChatGPT ne fournit pas une clé OpenAI au chat Creezio.

## Skills et paquet distribuable

Chaque module prévoit des workflows `skills/<nom>/SKILL.md`, avec références et ressources nécessaires. Ils expliquent comment employer les outils ; autorisations et données réelles restent au serveur. Leur qualité et leurs déclenchements font partie de la recette. L'import depuis MCP pendant Scan Tools produit une copie des skills dans le plugin, pas une lecture dynamique à chaque utilisation. [Skills](https://developers.openai.com/plugins/build/skills).

L'import MCP des skills repose actuellement sur un sous-ensemble de l'extension draft SEP-2640, avec découverte, ressources et empreintes déclarées. La limite documentée est de cinq skills par scan : le générateur sélectionne et valide une composition explicite, sans omettre silencieusement des workflows. Épingler ce contrat versionné et revérifier ses limites avant distribution. Une modification exige un nouveau scan puis une nouvelle version, revue et publication. [Import des skills MCP](https://developers.openai.com/plugins/build/mcp-server#import-skills-from-the-mcp-server).

Le starter produit trois livrables à partir d'une même source : paquet de module Creezio, démonstration du module dans Creezio, et paquet de plugin ChatGPT/Codex relié à un déploiement autorisé. Le format portable utilise `plugin.json` à la racine, `mcp.json` et `skills/`, avec `extensions.com.openai` pour les réglages OpenAI ; le format `.codex-plugin/plugin.json` reste un mécanisme de compatibilité. Les identités de connexion attribuées par la plateforme sont propres à l'installation. [Packaging](https://developers.openai.com/plugins/build/plugins).

Un profil de publication peut sélectionner un module ou un ensemble cohérent de modules, avec noms sans collision, skills choisis et endpoint HTTPS défini. Le parcours public courant utilise un endpoint fixe ; les URL templates par client nécessitent un accord OpenAI. Un plugin publié n'accepte donc pas automatiquement l'URL de n'importe quel fork. Qualifier l'identité et les origines de chaque publication. Les outils réservés à l'administration ne sont pas exposés automatiquement. [Destinations MCP publiques](https://developers.openai.com/plugins/deploy/app-review#template-mcp-server-urls).

La publication du code Creezio, du paquet npm et du plugin ChatGPT sont des étapes distinctes. Les changements de skills nécessitent la mise à jour de leur distribution. Préserver la compatibilité d'un schéma encore connu du client pendant une évolution serveur. Vérifier les limites et procédures courantes de scan/soumission au moment de publier ; ne pas promettre qu'installer un module Creezio l'inscrit automatiquement dans l'annuaire OpenAI.

## Preuve requise

Le module de recette possède un objet D1 et une pièce jointe R2. Depuis le front Creezio puis depuis ChatGPT, le même utilisateur autorisé retrouve cet objet, affiche le widget, exécute une action et relit le résultat. Un skill guide le workflow sans inventer les données. Tester utilisateur interdit, révocation, objet modifié, double action, widget historique et fonctionnement sans UI. Vérifier le paquet produit et sa mise à jour, ainsi que le rendu réel dans ChatGPT ; un simulateur de pont ou un test MCP seul ne suffit pas. Cette recette complète celle des deux Sites A/B.
