#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔄 Switching to production environment...');

// Update prisma schema for PostgreSQL
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

schema = schema.replace(/provider = "sqlite"/, 'provider = "postgresql"');

fs.writeFileSync(schemaPath, schema);

console.log('✅ Updated prisma/schema.prisma to use PostgreSQL');
console.log('✅ Make sure DATABASE_URL points to your Neon PostgreSQL database');
console.log('✅ Run: npm run db:generate');
