#!/usr/bin/env node

/**
 * Script de Testing Automatizado para Panel SUPERADMIN - v2
 * Prueba todos los endpoints de /api/superadmin/*
 * 
 * Uso: node testing-superadmin-v2.js
 */

// Configuración
const BASE_URL = 'http://localhost:5000';
const TIMEOUT = 10000;
let TOKEN = null;
let ADMIN_ID = null;
let TEST_RESULTS = [];

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
  cyan: '\x1b[34m',
};

// Función para hacer requests HTTP
async function makeRequest(method, path, data = null, useAuth = true) {
  try {
    const url = `${BASE_URL}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (useAuth && TOKEN) {
      options.headers['Authorization'] = `Bearer ${TOKEN}`;
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseText = await response.text();
    let body;

    try {
      body = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      body = null;
    }

    return {
      status: response.status,
      headers: response.headers,
      body: body,
      rawBody: responseText,
    };
  } catch (error) {
    throw error;
  }
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

// Test 1: Login
async function testLogin() {
  console.log(`\n${colors.cyan}[1/12] Testing Login...${colors.reset}`);
  
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: 'superadmin@example.com',
      password: 'superadmin123',
    }, false);

    if (response.status === 200 && response.body.token) {
      TOKEN = response.body.token;
      logTest('POST /api/auth/login', true, `Token obtenido: ${TOKEN.substring(0, 20)}...`);
      return true;
    } else {
      logTest('POST /api/auth/login', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('POST /api/auth/login', false, error.message);
    return false;
  }
}

// Test 2: Dashboard Stats
async function testDashboardStats() {
  console.log(`\n${colors.cyan}[2/12] Testing Dashboard Stats...${colors.reset}`);
  
  try {
    const response = await makeRequest('GET', '/api/superadmin/dashboard/stats');

    if (response.status === 200 && response.body) {
      const hasRequired = response.body.totalUsers !== undefined;
      logTest('GET /api/superadmin/dashboard/stats', hasRequired, `Users: ${response.body.totalUsers}, Orders: ${response.body.totalOrders}`);
      return hasRequired;
    } else {
      logTest('GET /api/superadmin/dashboard/stats', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('GET /api/superadmin/dashboard/stats', false, error.message);
    return false;
  }
}

// Test 3: System Health
async function testSystemHealth() {
  console.log(`\n${colors.cyan}[3/12] Testing System Health...${colors.reset}`);
  
  try {
    const response = await makeRequest('GET', '/api/superadmin/dashboard/health');

    if (response.status === 200 && response.body.dbConnection !== undefined) {
      logTest('GET /api/superadmin/dashboard/health', true, `DB: ${response.body.dbConnection ? '✓' : '✗'}`);
      return true;
    } else {
      logTest('GET /api/superadmin/dashboard/health', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('GET /api/superadmin/dashboard/health', false, error.message);
    return false;
  }
}

// Test 4: Get All Admins
async function testGetAdmins() {
  console.log(`\n${colors.cyan}[4/12] Testing Get All Admins...${colors.reset}`);
  
  try {
    const response = await makeRequest('GET', '/api/superadmin/admins?page=1&limit=10');

    if (response.status === 200 && Array.isArray(response.body.admins)) {
      logTest('GET /api/superadmin/admins', true, `Found: ${response.body.total} admins`);
      if (response.body.admins.length > 0) {
        ADMIN_ID = response.body.admins[0].id;
      }
      return true;
    } else {
      logTest('GET /api/superadmin/admins', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('GET /api/superadmin/admins', false, error.message);
    return false;
  }
}

// Test 5: Create Admin
async function testCreateAdmin() {
  console.log(`\n${colors.cyan}[5/12] Testing Create Admin...${colors.reset}`);
  
  try {
    const newAdmin = {
      email: `admin-test-${Date.now()}@example.com`,
      name: 'Test Admin',
      password: 'TestPassword123!',
    };

    const response = await makeRequest('POST', '/api/superadmin/admins', newAdmin);

    if (response.status === 201 && response.body.id) {
      ADMIN_ID = response.body.id;
      logTest('POST /api/superadmin/admins', true, `Admin creado: ${response.body.email}`);
      return true;
    } else {
      logTest('POST /api/superadmin/admins', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('POST /api/superadmin/admins', false, error.message);
    return false;
  }
}

// Test 6: Update Admin
async function testUpdateAdmin() {
  console.log(`\n${colors.cyan}[6/12] Testing Update Admin...${colors.reset}`);
  
  if (!ADMIN_ID) {
    logTest('PUT /api/superadmin/admins/:id', false, 'No admin ID available');
    return false;
  }

  try {
    const response = await makeRequest('PUT', `/api/superadmin/admins/${ADMIN_ID}`, {
      name: 'Updated Admin Name',
      isActive: true,
    });

    if (response.status === 200) {
      logTest('PUT /api/superadmin/admins/:id', true, `Admin actualizado`);
      return true;
    } else {
      logTest('PUT /api/superadmin/admins/:id', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('PUT /api/superadmin/admins/:id', false, error.message);
    return false;
  }
}

// Test 7: Get Audit Logs
async function testGetAuditLogs() {
  console.log(`\n${colors.cyan}[7/12] Testing Get Audit Logs...${colors.reset}`);
  
  try {
    const response = await makeRequest('GET', '/api/superadmin/audit-logs?page=1&limit=10');

    if (response.status === 200 && Array.isArray(response.body.logs)) {
      logTest('GET /api/superadmin/audit-logs', true, `Found: ${response.body.total} logs`);
      return true;
    } else {
      logTest('GET /api/superadmin/audit-logs', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('GET /api/superadmin/audit-logs', false, error.message);
    return false;
  }
}

// Test 8: Get Reports
async function testGetReports() {
  console.log(`\n${colors.cyan}[8/12] Testing Get Reports...${colors.reset}`);
  
  try {
    const response = await makeRequest('GET', '/api/superadmin/reports?days=30');

    if (response.status === 200 && response.body) {
      logTest('GET /api/superadmin/reports', true, `Report generado`);
      return true;
    } else {
      logTest('GET /api/superadmin/reports', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('GET /api/superadmin/reports', false, error.message);
    return false;
  }
}

// Test 9: Get Settings
async function testGetSettings() {
  console.log(`\n${colors.cyan}[9/12] Testing Get Settings...${colors.reset}`);
  
  try {
    const response = await makeRequest('GET', '/api/superadmin/settings');

    if (response.status === 200 && response.body) {
      logTest('GET /api/superadmin/settings', true, `Settings obtenidos`);
      return true;
    } else {
      logTest('GET /api/superadmin/settings', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('GET /api/superadmin/settings', false, error.message);
    return false;
  }
}

// Test 10: Update Settings
async function testUpdateSettings() {
  console.log(`\n${colors.cyan}[10/12] Testing Update Settings...${colors.reset}`);
  
  try {
    const response = await makeRequest('PUT', '/api/superadmin/settings', {
      appName: 'Un Poquito Variado Updated',
      currency: 'USD',
    });

    if (response.status === 200) {
      logTest('PUT /api/superadmin/settings', true, `Settings actualizados`);
      return true;
    } else {
      logTest('PUT /api/superadmin/settings', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('PUT /api/superadmin/settings', false, error.message);
    return false;
  }
}

// Test 11: Delete Admin
async function testDeleteAdmin() {
  console.log(`\n${colors.cyan}[11/12] Testing Delete Admin...${colors.reset}`);
  
  if (!ADMIN_ID) {
    logTest('DELETE /api/superadmin/admins/:id', false, 'No admin ID available');
    return false;
  }

  try {
    const response = await makeRequest('DELETE', `/api/superadmin/admins/${ADMIN_ID}`);

    if (response.status === 200 || response.status === 204) {
      logTest('DELETE /api/superadmin/admins/:id', true, `Admin eliminado`);
      return true;
    } else {
      logTest('DELETE /api/superadmin/admins/:id', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('DELETE /api/superadmin/admins/:id', false, error.message);
    return false;
  }
}

// Test 12: Security - Sin autenticación
async function testSecurityNoAuth() {
  console.log(`\n${colors.cyan}[12/12] Testing Security (No Auth)...${colors.reset}`);
  
  try {
    const response = await makeRequest('GET', '/api/superadmin/admins', null, false);

    if (response.status === 401 || response.status === 403) {
      logTest('GET /api/superadmin/admins (sin token)', true, `Correctamente protegido (${response.status})`);
      return true;
    } else {
      logTest('GET /api/superadmin/admins (sin token)', false, `Status: ${response.status} (esperaba 401/403)`);
      return false;
    }
  } catch (error) {
    logTest('GET /api/superadmin/admins (sin token)', false, error.message);
    return false;
  }
}

// Main testing flow
async function runTests() {
  console.log(`\n${colors.bold}${colors.blue}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║   Testing Panel SUPERADMIN - Todos Endpoints   ║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════════╝${colors.reset}\n`);

  // Ejecutar todos los tests
  const results = [];
  
  results.push(await testLogin());
  
  if (!TOKEN) {
    console.log(`\n${colors.red}${colors.bold}❌ Login falló - No se pueden ejecutar otros tests${colors.reset}`);
    printSummary(results);
    process.exit(1);
  }

  results.push(await testDashboardStats());
  results.push(await testSystemHealth());
  results.push(await testGetAdmins());
  results.push(await testCreateAdmin());
  results.push(await testUpdateAdmin());
  results.push(await testGetAuditLogs());
  results.push(await testGetReports());
  results.push(await testGetSettings());
  results.push(await testUpdateSettings());
  results.push(await testDeleteAdmin());
  results.push(await testSecurityNoAuth());

  printSummary(results);
}

// Print summary
function printSummary(results) {
  console.log(`\n${colors.bold}${colors.blue}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║           REPORTE FINAL DE TESTS             ║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════════╝${colors.reset}\n`);

  const totalTests = TEST_RESULTS.length;
  const passedTests = TEST_RESULTS.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  console.log(`${colors.bold}Resultados:${colors.reset}`);
  console.log(`  ${colors.green}✓ Pasados: ${passedTests}/${totalTests}${colors.reset}`);
  console.log(`  ${colors.red}✗ Fallidos: ${failedTests}/${totalTests}${colors.reset}`);
  console.log(`  ${colors.cyan}Success Rate: ${successRate}%${colors.reset}\n`);

  if (failedTests > 0) {
    console.log(`${colors.yellow}${colors.bold}Tests Fallidos:${colors.reset}`);
    TEST_RESULTS.filter(r => !r.success).forEach(r => {
      console.log(`  ${colors.red}✗${colors.reset} ${r.testName}`);
      if (r.details) console.log(`     ${r.details}`);
    });
    console.log();
  }

  if (successRate === 100) {
    console.log(`${colors.green}${colors.bold}🎉 TODOS LOS TESTS PASARON - ¡EXCELENTE!${colors.reset}\n`);
    process.exit(0);
  } else if (successRate >= 80) {
    console.log(`${colors.yellow}${colors.bold}⚠️  MAYORÍA DE TESTS PASARON (${successRate}%)${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bold}❌ ALGUNOS TESTS FALLARON - Revisar logs arriba${colors.reset}\n`);
    process.exit(1);
  }
}

// Ejecutar tests
console.log(`\n${colors.bold}Iniciando tests... por favor espera...${colors.reset}`);
runTests().catch(error => {
  console.error(`${colors.red}Error fatal:${colors.reset}`, error);
  process.exit(1);
});
