# Guide de Démarrage Rapide

## Installation

```bash
# 1. Installer les dépendances
pip install -r requirements.txt

# 2. Configurer .env (voir README.md)

# 3. Migrations
python manage.py makemigrations
python manage.py migrate

# 4. Créer superuser
python manage.py createsuperuser

# 5. Lancer le serveur
python manage.py runserver
```

## Tester l'API

### 1. Inscrire une entreprise
```bash
POST http://127.0.0.1:8000/api/company/register/
{
  "name": "Ma Société",
  "email": "contact@masociete.com",
  "admin_email": "admin@masociete.com",
  "admin_password": "motdepasse123",
  "admin_first_name": "Jean",
  "admin_last_name": "Dupont"
}
```

### 2. Se connecter
```bash
POST http://127.0.0.1:8000/api/auth/login/
{
  "email": "admin@masociete.com",
  "password": "motdepasse123"
}
```

Réponse :
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 3. Utiliser le token
Ajouter dans les headers :
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

## Documentation API

- Swagger : http://127.0.0.1:8000/api/docs/
- ReDoc : http://127.0.0.1:8000/api/redoc/
- Admin : http://127.0.0.1:8000/admin/
