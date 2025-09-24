# JR Transport Management System - Copilot Instructions

## Project Overview
JR Transport Management is an Angular 15 PWA for multi-role transport management with offline support. The system manages vehicle owners, drivers, customers, admins, and super-admins through role-based lazy-loaded feature modules.

## Architecture Patterns

### Role-Based Feature Architecture
- Each user role has dedicated feature module: `features/admin/`, `features/driver/`, `features/customer/`, `features/owner/`, `features/super-admin/`
- Lazy-loaded modules via `app-routing.module.ts` with `loadChildren` pattern
- Role-specific dashboards: e.g., `AdminDashboardComponent`, `DriverDashboardComponent`

### Service Layer Structure
- Core services in `core/` (auth, guards, interceptors) - singleton providers
- Feature services in root `services/` - domain-specific services like `vehicle.service.ts`, `booking.service.ts`
- Service-per-role pattern: `admin.service.ts`, `customer.service.ts`, `driver.service.ts`

### Model Organization
- TypeScript interfaces in `models/` - strongly typed DTOs
- Role-specific models: `auth.model.ts`, `driver.model.ts`, `customer.model.ts`
- Request/Response DTOs: `LoginRequest`, `SignupRequest`, `JwtResponse`

## PWA Implementation

### Service Worker Configuration
- PWA features enabled via `angular.json` serviceWorker: true
- Custom caching strategies in `ngsw-config.json`:
  - Performance strategy for user data APIs (1h cache)
  - Freshness strategy for real-time data (5m cache)
- Font caching for Google Fonts integration

### Build Commands
- Development: `ng serve` (no PWA features)
- PWA testing: `ng build --configuration production` + `npx http-server dist/jr-transport-management -p 8080 -c-1`
- Production deployment: Build outputs to `dist/jr-transport-management/`

## Authentication & Routing

### Multi-Role Auth Pattern
- Role-based API endpoints: `/api/auth/login/${role}`, `/api/auth/register/${role}`
- JWT token handling in `AuthService` and `TokenInterceptor`
- Route guards protect role-specific areas

### Environment Configuration
- Production API: `https://jrtransportmanagementbackend.onrender.com/api`
- Auto-detect environment in `environment.prod.ts` with `getApiUrl()`
- Database config included for PostgreSQL on Render

## Development Conventions

### Component Structure
- SCSS styling with `style: "scss"` schematic default
- Bootstrap 5 + Angular Material UI framework
- Feature components follow `{feature}-{component}.component.ts` naming

### Dependencies & Build
- ag-Grid Enterprise for data tables
- jsPDF + jsPDF-AutoTable for PDF generation
- Bootstrap Icons + FontAwesome for iconography
- CommonJS dependencies allowed for PDF libraries in `angular.json`

## Testing Setup
- Jasmine/Karma stack with basic component specs
- Test files follow `*.component.spec.ts` pattern
- Run with `ng test`

## Key Integration Points
- Backend: Node.js REST API on Render cloud
- Database: PostgreSQL with SSL required
- External libs: ag-Grid for complex tables, PDF libraries for reports
- PWA: Service worker caching for offline functionality

## Development Workflow
1. Use `ng serve` for development with hot reload
2. For PWA testing: build production + serve locally with http-server
3. Role-based development: create features under appropriate role directories
4. Models-first: Define TypeScript interfaces before implementing services/components