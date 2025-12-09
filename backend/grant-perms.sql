-- Dar permisos completos al usuario miappventas
ALTER DEFAULT PRIVILEGES FOR USER postgres IN SCHEMA public GRANT ALL ON TABLES TO miappventas;
ALTER DEFAULT PRIVILEGES FOR USER postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO miappventas;
ALTER DEFAULT PRIVILEGES FOR USER postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO miappventas;
GRANT CREATE ON SCHEMA public TO miappventas;
GRANT USAGE ON SCHEMA public TO miappventas;
