@echo off
title Shinobi RH - Serveurs
color 0A

echo ========================================
echo    SHINOBI RH - Demarrage des serveurs
echo ========================================
echo.

:: Vérifier si Node.js est installé
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe ou n'est pas dans le PATH
    pause
    exit /b 1
)

:: Vérifier si Python est installé
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Python n'est pas installe ou n'est pas dans le PATH
    pause
    exit /b 1
)

echo [1/3] Demarrage du serveur Backend Django...
start "Backend Django" cmd /k "cd /d %~dp0backend && python manage.py runserver"
timeout /t 3 /nobreak >nul

echo [2/3] Demarrage du serveur Frontend React...
start "Frontend React" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo [3/3] Demarrage de Ngrok (tunnel public)...
start "Ngrok Tunnel" cmd /k "cd /d %~dp0 && C:\ngrok\ngrok.exe http 3000"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo    Tous les serveurs sont demarres !
echo ========================================
echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo Ngrok UI: http://127.0.0.1:4040
echo.
echo Appuyez sur une touche pour ouvrir le navigateur...
pause >nul

:: Ouvrir le navigateur sur le frontend
start http://localhost:3000

echo.
echo Les serveurs tournent en arriere-plan.
echo Fermez les fenetres CMD pour arreter les serveurs.
echo.
pause
