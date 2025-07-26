# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start Next.js development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing
- `npm test` - Run all tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ci` - Run tests for CI (no watch, with coverage)

The Jest configuration uses separate environments:
- Node environment for API and lib tests
- JSDOM environment for component tests

### Database Management
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes directly to database
- `npm run db:seed` - Seed database with initial data
- `npm run db:seed:mercari` - Seed Mercari shipping data
- `npm run db:reset` - Reset database (destructive)
- `npm run db:studio` - Open Prisma Studio

### Environment Switching
- `npm run dev:local` - Switch to local SQLite development
- `npm run dev:production` - Switch to production PostgreSQL

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL (production) / SQLite (local development)
- **ORM**: Prisma
- **UI**: Tailwind CSS with custom components
- **Testing**: Jest with React Testing Library
- **AI Integration**: OpenAI GPT models (configured in src/config/models.ts)

### Core Features
1. **Waste Collection Service** - Funabashi city garbage collection schedules
2. **Mail Generator** - AI-powered business email generation with chat, reply, and polite conversion features
3. **Japan Post Integration** - Postal code and shipping services
4. **Mercari Shipping Calculator** - Shipping cost calculation with comprehensive rate data

### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable React components
- `src/lib/` - Business logic and utilities (especially shipping calculator)
- `src/config/` - Configuration files (AI models, etc.)
- `prisma/` - Database schema and migrations
- `scripts/` - Database seeding and environment switching scripts

### Database Schema
The application uses multiple database models:
- `WasteCollectionSchedule` - Garbage collection data for Funabashi city
- `MercariServiceCategory` - Mercari shipping service categories
- `ShippingService` - Individual shipping services
- `ShippingOption` - Specific shipping options with pricing
- `SizeTier` - Size-based pricing tiers

### Environment Management
The project supports dual database environments:
- **Local Development**: SQLite database (`prisma/dev.db`)
- **Production**: PostgreSQL on Vercel with Neon

Use the switching scripts to toggle between environments:
- Local: Run `npm run dev:local` then start with `DATABASE_URL="file:./dev.db" npm run dev`
- Production: Run `npm run dev:production`

### AI Model Configuration
AI models are centrally configured in `src/config/models.ts` with environment variable overrides:
- All features currently use 'o4-mini' model
- Feature-specific model assignments for mail generation, customs codes, etc.
- Environment variables can override default models

### API Structure
- `/api/mail-generator/` - Email generation endpoints (chat, reply, polite conversion)
- `/api/shipping/recommend/` - Mercari shipping recommendation API
- `/api/generate-customs-code/` - Customs code generation
- `/api/search/` - Waste collection search

### Testing Strategy
Tests are organized by environment:
- Node tests: API routes and business logic in `src/lib/` and `src/app/api/`
- JSDOM tests: React components in `src/components/` and page components

Run specific test environments or use the main test command for both.