# ExpenseAI - Receipt Management System

## Overview

ExpenseAI is a full-stack receipt management application that uses AI to analyze and categorize receipt images. Users can upload photos of receipts, which are automatically processed using OpenAI's vision models to extract key information like vendor, amount, date, and category. The application provides a dashboard for viewing receipt statistics and managing expenses with CSV export capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.
Subscription pricing: Multiple tiers with discounts for longer commitments (40% reduction from original pricing):
- Free: $0/month (10 receipts)
- Pro Monthly: $4.79/month
- Pro 3-Month: $13.66 (5% discount)
- Pro 6-Month: $25.88 (10% discount) 
- Pro Annual: $48.89 (15% discount)
- Pro 3-Year: $129.44 (25% discount)
- Pro 5-Year: $186.97 (35% discount)
- Pro Lifetime: $575.71 (50% discount, 20-year equivalent)

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side navigation
- **UI Components**: Radix UI with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple

### Key Components

#### Database Schema
- **Users Table**: Stores user profiles and Stripe subscription info
- **Receipts Table**: Main receipt data with AI analysis results
- **Categories Table**: Predefined expense categories
- **Sessions Table**: Authentication session storage

#### AI Integration
- **OpenAI GPT-4o**: Used for receipt image analysis and text extraction
- **Receipt Processing**: Extracts vendor, amount, date, category, and line items
- **Confidence Scoring**: AI provides confidence ratings for extracted data

#### Payment Integration
- **Stripe**: Subscription management and payment processing
- **React Stripe.js**: Frontend payment components
- **Webhook Support**: Server-side payment event handling

#### File Handling
- **Multer**: Multipart form data and file upload handling
- **Image Processing**: Base64 encoding for AI analysis
- **File Storage**: Prepared for external storage integration

## Data Flow

1. **User Authentication**: Replit Auth handles OAuth login/logout
2. **Receipt Upload**: Users drag/drop or select image files
3. **AI Analysis**: Images sent to OpenAI for processing
4. **Data Storage**: Extracted data saved to PostgreSQL
5. **Dashboard Display**: React components show stats and receipt lists
6. **Export Function**: CSV generation for accounting software

## External Dependencies

### Required Services
- **OpenAI API**: GPT-4o model access for receipt analysis
- **Stripe**: Payment processing and subscription management
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit Auth**: Authentication and user management

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API access key
- `STRIPE_SECRET_KEY`: Stripe backend API key
- `VITE_STRIPE_PUBLIC_KEY`: Stripe frontend public key
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit environment identifier

## Deployment Strategy

### Development
- **Vite Dev Server**: Hot module replacement for frontend
- **tsx**: TypeScript execution for backend development
- **Concurrent Processes**: Frontend and backend run simultaneously

### Production Build
- **Frontend**: Vite builds optimized React bundle
- **Backend**: esbuild creates Node.js bundle with external dependencies
- **Database**: Drizzle migrations handle schema updates
- **Static Assets**: Served from dist/public directory

### Key Architectural Decisions

#### Monorepo Structure
- **Problem**: Coordinating frontend, backend, and shared code
- **Solution**: Single repository with client/, server/, and shared/ directories
- **Benefits**: Simplified deployment, shared TypeScript types, consistent tooling

#### AI-First Receipt Processing
- **Problem**: Manual data entry is time-consuming and error-prone
- **Solution**: OpenAI vision models for automatic extraction
- **Benefits**: High accuracy, consistent categorization, time savings

#### Serverless Database
- **Problem**: Database scaling and maintenance overhead
- **Solution**: Neon serverless PostgreSQL with connection pooling
- **Benefits**: Automatic scaling, reduced operational complexity

#### Component-Based UI
- **Problem**: Consistent design system and reusable components
- **Solution**: Radix UI primitives with Tailwind styling
- **Benefits**: Accessibility built-in, consistent styling, rapid development

## Recent Changes

### July 15, 2025 - Enhanced Database Architecture
- **Enhanced Database Schema**: Added comprehensive validation, indexing, and constraints
- **Receipt Items Table**: New table for detailed line-item tracking per receipt
- **User Activity Log**: Added audit trail for all user actions and system events
- **Subscription Plans**: New table for managing subscription tiers and features
- **Enhanced Categories**: Added display names, descriptions, and active status flags
- **Performance Optimizations**: Added strategic database indexes for faster queries
- **Data Validation**: Implemented check constraints for data integrity
- **Error Handling**: Enhanced storage layer with comprehensive try-catch blocks
- **Activity Logging**: Automatic logging of user actions for analytics and debugging
- **Advanced Analytics**: Added support for expense analytics, top vendors, and trend analysis
- **Bulk Operations**: Added support for bulk receipt deletion and management
- **Search and Filtering**: Enhanced receipt queries with full-text search and filters

#### Database Schema Enhancements:
- **Receipts Table**: Added 11 new fields including confidence scores, verification status, tags, payment details
- **Categories Table**: Enhanced with display names, descriptions, sort order, and active status
- **Receipt Items Table**: New table for tracking individual items within receipts
- **User Activity Log**: Complete audit trail for user actions and system events
- **Subscription Plans**: Structured plan management with features and pricing
- **Performance Indexes**: Strategic indexing on high-query fields for optimal performance
- **Data Integrity**: Check constraints ensuring valid amounts, confidence scores, and quantities

### July 15, 2025 - Comprehensive Subscription Pricing System
- **Multi-Tier Pricing**: Implemented 8 subscription plans with progressive discounts
- **40% Price Reduction**: All subscription prices reduced by 40% (Pro Monthly now $4.79)
- **Discount Structure**: 5% to 50% savings for longer commitments (3 months to lifetime)
- **Enhanced UI**: Created comprehensive pricing page with plan comparisons and FAQ
- **Database Integration**: Updated subscription plans table with detailed features and savings calculations
- **User Experience**: Added pricing navigation, plan badges, and discount highlighting
- **Business Model**: Optimized for customer retention through commitment-based discounts

### July 15, 2025 - Admin System and Enhanced Features
- **Admin Dashboard**: Complete admin panel with system statistics and user management
- **Admin Authentication**: Role-based access control with admin permissions
- **System Analytics**: Real-time stats for users, receipts, revenue, and subscriptions
- **User Management**: Admin can view all users, roles, and subscription status
- **Enhanced UI Components**: Added upload zones, receipt cards, stats cards, and skeleton loaders
- **Footer Integration**: Added Jason Clark footer with copyright 2025 across all pages
- **Admin Access**: Created admin account (admin_001) with full system privileges
- **Security**: Implemented admin middleware for protected routes and operations