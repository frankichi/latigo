@echo off
REM ---------------------------------------------------------------
REM Sube (o actualiza) El Latigo en GitHub desde Windows.
REM Uso (doble clic o en CMD):
REM   scripts\subir-github.bat https://github.com/TU_USUARIO/el-latigo.git
REM   scripts\subir-github.bat            (para actualizar)
REM Requiere Git for Windows: https://git-scm.com
REM ---------------------------------------------------------------
setlocal
chcp 65001 >nul
cd /d "%~dp0.."

where git >nul 2>nul || (echo Instala Git primero: https://git-scm.com & pause & exit /b 1)

if not exist .git (
  echo Preparando el repositorio por primera vez...
  git init -q
  git branch -M main
)

if not "%~1"=="" (
  git remote get-url origin >nul 2>nul && git remote set-url origin %1 || git remote add origin %1
)

git remote get-url origin >nul 2>nul || (
  echo Falta la direccion del repositorio. Ejemplo:
  echo   scripts\subir-github.bat https://github.com/TU_USUARIO/el-latigo.git
  pause & exit /b 1
)

git add -A
git diff --cached --quiet && (echo No hay cambios nuevos.) || (git commit -q -m "Actualizacion %date% %time%" && echo Cambios guardados.)
git push -u origin main
echo.
echo Listo. Vercel actualiza la web en aprox. 1 minuto.
pause
