#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔄 Switching to local development environment...');

// Update prisma schema for SQLite
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

schema = schema.replace(/provider = "postgresql"/, 'provider = "sqlite"');

fs.writeFileSync(schemaPath, schema);

console.log('✅ Updated prisma/schema.prisma to use SQLite');
console.log('✅ Make sure DATABASE_URL="file:./dev.db" in your .env.local');
console.log('✅ Run: npm run db:generate');
