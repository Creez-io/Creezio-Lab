# Instructions Creezio-D1R2

Lire `README.md` avant intervention. Le périmètre confirmé par l'utilisateur prime sur les anciennes architectures des dépôts de référence.

- État initial : cadrage. La création du dépôt et de sa documentation est autorisée ; le plan complet doit précéder l'implémentation.
- Conserver les fonctions natives Creezio. Préparer une matrice de correspondance et des validations ; ne pas supprimer une capacité pour obtenir un socle dit léger.
- Séparer le back-office Creezio de l'interface des utilisateurs métier. Le front utilise les API autorisées du backend et des extensions.
- Un projet/repo et un déploiement Docker commun par application ; pas de repo Admin de flotte séparé ni de conteneur par client.
- Permettre données communes ou D1/R2 isolés selon l'application. Ne pas imposer le métier Tempoflow ou WinHub au cœur du CMS.
- Extensions : contrat commun couvrant schéma/données, migrations, API/MCP, droits, recherche, UI et widgets du chat. Les widgets ne créent pas une seconde logique métier.
- Première application de test par fork après structuration et vérification du socle ; elle doit être validée avant la recréation des applications existantes.
- Ne pas modifier les sources de référence, leurs bases ou leurs déploiements sans mandat spécifique.
- Ne jamais committer de secrets, jetons, données utilisateur ou clés privées.

## Espace disque

Réutiliser les checkouts, dépendances et builds existants. Vérifier l'espace libre avant installation, copie ou build volumineux ; sous 20 Gio, traiter d'abord les temporaires connus et inutilisés du travail. Préserver sources, modifications non committées, bases, secrets et livrables. Conserver le build actif et les éléments nécessaires au retour arrière. Avant suppression récursive, vérifier confinement et absence de liens/jonctions et de processus utilisateurs ; sous Windows utiliser PowerShell et `Remove-Item -LiteralPath`. Ne laisser aucun serveur de test inutile.
