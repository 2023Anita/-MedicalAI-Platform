# Med Agentic-AI 体检报告·分析平台 - Medical Report Analysis System

## Overview

This is a comprehensive medical report analysis application that uses AI to interpret medical examination data. The system is built with a full-stack architecture using React/TypeScript on the frontend and Express.js on the backend, with integrated AI analysis capabilities through Google's Gemini API.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom medical-themed color palette
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with ESM module support
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Google Gemini API for medical report analysis
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot reloading with Vite middleware integration

### Database Schema
The application uses PostgreSQL with two main tables:
- **users**: User authentication and management
- **medical_reports**: Storage of patient reports and AI analysis results

## Key Components

### AI Analysis Service
- **Multi-Agent Architecture**: Simulates a sophisticated medical analysis system with specialized agents:
  - Orchestrator: Coordinates analysis workflow
  - Imaging Analysis Agent: Processes medical imaging descriptions
  - Lab Analysis Agent: Interprets laboratory test results
  - Medical History Agent: Extracts patient history and risk factors
- **Gemini Integration**: Uses Google's Gemini 2.5 Pro model for comprehensive medical analysis
- **Structured Output**: Returns standardized health assessment reports in JSON format

### Frontend Components
- **ReportInput**: Form interface for submitting medical reports
- **AnalysisProgress**: Real-time progress tracking during AI analysis
- **ReportDisplay**: Comprehensive display of analysis results
- **HistoricalComparison**: Comparison with previous patient reports

### Data Flow Processing
1. User submits medical report data through the form interface
2. Backend validates input using Zod schemas
3. AI service processes data through simulated multi-agent workflow
4. Results are stored in database with patient information
5. Frontend displays comprehensive analysis report
6. Historical comparison available for returning patients

## Data Flow

1. **Input Processing**: Medical report data is validated and structured
2. **AI Analysis**: Multi-stage analysis simulating medical expertise
3. **Result Storage**: Analysis results stored with patient metadata
4. **Report Generation**: Structured health assessment reports
5. **Historical Analysis**: Longitudinal health tracking for patients

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **AI Service**: Google Gemini API for medical analysis
- **UI Components**: Radix UI primitives for accessible components
- **Form Validation**: Zod for runtime type checking
- **Date Handling**: date-fns for date manipulation

### Development Dependencies
- **Build Tools**: Vite, esbuild for production builds
- **Type Checking**: TypeScript with strict configuration
- **Styling**: Tailwind CSS with PostCSS processing

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Automated migrations with Drizzle Kit

### Environment Configuration
- **Development**: Hot reloading with Vite middleware
- **Production**: Static file serving with Express
- **Database**: Environment-based connection strings
- **API Keys**: Secure environment variable management for Gemini API

### Replit Integration
- **Autoscale Deployment**: Configured for Replit's autoscale platform
- **Port Configuration**: Backend serves on port 5000, mapped to external port 80
- **Module Dependencies**: Node.js 20, web server, and PostgreSQL 16

## Recent Changes

- **June 26, 2025**: Settings Page and UI Improvements
  - **Functional Settings Page**: Added comprehensive settings interface replacing static link
    - Account information display with user email and registration details
    - System preferences showing AI model, language, and data storage status
    - Data management section with report count and supported file formats
    - System status monitoring with real-time connection indicators
    - Action buttons for cache clearing, data export, and navigation
  - **Brand Neutrality**: Removed all Gemini and Google branding from settings interface
    - AI model displayed as "先进医疗分析模型" (Advanced Medical Analysis Model)
    - AI service shown as "智能医疗分析引擎" (Intelligent Medical Analysis Engine)
  - **Enhanced Historical Reports**: Fixed API response to include complete analysis results
    - Historical report viewing now displays full diagnostic content
    - Added functional delete buttons with confirmation dialogs
    - Toast notifications for successful operations
  - **Navigation Improvements**: Settings button now functional with gear icon
    - Consistent styling with other navigation elements
    - Proper tab switching between analysis, history, and settings
  - **File Upload Enhancement**: Increased video file upload limit from 50MB to 100MB
    - Updated both frontend validation and backend multer configuration
    - Added client-side file size validation with clear error messages
    - Settings page now displays correct 100MB maximum file size

- **June 26, 2025**: User Interface and Report Generation Improvements
  - **System Rebranding**: Updated system name from "医检智解 (MediScan-Insight)" to "Med Agentic-AI 体检报告·分析平台"
  - **Custom Logo Integration**: Replaced default stethoscope icon with custom Med Agentic-AI logo in header
  - **User Registration System**: Added user registration page with immediate login capability
    - Email and password registration form with validation
    - No activation codes required - users can register and use immediately
    - Registration route at `/register` accessible via user icon in header
    - Backend API endpoint `/api/auth/register` handles user registration
  - **Enhanced Status Indicator**: Updated connection status to show "Med Agentic-AI 已连接" with green pulsing indicator
  - **Enhanced Font Readability**: Increased font sizes throughout the report display (text-base instead of text-sm) for better readability
  - **Color-Coded Lab Results**: Implemented enhanced color coding for abnormal lab values with clear annotations
    - High values: Red background with "↑ 偏高 (Above Normal Range)" indicator
    - Low values: Blue background with "↓ 偏低 (Below Normal Range)" indicator  
    - Normal values: Green background with "✓ 正常 (Within Normal Range)" indicator
  - **Chinese Report Generation**: Updated medical analysis prompt to ensure all reports are generated in Chinese with professional bilingual terminology (中文术语 (English Term) format)
  - **Conditional Video Display**: Optimized video examination results to only display when video files are actually uploaded
  - **File Type Tracking**: Added metadata tracking for uploaded file types to enable conditional content display

- **December 26, 2024**: Enhanced system with comprehensive medical diagnostic capabilities
  - Added PostgreSQL database integration for persistent storage
  - Implemented exam date field for medical timeline tracking
  - Added support for PDF, DOCX, PNG/JPEG, MP4, and DICOM file uploads
  - **Enhanced image recognition**: Gemini Vision API extracts text from lab reports, identifies medical indicators, and converts images to structured medical data
  - **Video analysis**: Medical video content recognition for ultrasound, endoscopy, and diagnostic procedures with FFmpeg support
  - **Enhanced diagnostic output**: Added source attribution (影像来源/视频来源/报告来源), clinical reasoning process, and final diagnostic conclusions
  - **Comprehensive reporting**: Structured diagnostic workflow with detailed推理过程 and specific medical recommendations
  - Updated UI with enhanced diagnostic display including video findings and clinical reasoning sections
  - Fixed FormData validation and database ID conversion issues
  - Integrated Gemini 2.5-Flash model for comprehensive medical analysis

## Changelog

- June 26, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.