#!/usr/bin/env node

/**
 * Render Deployment Verification Script
 * Ensures the project is ready for Render deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Render Deployment Verification\n');

// Check if render.yaml exists
const renderConfigPath = path.join(process.cwd(), 'render.yaml');
if (fs.existsSync(renderConfigPath)) {
  console.log('✅ render.yaml configuration found');
} else {
  console.log('❌ render.yaml not found - creating one...');
  process.exit(1);
}

// Check package.json scripts
const packagePath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const requiredScripts = ['build:production', 'start'];
let scriptsValid = true;

requiredScripts.forEach(script => {
  if (pkg.scripts[script]) {
    console.log(`✅ Script "${script}" found: ${pkg.scripts[script]}`);
  } else {
    console.log(`❌ Missing required script: ${script}`);
    scriptsValid = false;
  }
});

// Check for required dependencies
const requiredDeps = ['express', 'pg', 'react', 'jspdf'];
let depsValid = true;

requiredDeps.forEach(dep => {
  if (pkg.dependencies[dep] || pkg.devDependencies[dep]) {
    console.log(`✅ Dependency "${dep}" found`);
  } else {
    console.log(`❌ Missing dependency: ${dep}`);
    depsValid = false;
  }
});

// Check build output directory
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  console.log('✅ Build output directory exists');
} else {
  console.log('⚠️  Build output not found - will be created during deployment');
}

console.log('\n📋 Deployment Summary:');
console.log(`📦 Project: ${pkg.name}`);
console.log(`🏷️  Version: ${pkg.version}`);
console.log(`🎯 Node Version: 20+ (required by Render)`);
console.log(`🗄️  Database: Supabase PostgreSQL`);
console.log(`🌐 Frontend: React + Vite`);
console.log(`⚙️  Backend: Node.js + Express`);

if (scriptsValid && depsValid) {
  console.log('\n🎉 Ready for Render deployment!');
  console.log('👉 Go to: https://dashboard.render.com/select-repo');
  console.log('👉 Select your repository and deploy');
} else {
  console.log('\n❌ Please fix the issues above before deploying');
  process.exit(1);
}

console.log('\n📝 Next Steps:');
console.log('1. Go to render.com and create account');
console.log('2. Connect your GitHub repository');
console.log('3. Render will auto-detect render.yaml');
console.log('4. Click "Create Web Service"');
console.log('5. Your app will be live in ~5 minutes!');

console.log('\n🔗 Useful Links:');
console.log('• Render Dashboard: https://dashboard.render.com');
console.log('• Deployment Guide: ./render-deploy-instructions.md');
console.log('• Health Check: /api/ping (once deployed)');
