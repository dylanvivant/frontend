# S4V Team Frontend

Frontend moderne pour la gestion d'équipe S4V, développé avec React, TailwindCSS et Vite.

## 🚀 Démarrage rapide

### Prérequis

- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev

# Construction pour la production
npm run build
```

## 🏗️ Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base
│   └── layout/         # Composants de mise en page
├── contexts/           # Contextes React
├── hooks/             # Hooks personnalisés
├── pages/             # Pages de l'application
├── services/          # Services API
├── utils/             # Utilitaires
└── main.jsx           # Point d'entrée
```

## 🎨 Design

### Palette de couleurs

- **Primaire** : #a189c9 (violet)
- **Secondaire** : #e9c46a (jaune)
- **Grays** : Palette de gris pour les éléments neutres

### Composants

- Design minimaliste et moderne
- Responsive design (mobile-first)
- Composants réutilisables avec variants
- Utilisation du nombre d'or pour les proportions

## 🔧 Technologies utilisées

- **React** 18.2 - Bibliothèque UI
- **TailwindCSS** - Framework CSS
- **Vite** - Build tool
- **React Router** - Navigation
- **React Query** - Gestion des données
- **React Hook Form** - Gestion des formulaires
- **Axios** - Client HTTP
- **Heroicons** - Icônes
- **date-fns** - Manipulation des dates

## 📱 Fonctionnalités

### Authentification

- Connexion / Inscription
- Gestion des tokens JWT
- Profil utilisateur

### Tableau de bord

- Aperçu des statistiques
- Événements à venir
- Notifications récentes

### Gestion d'équipe

- Liste des membres
- Rôles et permissions
- Profils des joueurs

### Événements

- Création d'événements
- Gestion des participations
- Calendrier

### Notifications

- Notifications en temps réel
- Marquage comme lu
- Historique

## 🚀 Scripts disponibles

```bash
# Développement
npm run dev

# Construction
npm run build

# Aperçu de la build
npm run preview

# Linting
npm run lint
```

## 🔒 Sécurité

- Authentification par JWT
- Gestion automatique du refresh token
- Protection des routes
- Validation des données côté client

## 📦 Déploiement

Le projet est configuré pour être déployé facilement avec Vite :

```bash
npm run build
```

Les fichiers générés dans le dossier `dist` peuvent être servis par n'importe quel serveur web statique.

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT.
