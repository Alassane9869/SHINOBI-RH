# Backend GRH SaaS Multi-tenant

Backend Django REST Framework complet pour un système de gestion des ressources humaines (GRH) multi-entreprise.

## 🎯 Fonctionnalités

- **Multi-tenant** : Isolation stricte des données par entreprise
- **Authentification JWT** : Tokens d'accès et de rafraîchissement
- **Gestion des employés** : CRUD complet avec upload de photos et contrats
- **Présence/Absence** : Suivi des présences avec check-in/check-out
- **Gestion des congés** : Demandes, approbations, rejets
- **Paie** : Génération automatique de bulletins de paie en PDF
- **Documents** : Upload et gestion de documents RH
- **Permissions par rôle** : Admin, RH, Manager, Employé
- **Documentation API** : Swagger et ReDoc automatiques

## 🛠️ Stack Technique

- Python 3.12+
- Django 5.2+
- Django REST Framework
- SimpleJWT (authentification)
- drf-spectacular (documentation API)
- xhtml2pdf (génération PDF)
- Cloudinary (stockage fichiers)
- PostgreSQL (production) / SQLite (développement)

## 📦 Installation

### 1. Cloner le projet et créer l'environnement virtuel

```bash
cd backend
python -m venv venv
```

### 2. Activer l'environnement virtuel

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 4. Configuration de l'environnement

Créer un fichier `.env` à la racine du projet `backend/` :

```env
DEBUG=True
SECRET_KEY=votre-clé-secrète-django
ALLOWED_HOSTS=*

# Base de données (PostgreSQL pour production)
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=grh_db
DATABASE_USER=postgres
DATABASE_PASSWORD=votre_mot_de_passe
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Pour développement avec SQLite, utilisez :
# DATABASE_ENGINE=django.db.backends.sqlite3

# Cloudinary (optionnel)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

### 5. Migrations de base de données

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Créer un superutilisateur

```bash
python manage.py createsuperuser
```

### 7. Lancer le serveur

```bash
python manage.py runserver
```

Le serveur sera accessible sur `http://127.0.0.1:8000/`

## 📚 Documentation API

Une fois le serveur lancé, accédez à :

- **Swagger UI** : `http://127.0.0.1:8000/api/docs/`
- **ReDoc** : `http://127.0.0.1:8000/api/redoc/`
- **Schema JSON** : `http://127.0.0.1:8000/api/schema/`

## 🌐 Endpoints Principaux

### Authentification
- `POST /api/company/register/` - Inscription d'une nouvelle entreprise
- `POST /api/auth/login/` - Connexion (obtenir tokens JWT)
- `POST /api/auth/refresh/` - Rafraîchir le token d'accès
- `GET /api/auth/me/` - Profil utilisateur connecté

### Gestion
- `/api/employees/` - CRUD employés
- `/api/attendance/` - Gestion présences
- `/api/leaves/` - Gestion congés
- `/api/payroll/` - Gestion paie
- `/api/documents/` - Gestion documents

## 🔐 Rôles et Permissions

### Rôles disponibles
- **admin** : Accès total à toutes les fonctionnalités
- **rh** : Gestion employés, salaires, congés
- **manager** : Validation des congés
- **employe** : Accès profil personnel et demandes de congé

### Permissions personnalisées
- `IsCompanyMember` : Vérifie l'appartenance à l'entreprise
- `IsAdmin` : Réservé aux administrateurs
- `IsRH` : Réservé aux RH et admins
- `IsManager` : Réservé aux managers, RH et admins

## 📄 Génération de PDF

Les bulletins de paie sont générés automatiquement en PDF lors de la création d'une entrée de paie. Le template se trouve dans `templates/payroll/payslip.html`.

## 🗂️ Structure du Projet

```
backend/
├── backend/              # Configuration Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── core/            # Modèles de base
│   ├── company/         # Gestion entreprises
│   ├── accounts/        # Utilisateurs et auth
│   ├── employees/       # Gestion employés
│   ├── attendance/      # Présences
│   ├── leaves/          # Congés
│   ├── payroll/         # Paie
│   └── documents/       # Documents
├── templates/           # Templates HTML pour PDF
├── static/             # Fichiers statiques
├── media/              # Fichiers uploadés
└── manage.py
```

## 🚀 Production

Pour déployer en production :

1. Configurer PostgreSQL
2. Mettre `DEBUG=False` dans `.env`
3. Configurer `ALLOWED_HOSTS` correctement
4. Utiliser Gunicorn : `gunicorn backend.wsgi:application`
5. Configurer un serveur web (Nginx) comme reverse proxy
6. Utiliser Cloudinary ou AWS S3 pour les fichiers media

## 📝 Notes Importantes

- Chaque modèle inclut automatiquement `created_at` et `updated_at` via `BaseModel`
- L'isolation multi-tenant est gérée via le champ `company` obligatoire
- Les permissions vérifient automatiquement l'appartenance à l'entreprise
- Les fichiers uploadés sont organisés par type dans le dossier `media/`

## 🤝 Support

Pour toute question ou problème, consultez la documentation API Swagger ou contactez l'équipe de développement.
