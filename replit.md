# Overview

DisciCole is a comprehensive student management system built for educational institutions. The application provides tools for tracking student attendance, behavior monitoring, parent communication through notifications and surveys, and complete student record management. The system is designed as a full-stack web application with a React-based frontend and Express.js backend, utilizing PostgreSQL for data persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built using React with TypeScript and follows a modern component-based architecture. It uses Vite as the build tool and development server, providing fast hot module replacement and optimized builds. The UI is built with shadcn/ui components based on Radix UI primitives, styled with Tailwind CSS for consistent design patterns.

Key architectural decisions:
- **Component Library**: Uses shadcn/ui for consistent, accessible UI components
- **Styling**: Tailwind CSS with custom CSS variables for theming support
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Authentication**: JWT-based authentication with local storage persistence

## Backend Architecture
The server follows a RESTful API design using Express.js with TypeScript. It implements a layered architecture separating routing, business logic, and data access concerns.

Key architectural decisions:
- **Framework**: Express.js for HTTP server with middleware-based request processing
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **Authentication**: JWT tokens with bcrypt for password hashing
- **API Design**: RESTful endpoints with consistent error handling and response formats
- **Development**: Hot reloading with tsx for rapid development cycles

## Database Schema
The application uses PostgreSQL with a well-structured relational schema designed for educational institution needs:

- **Users**: Admin/teacher accounts with email-based authentication
- **Students**: Complete student records with grade, section, and parent contact information
- **Attendance**: Daily attendance tracking with status and timestamp records
- **Behavior Reports**: Positive and negative behavior incidents with detailed descriptions
- **Notifications**: Mass communication system for parent/student notifications
- **Surveys**: Feedback collection system targeting students, parents, or both

The schema uses UUIDs for primary keys and includes proper foreign key relationships with cascading rules.

## Project Structure
The codebase follows a monorepo structure with clear separation of concerns:
- `/client` - React frontend application
- `/server` - Express.js backend API
- `/shared` - Common TypeScript types and Drizzle schema
- Component organization follows atomic design principles with reusable UI components

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Drizzle ORM**: Type-safe database operations and schema migrations

## UI Framework
- **Radix UI**: Headless, accessible UI components for complex interactions
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Consistent icon library

## Development Tools
- **Vite**: Fast build tool with TypeScript support and hot module replacement
- **TypeScript**: Static typing for enhanced developer experience and code safety
- **ESBuild**: Fast JavaScript bundler for production builds

## Authentication & Security
- **JWT**: Stateless authentication tokens
- **bcrypt**: Secure password hashing

## Data Fetching
- **TanStack Query**: Intelligent data synchronization and caching
- **Native Fetch API**: HTTP client for API communication

## Runtime Environment
- **Node.js**: JavaScript runtime with ES modules support
- **Replit**: Cloud development environment with integrated database provisioning