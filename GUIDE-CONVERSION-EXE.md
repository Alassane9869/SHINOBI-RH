# Guide : Convertir les scripts en fichiers .exe

Ce guide explique comment convertir les scripts de démarrage en fichiers exécutables (.exe) pour une utilisation plus simple.

## 📋 Fichiers disponibles

- **start-servers.bat** : Script batch simple
- **start-servers.ps1** : Script PowerShell avancé (recommandé)

## 🔧 Méthode 1 : Utiliser PS2EXE (PowerShell → EXE)

### Installation

```powershell
# Installer PS2EXE depuis PowerShell Gallery
Install-Module -Name ps2exe -Scope CurrentUser
```

### Conversion

```powershell
# Se placer dans le dossier du projet
cd C:\Censure\GRH

# Convertir le script PowerShell en .exe
Invoke-PS2EXE -inputFile ".\start-servers.ps1" -outputFile ".\Shinobi-RH-Launcher.exe" -title "Shinobi RH Launcher" -version "1.0.0.0" -company "Shinobi RH" -product "Server Launcher" -copyright "2024 Shinobi RH" -iconFile ".\icon.ico" -noConsole:$false
```

### Options recommandées

- `-noConsole:$false` : Garde la console visible pour voir les logs
- `-requireAdmin` : Si besoin de droits administrateur
- `-iconFile` : Ajouter une icône personnalisée (optionnel)

## 🔧 Méthode 2 : Utiliser Bat To Exe Converter (Batch → EXE)

### Téléchargement

1. Télécharger **Bat To Exe Converter** : https://www.f2ko.de/en/b2e.php
2. Installer le logiciel

### Conversion

1. Ouvrir Bat To Exe Converter
2. Cliquer sur "Open" et sélectionner `start-servers.bat`
3. Configurer les options :
   - **Application Title** : Shinobi RH Launcher
   - **Version** : 1.0.0
   - **Company** : Shinobi RH
   - **Icon** : Sélectionner une icône (optionnel)
   - **Visibility** : Cocher "Visible application"
4. Cliquer sur "Compile" et choisir le nom de sortie : `Shinobi-RH-Launcher.exe`

## 🔧 Méthode 3 : Utiliser PyInstaller (pour un script Python)

Si tu préfères créer un script Python pour plus de flexibilité :

### Installation

```bash
pip install pyinstaller
```

### Créer un script Python (start_servers.py)

```python
import subprocess
import os
import time
import webbrowser

def start_servers():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Démarrer Backend
    backend_path = os.path.join(script_dir, "backend")
    subprocess.Popen(
        ["python", "manage.py", "runserver"],
        cwd=backend_path,
        creationflags=subprocess.CREATE_NEW_CONSOLE
    )
    
    # Démarrer Frontend
    frontend_path = os.path.join(script_dir, "frontend")
    subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=frontend_path,
        creationflags=subprocess.CREATE_NEW_CONSOLE
    )
    
    # Démarrer Ngrok
    subprocess.Popen(
        [r"C:\ngrok\ngrok.exe", "http", "3000"],
        cwd=script_dir,
        creationflags=subprocess.CREATE_NEW_CONSOLE
    )
    
    # Attendre et ouvrir le navigateur
    time.sleep(5)
    webbrowser.open("http://localhost:3000")

if __name__ == "__main__":
    start_servers()
```

### Conversion en .exe

```bash
pyinstaller --onefile --name "Shinobi-RH-Launcher" --icon=icon.ico start_servers.py
```

Le fichier .exe sera dans le dossier `dist/`

## 📝 Recommandations

### ✅ Méthode recommandée : PS2EXE

**Avantages :**
- Gratuit et open-source
- Facile à utiliser
- Bonne gestion des erreurs
- Peut inclure une icône

**Inconvénients :**
- Nécessite PowerShell 5.1+

### 🎯 Utilisation quotidienne

1. **Double-cliquer** sur `Shinobi-RH-Launcher.exe`
2. Les 3 fenêtres s'ouvrent automatiquement :
   - Backend Django
   - Frontend React
   - Ngrok Tunnel
3. Le navigateur s'ouvre sur http://localhost:3000
4. Pour arrêter : Fermer les 3 fenêtres CMD/PowerShell

## 🔒 Sécurité

⚠️ **Important** : Les antivirus peuvent bloquer les .exe créés à partir de scripts. Pour éviter cela :

1. Ajouter une exception dans Windows Defender
2. Signer le .exe avec un certificat (pour distribution)
3. Utiliser des outils reconnus (PS2EXE, PyInstaller)

## 🎨 Ajouter une icône personnalisée

1. Créer ou télécharger une icône `.ico` (256x256 recommandé)
2. La placer dans `C:\Censure\GRH\icon.ico`
3. Utiliser l'option `-iconFile` lors de la conversion

## 📦 Distribution

Pour distribuer l'application :

1. Créer un dossier `Shinobi-RH-Portable`
2. Copier :
   - `Shinobi-RH-Launcher.exe`
   - Dossiers `backend/` et `frontend/`
   - `README.md` avec instructions
3. Compresser en `.zip`

## 🆘 Dépannage

### Le .exe ne démarre pas

- Vérifier que Node.js et Python sont installés
- Vérifier les chemins dans le script
- Exécuter en tant qu'administrateur

### Antivirus bloque le .exe

- Ajouter une exception dans l'antivirus
- Utiliser PS2EXE avec signature de code

### Les serveurs ne démarrent pas

- Vérifier que les ports 3000 et 8000 sont libres
- Vérifier les dépendances (`npm install`, `pip install -r requirements.txt`)

## 📞 Support

Pour toute question, contactez-nous sur WhatsApp : +223 66 82 62 07
