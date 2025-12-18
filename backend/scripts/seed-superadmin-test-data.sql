-- Script para crear datos de prueba para Testing del Panel SUPERADMIN
-- Ejecutar en PostgreSQL como administrador

-- 1. Crear usuario SUPERADMIN para testing
-- Password: superadmin123 (bcrypt hash)
INSERT INTO "User" (email, "passwordHash", "firstName", "lastName", phone, role, active, "createdAt", "updatedAt")
VALUES (
  'superadmin@test.com',
  '$2b$10$yJ7.K3.vK3.vK3.vK3.vK3vK3vK3vK3vK3vK3vK3vK3vK3vK3vK3vK', -- bcrypt hash de 'superadmin123'
  'Super',
  'Admin',
  '987654321',
  'SUPERADMIN',
  true,
  NOW(),
  NOW()
)
ON CONFLICT(email) DO NOTHING;

-- 2. Crear varios usuarios ADMIN para testing
INSERT INTO "User" (email, "passwordHash", "firstName", "lastName", phone, role, active, "createdAt", "updatedAt")
VALUES 
  ('admin1@test.com', '$2b$10$admin1admin1admin1admin1admin1admin1admin1admin1admin1admin1', 'Juan', 'Pérez', '111111111', 'ADMIN', true, NOW(), NOW()),
  ('admin2@test.com', '$2b$10$admin2admin2admin2admin2admin2admin2admin2admin2admin2admin2', 'María', 'García', '222222222', 'ADMIN', true, NOW(), NOW()),
  ('admin3@test.com', '$2b$10$admin3admin3admin3admin3admin3admin3admin3admin3admin3admin3', 'Carlos', 'López', '333333333', 'ADMIN', false, NOW(), NOW())
ON CONFLICT(email) DO NOTHING;

-- 3. Crear usuarios CUSTOMER normales para estadísticas
INSERT INTO "User" (email, "passwordHash", "firstName", "lastName", phone, role, active, "createdAt", "updatedAt")
VALUES
  ('customer1@test.com', '$2b$10$cust1cust1cust1cust1cust1cust1cust1cust1cust1cust1cust1', 'Ana', 'Rodríguez', '444444444', 'CUSTOMER', true, NOW(), NOW()),
  ('customer2@test.com', '$2b$10$cust2cust2cust2cust2cust2cust2cust2cust2cust2cust2cust2', 'Luis', 'Martínez', '555555555', 'CUSTOMER', true, NOW(), NOW()),
  ('customer3@test.com', '$2b$10$cust3cust3cust3cust3cust3cust3cust3cust3cust3cust3cust3', 'Sandra', 'Flores', '666666666', 'CUSTOMER', true, NOW(), NOW()),
  ('customer4@test.com', '$2b$10$cust4cust4cust4cust4cust4cust4cust4cust4cust4cust4cust4', 'Roberto', 'Sánchez', '777777777', 'CUSTOMER', true, NOW(), NOW()),
  ('customer5@test.com', '$2b$10$cust5cust5cust5cust5cust5cust5cust5cust5cust5cust5cust5', 'Elena', 'Díaz', '888888888', 'CUSTOMER', true, NOW(), NOW())
ON CONFLICT(email) DO NOTHING;

-- 4. Crear órdenes de prueba con ingresos variados
-- Primero obtener IDs de usuarios
DO $$
DECLARE
  customer_ids INT[];
  superadmin_id INT;
BEGIN
  -- Obtener IDs de clientes
  SELECT ARRAY_AGG(id) INTO customer_ids FROM "User" WHERE role = 'CUSTOMER' LIMIT 5;
  SELECT id INTO superadmin_id FROM "User" WHERE role = 'SUPERADMIN' LIMIT 1;

  -- Crear órdenes en diferentes estados
  IF customer_ids[1] IS NOT NULL THEN
    INSERT INTO "Order" (
      "orderNumber", "userId", "shippingMethod", "status", "paymentStatus",
      "subtotal", "tax", "shippingCost", "total", "createdAt", "updatedAt"
    ) VALUES
      ('ORD-001', customer_ids[1], 'STANDARD', 'DELIVERED', 'COMPLETED', 50000, 9000, 1000, 60000, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
      ('ORD-002', customer_ids[2], 'EXPRESS', 'DELIVERED', 'COMPLETED', 75000, 13500, 2500, 91000, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
      ('ORD-003', customer_ids[3], 'STANDARD', 'SHIPPED', 'COMPLETED', 120000, 21600, 1000, 142600, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
      ('ORD-004', customer_ids[4], 'PICKUP', 'PROCESSING', 'COMPLETED', 45000, 8100, 0, 53100, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 days'),
      ('ORD-005', customer_ids[5], 'STANDARD', 'PENDING', 'PENDING', 95000, 17100, 1500, 113600, NOW(), NOW()),
      ('ORD-006', customer_ids[1], 'EXPRESS', 'DELIVERED', 'COMPLETED', 65000, 11700, 2500, 79200, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days'),
      ('ORD-007', customer_ids[2], 'STANDARD', 'DELIVERED', 'COMPLETED', 110000, 19800, 1000, 130800, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days');
  END IF;
END $$;

-- 5. Crear órdenes con Items (productos) para estadísticas top productos
-- Obtener un product ID si existe
DO $$
DECLARE
  product_id INT;
  order_id INT;
  customer_id INT;
BEGIN
  -- Obtener primer producto
  SELECT id INTO product_id FROM "Product" LIMIT 1;
  SELECT id INTO customer_id FROM "User" WHERE role = 'CUSTOMER' LIMIT 1;
  
  IF product_id IS NOT NULL AND customer_id IS NOT NULL THEN
    -- Crear una orden con items
    INSERT INTO "Order" ("orderNumber", "userId", "shippingMethod", "status", "paymentStatus", "subtotal", "tax", "shippingCost", "total", "createdAt", "updatedAt")
    VALUES ('ORD-PROD-001', customer_id, 'STANDARD', 'DELIVERED', 'COMPLETED', 200000, 36000, 1000, 237000, NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days')
    RETURNING id INTO order_id;
    
    -- Agregar items a la orden
    IF order_id IS NOT NULL THEN
      INSERT INTO "OrderItem" ("orderId", "productId", "quantity", "unitPrice", "subtotal", "createdAt")
      VALUES 
        (order_id, product_id, 2, 100000, 200000, NOW());
    END IF;
  END IF;
END $$;

-- 6. Crear Payments para distribución de métodos de pago
DO $$
DECLARE
  order_ids INT[];
BEGIN
  SELECT ARRAY_AGG(id) INTO order_ids FROM "Order" WHERE "paymentStatus" = 'COMPLETED' LIMIT 7;
  
  IF order_ids[1] IS NOT NULL THEN
    INSERT INTO "Payment" ("orderId", "userId", "provider", "providerId", "amount", "status", "createdAt", "updatedAt")
    VALUES
      (order_ids[1], (SELECT "userId" FROM "Order" WHERE id = order_ids[1]), 'stripe', 'pi_test_001', 60000, 'COMPLETED', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
      (order_ids[2], (SELECT "userId" FROM "Order" WHERE id = order_ids[2]), 'stripe', 'pi_test_002', 91000, 'COMPLETED', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
      (order_ids[3], (SELECT "userId" FROM "Order" WHERE id = order_ids[3]), 'stripe', 'pi_test_003', 142600, 'COMPLETED', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
      (order_ids[4], (SELECT "userId" FROM "Order" WHERE id = order_ids[4]), 'stripe', 'pi_test_004', 53100, 'COMPLETED', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 days'),
      (order_ids[5], (SELECT "userId" FROM "Order" WHERE id = order_ids[5]), 'stripe', 'pi_test_005', 79200, 'COMPLETED', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days'),
      (order_ids[6], (SELECT "userId" FROM "Order" WHERE id = order_ids[6]), 'stripe', 'pi_test_006', 130800, 'COMPLETED', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days');
  END IF;
END $$;

-- 7. Crear registros de AuditLog para testing
DO $$
DECLARE
  superadmin_id INT;
BEGIN
  SELECT id INTO superadmin_id FROM "User" WHERE role = 'SUPERADMIN' LIMIT 1;
  
  IF superadmin_id IS NOT NULL THEN
    INSERT INTO "AuditLog" ("userId", "action", "entity", "entityId", "newData", "createdAt")
    VALUES
      (superadmin_id, 'admin_created', 'user', 1, '{"email":"test@test.com","role":"ADMIN"}', NOW() - INTERVAL '1 day'),
      (superadmin_id, 'admin_updated', 'user', 2, '{"role":"SUPERADMIN","active":true}', NOW() - INTERVAL '12 hours'),
      (superadmin_id, 'settings_updated', 'settings', 1, '{"maintenanceMode":false}', NOW() - INTERVAL '6 hours'),
      (superadmin_id, 'order_processed', 'order', 1, '{"status":"SHIPPED"}', NOW() - INTERVAL '3 days'),
      (superadmin_id, 'payment_completed', 'payment', 1, '{"amount":60000,"status":"COMPLETED"}', NOW() - INTERVAL '5 days');
  END IF;
END $$;

-- 8. Verificar que los datos se crearon correctamente
SELECT 'Users creados:' as info, COUNT(*) as total FROM "User";
SELECT 'Orders creadas:' as info, COUNT(*) as total FROM "Order";
SELECT 'Payments creados:' as info, COUNT(*) as total FROM "Payment";
SELECT 'Audit Logs creados:' as info, COUNT(*) as total FROM "AuditLog";

COMMIT;
