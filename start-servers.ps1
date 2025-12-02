# Shinobi RH - Script de démarrage des serveurs
# PowerShell Script

$Host.UI.RawUI.WindowTitle = "Shinobi RH - Serveurs"
$ErrorActionPreference = "Stop"

# Couleurs
$ColorSuccess = "Green"
$ColorError = "Red"
$ColorInfo = "Cyan"
$ColorWarning = "Yellow"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Banner
Clear-Host
Write-ColorOutput "========================================" $ColorInfo
Write-ColorOutput "   SHINOBI RH - Démarrage des serveurs" $ColorInfo
Write-ColorOutput "========================================" $ColorInfo
Write-Host ""

# Vérifications préalables
Write-ColorOutput "[Vérification] Contrôle des dépendances..." $ColorWarning

if (-not (Test-Command "node")) {
    Write-ColorOutput "[ERREUR] Node.js n'est pas installé ou n'est pas dans le PATH" $ColorError
    pause
    exit 1
}
Write-ColorOutput "✓ Node.js détecté" $ColorSuccess

if (-not (Test-Command "python")) {
    Write-ColorOutput "[ERREUR] Python n'est pas installé ou n'est pas dans le PATH" $ColorError
    pause
    exit 1
}
Write-ColorOutput "✓ Python détecté" $ColorSuccess

if (-not (Test-Path "C:\ngrok\ngrok.exe")) {
    Write-ColorOutput "[AVERTISSEMENT] Ngrok non trouvé à C:\ngrok\ngrok.exe" $ColorWarning
    Write-ColorOutput "Le tunnel public ne sera pas démarré." $ColorWarning
    $ngrokAvailable = $false
} else {
    Write-ColorOutput "✓ Ngrok détecté" $ColorSuccess
    $ngrokAvailable = $true
}

Write-Host ""

# Obtenir le répertoire du script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Démarrage du Backend
Write-ColorOutput "[1/3] Démarrage du serveur Backend Django..." $ColorInfo
$BackendPath = Join-Path $ScriptDir "backend"
if (Test-Path $BackendPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; python manage.py runserver" -WindowStyle Normal
    Write-ColorOutput "✓ Backend démarré sur http://127.0.0.1:8000" $ColorSuccess
    Start-Sleep -Seconds 3
} else {
    Write-ColorOutput "[ERREUR] Dossier backend introuvable: $BackendPath" $ColorError
}

# Démarrage du Frontend
Write-ColorOutput "[2/3] Démarrage du serveur Frontend React..." $ColorInfo
$FrontendPath = Join-Path $ScriptDir "frontend"
if (Test-Path $FrontendPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendPath'; npm run dev" -WindowStyle Normal
    Write-ColorOutput "✓ Frontend démarré sur http://localhost:3000" $ColorSuccess
    Start-Sleep -Seconds 3
} else {
    Write-ColorOutput "[ERREUR] Dossier frontend introuvable: $FrontendPath" $ColorError
}

# Démarrage de Ngrok
if ($ngrokAvailable) {
    Write-ColorOutput "[3/3] Démarrage de Ngrok (tunnel public)..." $ColorInfo
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ScriptDir'; C:\ngrok\ngrok.exe http 3000" -WindowStyle Normal
    Write-ColorOutput "✓ Ngrok démarré - Interface: http://127.0.0.1:4040" $ColorSuccess
    Start-Sleep -Seconds 2
} else {
    Write-ColorOutput "[3/3] Ngrok ignoré (non disponible)" $ColorWarning
}

Write-Host ""
Write-ColorOutput "========================================" $ColorSuccess
Write-ColorOutput "   Tous les serveurs sont démarrés !" $ColorSuccess
Write-ColorOutput "========================================" $ColorSuccess
Write-Host ""

Write-ColorOutput "📍 URLs d'accès:" $ColorInfo
Write-ColorOutput "   Backend:  http://127.0.0.1:8000" "White"
Write-ColorOutput "   Frontend: http://localhost:3000" "White"
if ($ngrokAvailable) {
    Write-ColorOutput "   Ngrok UI: http://127.0.0.1:4040" "White"
}
Write-Host ""

# Attendre 5 secondes puis ouvrir le navigateur
Write-ColorOutput "Ouverture du navigateur dans 5 secondes..." $ColorWarning
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

Write-Host ""
Write-ColorOutput "Les serveurs tournent en arrière-plan." $ColorInfo
Write-ColorOutput "Fermez les fenêtres PowerShell pour arrêter les serveurs." $ColorInfo
Write-Host ""
Write-ColorOutput "Appuyez sur une touche pour fermer ce script..." $ColorWarning
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
