import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const CLOUD_NAME = 'dy73lxudf';
const UPLOAD_PRESET = 'unpoquitovariado_jewelry';

// Crear imagen de prueba (PNG mínimo)
const createTestImage = () => {
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41,
    0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x00, 0x03, 0x00, 0x01, 0x3e, 0x21, 0xbc,
    0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
    0x44, 0xae, 0x42, 0x60, 0x82
  ]);
  
  const testPath = path.join(__dirname, 'test-image.png');
  fs.writeFileSync(testPath, pngHeader);
  return testPath;
};

// Función para hacer POST a Cloudinary
const uploadToCloudinary = (filePath) => {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    
    // Crear multipart form data manualmente
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substr(2, 13);
    
    let body = '';
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="file"; filename="test-image.png"\r\n`;
    body += `Content-Type: image/png\r\n\r\n`;
    
    const startBuffer = Buffer.from(body);
    const endBuffer = Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="upload_preset"\r\n\r\n${UPLOAD_PRESET}\r\n--${boundary}--\r\n`);
    
    const finalBuffer = Buffer.concat([startBuffer, fileBuffer, endBuffer]);
    
    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: `/v1_1/${CLOUD_NAME}/image/upload`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': finalBuffer.length
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(finalBuffer);
    req.end();
  });
};

// Test 1: Subir imagen a Cloudinary
const testCloudinaryUpload = async () => {
  console.log('\n🧪 TEST 1: Subir imagen a Cloudinary...');
  
  try {
    const testImagePath = createTestImage();
    const result = await uploadToCloudinary(testImagePath);
    
    if (result.status === 200 && result.data.secure_url) {
      console.log('✅ Subida exitosa a Cloudinary');
      console.log(`   URL: ${result.data.secure_url}`);
      console.log(`   Public ID: ${result.data.public_id}`);
      console.log(`   Ancho: ${result.data.width}px`);
      console.log(`   Alto: ${result.data.height}px`);
      console.log(`   Tamaño: ${result.data.bytes} bytes`);
      
      fs.unlinkSync(testImagePath);
      return { success: true, data: result.data };
    } else {
      console.log('❌ Error en subida a Cloudinary');
      console.log(`   Status: ${result.status}`);
      console.log(`   Error: ${result.data.error?.message || JSON.stringify(result.data)}`);
      fs.unlinkSync(testImagePath);
      return { success: false, error: result.data.error };
    }
  } catch (error) {
    console.log('❌ Error en conexión a Cloudinary');
    console.log(`   ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Test 2: Verificar Backend disponible
const testBackendConnection = async () => {
  console.log('\n🧪 TEST 2: Verificar backend disponible...');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/products',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      console.log(`✅ Backend disponible (Status: ${res.statusCode})`);
      resolve({ success: true, port: 5000 });
    });
    
    req.on('error', (error) => {
      console.log('❌ Backend no disponible en http://localhost:5000');
      console.log('   Ejecuta: npm run dev (en carpeta backend)');
      resolve({ success: false, error: error.message });
    });
    
    req.end();
  });
};

// Ejecutar tests
const runTests = async () => {
  console.log('═══════════════════════════════════════════════');
  console.log('   🧪 Tests de Cloudinary Integration');
  console.log('═══════════════════════════════════════════════');
  
  const test1 = await testCloudinaryUpload();
  const test2 = await testBackendConnection();
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('   📊 Resumen de Tests');
  console.log('═══════════════════════════════════════════════');
  console.log(`   Test 1 (Cloudinary Upload): ${test1.success ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`   Test 2 (Backend Connection): ${test2.success ? '✅ PASÓ' : '⚠️  NO DISPONIBLE'}`);
  console.log('═══════════════════════════════════════════════\n');
};

runTests();

