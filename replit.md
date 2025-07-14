# Sistema de Votación - Electronic Voting System

## Overview

Sistema de Votación (formerly SecureVotacion) is a comprehensive electronic voting system designed specifically for educational communities. It provides secure, transparent, and user-friendly voting capabilities with role-based access control for students, teachers, administrators, and authorities.

**Current Branding**: 
- Title: Sistema de Votación
- Subtitle: Unidad Educativa Simulada

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful APIs with JSON responses
- **Session Management**: Express sessions with memory store
- **File Structure**: Monorepo structure with shared schema between client and server

### Authentication System
- **Provider**: Replit OpenID Connect (OIDC) integration
- **Strategy**: Passport.js with OpenID Connect strategy
- **Session Storage**: Memory-based session store with TTL
- **Security**: HTTP-only cookies, CSRF protection, secure session handling

## Key Components

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless connection
- **Schema Management**: Shared TypeScript schemas with Zod validation
- **Migration Strategy**: Drizzle Kit for schema migrations

### Core Features
1. **User Management**: Role-based access (student, teacher, administrator, authority)
2. **Election Management**: Create, configure, and manage elections
3. **Voting System**: Secure voting with transaction tracking and audit trails
4. **Results & Analytics**: Real-time results with charts and statistics
5. **Audit Logging**: Comprehensive activity tracking for security
6. **Dashboard**: Role-specific dashboards with relevant metrics
7. **Support System**: Help desk and FAQ functionality

### UI/UX Design
- **Design System**: Custom design tokens with CSS variables
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Theme**: Light theme with consistent color palette
- **Component Library**: Reusable components following atomic design principles

## Data Flow

### Authentication Flow
1. User accesses application
2. Redirected to Replit OIDC provider
3. Successful authentication creates/updates user session
4. User object stored in session with role-based permissions
5. Protected routes validate authentication status

### Voting Flow
1. User selects active election
2. System verifies user eligibility and voting status
3. Candidate selection with confirmation step
4. Vote submission with hash generation for anonymity
5. Transaction ID generation for audit trail
6. Real-time results update

### Data Management
- **Client State**: TanStack Query for caching and synchronization
- **Server State**: Express sessions for user authentication
- **Database Operations**: Drizzle ORM with connection pooling
- **Error Handling**: Centralized error handling with user-friendly messages

## External Dependencies

### Core Libraries
- **React Ecosystem**: React, React DOM, React Hook Form, TanStack Query
- **UI Components**: Radix UI primitives, Lucide React icons
- **Styling**: Tailwind CSS, class-variance-authority, clsx
- **Database**: Drizzle ORM, Neon serverless PostgreSQL
- **Authentication**: Passport.js, OpenID Client
- **Validation**: Zod for schema validation
- **Date Handling**: date-fns with internationalization
- **Charts**: Recharts for data visualization

### Development Tools
- **Build Tools**: Vite, esbuild for production builds
- **TypeScript**: Full TypeScript support with strict configuration
- **Linting**: Path mapping for clean imports
- **Development**: Hot module replacement, error overlays

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR
- **Database**: Neon serverless PostgreSQL
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPL_ID
- **Asset Handling**: Static file serving through Express

### Production Build
- **Frontend**: Vite production build with optimizations
- **Backend**: esbuild bundling for Node.js deployment
- **Static Assets**: Served from Express with proper caching headers
- **Session Storage**: Memory store (should be upgraded to persistent storage for production)

### Security Considerations
- **Environment Variables**: Sensitive data in environment variables
- **Session Security**: HTTP-only cookies, secure flags in production
- **CORS**: Configured for same-origin requests
- **Input Validation**: Zod schemas for all API inputs
- **SQL Injection Prevention**: Parameterized queries through Drizzle ORM

### Performance Optimizations
- **Code Splitting**: Vite handles automatic code splitting
- **Caching**: TanStack Query provides intelligent caching
- **Bundle Size**: Tree shaking and minification in production
- **Database**: Connection pooling and query optimization

## Recent Improvements (July 2025)

### Latest Updates (January 14, 2025)
- Fixed critical 'X' icon import issue in Sidebar component that was preventing system functionality
- System is now fully operational with all APIs responding correctly (200 status)
- Implemented comprehensive ISO 9241-11 and ISO 25010:2011 compliance improvements
- **MAJOR:** Completely implemented dark mode with proper contrast ratios meeting ISO standards
- Applied semantic color variables throughout Sidebar, Header, and Dashboard components
- Fixed all HTML validation errors (nested links, duplicate keys) for better accessibility
- Dark mode titles and icons now have white/high contrast colors as required by accessibility standards
- **MAJOR:** Fixed Settings page internationalization - now properly switches languages in real-time
- Implemented complete translation system for Settings page with all UI elements
- Enhanced useTranslation hook for proper real-time language switching without page reload
- **MAJOR:** Completed comprehensive internationalization across entire system (Spanish, English, Portuguese)
- Implemented full translation system in Dashboard, Header, Sidebar, Elections, and all core components
- Added Portuguese language support to complement Spanish and English
- Real-time language switching works system-wide without page reload
- Fixed duplicate translation keys and completed i18n architecture
- All navigation, forms, buttons, and UI elements now use translation system
- **MAJOR:** Fixed dark mode persistence issues - theme now properly persists across window changes and page refreshes
- Enhanced ThemeProvider with better localStorage handling and system theme detection
- Added script in HTML head to prevent theme flashing on page load and improved CSS transitions
- Implemented automatic system preference detection when no saved theme exists
- Fixed localStorage error handling and added fallback mechanisms

### Accessibility & Usability Enhancements (ISO 9241-11 & ISO 25010:2011)

#### 1. Enhanced CSS Architecture
- **Smooth Transitions**: Added consistent 200ms transitions across all interactive elements
- **Focus Management**: Implemented comprehensive focus-ring styles for keyboard navigation
- **Button Standards**: All interactive elements meet WCAG AA minimum 44px touch target requirements
- **Loading States**: Enhanced loading indicators with proper ARIA labels using Loader2 component
- **Form Validation**: Real-time validation states with clear visual feedback

#### 2. Header Component Improvements
- **Mobile Menu**: Added ARIA labels and expanded states for screen readers
- **Breadcrumbs**: Enhanced navigation with proper role="list" and aria-current attributes
- **Notifications**: Improved accessibility with descriptive ARIA labels and live regions
- **User Menu**: Added comprehensive keyboard navigation support
- **Admin Badge**: Enhanced visibility and context for administrative users

#### 3. Sidebar Navigation Enhancements
- **Desktop Version**: Added role="complementary" and proper navigation landmarks
- **Mobile Version**: Implemented close button and improved focus management
- **Menu Items**: Enhanced with descriptions, keyboard shortcuts, and active indicators
- **Role-based Access**: Clear visual distinction for different user permissions
- **Icon Accessibility**: All icons marked with aria-hidden="true" and descriptive labels

#### 4. Elections Page Improvements
- **Loading States**: Enhanced with proper status roles and descriptive text
- **Form Dialogs**: Improved modal accessibility with proper ARIA attributes
- **Election Cards**: Added semantic structure with article roles and unique IDs
- **Button Actions**: Enhanced with descriptive labels and loading indicators
- **Date/Time**: Proper semantic time elements for better screen reader support

#### 5. Dashboard Enhancements
- **Welcome Section**: Converted to semantic banner with proper heading hierarchy
- **Statistics Cards**: Enhanced with descriptive ARIA labels for metrics
- **Loading States**: Improved accessibility for dashboard data loading
- **Quick Actions**: Better keyboard navigation and focus management

#### 6. Global UI/UX Improvements
- **Color Contrast**: Ensured WCAG AA compliance throughout the interface
- **Responsive Design**: Mobile-first approach with improved touch targets
- **Error Handling**: Enhanced error messages with clear recovery instructions
- **Status Indicators**: Consistent visual and semantic status communication
- **Progress Feedback**: Loading spinners and progress indicators with proper labels

#### 7. Technical Accessibility Features
- **Semantic HTML**: Proper use of landmarks, headings, and structural elements
- **ARIA Attributes**: Comprehensive implementation of ARIA labels, roles, and states
- **Keyboard Navigation**: Full keyboard accessibility across all components
- **Screen Reader Support**: Optimized content structure and announcements
- **Focus Management**: Logical tab order and visible focus indicators

#### 8. Support Page Enhancements
- **Contact Form**: Added name and email fields with auto-population from user data
- **Character Counter**: Implemented 1000 character limit with visual counter for description field
- **Clear Form Button**: Added "Limpiar formulario" functionality for better user control
- **Success Feedback**: Visual confirmation message after successful ticket submission
- **Loading States**: Replaced Clock icon with proper Loader2 spinner for consistency
- **Instructions Panel**: Added clear user guidance with estimated response times

#### 9. Results Page Improvements  
- **Loading Indicators**: Enhanced with Loader2 spinner and descriptive loading messages
- **Export Options**: Added CSV export and share functionality with proper ARIA labels
- **Responsive Cards**: Improved election cards with semantic HTML and proper focus states
- **Table Accessibility**: Converted results table to use proper semantic table elements
- **Progress Bars**: Added ARIA progressbar roles with proper value attributes
- **Statistics Summary**: Added total votes, candidates, and participation rate display
- **Winner Badges**: Enhanced with Trophy icon and proper ARIA labels

#### 10. Profile Page Updates
- **Quick Actions**: Added security, activity, notifications, and preferences quick access cards
- **Profile Photo**: Added camera button overlay for changing profile picture
- **Edit Mode**: Enhanced form with required field indicators and validation
- **Unsaved Changes**: Visual indicator when form has pending changes
- **Loading States**: Proper Loader2 spinner during save operations
- **Confirmation Dialog**: Improved with AlertCircle icon and detailed change preview
- **Security Card**: Added account status, authentication method, and permissions display

### Security & Performance Maintained
- **Database Connectivity**: Resolved PostgreSQL connection issues with memory storage fallback
- **Session Management**: Stable authentication with Replit OpenID integration
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Code Quality**: TypeScript strict mode with enhanced type safety
- **Form Security**: All forms include proper validation and CSRF protection