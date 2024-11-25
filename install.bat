@echo off
set "APPDATA_PATH=%APPDATA%\GofileUploader"
set "NODE_SCRIPT=script.js"

:: Créer le répertoire dans APPDATA
if not exist "%APPDATA_PATH%" (
    mkdir "%APPDATA_PATH%"
    echo Répertoire créé : %APPDATA_PATH%
)

:: Copier le script Node.js dans le répertoire APPDATA
echo Copie du script Node.js dans %APPDATA_PATH%...
copy /Y "%~dp0%NODE_SCRIPT%" "%APPDATA_PATH%\%NODE_SCRIPT%"
if %errorlevel% neq 0 (
    echo Erreur : Impossible de copier le fichier %NODE_SCRIPT%. Assurez-vous qu'il est dans le même dossier que ce script.
    pause
    exit /b 1
)

:: Initialiser un projet Node.js si ce n'est pas déjà fait
echo Initialisation de Node.js dans %APPDATA_PATH%...
cd /D "%APPDATA_PATH%"
if not exist "package.json" (
    echo { "name": "gofile-uploader", "version": "1.0.0", "main": "%NODE_SCRIPT%", "dependencies": {} } > package.json
)

:: Installer les modules nécessaires
echo Installation des modules Node.js requis...
npm install axios form-data clipboardy --save
if %errorlevel% neq 0 (
    echo Erreur : Impossible d'installer les modules Node.js. Assurez-vous que Node.js et npm sont correctement installés.
    pause
    exit /b 1
)

:: Ajouter l'entrée au registre pour le menu contextuel
echo Ajout de l'entrée au menu contextuel Windows...
reg add "HKEY_CLASSES_ROOT\*\shell\UploadToGofile" /t REG_SZ /v "" /d "Upload to Gofile" /f
reg add "HKEY_CLASSES_ROOT\*\shell\UploadToGofile\command" /t REG_SZ /v "" /d "\"cmd.exe\" /c \"node \"%APPDATA_PATH%\%NODE_SCRIPT%\" \"%%1\"\"" /f
if %errorlevel% neq 0 (
    echo Erreur : Impossible de modifier le registre. Exécutez ce script en tant qu'administrateur.
    pause
    exit /b 1
)

echo Installation complète !
echo Modules Node.js installés dans %APPDATA_PATH%.
echo Cliquez droit sur un fichier pour voir l'option "Upload to Gofile".
pause