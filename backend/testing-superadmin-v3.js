#!/usr/bin/env node

/**
 * Script de Testing Automatizado para Panel SUPERADMIN - v3
 * Usando módulo http nativo de Node
 */

import http from 'http';

const BASE_URL = 'localhost';
const PORT = 5000;
let TOKEN = null;
let ADMIN_ID = null;
let TEST_RESULTS = [];

// Colores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
  cyan: '\x1b[34m',
};

// HTTP Request helper
function makeRequest(method, path, data = null, useAuth = true) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    };

    if (useAuth && TOKEN) {
      options.headers['Authorization'] = `Bearer ${TOKEN}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        let body;
        try {
          body = responseData ? JSON.parse(responseData) : {};
        } catch (e) {
          body = null;
        }

        resolve({
          status: res.statusCode,
          body: body,
          rawBody: responseData,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

function logTest(testName, success, details = '') {
  const status = success ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
  console.log(`${status} - ${testName}`);
  if (details) {
    console.log(`     ${colors.yellow}${details}${colors.reset}`);
  }
  TEST_RESULTS.push({ testName, success, details });
}

async function testLogin() {
  console.log(`\n${colors.cyan}[1/12] Testing Login...${colors.reset}`);
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: 'superadmin@test.com',
      password: 'TestPassword123!',
    }, false);

    if (response.status === 200 && response.body.token) {
      TOKEN = response.body.token;
      logTest('POST /api/auth/login', true, `Token obtenido`);
      return true;
    } else {
      logTest('POST /api/auth/login', false, `Status: ${response.status}, Body: ${JSON.stringify(response.body)}`);
      return false;
    }
  } catch (error) {
    logTest('POST /api/auth/login', false, error.message);
    return false;
  }
}

async function testHealth() {
  console.log(`\n${colors.cyan}[2/12] Testing Health...${colors.reset}`);
  try {
    const response = await makeRequest('GET', '/api/health', null, false);
    if (response.status === 200) {
      logTest('GET /api/health', true, `Server OK`);
      return true;
    } else {
      logTest('GET /api/health', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('GET /api/health', false, error.message);
    return false;
  }
}

async function testDashboardStats() {
  console.log(`\n${colors.cyan}[3/12] Testing Dashboard Stats...${colors.reset}`);
  try {
    const response = await makeRequest('GET', '/api/superadmin/dashboard/stats');
    if (response.status === 200) {
      logTest('GET /api/superadmin/dashboard/stats', true, `Stats: ${JSON.stringify(response.body)}`);
      return true;
    } else {
      logTest('GET /api/superadmin/dashboard/stats', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('GET /api/superadmin/dashboard/stats', false, error.message);
    return false;
  }
}

async function testGetAdmins() {
  console.log(`\n${colors.cyan}[4/12] Testing Get Admins...${colors.reset}`);
  try {
    const response = await makeRequest('GET', '/api/superadmin/admins?page=1&limit=10');
    if (response.status === 200 && Array.isArray(response.body.admins)) {
      logTest('GET /api/superadmin/admins', true, `Found ${response.body.total} admins`);
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

async function testCreateAdmin() {
  console.log(`\n${colors.cyan}[5/12] Testing Create Admin...${colors.reset}`);
  try {
    const response = await makeRequest('POST', '/api/superadmin/admins', {
      email: `admin-test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'Admin',
      password: 'TestPassword123!',
      role: 'ADMIN',
    });

    if (response.status === 201 && response.body.id) {
      ADMIN_ID = response.body.id;
      logTest('POST /api/superadmin/admins', true, `Admin created`);
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

async function testUpdateAdmin() {
  console.log(`\n${colors.cyan}[6/12] Testing Update Admin...${colors.reset}`);
  if (!ADMIN_ID) {
    logTest('PUT /api/superadmin/admins/:id', false, 'No admin ID');
    return false;
  }

  try {
    const response = await makeRequest('PUT', `/api/superadmin/admins/${ADMIN_ID}`, {
      name: 'Updated Admin',
    });

    if (response.status === 200) {
      logTest('PUT /api/superadmin/admins/:id', true, `Updated`);
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

async function testGetAuditLogs() {
  console.log(`\n${colors.cyan}[7/12] Testing Audit Logs...${colors.reset}`);
  try {
    const response = await makeRequest('GET', '/api/superadmin/audit-logs?page=1&limit=10');
    if (response.status === 200 && Array.isArray(response.body.logs)) {
      logTest('GET /api/superadmin/audit-logs', true, `${response.body.total} logs`);
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

async function testGetReports() {
  console.log(`\n${colors.cyan}[8/12] Testing Reports...${colors.reset}`);
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const response = await makeRequest('GET', `/api/superadmin/reports?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
    if (response.status === 200) {
      logTest('GET /api/superadmin/reports', true, `Report OK`);
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

async function testGetSettings() {
  console.log(`\n${colors.cyan}[9/12] Testing Settings...${colors.reset}`);
  try {
    const response = await makeRequest('GET', '/api/superadmin/settings');
    if (response.status === 200) {
      logTest('GET /api/superadmin/settings', true, `OK`);
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

async function testUpdateSettings() {
  console.log(`\n${colors.cyan}[10/12] Testing Update Settings...${colors.reset}`);
  try {
    const response = await makeRequest('PUT', '/api/superadmin/settings', {
      appName: 'Updated Name',
    });

    if (response.status === 200) {
      logTest('PUT /api/superadmin/settings', true, `Updated`);
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

async function testDeleteAdmin() {
  console.log(`\n${colors.cyan}[11/12] Testing Delete Admin...${colors.reset}`);
  if (!ADMIN_ID) {
    logTest('DELETE /api/superadmin/admins/:id', false, 'No admin ID');
    return false;
  }

  try {
    const response = await makeRequest('DELETE', `/api/superadmin/admins/${ADMIN_ID}`);
    if (response.status === 200 || response.status === 204) {
      logTest('DELETE /api/superadmin/admins/:id', true, `Deleted`);
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

async function testSecurityNoAuth() {
  console.log(`\n${colors.cyan}[12/12] Testing Security...${colors.reset}`);
  try {
    const response = await makeRequest('GET', '/api/superadmin/admins', null, false);
    if (response.status === 401 || response.status === 403) {
      logTest('Security (No Auth)', true, `Protected (${response.status})`);
      return true;
    } else {
      logTest('Security (No Auth)', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Security (No Auth)', false, error.message);
    return false;
  }
}

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
    console.log(`${colors.green}${colors.bold}🎉 ¡TODOS LOS TESTS PASARON!${colors.reset}\n`);
  } else if (successRate >= 80) {
    console.log(`${colors.yellow}${colors.bold}⚠️  ${successRate}% de tests pasaron${colors.reset}\n`);
  } else {
    console.log(`${colors.red}${colors.bold}❌ ${successRate}% - Revisar logs${colors.reset}\n`);
  }

  process.exit(successRate === 100 ? 0 : 1);
}

async function runTests() {
  console.log(`\n${colors.bold}${colors.blue}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║   Testing Panel SUPERADMIN - Todos Endpoints   ║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════════╝${colors.reset}\n`);

  const results = [];

  // Test health first
  results.push(await testHealth());

  // Test login
  results.push(await testLogin());

  if (!TOKEN) {
    console.log(`\n${colors.red}${colors.bold}❌ Login failed - No se pueden ejecutar otros tests${colors.reset}`);
    printSummary(results);
    return;
  }

  // Test other endpoints
  results.push(await testDashboardStats());
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

console.log(`${colors.bold}Iniciando tests en ${BASE_URL}:${PORT}...${colors.reset}`);
runTests().catch(error => {
  console.error(`${colors.red}Error fatal:${colors.reset}`, error);
  process.exit(1);
});
