#!/usr/bin/env node

/**
 * Script de Testing Automatizado para Panel SUPERADMIN
 * Prueba todos los endpoints de /api/superadmin/*
 * 
 * Uso: node testing-superadmin.js
 */

import fetch from 'node-fetch';

// Configuración
const BASE_URL = 'http://localhost:5000';
const TIMEOUT = 10000;
let TOKEN = null;
let TEST_RESULTS = [];

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

// Función para hacer requests HTTP
async function makeRequest(method, path, data = null, useAuth = true) {
  return new Promise((resolve, reject) => {
    try {
      const url = `${BASE_URL}${path}`;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: TIMEOUT,
      };

      if (useAuth && TOKEN) {
        options.headers['Authorization'] = `Bearer ${TOKEN}`;
      }

      const req = fetch(url, {
        ...options,
        body: data ? JSON.stringify(data) : undefined,
      })
        .then(res => {
          if (!res.ok && res.status !== 201) {
            return res.text().then(text => {
              try {
                return {
                  status: res.status,
                  headers: res.headers,
                  body: JSON.parse(text),
                  rawBody: text,
                };
              } catch (e) {
                return {
                  status: res.status,
                  headers: res.headers,
                  body: null,
                  rawBody: text,
                };
              }
            });
          }
          return res.text().then(text => {
            try {
              return {
                status: res.status,
                headers: res.headers,
                body: text ? JSON.parse(text) : {},
                rawBody: text,
              };
            } catch (e) {
              return {
                status: res.status,
                headers: res.headers,
                body: null,
                rawBody: text,
              };
            }
          });
        })
        .then(resolve)
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

// Función para registrar resultados
function logTest(testName, success, details = '') {
  const status = success ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
  console.log(`${status} - ${testName}`);
  if (details) {
    console.log(`     ${colors.yellow}${details}${colors.reset}`);
  }
  TEST_RESULTS.push({ testName, success, details });
}

// Main testing flow
async function runTests() {
  console.log(`\n${colors.bold}${colors.blue}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║   Testing Panel SUPERADMIN - Todos Endpoints   ║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════════╝${colors.reset}\n`);

  try {
    // TEST 1: Login (Obtener TOKEN)
    console.log(`${colors.bold}📌 Test 1: Authentication${colors.reset}`);
    await testLogin();

    // TEST 2: Dashboard Stats
    console.log(`\n${colors.bold}📌 Test 2: Dashboard - GET /api/superadmin/dashboard/stats${colors.reset}`);
    await testDashboardStats();

    // TEST 3: System Health
    console.log(`\n${colors.bold}📌 Test 3: System - GET /api/superadmin/dashboard/health${colors.reset}`);
    await testSystemHealth();

    // TEST 4: Get Admins
    console.log(`\n${colors.bold}📌 Test 4: Admins - GET /api/superadmin/admins${colors.reset}`);
    await testGetAdmins();

    // TEST 5: Create Admin
    console.log(`\n${colors.bold}📌 Test 5: Admins - POST /api/superadmin/admins (Create)${colors.reset}`);
    const newAdminId = await testCreateAdmin();

    // TEST 6: Update Admin
    if (newAdminId) {
      console.log(`\n${colors.bold}📌 Test 6: Admins - PUT /api/superadmin/admins/:id (Update)${colors.reset}`);
      await testUpdateAdmin(newAdminId);
    }

    // TEST 7: Get Audit Logs
    console.log(`\n${colors.bold}📌 Test 7: Audit Logs - GET /api/superadmin/audit-logs${colors.reset}`);
    await testGetAuditLogs();

    // TEST 8: Get Reports
    console.log(`\n${colors.bold}📌 Test 8: Reports - GET /api/superadmin/reports${colors.reset}`);
    await testGetReports();

    // TEST 9: Get Settings
    console.log(`\n${colors.bold}📌 Test 9: Settings - GET /api/superadmin/settings${colors.reset}`);
    await testGetSettings();

    // TEST 10: Update Settings
    console.log(`\n${colors.bold}📌 Test 10: Settings - PUT /api/superadmin/settings (Update)${colors.reset}`);
    await testUpdateSettings();

    // TEST 11: Delete Admin
    if (newAdminId) {
      console.log(`\n${colors.bold}📌 Test 11: Admins - DELETE /api/superadmin/admins/:id${colors.reset}`);
      await testDeleteAdmin(newAdminId);
    }

    // TEST 12: Security Tests
    console.log(`\n${colors.bold}📌 Test 12: Security - Endpoints sin autenticación${colors.reset}`);
    await testSecurityNoAuth();

  } catch (error) {
    console.error(`${colors.red}Error general en tests:${colors.reset}`, error.message);
  }

  // Resumen final
  printSummary();
}

// ============== TESTS INDIVIDUALES ==============

async function testLogin() {
  try {
    const response = await makeRequest(
      'POST',
      '/api/auth/login',
      {
        email: 'superadmin@test.com',
        password: 'superadmin123',
      },
      false
    );

    if (response.status === 200 && response.body.token) {
      TOKEN = response.body.token;
      logTest('Login y obtención de token', true, `Token: ${TOKEN.substring(0, 20)}...`);
      return true;
    } else {
      logTest('Login y obtención de token', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Login y obtención de token', false, error.message);
    return false;
  }
}

async function testDashboardStats() {
  try {
    const response = await makeRequest('GET', '/api/superadmin/dashboard/stats');

    if (response.status === 200) {
      const { summary, thisMonth, topProducts } = response.body;
      logTest('Cargar estadísticas del dashboard', true, 
        `Usuarios: ${summary?.totalUsers}, Órdenes: ${summary?.totalOrders}, Ingresos: S/. ${(summary?.totalRevenue / 100).toFixed(2)}`);
      return true;
    } else {
      logTest('Cargar estadísticas del dashboard', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Cargar estadísticas del dashboard', false, error.message);
    return false;
  }
}

async function testSystemHealth() {
  try {
    const response = await makeRequest('GET', '/api/superadmin/dashboard/health');

    if (response.status === 200 && response.body.status === 'ok') {
      logTest('Verificar salud del sistema', true, 'Database conectada');
      return true;
    } else {
      logTest('Verificar salud del sistema', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Verificar salud del sistema', false, error.message);
    return false;
  }
}

async function testGetAdmins() {
  try {
    const response = await makeRequest('GET', '/api/superadmin/admins?page=1&limit=10');

    if (response.status === 200 && response.body.admins) {
      logTest('Listar admins', true, `Total: ${response.body.admins.length}, Páginas: ${response.body.pagination.pages}`);
      return true;
    } else {
      logTest('Listar admins', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Listar admins', false, error.message);
    return false;
  }
}

async function testCreateAdmin() {
  try {
    const newAdmin = {
      email: `testadmin_${Date.now()}@test.com`,
      password: 'TestPassword123',
      firstName: 'Test',
      lastName: 'Admin',
      role: 'ADMIN',
    };

    const response = await makeRequest('POST', '/api/superadmin/admins', newAdmin);

    if (response.status === 201 && response.body.id) {
      logTest('Crear nuevo admin', true, `Email: ${response.body.email}, ID: ${response.body.id}`);
      return response.body.id;
    } else {
      logTest('Crear nuevo admin', false, `Status: ${response.status}, Error: ${response.body.error || 'Desconocido'}`);
      return null;
    }
  } catch (error) {
    logTest('Crear nuevo admin', false, error.message);
    return null;
  }
}

async function testUpdateAdmin(adminId) {
  try {
    const updateData = {
      firstName: 'TestUpdated',
      lastName: 'AdminUpdated',
      role: 'ADMIN',
      active: true,
    };

    const response = await makeRequest('PUT', `/api/superadmin/admins/${adminId}`, updateData);

    if (response.status === 200 && response.body.id) {
      logTest('Actualizar admin', true, `Nombre actualizado: ${response.body.firstName}`);
      return true;
    } else {
      logTest('Actualizar admin', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Actualizar admin', false, error.message);
    return false;
  }
}

async function testGetAuditLogs() {
  try {
    const response = await makeRequest('GET', '/api/superadmin/audit-logs?page=1&limit=20');

    if (response.status === 200 && response.body.logs) {
      logTest('Obtener audit logs', true, `Registros: ${response.body.logs.length}, Total: ${response.body.pagination.total}`);
      return true;
    } else {
      logTest('Obtener audit logs', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Obtener audit logs', false, error.message);
    return false;
  }
}

async function testGetReports() {
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await makeRequest(
      'GET',
      `/api/superadmin/reports?startDate=${startDate}&endDate=${endDate}`
    );

    if (response.status === 200 && response.body.dailyRevenue) {
      const days = Object.keys(response.body.dailyRevenue).length;
      logTest('Generar reportes', true, `Días con datos: ${days}, Top clientes: ${response.body.topCustomers?.length || 0}`);
      return true;
    } else {
      logTest('Generar reportes', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Generar reportes', false, error.message);
    return false;
  }
}

async function testGetSettings() {
  try {
    const response = await makeRequest('GET', '/api/superadmin/settings');

    if (response.status === 200 && response.body.appName) {
      logTest('Obtener configuración', true, `App: ${response.body.appName}, Idioma: ${response.body.defaultLanguage}`);
      return true;
    } else {
      logTest('Obtener configuración', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Obtener configuración', false, error.message);
    return false;
  }
}

async function testUpdateSettings() {
  try {
    const updateData = {
      appName: 'Un Poquito Variado Updated',
      maintenanceMode: false,
      enableNewsletter: true,
    };

    const response = await makeRequest('PUT', '/api/superadmin/settings', updateData);

    if (response.status === 200) {
      logTest('Actualizar configuración', true, 'Configuración guardada');
      return true;
    } else {
      logTest('Actualizar configuración', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Actualizar configuración', false, error.message);
    return false;
  }
}

async function testDeleteAdmin(adminId) {
  try {
    const response = await makeRequest('DELETE', `/api/superadmin/admins/${adminId}`);

    if (response.status === 200) {
      logTest('Eliminar admin', true, 'Admin eliminado correctamente');
      return true;
    } else {
      logTest('Eliminar admin', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Eliminar admin', false, error.message);
    return false;
  }
}

async function testSecurityNoAuth() {
  try {
    // Intentar acceder sin token
    const response = await makeRequest('GET', '/api/superadmin/admins', null, false);

    if (response.status === 401 || response.status === 403) {
      logTest('Acceso rechazado sin autenticación', true, `Status: ${response.status} (correcto)`);
      return true;
    } else {
      logTest('Acceso rechazado sin autenticación', false, `Status: ${response.status} (debe ser 401/403)`);
      return false;
    }
  } catch (error) {
    logTest('Acceso rechazado sin autenticación', false, error.message);
    return false;
  }
}

function printSummary() {
  console.log(`\n${colors.bold}${colors.blue}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║              RESUMEN DE TESTING              ║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════════╝${colors.reset}\n`);

  const passed = TEST_RESULTS.filter(r => r.success).length;
  const failed = TEST_RESULTS.filter(r => !r.success).length;
  const total = TEST_RESULTS.length;
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

  console.log(`Total Tests: ${total}`);
  console.log(`${colors.green}✓ Pasados: ${passed}${colors.reset}`);
  console.log(`${colors.red}✗ Fallidos: ${failed}${colors.reset}`);
  console.log(`Success Rate: ${percentage}%\n`);

  if (failed > 0) {
    console.log(`${colors.bold}${colors.red}Tests Fallidos:${colors.reset}`);
    TEST_RESULTS.filter(r => !r.success).forEach(r => {
      console.log(`  • ${r.testName}: ${r.details}`);
    });
  }

  console.log(`\n${colors.bold}Resultado Final:${colors.reset}`);
  if (percentage === 100) {
    console.log(`${colors.green}${colors.bold}✓✓✓ TODOS LOS TESTS PASARON ✓✓✓${colors.reset}\n`);
  } else if (percentage >= 80) {
    console.log(`${colors.yellow}${colors.bold}⚠️  TESTS CON ISSUES (${percentage}%)${colors.reset}\n`);
  } else {
    console.log(`${colors.red}${colors.bold}✗✗✗ MUCHOS FALLOS (${percentage}%)${colors.reset}\n`);
  }
}

// Iniciar tests
runTests().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
