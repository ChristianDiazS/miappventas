#!/bin/bash

echo "🚀 Iniciando MiAppVentas (Frontend + Backend)..."
echo ""

# Función para manejar Ctrl+C
cleanup() {
  echo ""
  echo "⏹️  Deteniendo servidores..."
  kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
  exit 0
}

trap cleanup SIGINT

# Iniciar Frontend
echo "📦 Iniciando Frontend (puerto 5173)..."
cd frontend
npm run dev &
FRONTEND_PID=$!

# Esperar un poco para que se inicie
sleep 2

# Iniciar Backend
echo "🔧 Iniciando Backend (puerto 5000)..."
cd ../backend
npm run dev &
BACKEND_PID=$!

echo ""
echo "✅ Ambos servidores iniciados:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo ""
echo "Presiona Ctrl+C para detener ambos servidores"

wait
