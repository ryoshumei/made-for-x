// Smart environment loading for Jest tests
const path = require('path');
const fs = require('fs');

// Define environment precedence
const envFiles = [
  '.env.test.local', // Highest priority - local test overrides
  '.env.test', // Test environment defaults
  '.env.local', // Local overrides (if no test-specific file)
  '.env', // Lowest priority - general defaults
];

// Load environment files in order (later files don't override earlier ones)
envFiles.forEach((envFile) => {
  const envPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    require('dotenv').config({
      path: envPath,
      override: false, // Don't override already set variables
    });
    console.log(`📁 Loaded test environment from: ${envFile}`);
  }
});

// Ensure DATABASE_URL is set for tests
if (!process.env.DATABASE_URL) {
  // Fallback to production database for tests (could be risky in real scenarios)
  process.env.DATABASE_URL =
    'postgresql://neondb_owner:npg_vj2h1ASQgtWr@ep-rapid-paper-a469wf0k-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
  console.log('⚠️  Using fallback DATABASE_URL for tests');
}

// Set test-specific defaults
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Validate critical test environment variables
const requiredVars = ['DATABASE_URL'];
const missing = requiredVars.filter((varName) => !process.env[varName]);

if (missing.length > 0) {
  console.error(`❌ Missing required environment variables for tests: ${missing.join(', ')}`);
  process.exit(1);
}
