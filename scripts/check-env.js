#!/usr/bin/env node

/**
 * Environment Check Script for Production Deployment
 */

const requiredEnvVars = {
  NODE_ENV: 'Should be "production" for production deployment',
  PORT: 'Server port (usually set by Render.com automatically)'
};

const optionalEnvVars = {
  DATABASE_URL: 'PostgreSQL connection string (leave empty to use mock data)',
  PING_MESSAGE: 'Custom API ping message'
};

console.log('🔍 Checking environment configuration...\n');

let hasErrors = false;

// Check required variables
console.log('📋 Required Environment Variables:');
for (const [varName, description] of Object.entries(requiredEnvVars)) {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value}`);
  } else {
    console.log(`  ⚠️  ${varName}: Not set - ${description}`);
    if (varName === 'NODE_ENV') {
      hasErrors = true;
    }
  }
}

console.log('\n📋 Optional Environment Variables:');
for (const [varName, description] of Object.entries(optionalEnvVars)) {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
  } else {
    console.log(`  ℹ️  ${varName}: Not set - ${description}`);
  }
}

console.log('\n🚀 Deployment Platform Recommendations:');
console.log('  • Render.com: Use the included render.yaml configuration');
console.log('  • Docker: Use the included Dockerfile');
console.log('  • Manual: Set NODE_ENV=production and run "npm start"');

if (hasErrors) {
  console.log('\n❌ Please fix the environment variable issues before deploying.');
  process.exit(1);
} else {
  console.log('\n✅ Environment configuration looks good!');
}
