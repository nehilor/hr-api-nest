#!/usr/bin/env node

/**
 * Simple script to send errors to Sentry
 *
 * Usage:
 * node scripts/send-to-sentry.js
 */

const BASE_URL = 'http://localhost:4000/api';

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Function to make HTTP requests
async function makeRequest(method, endpoint) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, options);
    const responseData = await response.json().catch(() => null);

    return {
      status: response.status,
      data: responseData,
      ok: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      data: null,
      ok: false,
      error: error.message
    };
  }
}

// Main function
async function sendToSentry() {
  log('🚀 Sending errors to Sentry...', 'bold');
  log('=' * 50, 'blue');

  // Check if backend is running
  log('\n🔍 Checking backend connection...', 'cyan');
  const healthCheck = await makeRequest('GET', '/health');

  if (!healthCheck.ok) {
    log('❌ Backend is not running on http://localhost:4000', 'red');
    process.exit(1);
  }

  log('✅ Backend connected successfully', 'green');

  // Endpoints that DO send to Sentry
  const sentryEndpoints = [
    { name: 'Manual Error', method: 'GET', endpoint: '/debug/sentry-test' },
    { name: 'TypeError', method: 'GET', endpoint: '/debug/sentry-test-2' },
    { name: 'Validation Error', method: 'POST', endpoint: '/debug/sentry-test-3' }
  ];

  log('\n🔥 Sending errors to Sentry...', 'bold');
  log('=' * 50, 'blue');

  let successCount = 0;

  for (let i = 0; i < sentryEndpoints.length; i++) {
    const test = sentryEndpoints[i];
    log(`\n[${i + 1}/${sentryEndpoints.length}] ${test.name}`, 'magenta');

    try {
      const result = await makeRequest(test.method, test.endpoint);

      if (!result.ok) {
        log(`✅ Error sent: ${result.status}`, 'green');
        successCount++;
      } else {
        log(`⚠️  No error generated (status: ${result.status})`, 'yellow');
      }
    } catch (error) {
      log(`✅ Exception captured: ${error.message}`, 'green');
      successCount++;
    }

    // Pause between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  log('\n' + '=' * 50, 'blue');
  log('📊 SUMMARY', 'bold');
  log('=' * 50, 'blue');
  log(`✅ Errors sent: ${successCount}/${sentryEndpoints.length}`, 'green');

  if (successCount > 0) {
    log('\n🎉 Errors sent to Sentry!', 'green');
    log('📱 Check your Sentry dashboard in 1-2 minutes', 'cyan');
    log('🔗 Dashboard: https://sentry.io', 'cyan');
  }
}

// Execute if called directly
if (require.main === module) {
  sendToSentry().catch(error => {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { sendToSentry };
