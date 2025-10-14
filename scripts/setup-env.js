#!/usr/bin/env node

/**
 * Script para configurar las variables de entorno
 *
 * Uso:
 * node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');

const envContent = `# Environment variables
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hr_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-minimum-32-characters"
JWT_EXPIRES_IN="1h"
PORT=4000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
SENTRY_DSN="https://738d9320a89211f0af719abe26399cc6@o4510184940175362.ingest.sentry.io/4510184940175362"
`;

const envPath = path.join(__dirname, '..', '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env creado exitosamente');
  console.log('📁 Ubicación:', envPath);
  console.log('🔑 SENTRY_DSN configurado');
} catch (error) {
  console.error('❌ Error creando archivo .env:', error.message);
  process.exit(1);
}
