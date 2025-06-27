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

- **June 27, 2025**: AI聊天数据真实性验证与历史记录准确链接
  - **AI对话数据真实性保障**: 修复AI聊天系统确保绝不编造医疗数据或历史记录
    - 实现基于用户实际报告数量的动态系统提示词生成
    - 当用户无历史记录时，AI明确告知没有上传过任何医疗报告
    - 当用户有历史记录时，AI准确显示报告数量并提供基于实际数据的个性化建议
    - 添加详细的文件类型支持说明，引导用户正确上传医疗文档
    - 消除AI编造虚假医疗信息的可能性，确保所有回应基于真实数据
  - **浏览器会话管理优化**: 完全修复前端用户认证和会话维护问题
    - 实现自动会话状态验证，确保用户登录状态正确维护
    - 添加认证状态检查端点/api/auth/status，提供实时登录验证
    - 修复浏览器与服务器会话同步问题，消除401认证错误
    - 优化前端认证流程，登录后立即建立有效会话连接

- **June 27, 2025**: AI上下文对话与用户数据链接实现
  - **AI智能对话上下文链接**: 实现AI聊天与用户历史医疗数据的完整上下文整合
    - 增强AI聊天API以访问用户的历史医疗报告作为对话上下文
    - AI助手现在可以基于用户既往检查结果提供个性化医疗建议
    - 支持历史报告趋势分析、指标对比和连续性健康管理指导
    - 添加医疗数据上下文指示器显示已连接的历史记录数量
    - 更新AI聊天欢迎消息说明可用的上下文对话功能
    - 提供基于历史数据的智能对话示例引导用户使用
  - **Individual User Account System**: Implemented complete user isolation with private report access
    - Added PostgreSQL user_id foreign key to medical_reports table for proper data association
    - Implemented Express session management with user authentication middleware
    - Updated all API endpoints to enforce user-specific data access (reports, analysis, deletion)
    - Modified dashboard to show "我的分析记录" instead of system-wide reports
    - Each user account now only sees their own medical analysis results, ensuring complete privacy
    - Registration and login system properly associates reports with authenticated users
  - **Clinical Reasoning Optimization**: Enhanced readability of long medical reasoning text
    - Converted dense paragraph format to structured bullet-point display
    - Split reasoning by Chinese sentence delimiters for better visual organization
    - Added green bullet points for each reasoning step while preserving all content
    - Maintained complete medical vocabulary highlighting and color coding
    - Improved user experience for following AI diagnostic logic flow
  - **File Upload Fix**: Resolved persistent file upload validation issue preventing analysis with uploaded files
    - Removed conflicting validation constraints that blocked submission when files were selected
    - Simplified frontend validation to allow flexible OR logic (text content OR file uploads)
    - Maintained server-side validation for data integrity while fixing client-side blocking issues
    - File upload now works correctly with all supported formats (PDF, DOCX, PNG/JPEG, MP4, DICOM)
  - **Progress Display Branding**: Updated analysis progress text for consistent branding
    - Changed "正在使用 Gemini 2.5-Flash Lite 模型进行快速分析" to "Med Agentic-AI系统启动运行"
    - Maintains brand consistency throughout the analysis workflow
  - **Validation Logic Optimization**: Improved form validation to handle edge cases
    - Fixed React state timing issues that caused validation to fail with selected files
    - Implemented proper file state management to ensure accurate validation
    - Users can now successfully submit analysis with either text content (10+ characters) or uploaded files

- **June 27, 2025**: Medical Report Display Consistency & Section Numbering Improvements
  - **Typography Optimization**: Enhanced font consistency across all medical report sections
    - Updated video analysis section with improved readability using `text-base` and `leading-relaxed`
    - Applied consistent medical vocabulary highlighting with color-coded terminology
    - Unified font sizes and line spacing throughout health assessment reports
  - **Visual Theme Consistency**: Aligned imaging findings section with overall design system
    - Updated background gradients to match blue medical theme (`from-blue-50 to-cyan-50`)
    - Consistent border styling and rounded corners across all report sections
    - Enhanced shadow effects and spacing for better visual hierarchy
  - **Bilingual Format Enhancement**: Added English translations to section titles
    - Updated "影像视频读取结果分析" to include "(Video & Imaging Analysis Results)"
    - Maintained consistent Chinese-English formatting across all medical sections
  - **Dynamic Section Numbering**: Implemented intelligent numbering system for conditional content
    - Fixed section numbering gaps when conditional sections (video analysis, clinical reasoning) are hidden
    - Added dynamic counter system that automatically adjusts sequence based on displayed content
    - Ensures continuous numbering regardless of which sections are present in the report
  - **Empty Data State Handling**: Enhanced user experience for missing laboratory data
    - Added "暂无实验室检查数据 (No Lab Test Data)" indicator with descriptive messaging
    - Implemented consistent empty state design with document icon and guidance text
    - Maintains section visibility while clearly indicating absence of specific data types
  - **Medical Terminology Consistency**: Standardized severity descriptions across all report sections
    - Extended medical vocabulary highlighting to include comprehensive severity levels
    - Unified terms like "偏高" and "远高于正常水平" with consistent orange highlighting
    - Added support for degree descriptors: 明显/显著/轻度/中度/重度 + 升高/降低
    - Ensures consistent medical language presentation across lab results, risk factors, and clinical reasoning
  - **Laboratory Results Display Simplification**: Removed status indicator bubbles from lab abnormalities section
    - Eliminated color-coded status badges (↑ 偏高, ↓ 偏低, ✓ 正常) for cleaner presentation
    - Maintains focus on numerical values and medical interpretations without visual clutter
    - Preserves all medical terminology highlighting while removing status indicator styling
  - **Report Input Form Enhancement**: Comprehensive UI optimization and validation improvements
    - **Font Optimization**: Updated to text-base (16px) with leading-relaxed for improved readability across all form elements
    - **Theme Consistency**: Applied unified glassmorphism design with gradient backgrounds and backdrop blur effects
    - **Required Gender Selection**: Implemented dropdown selection with "男性" and "女性" options, made mandatory field
    - **Enhanced Visual Design**: Added gradient section headers with icons and bilingual labels for better organization
    - **Improved Form Controls**: Increased input heights (h-12), enhanced shadows and border styling for better accessibility
    - **Consistent Styling**: Applied bg-white/80 backdrop-blur-sm styling across all input fields for unified appearance
    - **Enhanced File Upload Guide**: Added comprehensive medical file type categories with visual explanations
      - Color-coded sections for 病历文档, 化验检查, 医学影像, and 动态检查
      - Detailed descriptions for medical record images, lab report images, imaging photos, and imaging videos
      - Professional grid layout with glassmorphism design and file format specifications

- **June 26, 2025**: Complete UI Design System Transformation
  - **Unified Glassmorphism Design**: Transformed entire platform with cohesive sci-fi medical aesthetic
    - Applied semi-transparent cards with backdrop blur effects across all components
    - Implemented gradient icon containers with consistent rounded styling (rounded-2xl)
    - Enhanced color coding system using blue, teal, purple, green gradients for visual distinction
    - Updated all interface elements with improved shadows, hover animations, and transition effects
  - **Component-Level Updates**: Redesigned core analysis components for consistency
    - ReportInput: Modern form styling with gradient backgrounds and enhanced input fields
    - AnalysisProgress: Updated progress indicators with glassmorphism cards and color-coded status
    - ReportDisplay: Transformed report sections with gradient summary cards and improved typography
    - Dashboard: Unified header, navigation, and content areas with consistent visual language
  - **Enhanced Visual Hierarchy**: Improved readability and user experience
    - Larger font sizes (text-lg) for AI responses and improved line spacing
    - Color-coded medical terms with intelligent background highlights
    - Gradient button designs with enhanced hover states and shadow depths
    - Better spacing and visual separation between content sections
  - **Settings Page Enhancement**: Comprehensive settings interface with modern styling
    - Account information display with colorful tag-based value presentation
    - System preferences showing AI model, language, and data storage with status indicators
    - Data management section with color-coded information cards
    - Modern action buttons with gradient backgrounds and unified styling
  - **Previous Features Maintained**: All existing functionality preserved
    - AI Chat integration with 1,000,000 token output limit
    - File upload support up to 100MB with enhanced validation
    - Historical reports with delete functionality and toast notifications
    - Brand consistency as "Med Agentic-AI 体检报告·分析平台"

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
  - **Enhanced image recognition**: Med Agentic-AI Vision API extracts text from lab reports, identifies medical indicators, and converts images to structured medical data
  - **Video analysis**: Medical video content recognition for ultrasound, endoscopy, and diagnostic procedures with FFmpeg support
  - **Enhanced diagnostic output**: Added source attribution (影像来源/视频来源/报告来源), clinical reasoning process, and final diagnostic conclusions
  - **Comprehensive reporting**: Structured diagnostic workflow with detailed推理过程 and specific medical recommendations
  - Updated UI with enhanced diagnostic display including video findings and clinical reasoning sections
  - Fixed FormData validation and database ID conversion issues
  - Integrated Med Agentic-AI model for comprehensive medical analysis

## Changelog

- June 26, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.