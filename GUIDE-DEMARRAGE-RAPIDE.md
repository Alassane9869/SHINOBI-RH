# 🚀 Guide de Démarrage Rapide - Système de Paiement

## Étape 1 : Installer Stripe (Backend)

```bash
cd backend
pip install stripe
```

## Étape 2 : Créer un compte Stripe

1. Aller sur https://stripe.com
2. Créer un compte (gratuit)
3. Activer le mode test
4. Aller dans **Developers** → **API keys**
5. Copier :
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)

## Étape 3 : Configurer dans l'Admin Django

1. Démarrer le serveur : `python manage.py runserver`
2. Aller sur http://127.0.0.1:8000/admin
3. **Billing** → **Payment Configs** → **Add Payment Config**
4. Remplir :
   - **Provider** : Stripe (Mastercard/Visa)
   - **Is active** : ✓ Coché
   - **Test mode** : ✓ Coché
   - **API Key** : Coller la Publishable key (pk_test_...)
   - **API Secret** : Coller la Secret key (sk_test_...)
   - **Notification Email** : **TON EMAIL** (où tu veux recevoir les notifications)
5. Cliquer sur **Save**

## Étape 4 : Créer les Plans d'Abonnement

Dans l'admin → **Billing** → **Subscription Plans** → **Add**

### Plan 1 : Starter
- **Name** : Starter
- **Slug** : starter
- **Description** : Pour les petites équipes
- **Price** : 0
- **Currency** : XOF
- **Period** : monthly
- **Max employees** : 10
- **Is active** : ✓
- **Features** (JSON) :
```json
{
  "basic_management": true,
  "email_support": true
}
```

### Plan 2 : Pro
- **Name** : Pro
- **Slug** : pro
- **Description** : Pour les entreprises en croissance
- **Price** : 30000
- **Currency** : XOF
- **Period** : monthly
- **Max employees** : 50
- **Is active** : ✓
- **Is popular** : ✓
- **Display order** : 1
- **Features** (JSON) :
```json
{
  "advanced_analytics": true,
  "priority_support": true,
  "api_access": true
}
```

### Plan 3 : Enterprise
- **Name** : Enterprise
- **Slug** : enterprise
- **Description** : Pour les grandes structures
- **Price** : 0
- **Currency** : XOF
- **Period** : monthly
- **Max employees** : null (laisser vide pour illimité)
- **Is active** : ✓
- **Display order** : 2
- **Features** (JSON) :
```json
{
  "unlimited_employees": true,
  "dedicated_support": true,
  "sla_guarantee": true,
  "sso": true
}
```

## Étape 5 : Configurer le Frontend

1. Copier `.env.example` vers `.env` :
```bash
cd frontend
copy .env.example .env
```

2. Éditer `.env` et ajouter ta clé publique Stripe :
```
VITE_STRIPE_PUBLIC_KEY=pk_test_VOTRE_CLE_PUBLIQUE_ICI
```

## Étape 6 : Tester le Système

1. Aller sur http://localhost:3000
2. Cliquer sur "Choisir Pro" dans la section pricing
3. Tu seras redirigé vers `/checkout?plan=pro`
4. Choisir "Carte bancaire"
5. Utiliser une carte de test Stripe :
   - **Numéro** : 4242 4242 4242 4242
   - **Date** : N'importe quelle date future (ex: 12/25)
   - **CVC** : N'importe quel 3 chiffres (ex: 123)
6. Cliquer sur "Payer"
7. Le paiement sera validé automatiquement
8. Tu recevras un email de notification avec tous les détails

## ✅ C'est tout !

Le système est maintenant fonctionnel. Quand un client paie :
- ✅ Paiement validé automatiquement
- ✅ Abonnement activé
- ✅ Facture PDF générée
- ✅ Email envoyé au client
- ✅ Email envoyé à toi avec les coordonnées du client

**Tout est automatique ! 🎉**

## 🔧 Configuration Email (Optionnel)

Pour recevoir les emails de notification, configure SMTP dans `backend/backend/settings.py` :

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'ton-email@gmail.com'
EMAIL_HOST_PASSWORD = 'ton-mot-de-passe-app'
DEFAULT_FROM_EMAIL = 'Shinobi RH <noreply@shinobih.com>'
```

Pour Gmail, utilise un "Mot de passe d'application" (pas ton mot de passe normal).

## 📞 Besoin d'aide ?

Consulte `GUIDE-PAIEMENT-CONFIGURATION.md` pour plus de détails !
