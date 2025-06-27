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

- **June 27, 2025**: 全平台品牌标识统一更新完成 & 报告导出功能实现
  - **版权信息全面部署**: 在所有主要界面添加"Med Agentic-AI © 江阴市人民医院-殷利鑫"版权标识
    - 登录页面底部版权信息更新
    - Dashboard主页面底部添加版权信息
    - 医疗报告显示页面元数据区域品牌更新
    - AI聊天界面底部版权标识
    - 报告对比分析页面版权信息
  - **品牌标识统一**: 确保平台品牌信息与江阴市人民医院的合作关系得到正确展示
  - **专业认证标识**: 突出医疗机构背景，增强用户对平台专业性和可信度的认知
  - **用户界面一致性**: 所有主要功能模块均显示统一的医疗机构授权标识
  - **报告导出功能完善**: 修复下载按钮无响应问题，新增完整的导出功能
    - 实现医疗报告JSON格式下载，包含完整患者信息和分析结果
    - 添加打印功能，支持直接打印医疗报告页面
    - 增强错误处理和用户反馈提示系统
    - 优化按钮布局，提供下载、打印、删除等完整操作选项
    - 文件命名规范化，包含患者姓名和分析日期信息
  - **医疗术语优化**: 更新分析进度显示中的专业术语
    - 将"病例数据 Agent"更正为"病史数据 Agent"，更准确反映医疗数据分类
    - 提升用户界面专业性和医疗术语准确性
  - **历史对比分析界面全面重构**: 实现专业级数据可视化和用户体验优化
    - 智能健康评分系统，基于风险因子和实验室指标计算量化健康分数
    - 动态趋势分析，直观显示健康状况改善、稳定或恶化趋势
    - 风险因子变化追踪，智能识别新增风险和改善情况
    - 检验指标对比分析，详细展示关键指标的历史变化趋势
    - 渐变色彩设计体系，使用专业医疗配色增强视觉层次感
    - 响应式布局优化，支持桌面和移动设备的最佳显示效果
    - 交互式进度条和状态指示器，提供丰富的视觉反馈
    - 专业术语双语标注，中英文医疗术语并行显示
  - **医疗报告页面导出功能修复**: 完善报告显示页面的下载和打印功能
    - 修复报告显示页面下载按钮无响应问题
    - 添加完整的下载功能，支持JSON格式导出包含完整医疗数据
    - 实现打印功能，直接调用浏览器打印接口
    - 增强用户反馈提示，成功和错误状态均有明确提示
    - 标准化文件命名，包含患者姓名和生成日期
  - **界面功能去重优化**: 移除报告输入表单中的重复功能
    - 删除"与历史报告对比"复选框，避免与历史记录页面多选对比功能重复
    - 简化表单界面，用户通过历史记录页面进行报告对比分析
    - 优化用户体验，减少界面混乱和功能冗余
    - 更新相关schema和组件导入，清理无用代码
  - **AI对话界面字体优化**: 调整对话消息字体大小以提升可读性
    - 将AI回复字体从text-xl调整为text-base，与用户消息保持一致
    - 减少消息内边距从p-8到p-6，使对话框比例更协调
    - 保持专业医疗术语高亮显示和响应式设计
    - 提升整体对话界面的视觉平衡和用户体验
  - **AI聊天界面图标更新**: 替换聊天头部图标为专业医疗AI标识
    - 导入用户提供的医疗AI头像图标(image_1751064453952.png)
    - 新图标包含人脑轮廓、医疗十字、心电图心形、AI盾牌和神经网络连接元素
    - 完美体现Med Agentic-AI智能医疗分析平台的专业定位
    - 提升聊天界面的医疗科技感和品牌一致性
    - 优化图标显示为object-cover，确保图像完全填充容器无留白
  - **AI消息头像更新**: 将对话中AI头像替换为用户定制医疗AI图标
    - 使用新的医疗AI图标(image_1751065085972.png)作为所有AI消息头像
    - 图标包含人脑轮廓、医疗十字、心电图心形和AI神经网络元素
    - 应用w-full h-full object-cover rounded-xl样式确保图像完全覆盖绿色容器
    - 统一消息对话和输入状态指示器的AI头像样式
    - 增强聊天界面视觉一致性和专业医疗科技感
    - 图像完全填充10x10像素容器，无任何绿色背景显露
  - **Dashboard主页Logo更新**: 替换导航栏Logo为专业AI健康分析标识
    - 使用新的AI-POWERED HEALTH CHECKUP ANALYSIS图标(image_1751065393476.png)
    - 新Logo包含医疗防护盾、医疗十字、心电图和AI处理器元素
    - 优化容器样式为更透明的bg-white/10和ring-1 ring-white/20设计
    - 使用object-contain和rounded-lg确保完整Logo显示无裁切
    - 添加p-1内边距提供适当的视觉间距
    - 完美融入导航栏设计，体现AI驱动医疗分析平台专业形象

- **June 27, 2025**: AI聊天界面优化与历史记录显示修复
  - **AI对话界面尺寸优化**: 全面优化AI聊天界面的空间布局和用户体验
    - 增加对话框整体高度从calc(100vh-200px)到calc(100vh-120px)，提供更大显示空间
    - 扩大消息气泡宽度从85%到95%，最大化内容显示效果
    - 增加消息内容内边距从p-4到p-8，显著改善文字阅读体验
    - 增加消息区域间距从space-y-6到space-y-8，提供更好的视觉分离
    - 增加消息区域外边距从p-6到p-8，提供更宽敞的阅读环境
    - 提升AI回复字体大小从text-lg到text-xl，增强可读性
    - 优化输入区域内边距从p-4到p-6，提供更舒适的输入体验
    - 扩大文本输入框最小高度从60px到80px，最大高度从140px到180px
    - 增加输入框内边距p-4和行高leading-relaxed，提升输入舒适度
    - 移除聊天区域最大宽度限制，使用全屏宽度显示
  - **AI输入框精美化优化**: 重新设计输入区域，打造更精致紧凑的用户界面
    - 缩小输入区域内边距从p-6到p-4，创建更紧凑的布局
    - 优化文本输入框尺寸：最小高度从80px减至50px，最大高度从180px减至120px
    - 精简按钮设计：上传和发送按钮统一为10px高度，增强视觉一致性
    - 提升背景透明度和模糊效果，使用backdrop-blur-md创建更精美的玻璃质感
    - 优化边框和阴影效果，使用更细腻的border-blue-300/60和shadow-md
    - 调整字体大小为text-sm，保持精致感的同时确保可读性
    - 增强聚焦状态样式，使用focus:ring-2创建更明显的交互反馈
  - **AI头像定制化**: 替换默认机器人图标为自定义医疗AI图标
    - 导入用户提供的医疗AI图标(image_1751000871336.png)
    - 更新消息对话中AI头像显示为自定义医疗图标
    - 更新输入状态指示器中的AI头像保持一致性
    - 优化图标尺寸为w-6 h-6，使用object-contain确保图标完整显示
  - **配色方案优化**: 调整AI对话界面配色以匹配医疗AI图标的青绿色调
    - 更新AI头像背景渐变从teal-500/green-500改为emerald-500/teal-600
    - 统一输入状态指示器配色，使用emerald-500动画点
    - 调整文件预览区域边框和背景为emerald色调
    - 优化发送按钮渐变色彩，从blue-500/teal-500改为emerald-500/teal-500
    - 创建统一的emerald-teal医疗主题色彩体系，与图标完美协调
  - **平台Logo更新**: 替换Dashboard头部Logo为用户提供的全新医疗防护盾Logo
    - 导入用户提供的医疗Logo图标(image_1751001197483.png)
    - 新Logo设计包含医疗十字、心电图心形和电路板元素
    - 完美契合Med Agentic-AI智能医疗平台的专业定位
    - 统一品牌视觉识别，提升平台专业形象
    - 优化Logo显示方式，使用object-cover完全填充容器，无留白边
  - **界面布局精美化优化**: 全面提升报告显示区域和历史记录页面的视觉设计
    - 重新设计等待分析状态页面，使用渐变背景和动态元素
    - 添加背景图案装饰，营造科技医疗氛围
    - 增强图标容器设计，多层次阴影和动画效果
    - 实现渐变文字标题，提升视觉层次感
    - 添加功能特性标签展示，增强用户体验
    - 优化按钮设计，增加悬停动画和缩放效果
    - 统一历史记录空状态设计，保持界面一致性
    - 优化空白区域利用，添加功能特性展示卡片
    - 增加支持文件格式说明区域，提升用户引导
    - 调整内边距和尺寸，实现更紧凑的布局设计
    - 统一加载状态样式，保持视觉一致性
  - **历史报告多选对比功能**: 实现历史记录页面的多报告选择对比分析功能
    - 添加对比模式切换按钮，支持启用/取消对比模式
    - 实现报告卡片多选功能，支持复选框和点击选择
    - 限制最多选择3份报告进行对比，防止界面过载
    - 添加选择状态视觉反馈，选中报告显示绿色边框和勾选图标
    - 实现选择计数显示和对比按钮动态显示
    - 在对比模式下隐藏删除按钮，避免误操作
    - 添加报告选择验证，确保至少选择2份报告才能开始对比
  - **AI智能对比分析系统**: 实现完整的AI驱动医疗报告对比分析功能
    - 创建专业级ReportComparison组件，提供全屏可视化对比界面
    - 集成Recharts图表库，支持折线图、雷达图、柱状图等多种可视化
    - 实现AI智能趋势分析，自动识别improving/stable/declining状态
    - 生成风险因子雷达图对比，直观显示健康状态变化
    - 提供实验室指标趋势图，展示各项检验指标的时间序列变化
    - 实现整体健康评分系统，量化健康改善程度
    - 添加专业医疗建议生成，基于对比结果提供个性化指导
    - 创建时间线视图，清晰展示检查历史和报告关联关系
    - 后端集成Gemini AI进行深度医疗数据对比分析
    - 支持JSON结构化输出，确保图表数据格式准确性
    - 更新Gemini API密钥，恢复AI智能分析功能正常运行
    - 系统现在可以生成基于真实数据的专业医疗对比分析报告
  - **可视化图表用户体验优化**: 大幅提升医疗对比分析图表的可读性和用户理解度
    - 添加详细图表阅读指南，包含图表结构说明和数值解读方法
    - 实现分层式信息展示，从基础概念到专业解读逐步引导用户
    - 增强颜色编码系统，使用直观的颜色搭配表示不同健康状态
    - 添加交互式工具提示，提供上下文相关的详细说明
    - 创建综合用户指南卡片，解释如何正确理解趋势变化
    - 优化健康评分系统，使用色彩分级和文字说明双重标识
    - 增加优先级建议系统，为AI健康建议添加执行优先级标识
    - 强化专业免责声明，确保用户理解AI建议的辅助性质
  - **历史记录显示修复**: 完全解决用户个人报告无法在历史记录页面显示的认证问题
    - 修复前端查询认证凭据传递问题，确保credentials: 'include'正确配置
    - 添加服务器端会话状态调试日志，准确追踪用户认证状态
    - 更新API端点统一使用sessionData模式，确保会话一致性验证
    - 成功显示用户个人分析报告，验证数据隔离和权限控制正常工作
    - AI聊天功能正常访问用户历史医疗数据，提供基于真实数据的个性化建议

- **June 27, 2025**: AI聊天数据真实性验证与历史记录准确链接
  - **品牌标识统一优化**: 全面更新平台品牌显示为"智能运行平台：Med Agentic-AI"
    - 更新系统设置页面AI模型显示标识
    - 更新医疗报告底部元数据区域的平台标识
    - 统一品牌标识在所有用户界面的显示
    - 强化Med Agentic-AI作为智能医疗平台的品牌定位
    - 提升用户对平台专业性和系统性的认知
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