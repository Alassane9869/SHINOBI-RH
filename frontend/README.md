# Frontend React/Vite - GRH SaaS

Application frontend complète pour le système de gestion RH multi-tenant.

## 🚀 Démarrage rapide

```bash
cd frontend
npm install
npm run dev
```

L'application sera disponible sur **http://localhost:3000**

## 📁 Structure du projet

```
frontend/
├── src/
│   ├── api/
│   │   └── axiosClient.js          # Client HTTP avec interceptors JWT
│   ├── auth/
│   │   ├── AuthStore.js            # Store Zustand pour l'authentification
│   │   └── RequireAuth.jsx         # HOC pour protéger les routes
│   ├── components/
│   │   ├── Navbar.jsx              # Barre de navigation
│   │   ├── Sidebar.jsx             # Menu latéral
│   │   ├── DataTable.jsx           # Table réutilisable
│   │   ├── FileUploader.jsx        # Upload avec drag & drop
│   │   ├── ModalForm.jsx           # Modal réutilisable
│   │   ├── CardStat.jsx            # Carte de statistique
│   │   └── ConfirmDialog.jsx       # Dialog de confirmation
│   ├── pages/
│   │   ├── LandingPage.jsx         # Page d'accueil marketing
│   │   ├── Login.jsx               # Connexion
│   │   ├── RegisterCompany.jsx     # Inscription entreprise
│   │   ├── Dashboard.jsx           # Tableau de bord
│   │   ├── Employees.jsx           # Gestion employés
│   │   ├── Attendance.jsx          # Gestion présences
│   │   ├── Leaves.jsx              # Gestion congés
│   │   ├── Payroll.jsx             # Gestion paie
│   │   ├── Documents.jsx           # Gestion documents
│   │   └── Settings.jsx            # Paramètres
│   ├── App.jsx                     # Composant principal
│   ├── main.jsx                    # Point d'entrée
│   └── index.css                   # Styles globaux
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🎨 Technologies utilisées

- **React 18** - Framework UI
- **Vite** - Build tool ultra-rapide
- **React Router v6** - Routing
- **TanStack Query (React Query)** - Gestion état serveur
- **Zustand** - State management
- **Axios** - Client HTTP
- **React Hook Form** - Gestion formulaires
- **Zod** - Validation schémas
- **Tailwind CSS** - Styling
- **Recharts** - Graphiques
- **Lucide React** - Icônes
- **React Hot Toast** - Notifications
- **React Dropzone** - Upload fichiers

## 🔑 Fonctionnalités principales

### Authentification
- ✅ Login avec JWT
- ✅ Inscription entreprise multi-étapes
- ✅ Auto-refresh token
- ✅ Protection des routes par rôle
- ✅ Persistance de session

### Dashboard
- ✅ Statistiques en temps réel
- ✅ Graphiques interactifs
- ✅ Cartes de métriques

### Gestion Employés
- ✅ CRUD complet
- ✅ Upload photo de profil
- ✅ Téléchargement attestation de travail (PDF)
- ✅ Filtrage et recherche

### Présences
- ✅ Enregistrement présences
- ✅ Statuts (présent, absent, retard, excusé)
- ✅ Historique

### Congés
- ✅ Demande de congé avec pièce jointe
- ✅ Workflow d'approbation
- ✅ Statuts (en attente, approuvé, rejeté)
- ✅ Validation des dates

### Paie
- ✅ Création bulletins de paie
- ✅ Calcul automatique net
- ✅ Téléchargement PDF
- ✅ Historique des paiements

### Documents
- ✅ Upload fichiers (PDF, images)
- ✅ Catégorisation
- ✅ Stockage sécurisé

### Paramètres
- ✅ Informations entreprise
- ✅ Profil utilisateur
- ✅ Dark mode

## 🎯 Composants réutilisables

### DataTable
Table avec tri, pagination et actions (voir, éditer, supprimer).

```jsx
<DataTable
  columns={columns}
  data={data}
  isLoading={isLoading}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onView={handleView}
/>
```

### ModalForm
Modal responsive pour formulaires.

```jsx
<ModalForm isOpen={isOpen} onClose={onClose} title="Titre">
  {/* Contenu */}
</ModalForm>
```

### FileUploader
Upload avec drag & drop et preview.

```jsx
<FileUploader
  onFileSelect={setFile}
  accept={{ 'image/*': ['.png', '.jpg'] }}
  preview={file}
/>
```

## 🔐 Gestion de l'authentification

Le store Zustand gère l'état d'authentification :

```javascript
const { user, login, logout, isAuthenticated } = useAuthStore();
```

Les routes sont protégées avec `RequireAuth` :

```jsx
<Route path="/employees" element={
  <RequireAuth allowedRoles={['admin', 'rh']}>
    <Employees />
  </RequireAuth>
} />
```

## 🌐 API Client

Axios est configuré avec :
- Base URL automatique
- Interceptor pour ajouter le token JWT
- Auto-refresh du token expiré
- Gestion des erreurs centralisée

## 🎨 Thème et Styling

- **Tailwind CSS** pour le styling
- **Dark mode** activable
- **Design responsive** (mobile, tablet, desktop)
- **Composants réutilisables** avec classes CSS

## 📱 Pages

### Landing Page
Page marketing avec :
- Hero section
- Présentation fonctionnalités
- Avantages
- Call-to-action

### Dashboard
- 4 cartes de statistiques
- Graphique en barres
- Données en temps réel

### Pages CRUD
Toutes les pages suivent le même pattern :
1. Liste avec DataTable
2. Bouton "Nouveau"
3. Modal de création/édition
4. Actions (voir, éditer, supprimer)

## 🚀 Commandes

```bash
# Installation
npm install

# Développement
npm run dev

# Build production
npm run build

# Preview production
npm run preview
```

## 🔗 Connexion au backend

Le proxy Vite redirige `/api/*` vers `http://127.0.0.1:8000`.

Configuration dans `vite.config.js` :

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    }
  }
}
```

## 📝 Variables d'environnement

Créer un fichier `.env` :

```
VITE_API_URL=http://127.0.0.1:8000
```

## 🎯 Prochaines améliorations possibles

- [ ] Tests unitaires (Vitest)
- [ ] Tests E2E (Playwright)
- [ ] Internationalisation (i18n)
- [ ] PWA
- [ ] Export Excel
- [ ] Notifications en temps réel (WebSocket)
- [ ] Thèmes personnalisables
- [ ] Mode hors ligne

## 📄 Licence

Propriétaire - GRH SaaS
