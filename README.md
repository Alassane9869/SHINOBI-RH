# GRH - Système de Gestion des Ressources Humaines

Un système complet de gestion des ressources humaines développé avec Django REST Framework et React.

## 🚀 Fonctionnalités

### ✅ Implémenté
- **Authentification & Autorisation** : Système multi-rôles (Admin, RH, Manager, Employé)
- **Gestion des Employés** : CRUD complet avec profils détaillés
- **Gestion des Utilisateurs** : Administration des comptes
- **Gestion des Congés** : Demandes, approbations, historique
- **Gestion de la Paie** : Calcul automatique, bulletins de paie PDF
- **Présences** : Suivi des présences et absences
- **Documents** : Génération de contrats et attestations
- **Dashboard** : Statistiques et graphiques en temps réel
- **Export de Données** : PDF, Excel, CSV pour tous les modules
- **Reçus de Paiement** : Téléchargement des reçus et bulletins
- **Recherche & Filtres** : Sur toutes les pages de données
- **Mode Sombre** : Interface adaptative

## 🛠️ Technologies

### Backend
- Django 5.0+
- Django REST Framework
- PostgreSQL
- JWT Authentication
- xhtml2pdf (génération PDF)
- openpyxl & pandas (exports Excel/CSV)

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- TanStack Query (React Query)
- React Hook Form + Zod
- Framer Motion
- Axios

## 📦 Installation

### Prérequis
- Python 3.10+
- Node.js 18+
- PostgreSQL

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuration

### Backend (.env)
```
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost:5432/grh_db
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Frontend (.env)
```
VITE_API_URL=http://127.0.0.1:8000
```

## 📱 Utilisation

1. Accédez à `http://localhost:3000`
2. Connectez-vous avec vos identifiants
3. Explorez les différents modules

### Comptes par défaut
- **Admin** : admin@techcorp.com / admin123
- **RH** : rh@techcorp.com / rh123

## 🎯 Roadmap

### Priorité Haute
- [ ] Système de notifications en temps réel
- [ ] Tableau de bord analytique avancé

### Priorité Moyenne
- [ ] Opérations en masse (import Excel, génération groupée)
- [ ] Logs d'audit
- [ ] Rapports personnalisés

### Priorité Basse
- [ ] Authentification 2FA
- [ ] Support PWA
- [ ] Internationalisation (i18n)

## 📄 Licence

MIT License

## 👥 Contributeurs

Développé avec ❤️ pour la gestion RH moderne
