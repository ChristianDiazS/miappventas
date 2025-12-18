#!/usr/bin/env node

/**
 * Script de Testing - Versión que escribe en archivo
 */

import http from 'http';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'localhost';
const PORT = 5000;
let TOKEN = null;
let TEST_RESULTS = [];
let logOutput = [];

function log(msg) {
  console.log(msg);
  logOutput.push(msg);
}

function makeRequest(method, pathStr, data = null, useAuth = true) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: pathStr,
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
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  log('\n========== TESTING SUPERADMIN ENDPOINTS ==========\n');

  // Test 1: Health
  log('[1/2] Testing Health...');
  try {
    const res = await makeRequest('GET', '/api/health', null, false);
    if (res.status === 200) {
      log('✅ PASS - GET /api/health');
      TEST_RESULTS.push({ test: 'GET /api/health', pass: true });
    } else {
      log(`❌ FAIL - GET /api/health (Status: ${res.status})`);
      TEST_RESULTS.push({ test: 'GET /api/health', pass: false });
    }
  } catch (error) {
    log(`❌ FAIL - GET /api/health (${error.message})`);
    TEST_RESULTS.push({ test: 'GET /api/health', pass: false });
  }

  // Test 2: Login
  log('[2/2] Testing Login...');
  try {
    const res = await makeRequest('POST', '/api/auth/login', {
      email: 'superadmin@test.com',
      password: 'TestPassword123!',
    }, false);
    
    if (res.status === 200 && res.body.token) {
      TOKEN = res.body.token;
      log('✅ PASS - POST /api/auth/login');
      TEST_RESULTS.push({ test: 'POST /api/auth/login', pass: true });
    } else {
      log(`❌ FAIL - POST /api/auth/login (Status: ${res.status})`);
      TEST_RESULTS.push({ test: 'POST /api/auth/login', pass: false });
    }
  } catch (error) {
    log(`❌ FAIL - POST /api/auth/login (${error.message})`);
    TEST_RESULTS.push({ test: 'POST /api/auth/login', pass: false });
  }

  // Summary
  log('\n========== SUMMARY ==========');
  const passed = TEST_RESULTS.filter(r => r.pass).length;
  const total = TEST_RESULTS.length;
  const rate = Math.round((passed / total) * 100);
  
  log(`Passed: ${passed}/${total}`);
  log(`Success Rate: ${rate}%`);
  
  if (rate === 100) {
    log('✅ ALL TESTS PASSED');
  } else {
    log('❌ SOME TESTS FAILED');
  }

  // Write to file
  const outputPath = path.join(process.cwd(), 'test-results.txt');
  fs.writeFileSync(outputPath, logOutput.join('\n'), 'utf-8');
  log(`\n📄 Results written to: ${outputPath}`);
}

log('Starting tests...');
runTests().catch(error => {
  log(`Fatal error: ${error.message}`);
  const outputPath = path.join(process.cwd(), 'test-results.txt');
  fs.writeFileSync(outputPath, logOutput.join('\n'), 'utf-8');
  process.exit(1);
});
