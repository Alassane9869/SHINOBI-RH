# Guide de Déploiement Production

## Prérequis

- Serveur Linux (Ubuntu 20.04+ recommandé)
- Python 3.12+
- PostgreSQL 14+
- Nginx
- Supervisor (pour gérer Gunicorn)

## Étapes de Déploiement

### 1. Préparer le serveur

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer les dépendances
sudo apt install python3-pip python3-venv postgresql postgresql-contrib nginx supervisor -y
```

### 2. Configurer PostgreSQL

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données et l'utilisateur
CREATE DATABASE grh_db;
CREATE USER grh_user WITH PASSWORD 'votre_mot_de_passe_securise';
ALTER ROLE grh_user SET client_encoding TO 'utf8';
ALTER ROLE grh_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE grh_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE grh_db TO grh_user;
\q
```

### 3. Déployer l'application

```bash
# Créer le répertoire de l'application
sudo mkdir -p /var/www/grh-backend
cd /var/www/grh-backend

# Cloner le code (ou copier via FTP/SCP)
# git clone votre_repo .

# Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
pip install gunicorn
```

### 4. Configurer l'environnement (.env)

```bash
nano .env
```

Contenu :
```env
DEBUG=False
SECRET_KEY=votre_clé_secrète_très_longue_et_aléatoire
ALLOWED_HOSTS=votre-domaine.com,www.votre-domaine.com

DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=grh_db
DATABASE_USER=grh_user
DATABASE_PASSWORD=votre_mot_de_passe_securise
DATABASE_HOST=localhost
DATABASE_PORT=5432

CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

### 5. Migrations et fichiers statiques

```bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### 6. Configurer Gunicorn

Créer `/etc/supervisor/conf.d/grh-backend.conf` :

```ini
[program:grh-backend]
directory=/var/www/grh-backend
command=/var/www/grh-backend/venv/bin/gunicorn backend.wsgi:application --bind 127.0.0.1:8000 --workers 3
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/grh-backend.log
```

Activer :
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start grh-backend
```

### 7. Configurer Nginx

Créer `/etc/nginx/sites-available/grh-backend` :

```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    location /static/ {
        alias /var/www/grh-backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/grh-backend/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activer :
```bash
sudo ln -s /etc/nginx/sites-available/grh-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. SSL avec Let's Encrypt (optionnel mais recommandé)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

## Maintenance

### Redémarrer l'application
```bash
sudo supervisorctl restart grh-backend
```

### Voir les logs
```bash
tail -f /var/log/grh-backend.log
```

### Mettre à jour l'application
```bash
cd /var/www/grh-backend
source venv/bin/activate
git pull  # ou copier les nouveaux fichiers
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo supervisorctl restart grh-backend
```

## Sécurité

- Toujours utiliser HTTPS en production
- Changer le SECRET_KEY régulièrement
- Utiliser des mots de passe forts pour PostgreSQL
- Configurer un pare-feu (UFW)
- Mettre en place des sauvegardes régulières de la base de données
- Limiter l'accès SSH par clé uniquement
