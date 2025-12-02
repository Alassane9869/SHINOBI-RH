# 🚀 Guide de Configuration - Système de Paiement Shinobi RH

## ✅ Installation Terminée !

Le système de paiement est maintenant installé avec :
- ✓ Modèles de base de données créés
- ✓ Interface admin configurée
- ✓ Services de paiement (Stripe, Orange Money)
- ✓ Génération automatique de factures PDF
- ✓ Notifications email automatiques

---

## 📋 Étapes de Configuration

### 1. Installer les dépendances Python

```bash
cd backend
pip install stripe
```

### 2. Accéder à l'Admin Django

1. Démarrer le serveur : `python manage.py runserver`
2. Aller sur : http://127.0.0.1:8000/admin
3. Se connecter avec ton compte admin

### 3. Configurer Stripe (Carte Bancaire)

#### A. Créer un compte Stripe

1. Aller sur https://stripe.com
2. Créer un compte (gratuit)
3. Activer le mode test

#### B. Récupérer les clés API

1. Dans le dashboard Stripe, aller dans **Developers** → **API keys**
2. Copier :
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)

#### C. Configurer dans l'Admin Django

1. Dans l'admin Django, aller dans **Billing** → **Payment Configs**
2. Cliquer sur **Add Payment Config**
3. Remplir :
   - **Provider** : Stripe (Mastercard/Visa)
   - **Is active** : ✓ Coché
   - **Test mode** : ✓ Coché (pour commencer)
   - **API Key** : Coller la Publishable key
   - **API Secret** : Coller la Secret key
   - **Notification Email** : **TON EMAIL** (où tu veux recevoir les notifications)
4. Sauvegarder

#### D. Configurer les Webhooks Stripe

1. Dans Stripe Dashboard → **Developers** → **Webhooks**
2. Cliquer sur **Add endpoint**
3. URL : `https://ton-domaine.com/api/billing/webhooks/stripe/`
4. Événements à écouter :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copier le **Signing secret** (whsec_...)
6. Dans l'admin Django, modifier la config Stripe et coller dans **Webhook Secret**

### 4. Configurer Orange Money (Optionnel)

#### A. Obtenir un compte marchand

1. Contacter Orange Money Mali : +223 XX XX XX XX
2. Demander un compte marchand
3. Récupérer :
   - Merchant ID
   - API Secret

#### B. Configurer dans l'Admin

1. **Billing** → **Payment Configs** → **Add**
2. Remplir :
   - **Provider** : Orange Money
   - **Is active** : ✓ Coché
   - **Test mode** : ✓ Coché (au début)
   - **API Key** : Merchant ID
   - **API Secret** : API Secret
   - **Notification Email** : TON EMAIL
3. Sauvegarder

### 5. Créer les Plans d'Abonnement

1. Dans l'admin → **Billing** → **Subscription Plans** → **Add**

#### Plan Starter (Gratuit)
- **Name** : Starter
- **Slug** : starter
- **Price** : 0
- **Currency** : XOF
- **Period** : monthly
- **Max employees** : 10
- **Is active** : ✓
- **Features** (JSON) :
```json
{
  "basic_management": true,
  "email_support": true,
  "max_employees": 10
}
```

#### Plan Pro
- **Name** : Pro
- **Slug** : pro
- **Price** : 30000
- **Currency** : XOF
- **Period** : monthly
- **Max employees** : 50
- **Is popular** : ✓
- **Features** (JSON) :
```json
{
  "advanced_analytics": true,
  "priority_support": true,
  "api_access": true,
  "max_employees": 50
}
```

#### Plan Enterprise
- **Name** : Enterprise
- **Slug** : enterprise
- **Price** : 0 (Sur devis)
- **Currency** : XOF
- **Period** : monthly
- **Max employees** : null (illimité)
- **Features** (JSON) :
```json
{
  "unlimited_employees": true,
  "dedicated_support": true,
  "sla_guarantee": true,
  "sso": true,
  "account_manager": true
}
```

---

## 🎯 Comment ça marche ?

### Flux de paiement automatique

1. **Client choisit un plan** sur le frontend
2. **Client entre ses infos de paiement** (carte ou Orange Money)
3. **Paiement traité automatiquement**
4. **Système valide automatiquement** (pas d'action manuelle)
5. **Facture PDF générée automatiquement**
6. **Email envoyé au client** avec la facture
7. **Email envoyé à TOI** avec les détails du paiement et coordonnées du client

### Ce que tu reçois par email

Quand un client paie, tu reçois un email avec :
- ✅ Montant payé
- ✅ Nom de l'entreprise
- ✅ Plan choisi
- ✅ Méthode de paiement
- ✅ Transaction ID
- ✅ Email du client
- ✅ Téléphone du client
- ✅ Date et heure

**Tout est AUTO-VALIDÉ** - Pas besoin de faire quoi que ce soit !

---

## 🧪 Tester le système

### Test avec Stripe (Mode Test)

1. Utiliser une carte de test Stripe :
   - **Numéro** : 4242 4242 4242 4242
   - **Date** : N'importe quelle date future
   - **CVC** : N'importe quel 3 chiffres

2. Le paiement sera validé automatiquement
3. Tu recevras un email de notification
4. La facture sera générée

### Test avec Orange Money (Mode Test)

1. En mode test, le système simule le paiement
2. Pas besoin de vraie transaction
3. Tout fonctionne comme en production

---

## 📧 Configuration Email (Important !)

Pour recevoir les notifications, configure l'email dans `settings.py` :

```python
# Email settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # Ou ton serveur SMTP
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'ton-email@gmail.com'
EMAIL_HOST_PASSWORD = 'ton-mot-de-passe-app'  # Mot de passe d'application Gmail
DEFAULT_FROM_EMAIL = 'Shinobi RH <noreply@shinobih.com>'
```

### Pour Gmail :
1. Activer la validation en 2 étapes
2. Générer un "Mot de passe d'application"
3. Utiliser ce mot de passe dans `EMAIL_HOST_PASSWORD`

---

## 🎨 Frontend (À venir)

Le frontend sera créé avec :
- Page de sélection de plan
- Page de checkout
- Formulaires de paiement (Stripe Elements)
- Dashboard d'abonnement
- Historique des paiements

---

## 🆘 Dépannage

### Les emails ne sont pas envoyés

- Vérifier la configuration SMTP dans `settings.py`
- Vérifier que l'email de notification est configuré dans l'admin
- Tester avec : `python manage.py shell`
  ```python
  from django.core.mail import send_mail
  send_mail('Test', 'Message test', 'from@example.com', ['to@example.com'])
  ```

### Les paiements ne sont pas validés

- Vérifier que les webhooks Stripe sont configurés
- Vérifier les logs dans l'admin Django
- Vérifier que le webhook secret est correct

### Les factures ne sont pas générées

- Vérifier que xhtml2pdf est installé : `pip install xhtml2pdf`
- Vérifier les permissions du dossier `media/invoices/`

---

## 📞 Support

Pour toute question :
- WhatsApp : +223 66 82 62 07
- Email : contact@shinobih.com

---

## 🎉 C'est tout !

Le système est prêt à l'emploi. Configure juste :
1. ✅ Les clés API Stripe dans l'admin
2. ✅ Ton email de notification
3. ✅ Les plans d'abonnement
4. ✅ La configuration SMTP

Et tout fonctionnera automatiquement ! 🚀
