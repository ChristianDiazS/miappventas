-- Script para crear base de datos y usuario para MiAppVentas
-- Ejecutar como: psql -U postgres -f setup-db.sql

-- Crear base de datos
CREATE DATABASE miappventas;

-- Crear usuario
CREATE USER miappventas WITH PASSWORD 'miappventas';

-- Configuraciones del rol
ALTER ROLE miappventas SET client_encoding TO 'utf8';
ALTER ROLE miappventas SET default_transaction_isolation TO 'read committed';
ALTER ROLE miappventas SET default_transaction_deferrable TO on;
ALTER USER miappventas CREATEDB;

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE miappventas TO miappventas;

-- Conectarse a la base de datos y dar más permisos
\c miappventas

GRANT ALL PRIVILEGES ON SCHEMA public TO miappventas;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO miappventas;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO miappventas;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO miappventas;

-- Verificación
SELECT 'Base de datos y usuario creados exitosamente' as resultado;
