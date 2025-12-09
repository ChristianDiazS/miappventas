import { prisma } from './src/lib/prisma.js';
import { hashPassword } from './src/utils/password.js';

async function main() {
  console.log('🌱 Iniciando seed de datos...\n');

  try {
    // Limpiar datos existentes (opcional - comentar si quieres mantener)
    console.log('🗑️  Limpiando tablas existentes...');
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.productFeature.deleteMany({});
    await prisma.productImage.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✅ Tablas limpias\n');

    // Crear usuarios
    console.log('👤 Creando usuarios...');
    const hashedPassword = await hashPassword('password123');
    const adminPassword = await hashPassword('admin123');

    const user1 = await prisma.user.create({
      data: {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@ejemplo.com',
        passwordHash: hashedPassword,
        phone: '987654321',
        role: 'CUSTOMER',
        active: true,
      },
    });

    const user2 = await prisma.user.create({
      data: {
        firstName: 'María',
        lastName: 'García',
        email: 'maria@ejemplo.com',
        passwordHash: hashedPassword,
        phone: '987654322',
        role: 'CUSTOMER',
        active: true,
      },
    });

    const adminUser = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@ejemplo.com',
        passwordHash: adminPassword,
        phone: '987654300',
        role: 'ADMIN',
        active: true,
      },
    });

    console.log('✅ 3 usuarios creados\n');

    // Crear direcciones
    console.log('📍 Creando direcciones...');
    const address1 = await prisma.address.create({
      data: {
        userId: user1.id,
        label: 'Casa',
        street: 'Av. Principal 123',
        city: 'Lima',
        district: 'Lima',
        province: 'Lima',
        department: 'Lima',
        postalCode: '15001',
        isDefault: true,
      },
    });

    const address2 = await prisma.address.create({
      data: {
        userId: user1.id,
        label: 'Trabajo',
        street: 'Av. Secundaria 456',
        city: 'Lima',
        district: 'Lima',
        province: 'Lima',
        department: 'Lima',
        postalCode: '15002',
        isDefault: false,
      },
    });

    const address3 = await prisma.address.create({
      data: {
        userId: user2.id,
        label: 'Casa',
        street: 'Calle Nueva 789',
        city: 'Lima',
        district: 'Lima',
        province: 'Lima',
        department: 'Lima',
        postalCode: '15003',
        isDefault: true,
      },
    });

    console.log('✅ 3 direcciones creadas\n');

    // Crear categorías
    console.log('📦 Creando categorías...');
    const categoryElectronics = await prisma.category.create({
      data: {
        name: 'Electrónica',
        slug: 'electronica',
        description: 'Dispositivos y equipos electrónicos',
        active: true,
      },
    });

    const categoryAccesories = await prisma.category.create({
      data: {
        name: 'Accesorios',
        slug: 'accesorios',
        description: 'Accesorios para computadoras y dispositivos',
        active: true,
      },
    });

    const categoryMonitors = await prisma.category.create({
      data: {
        name: 'Monitores',
        slug: 'monitores',
        description: 'Monitores de diferentes tamaños',
        active: true,
      },
    });

    console.log('✅ 3 categorías creadas\n');

    // Crear productos
    console.log('🛍️  Creando productos...');
    const product1 = await prisma.product.create({
      data: {
        sku: 'DELL-XPS-13-001',
        title: 'Laptop Dell XPS 13',
        description: 'Laptop ultraportátil de alta performance con procesador Intel i7 y 16GB RAM',
        price: 250000,  // 2500.00 en centavos
        originalPrice: 280000,  // 2800.00 en centavos
        categoryId: categoryElectronics.id,
        stock: 50,
        weight: 1.2,
        rating: 4.5,
        reviewCount: 120,
        active: true,
        images: {
          createMany: {
            data: [
              {
                url: 'https://example.com/dell-xps-13-1.jpg',
                alt: 'Dell XPS 13 vista frontal',
              },
              {
                url: 'https://example.com/dell-xps-13-2.jpg',
                alt: 'Dell XPS 13 vista lateral',
              },
            ],
          },
        },
        features: {
          createMany: {
            data: [
              { feature: 'Procesador: Intel Core i7-1260P' },
              { feature: 'RAM: 16GB LPDDR5' },
              { feature: 'Almacenamiento: 512GB SSD' },
              { feature: 'Pantalla: 13.4" FHD OLED' },
            ],
          },
        },
      },
      include: { images: true, features: true },
    });

    const product2 = await prisma.product.create({
      data: {
        sku: 'LOG-MX-MASTER-001',
        title: 'Mouse Logitech MX Master 3S',
        description: 'Mouse profesional de precisión con tecnología MagSpeed',
        price: 15000,  // 150.00 en centavos
        originalPrice: 17999,  // 179.99 en centavos
        categoryId: categoryAccesories.id,
        stock: 200,
        weight: 0.135,
        rating: 4.8,
        reviewCount: 350,
        active: true,
        images: {
          createMany: {
            data: [
              {
                url: 'https://example.com/logitech-mx-master.jpg',
                alt: 'Logitech MX Master 3S',
              },
            ],
          },
        },
        features: {
          createMany: {
            data: [
              { feature: 'Conexión: Inalámbrica 2.4GHz + Bluetooth' },
              { feature: 'Botones: 8 botones personalizables' },
              { feature: 'DPI: 4000 DPI máximo' },
              { feature: 'Batería: Recargable, 70 días' },
            ],
          },
        },
      },
      include: { images: true, features: true },
    });

    const product3 = await prisma.product.create({
      data: {
        sku: 'KEY-RGB-MECH-001',
        title: 'Teclado Mecánico RGB',
        description: 'Teclado mecánico con retroiluminación RGB y switches Cherry MX',
        price: 12000,  // 120.00 en centavos
        originalPrice: 14999,  // 149.99 en centavos
        categoryId: categoryAccesories.id,
        stock: 75,
        weight: 0.9,
        rating: 4.3,
        reviewCount: 89,
        active: true,
        images: {
          createMany: {
            data: [
              {
                url: 'https://example.com/keyboard-rgb.jpg',
                alt: 'Teclado Mecánico RGB',
              },
            ],
          },
        },
        features: {
          createMany: {
            data: [
              { feature: 'Tipo de Switch: Cherry MX Red' },
              { feature: 'Retroiluminación: RGB Full Color' },
              { feature: 'Conexión: USB-C con Cable Desmontable' },
              { feature: 'Diseño: Gamer Compacto 75%' },
            ],
          },
        },
      },
      include: { images: true, features: true },
    });

    const product4 = await prisma.product.create({
      data: {
        sku: 'MON-LG-27-4K-001',
        title: 'Monitor LG 27" 4K UltraFine',
        description: 'Monitor profesional 4K para diseño gráfico y edición de video',
        price: 120000,  // 1200.00 en centavos
        originalPrice: 149999,  // 1499.99 en centavos
        categoryId: categoryMonitors.id,
        stock: 30,
        weight: 5.5,
        rating: 4.7,
        reviewCount: 45,
        active: true,
        images: {
          createMany: {
            data: [
              {
                url: 'https://example.com/lg-27-4k.jpg',
                alt: 'Monitor LG 27 4K',
              },
            ],
          },
        },
        features: {
          createMany: {
            data: [
              { feature: 'Resolución: 3840x2160 (4K)' },
              { feature: 'Panel: IPS 99.5% Adobe RGB' },
              { feature: 'Tamaño: 27 pulgadas' },
              { feature: 'Puertos: HDMI 2.1, DisplayPort 1.4, USB-C' },
            ],
          },
        },
      },
      include: { images: true, features: true },
    });

    console.log('✅ 4 productos creados\n');

    // Crear órdenes
    console.log('📋 Creando órdenes...');
    const order1 = await prisma.order.create({
      data: {
        orderNumber: 'ORD-2025-00001',
        userId: user1.id,
        shippingAddressId: address1.id,
        shippingMethod: 'STANDARD',
        subtotal: 265000,  // 2650.00 en centavos
        tax: 47700,  // 477.00 en centavos
        shippingCost: 5000,  // 50.00 en centavos
        total: 317700,  // 3177.00 en centavos
        status: 'CONFIRMED',
        paymentStatus: 'COMPLETED',
        items: {
          createMany: {
            data: [
              {
                productId: product1.id,
                quantity: 1,
                unitPrice: 250000,  // 2500.00 en centavos
                subtotal: 250000,
              },
              {
                productId: product2.id,
                quantity: 1,
                unitPrice: 15000,  // 150.00 en centavos
                subtotal: 15000,
              },
            ],
          },
        },
      },
      include: { items: true, user: true },
    });

    const order2 = await prisma.order.create({
      data: {
        orderNumber: 'ORD-2025-00002',
        userId: user2.id,
        shippingAddressId: address3.id,
        shippingMethod: 'EXPRESS',
        subtotal: 12000,  // 120.00 en centavos
        tax: 2160,  // 21.60 en centavos
        shippingCost: 15000,  // 150.00 en centavos
        total: 29160,  // 291.60 en centavos
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          createMany: {
            data: [
              {
                productId: product3.id,
                quantity: 1,
                unitPrice: 12000,  // 120.00 en centavos
                subtotal: 12000,
              },
            ],
          },
        },
      },
      include: { items: true, user: true },
    });

    console.log('✅ 2 órdenes creadas\n');

    // Crear pagos
    console.log('💳 Creando pagos...');
    const payment1 = await prisma.payment.create({
      data: {
        orderId: order1.id,
        userId: user1.id,
        provider: 'STRIPE',
        providerId: 'txn_12345678901234567890',
        amount: order1.total,
        status: 'COMPLETED',
      },
    });

    console.log('✅ 1 pago creado\n');

    // Crear reviews
    console.log('⭐ Creando reviews...');
    const review1 = await prisma.review.create({
      data: {
        productId: product1.id,
        userId: user1.id,
        rating: 5,
        title: 'Excelente laptop',
        content: 'Muy buena calidad, rendimiento excepcional. Recomendado!',
        helpful: 45,
      },
    });

    const review2 = await prisma.review.create({
      data: {
        productId: product2.id,
        userId: user1.id,
        rating: 5,
        title: 'Mejor mouse que he usado',
        content: 'Precisión perfecta, muy cómodo para largas sesiones de trabajo.',
        helpful: 32,
      },
    });

    console.log('✅ 2 reviews creados\n');

    console.log('✨ ¡Seed completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - ${3} usuarios`);
    console.log(`   - ${3} direcciones`);
    console.log(`   - ${3} categorías`);
    console.log(`   - ${4} productos`);
    console.log(`   - ${2} órdenes`);
    console.log(`   - ${1} pago`);
    console.log(`   - ${2} reviews`);
  } catch (error) {
    console.error('❌ Error durante seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
