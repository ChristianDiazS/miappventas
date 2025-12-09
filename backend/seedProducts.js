// Script para agregar productos de prueba a MongoDB
import { Product } from './src/models/Product.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const productsData = [
  {
    name: 'Laptop Dell XPS 13',
    description: 'Laptop ultradelgada con procesador Intel i7, 16GB RAM, 512GB SSD',
    price: 199900,
    stock: 10,
    category: 'Laptops',
    images: [{ url: 'https://via.placeholder.com/300x200?text=Laptop+Dell', alt: 'Dell XPS 13' }],
    rating: 4.5,
    reviews: 25,
    features: ['Intel i7', '16GB RAM', '512GB SSD', 'Windows 11']
  },
  {
    name: 'Monitor LG UltraWide 34"',
    description: 'Monitor ultraancho con resolución 3440x1440',
    price: 89900,
    stock: 15,
    category: 'Monitores',
    images: [{ url: 'https://via.placeholder.com/300x200?text=LG+Monitor', alt: 'LG UltraWide' }],
    rating: 4.8,
    reviews: 45,
    features: ['3440x1440', '144Hz', 'Curved Display']
  },
  {
    name: 'Teclado Mecánico Corsair',
    description: 'Teclado mecánico RGB con switches Cherry MX',
    price: 24900,
    stock: 20,
    category: 'Periféricos',
    images: [{ url: 'https://via.placeholder.com/300x200?text=Corsair+Keyboard', alt: 'Corsair K95' }],
    rating: 4.6,
    reviews: 120,
    features: ['Mechanical', 'RGB Backlight', 'Programmable']
  },
  {
    name: 'Mouse Logitech MX Master 3',
    description: 'Mouse inalámbrico de precisión para profesionales',
    price: 34900,
    stock: 12,
    category: 'Periféricos',
    images: [{ url: 'https://via.placeholder.com/300x200?text=Logitech+Mouse', alt: 'MX Master 3' }],
    rating: 4.4,
    reviews: 78,
    features: ['Wireless', 'Multi-device', 'Precision Tracking']
  },
  {
    name: 'Escritorio Gamer RGB',
    description: 'Escritorio gaming con iluminación RGB integrada',
    price: 79900,
    stock: 8,
    category: 'Mobiliario',
    images: [{ url: 'https://via.placeholder.com/300x200?text=Gaming+Desk', alt: 'RGB Desk' }],
    rating: 4.7,
    reviews: 95,
    features: ['RGB Lighting', 'Cable Management', '150cm Width']
  },
  {
    name: 'Auriculares Hyperx Cloud Flight',
    description: 'Auriculares inalámbricos profesionales para gaming',
    price: 39900,
    stock: 18,
    category: 'Accesorios',
    images: [{ url: 'https://via.placeholder.com/300x200?text=Hyperx+Headset', alt: 'Cloud Flight' }],
    rating: 4.9,
    reviews: 156,
    features: ['Wireless', 'Noise Cancelling', '30h Battery']
  },
  {
    name: 'Silla Gamer Herman Miller',
    description: 'Silla ergonómica profesional para gaming',
    price: 44900,
    stock: 14,
    category: 'Mobiliario',
    images: [{ url: 'https://via.placeholder.com/300x200?text=Gaming+Chair', alt: 'Herman Miller' }],
    rating: 4.8,
    reviews: 134,
    features: ['Ergonomic', 'Adjustable', 'Lumbar Support']
  },
  {
    name: 'Laptop MacBook Pro 14"',
    description: 'Laptop profesional con chip M3 Max, 18GB RAM, 512GB SSD',
    price: 259900,
    stock: 6,
    category: 'Laptops',
    images: [{ url: 'https://via.placeholder.com/300x200?text=MacBook+Pro', alt: 'MacBook Pro 14' }],
    rating: 4.9,
    reviews: 89,
    features: ['M3 Max Chip', '18GB RAM', 'ProMotion Display']
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Eliminar productos existentes
    const deleted = await Product.deleteMany({});
    console.log(`✅ ${deleted.deletedCount} productos eliminados`);

    // Insertar nuevos productos
    const result = await Product.insertMany(productsData);
    console.log(`✅ ${result.length} productos creados:`);
    result.forEach(p => {
      console.log(`   - ${p.name} (S/. ${(p.price / 100).toFixed(2)})`);
    });

    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedProducts();
