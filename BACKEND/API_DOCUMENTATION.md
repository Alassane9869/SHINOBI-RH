# API Endpoints Documentation

## Base URL
`http://127.0.0.1:8000/api/`

## Authentification

Toutes les requêtes (sauf register et login) nécessitent un token JWT dans le header :
```
Authorization: Bearer <votre_access_token>
```

---

## 🏢 Company

### Inscription d'une entreprise
**POST** `/company/register/`

Crée une nouvelle entreprise et un utilisateur admin automatiquement.

**Body:**
```json
{
  "name": "Ma Société SARL",
  "email": "contact@masociete.com",
  "address": "123 Rue Example, Paris",
  "phone": "+33123456789",
  "website": "https://masociete.com",
  "admin_email": "admin@masociete.com",
  "admin_password": "MotDePasse123!",
  "admin_first_name": "Jean",
  "admin_last_name": "Dupont"
}
```

---

## 🔐 Authentication

### Login
**POST** `/auth/login/`

**Body:**
```json
{
  "email": "admin@masociete.com",
  "password": "MotDePasse123!"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Refresh Token
**POST** `/auth/refresh/`

**Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Profil utilisateur
**GET** `/auth/me/`

Retourne les informations de l'utilisateur connecté.

---

## 👥 Employees

### Liste des employés
**GET** `/employees/`

**Query params:**
- `search`: Recherche par nom, prénom, poste, département

### Créer un employé
**POST** `/employees/`

**Body:**
```json
{
  "user_id": 2,
  "position": "Développeur Full Stack",
  "department": "IT",
  "date_hired": "2024-01-15",
  "base_salary": 45000,
  "address": "456 Avenue Test",
  "phone": "+33987654321"
}
```

### Détails d'un employé
**GET** `/employees/{id}/`

### Modifier un employé
**PUT/PATCH** `/employees/{id}/`

### Supprimer un employé
**DELETE** `/employees/{id}/`

### Générer attestation de travail
**GET** `/employees/{id}/work_certificate/`

Télécharge un PDF d'attestation de travail.

### Générer contrat de travail
**GET** `/employees/{id}/contract_pdf/`

Télécharge un PDF de contrat de travail.

---

## 📅 Attendance (Présences)

### Liste des présences
**GET** `/attendance/`

### Enregistrer une présence
**POST** `/attendance/`

**Body:**
```json
{
  "employee": 1,
  "date": "2024-11-27",
  "check_in": "09:00:00",
  "check_out": "18:00:00",
  "status": "present",
  "notes": "Journée normale"
}
```

**Statuts possibles:** `present`, `absent`, `late`, `excused`

---

## 🏖️ Leaves (Congés)

### Liste des congés
**GET** `/leaves/`

### Demander un congé
**POST** `/leaves/`

**Body:**
```json
{
  "employee": 1,
  "start_date": "2024-12-20",
  "end_date": "2024-12-31",
  "leave_type": "vacation",
  "reason": "Vacances de fin d'année"
}
```

**Types:** `sick`, `vacation`, `unpaid`, `maternity`, `other`

### Approuver un congé
**POST** `/leaves/{id}/approve/`

Permissions: Manager, RH, Admin

### Rejeter un congé
**POST** `/leaves/{id}/reject/`

Permissions: Manager, RH, Admin

---

## 💰 Payroll (Paie)

### Liste des paies
**GET** `/payroll/`

### Créer une paie
**POST** `/payroll/`

**Body:**
```json
{
  "employee": 1,
  "month": 11,
  "year": 2024,
  "basic_salary": 3500,
  "bonus": 500,
  "deductions": 200
}
```

Le PDF du bulletin de paie est généré automatiquement.

### Générer reçu de paiement
**GET** `/payroll/{id}/payment_receipt/`

Télécharge un PDF de reçu de paiement.

---

## 📄 Documents

### Liste des documents
**GET** `/documents/`

### Upload un document
**POST** `/documents/`

**Body (multipart/form-data):**
```
file: [fichier]
document_type: contract
employee: 1
description: Contrat signé
```

**Types:** `contract`, `receipt`, `id_card`, `other`

---

## 📊 Dashboard

### Statistiques
**GET** `/dashboard/stats/`

Retourne les statistiques de l'entreprise :
```json
{
  "total_employees": 25,
  "total_leaves": 48,
  "pending_leaves": 5,
  "total_payrolls": 120,
  "total_documents": 85,
  "total_attendances": 450
}
```

---

## 🔒 Permissions par Rôle

| Endpoint | Admin | RH | Manager | Employé |
|----------|-------|----|---------| --------|
| Employees (CRUD) | ✅ | ✅ | ❌ | ❌ |
| Attendance | ✅ | ✅ | ✅ | Lecture seule |
| Leaves (Create) | ✅ | ✅ | ✅ | ✅ |
| Leaves (Approve/Reject) | ✅ | ✅ | ✅ | ❌ |
| Payroll | ✅ | ✅ | ❌ | ❌ |
| Documents | ✅ | ✅ | ✅ | Lecture seule |
| Stats | ✅ | ✅ | ✅ | ❌ |

---

## 📝 Codes d'Erreur

- `400` - Bad Request (données invalides)
- `401` - Unauthorized (token manquant ou invalide)
- `403` - Forbidden (permissions insuffisantes)
- `404` - Not Found (ressource inexistante)
- `500` - Internal Server Error

---

## 🔗 Documentation Interactive

- **Swagger UI:** http://127.0.0.1:8000/api/docs/
- **ReDoc:** http://127.0.0.1:8000/api/redoc/
