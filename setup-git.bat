@echo off
REM ============================================================
REM CHATWITHPDFAI.COM — One-time Git setup script (Windows)
REM Double-click this file to initialize Git and push to GitHub.
REM ============================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ============================================================
echo   CHATWITHPDFAI.COM - Git initialization
echo ============================================================
echo.

REM --- Check that git is installed ---
where git >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed or not in PATH.
    echo.
    echo Download and install from: https://git-scm.com/download/win
    echo Then re-run this script.
    echo.
    pause
    exit /b 1
)

echo [OK] Git is installed:
git --version
echo.

REM --- Clean up any partial .git folder from earlier attempts ---
if exist ".git" (
    echo [INFO] Found existing .git folder. Removing it for a clean init...
    rmdir /s /q ".git"
)

REM --- Configure global identity if missing ---
for /f "tokens=*" %%a in ('git config --global user.email 2^>nul') do set GIT_EMAIL=%%a
if not defined GIT_EMAIL (
    echo [INFO] Setting global Git identity...
    git config --global user.name  "Rajasekar Selvam"
    git config --global user.email "rajasekarjavaee@gmail.com"
    git config --global init.defaultBranch main
)

REM --- Initialize repo ---
echo.
echo [STEP 1/4] Initializing repository...
git init -b main
if errorlevel 1 goto :fail

echo.
echo [STEP 2/4] Staging all files...
git add .
if errorlevel 1 goto :fail

echo.
echo [STEP 3/4] Creating first commit...
git commit -m "Initial commit: full site + Hostinger auto-deploy pipeline"
if errorlevel 1 goto :fail

echo.
echo ============================================================
echo   LOCAL REPO READY
echo ============================================================
echo.
echo Next steps:
echo.
echo   1. Create an empty repo on GitHub:  https://github.com/new
echo      - Name it whatever you like (e.g. chatwithpdfai)
echo      - Set it to Private
echo      - Do NOT add README, .gitignore, or license
echo.
echo   2. Copy the repository URL from GitHub. It looks like:
echo        https://github.com/YOUR-USERNAME/chatwithpdfai.git
echo.
echo   3. Paste it below and press Enter:
echo.
set /p REPO_URL="GitHub repo URL: "

if "!REPO_URL!"=="" (
    echo.
    echo [SKIPPED] No URL entered. To push later, run:
    echo     git remote add origin YOUR-URL
    echo     git push -u origin main
    goto :end
)

echo.
echo [STEP 4/4] Connecting to GitHub and pushing...
git remote add origin !REPO_URL!
git push -u origin main
if errorlevel 1 (
    echo.
    echo [WARN] Push failed. You may need to authenticate with GitHub.
    echo If prompted, use a Personal Access Token instead of your password.
    echo Create one at: https://github.com/settings/tokens
    goto :end
)

echo.
echo ============================================================
echo   DONE - Code is now on GitHub
echo ============================================================
echo.
echo Next: open DEPLOYMENT.md and follow Part 3 onwards
echo       (add Hostinger FTP credentials as GitHub Secrets)
echo.

:end
echo.
pause
exit /b 0

:fail
echo.
echo [ERROR] Something went wrong. See messages above.
echo.
pause
exit /b 1
