@echo off
set "APPDATA_PATH=%APPDATA%\GofileUploader"
set "NODE_SCRIPT=script.js"

if not exist "%APPDATA_PATH%" (
    mkdir "%APPDATA_PATH%"
    echo Repertory created : %APPDATA_PATH%
)

echo Copy of the script in %APPDATA_PATH%...
copy /Y "%~dp0%NODE_SCRIPT%" "%APPDATA_PATH%\%NODE_SCRIPT%"
if %errorlevel% neq 0 (
    echo Error impossible to copy the script in appdate
    pause
    exit /b 1
)

echo Install node module in %APPDATA_PATH%...
cd /D "%APPDATA_PATH%"
if not exist "package.json" (
    echo { "name": "gofile-uploader", "version": "1.0.0", "main": "%NODE_SCRIPT%", "dependencies": {} } > package.json
)

echo install node module
npm install axios node-hide-console-window child_process node-notifier form-data --save
if %errorlevel% neq 0 (
    echo Error nodejs as not installed or corrupted.
    pause
    exit /b 1
)

echo Ajout de l'entrée au menu contextuel Windows...
reg add "HKEY_CLASSES_ROOT\*\shell\UploadToGofile" /t REG_SZ /v "" /d "Upload to Gofile" /f
reg add "HKEY_CLASSES_ROOT\*\shell\UploadToGofile\command" /t REG_SZ /v "" /d "\"cmd.exe\" /c \"node \"%APPDATA_PATH%\%NODE_SCRIPT%\" \"%%1\"\"" /f
if %errorlevel% neq 0 (
    echo Error execute this as admin plsss.
    pause
    exit /b 1
)

echo Install complete !
echo Node module as succesfully installed in %APPDATA_PATH%.
echo right click for see "Upload to Gofile".
pause
