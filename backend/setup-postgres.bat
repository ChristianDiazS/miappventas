@echo off
REM Script para crear BD y usuario en PostgreSQL
REM Ejecutar como Administrator

setlocal enabledelayedexpansion
set PSQL="C:\Program Files\PostgreSQL\17\bin\psql.exe"
set PGPASSWORD=admin

echo =============================================
echo Creando base de datos miappventas...
echo =============================================

REM Crear base de datos
%PSQL% -U postgres -h localhost -c "CREATE DATABASE miappventas;"

REM Crear usuario
%PSQL% -U postgres -h localhost -c "CREATE USER miappventas WITH PASSWORD 'miappventas';"

REM Dar permisos
%PSQL% -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE miappventas TO miappventas;"

echo.
echo =============================================
echo Configurando permisos en schema public...
echo =============================================

REM Conectar a la BD y dar permisos en schema
%PSQL% -U postgres -h localhost -d miappventas -c "GRANT ALL PRIVILEGES ON SCHEMA public TO miappventas;"
%PSQL% -U postgres -h localhost -d miappventas -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO miappventas;"
%PSQL% -U postgres -h localhost -d miappventas -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO miappventas;"
%PSQL% -U postgres -h localhost -d miappventas -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO miappventas;"

echo.
echo =============================================
echo Verificando...
echo =============================================

%PSQL% -U postgres -h localhost -c "SELECT datname FROM pg_database WHERE datname='miappventas';"

echo.
echo =============================================
echo LISTO! Base de datos y usuario creados
echo =============================================
echo.
pause
