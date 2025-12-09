@echo off
REM Script para iniciar Frontend y Backend en Windows

echo 🚀 Iniciando MiAppVentas (Frontend + Backend)...
echo.

REM Iniciar Backend en una nueva ventana
echo 🔧 Iniciando Backend (puerto 5000)...
start cmd /k "cd backend && npm run dev"

REM Esperar un poco para que se inicie el backend
timeout /t 3 /nobreak

REM Iniciar Frontend en una nueva ventana
echo 📦 Iniciando Frontend (puerto 5173)...
start cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Ambos servidores iniciados:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo.
echo Cierra las ventanas para detener los servidores
