-- Archivo: database-optimization.sql
-- Descripción: Índices y optimizaciones para PostgreSQL
-- Ejecutar este script en la base de datos MiAppVentas

-- =====================================================
-- ÍNDICES PARA TABLA 'users'
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at DESC);

-- =====================================================
-- ÍNDICES PARA TABLA 'products'
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING GIN (to_tsvector('spanish', name || ' ' || COALESCE(description, '')));

-- =====================================================
-- ÍNDICES PARA TABLA 'orders'
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);

-- =====================================================
-- ÍNDICES PARA TABLA 'order_items'
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- =====================================================
-- ÍNDICES PARA TABLA 'cart'
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product_id ON cart(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_user_product ON cart(user_id, product_id) UNIQUE;

-- =====================================================
-- ÍNDICES PARA TABLA 'audit_logs'
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- =====================================================
-- ÍNDICES PARA TABLA 'payments'
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(provider);

-- =====================================================
-- ÍNDICES PARA TABLA 'categories'
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug) UNIQUE;

-- =====================================================
-- ÍNDICES PARA TABLA 'admin'
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_admin_user_id ON admin(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin(email) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_admin_role ON admin(role);
CREATE INDEX IF NOT EXISTS idx_admin_created_at ON admin(created_at DESC);

-- =====================================================
-- ESTADÍSTICAS Y ANÁLISIS
-- =====================================================

-- Analizar todas las tablas para optimizar queries
ANALYZE users;
ANALYZE products;
ANALYZE orders;
ANALYZE order_items;
ANALYZE cart;
ANALYZE payments;
ANALYZE categories;
ANALYZE admin;
ANALYZE audit_logs;

-- =====================================================
-- CONFIGURACIÓN DE CONEXIÓN
-- =====================================================

-- Aumentar el tamaño del pool de conexiones para mejor concurrencia
-- (Configurado en Prisma: prisma.schema - datasource db)

-- =====================================================
-- VACUUM Y MANTENIMIENTO
-- =====================================================

-- Ejecutar regularmente (por ejemplo, diariamente):
-- VACUUM ANALYZE;

-- =====================================================
-- CONSULTAS OPTIMIZADAS PARA SUPERADMIN
-- =====================================================

-- Dashboard Stats - Optimizada
-- Índices ya creados permiten que Prisma genere queries eficientes

-- Reporte de ventas mensuales
CREATE INDEX IF NOT EXISTS idx_orders_monthly ON orders(created_at DESC, status)
  WHERE status = 'CONFIRMED';

-- Top productos
CREATE INDEX IF NOT EXISTS idx_order_items_product_quantity ON order_items(product_id, quantity);

-- =====================================================
-- SCRIPT DE MONITOREO (Para ejecutar regularmente)
-- =====================================================

-- Ver tamaño de índices:
-- SELECT schemaname, tablename, indexname, pg_size_pretty(pg_relation_size(indexrelid)) as size
-- FROM pg_indexes
-- WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- Ver consultas lentas:
-- SELECT query, calls, total_time, mean_time
-- FROM pg_stat_statements
-- WHERE query NOT LIKE '%pg_stat%'
-- ORDER BY mean_time DESC LIMIT 10;
