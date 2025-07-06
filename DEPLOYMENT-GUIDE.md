# 🚀 Guide de Déploiement - Système de Gestion de Bibliothèque

## 📋 Vue d'Ensemble

Ce guide détaille les étapes de déploiement du système de gestion de bibliothèque en production. Le système est composé de trois parties principales :
- **Backend API** (Node.js + Express)
- **Frontend Web** (Next.js + TypeScript)
- **Base de données** (MySQL)

## 🏗️ Architecture de Déploiement

```
Production Environment
├── Serveur Web (Frontend)
│   ├── Next.js Application
│   ├── Static Assets
│   └── Reverse Proxy (Nginx)
├── Serveur API (Backend)
│   ├── Node.js + Express
│   ├── JWT Authentication
│   └── Business Logic
└── Serveur Base de Données
    ├── MySQL 8.0+
    ├── Data Persistence
    └── Automated Backups
```

## 🔧 Prérequis de Déploiement

### Serveur de Production
- **OS** : Ubuntu 20.04 LTS ou supérieur
- **RAM** : Minimum 4GB (8GB recommandé)
- **CPU** : 2 cores minimum (4 cores recommandé)
- **Stockage** : 50GB minimum (SSD recommandé)
- **Réseau** : Connexion stable avec IP publique

### Logiciels Requis
- **Node.js** 18.x ou supérieur
- **MySQL** 8.0 ou supérieur
- **Nginx** (reverse proxy)
- **PM2** (process manager)
- **Git** (déploiement)
- **SSL/TLS** certificats (Let's Encrypt)

## 📦 1. Préparation du Serveur

### 1.1 Mise à jour du Système
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl wget git build-essential -y
```

### 1.2 Installation de Node.js
```bash
# Via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérification
node --version
npm --version
```

### 1.3 Installation de MySQL
```bash
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Configuration
sudo mysql -u root -p
```

```sql
-- Création de la base de données et utilisateur
CREATE DATABASE bibliotheque;
CREATE USER 'bibliotheque_user'@'localhost' IDENTIFIED BY 'mot_de_passe_securise';
GRANT ALL PRIVILEGES ON bibliotheque.* TO 'bibliotheque_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 1.4 Installation de Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.5 Installation de PM2
```bash
sudo npm install -g pm2
```

## 🗄️ 2. Déploiement de la Base de Données

### 2.1 Configuration MySQL
```bash
# Édition de la configuration MySQL
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

```ini
# Optimisations pour la production
[mysqld]
innodb_buffer_pool_size = 2G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
query_cache_type = 1
query_cache_size = 256M
max_connections = 500
```

```bash
# Redémarrage MySQL
sudo systemctl restart mysql
```

### 2.2 Sécurisation
```bash
# Firewall pour MySQL (accessible seulement localement)
sudo ufw allow from 127.0.0.1 to any port 3306
```

### 2.3 Script de Sauvegarde Automatique
```bash
# Création du script de backup
sudo nano /opt/backup-bibliotheque.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/bibliotheque"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="bibliotheque"
DB_USER="bibliotheque_user"
DB_PASSWORD="mot_de_passe_securise"

# Création du répertoire de backup
mkdir -p $BACKUP_DIR

# Sauvegarde de la base de données
mysqldump -u$DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/bibliotheque_$DATE.sql

# Compression
gzip $BACKUP_DIR/bibliotheque_$DATE.sql

# Suppression des sauvegardes de plus de 30 jours
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: bibliotheque_$DATE.sql.gz"
```

```bash
# Permissions et automatisation
sudo chmod +x /opt/backup-bibliotheque.sh
sudo crontab -e
# Ajouter : 0 2 * * * /opt/backup-bibliotheque.sh
```

## 🔧 3. Déploiement du Backend

### 3.1 Clone et Configuration
```bash
# Création de l'utilisateur applicatif
sudo adduser bibliotheque --disabled-password --gecos ""
sudo su - bibliotheque

# Clone du repository
git clone https://github.com/votre-repo/bibliotheque.git
cd bibliotheque/Backend\ 2/

# Installation des dépendances
npm ci --production
```

### 3.2 Configuration Environnement
```bash
# Création du fichier .env
nano .env
```

```env
# Configuration de production
NODE_ENV=production

# Base de données
DB_HOST=localhost
DB_USER=bibliotheque_user
DB_PASSWORD=mot_de_passe_securise
DB_NAME=bibliotheque
DB_PORT=3306

# Serveur
PORT=4401
HOST=127.0.0.1

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise_pour_production
JWT_EXPIRE=24h

# Email (si configuré)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=bibliotheque@votre-domaine.com
SMTP_PASSWORD=mot_de_passe_email

# URLs
FRONTEND_URL=https://votre-domaine.com
BACKEND_URL=https://api.votre-domaine.com

# Logs
LOG_LEVEL=info
LOG_FILE=/var/log/bibliotheque/backend.log
```

### 3.3 Initialisation de la Base de Données
```bash
# Exécution des migrations et seeders
npm run migrate
npm run seed:production  # Si vous avez des données de base
```

### 3.4 Configuration PM2
```bash
# Création du fichier de configuration PM2
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'bibliotheque-api',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4401
    },
    log_file: '/var/log/bibliotheque/backend.log',
    error_file: '/var/log/bibliotheque/backend-error.log',
    out_file: '/var/log/bibliotheque/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '1G',
    restart_delay: 4000,
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    env_production: {
      NODE_ENV: 'production'
    }
  }]
}
```

```bash
# Création du répertoire de logs
sudo mkdir -p /var/log/bibliotheque
sudo chown bibliotheque:bibliotheque /var/log/bibliotheque

# Démarrage avec PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 🎨 4. Déploiement du Frontend

### 4.1 Build de Production
```bash
cd ../fronctend/

# Configuration des variables d'environnement
nano .env.production
```

```env
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com
NEXT_PUBLIC_SITE_URL=https://votre-domaine.com
NEXTAUTH_SECRET=secret_nextauth_production
NEXTAUTH_URL=https://votre-domaine.com
```

```bash
# Installation et build
npm ci
npm run build

# Test du build
npm start
```

### 4.2 Configuration PM2 pour Frontend
```bash
nano ecosystem.frontend.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'bibliotheque-frontend',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: '/var/log/bibliotheque/frontend.log',
    error_file: '/var/log/bibliotheque/frontend-error.log',
    out_file: '/var/log/bibliotheque/frontend-out.log',
    max_memory_restart: '1G'
  }]
}
```

```bash
pm2 start ecosystem.frontend.config.js
pm2 save
```

## 🌐 5. Configuration Nginx

### 5.1 Configuration du Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/bibliotheque
```

```nginx
# Configuration pour le frontend
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;
    
    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }

    # Static files caching
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Images and assets
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000";
    }
}

# Configuration pour l'API
server {
    listen 80;
    server_name api.votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.votre-domaine.com;

    # SSL Configuration (même que frontend)
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # API Backend
    location / {
        proxy_pass http://127.0.0.1:4401;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS Headers
        add_header Access-Control-Allow-Origin "https://votre-domaine.com";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    }

    # Rate limiting
    location /auth/ {
        limit_req zone=auth burst=5 nodelay;
        proxy_pass http://127.0.0.1:4401;
    }
}
```

### 5.2 Activation et SSL
```bash
# Activation du site
sudo ln -s /etc/nginx/sites-available/bibliotheque /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Installation de Certbot pour SSL
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com -d api.votre-domaine.com

# Renouvellement automatique
sudo crontab -e
# Ajouter : 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔥 6. Configuration du Firewall

```bash
# Configuration UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow from 127.0.0.1 to any port 3000
sudo ufw allow from 127.0.0.1 to any port 4401
sudo ufw --force enable
```

## 📊 7. Monitoring et Logs

### 7.1 Configuration des Logs
```bash
# Rotation des logs
sudo nano /etc/logrotate.d/bibliotheque
```

```
/var/log/bibliotheque/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 bibliotheque bibliotheque
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 7.2 Monitoring avec PM2
```bash
# Installation de PM2 Monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30

# Monitoring en temps réel
pm2 monit
pm2 logs
pm2 status
```

## 🔧 8. Scripts de Maintenance

### 8.1 Script de Déploiement
```bash
sudo nano /opt/deploy-bibliotheque.sh
```

```bash
#!/bin/bash
set -e

echo "🚀 Déploiement de la Bibliothèque..."

# Variables
APP_DIR="/home/bibliotheque/bibliotheque"
BACKUP_DIR="/var/backups/bibliotheque"

# Sauvegarde de la DB avant déploiement
echo "💾 Sauvegarde de la base de données..."
/opt/backup-bibliotheque.sh

# Mise à jour du code
echo "📥 Mise à jour du code..."
cd $APP_DIR
git pull origin main

# Backend
echo "🔧 Mise à jour du Backend..."
cd "Backend 2"
npm ci --production
pm2 restart bibliotheque-api

# Frontend
echo "🎨 Mise à jour du Frontend..."
cd ../fronctend
npm ci
npm run build
pm2 restart bibliotheque-frontend

echo "✅ Déploiement terminé avec succès!"
```

### 8.2 Script de Santé
```bash
sudo nano /opt/health-check.sh
```

```bash
#!/bin/bash

# Vérification des services
services=("mysql" "nginx" "pm2")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        echo "✅ $service est actif"
    else
        echo "❌ $service est inactif"
        # Optionnel : restart automatique
        # sudo systemctl restart $service
    fi
done

# Vérification des applications PM2
pm2 status | grep -E "(online|stopped|errored)"

# Vérification des endpoints
curl -f http://localhost:3000 > /dev/null 2>&1 && echo "✅ Frontend accessible" || echo "❌ Frontend inaccessible"
curl -f http://localhost:4401/health > /dev/null 2>&1 && echo "✅ API accessible" || echo "❌ API inaccessible"
```

## 📋 9. Checklist de Déploiement

### Avant le Déploiement
- [ ] Serveur configuré et sécurisé
- [ ] MySQL installé et configuré
- [ ] Node.js et PM2 installés
- [ ] Nginx installé et configuré
- [ ] SSL/TLS configuré
- [ ] Firewall activé et configuré
- [ ] Variables d'environnement configurées
- [ ] Tests effectués en local

### Après le Déploiement
- [ ] Services démarrés (MySQL, Nginx, PM2)
- [ ] Applications accessibles via HTTPS
- [ ] Base de données migrée et seedée
- [ ] Logs fonctionnels
- [ ] Monitoring activé
- [ ] Sauvegardes programmées
- [ ] Tests fonctionnels effectués
- [ ] Performance vérifiée

### Tests de Validation
- [ ] Connexion utilisateur
- [ ] Catalogue de livres accessible
- [ ] Emprunt de livre fonctionnel
- [ ] Interface admin accessible
- [ ] Statistiques correctes
- [ ] Notifications fonctionnelles
- [ ] Performance acceptable (< 2s)

## 🆘 10. Dépannage

### Problèmes Courants

**Application inaccessible :**
```bash
# Vérifier les services
sudo systemctl status nginx
pm2 status
pm2 logs

# Vérifier les ports
sudo netstat -tlnp | grep -E ':80|:443|:3000|:4401'
```

**Erreurs de base de données :**
```bash
# Logs MySQL
sudo tail -f /var/log/mysql/error.log

# Connexion de test
mysql -u bibliotheque_user -p bibliotheque
```

**Problèmes de performance :**
```bash
# Monitoring des ressources
htop
iotop
pm2 monit
```

### Commandes Utiles
```bash
# Redémarrage complet
sudo systemctl restart mysql nginx
pm2 restart all

# Vérification des logs
pm2 logs --lines 100
sudo tail -f /var/log/nginx/error.log

# Mise à jour de sécurité
sudo apt update && sudo apt upgrade
npm audit fix
```

## 📞 Support et Maintenance

- **Monitoring** : Vérification quotidienne des services
- **Sauvegardes** : Validation hebdomadaire des backups
- **Mises à jour** : Déploiement mensuel des correctifs
- **Sécurité** : Audit trimestriel de sécurité

---

**🎉 Félicitations ! Votre système de gestion de bibliothèque est maintenant déployé en production !**
