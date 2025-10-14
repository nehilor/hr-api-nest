#!/usr/bin/env node

/**
 * Direct test of Sentry functionality
 *
 * Usage:
 * node scripts/test-sentry-direct.js
 */

const Sentry = require('@sentry/node');

// Initialize Sentry directly
Sentry.init({
  dsn: 'https://1cf899d8dc5bec90d671cb1d31ee3e22@o4510184938668033.ingest.sentry.io/4510184940175362',
  environment: 'development',
  tracesSampleRate: 1.0,
  enabled: true,
});

console.log('🚀 Testing Sentry directly...');

// Test 1: Capture a simple error
try {
  throw new Error('Direct Sentry test error - ' + new Date().toISOString());
} catch (error) {
  Sentry.captureException(error);
  console.log('✅ Error captured with Sentry.captureException()');
}

// Test 2: Capture with scope
Sentry.withScope((scope) => {
  scope.setTag('test', 'direct-sentry');
  scope.setLevel('error');
  scope.setContext('test', {
    timestamp: new Date().toISOString(),
    method: 'direct-test'
  });
  Sentry.captureException(new Error('Scoped Sentry test error - ' + new Date().toISOString()));
  console.log('✅ Error captured with scope');
});

// Test 3: Capture message
Sentry.captureMessage('Direct Sentry test message - ' + new Date().toISOString(), 'error');
console.log('✅ Message captured');

// Flush Sentry
Sentry.flush(2000).then(() => {
  console.log('✅ Sentry flushed');
  console.log('📱 Check your Sentry dashboard in 1-2 minutes');
  console.log('🔗 Dashboard: https://sentry.io');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error flushing Sentry:', error);
  process.exit(1);
});