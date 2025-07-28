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
  console.error('❌ DATABASE_URL environment variable is required for tests');
  console.error('   Please set DATABASE_URL in your .env.test or .env.test.local file');
  process.exit(1);
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
