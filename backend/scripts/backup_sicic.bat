@echo off
REM ==============================================================================
REM Script Ejecutor Batch para Programador de Tareas Windows - SICIZ-INSAI V2.0
REM ==============================================================================

set SCRIPT_DIR=%~dp0
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%backup_sicic.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] El respaldo fallo con codigo de error %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)
exit /b 0

