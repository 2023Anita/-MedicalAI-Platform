# 🏥 Med Agentic-AI | 智能医疗分析平台

<div align="center">

![Med Agentic-AI](./attached_assets/image_1751065393476.png)

**基于多智能体协作的下一代医疗分析平台**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

[🚀 快速开始](#-快速开始) • [📖 使用指南](#-使用指南) • [🏗️ 技术架构](#️-技术架构) • [🤝 贡献指南](#-贡献指南)

</div>

---

## 🌟 项目概述

Med Agentic-AI 是一个革命性的智能医疗分析平台，采用多智能体协作架构，结合 Google Gemini 2.5 Flash 先进AI技术，为医疗专业人员提供全面、准确、智能的医疗数据分析服务。

### 🎯 核心价值

- **🤖 多智能体协作**：编排代理、影像分析代理、实验室分析代理、病史分析代理协同工作
- **🔬 多模态数据处理**：支持文本、图像、视频等多种医疗数据格式
- **📊 智能分析报告**：生成专业的中文医疗分析报告，专业术语中英文对照
- **🏥 临床决策支持**：提供鉴别诊断、风险评估、治疗建议等临床支持
- **📈 历史数据对比**：智能对比分析历史检查数据，追踪病情变化
- **💬 AI智能问答**：基于报告内容的智能医疗咨询助手

---

## ✨ 功能特性

### 🔧 核心功能

#### 🎯 智能分析引擎
- **多智能体协作分析**：5个专业AI代理协同工作
- **实时分析进度**：可视化分析流程，透明化处理过程
- **多模态数据支持**：文本报告、医学影像、检查视频全覆盖
- **专业报告生成**：结构化中文医疗报告，符合临床规范

#### 📊 数据管理
- **历史报告管理**：完整的检查历史记录和管理
- **智能数据对比**：多份报告智能对比分析
- **数据安全存储**：企业级数据安全和隐私保护
- **导出打印功能**：支持PDF导出和专业打印格式

#### 💡 智能助手
- **AI医疗问答**：基于报告内容的智能咨询
- **个性化建议**：根据患者情况提供定制化健康建议
- **风险预警**：智能识别潜在健康风险
- **随访提醒**：智能随访计划和提醒系统

### 🏗️ 技术特性

- **🚀 现代化技术栈**：React 18 + TypeScript + Node.js
- **🎨 优雅用户界面**：Tailwind CSS + Radix UI 组件库
- **⚡ 高性能架构**：Vite构建 + PostgreSQL数据库
- **🔒 企业级安全**：Session管理 + 数据加密
- **📱 响应式设计**：完美适配桌面端和移动端
- **🌐 实时通信**：WebSocket实时数据更新

---

## 🏗️ 技术架构

### 系统架构图

```mermaid
graph TB
    subgraph "用户界面层"
        A[React前端应用]
        B[Tailwind CSS样式]
        C[Radix UI组件]
    end
    
    subgraph "API服务层"
        D[Express.js服务器]
        E[RESTful API]
        F[WebSocket服务]
    end
    
    subgraph "业务逻辑层"
        G[多智能体系统]
        H[医疗分析服务]
        I[文件处理服务]
        J[对比分析服务]
    end
    
    subgraph "AI服务层"
        K[Google Gemini 2.5]
        L[编排代理]
        M[影像分析代理]
        N[实验室分析代理]
        O[病史分析代理]
    end
    
    subgraph "数据存储层"
        P[PostgreSQL数据库]
        Q[文件存储系统]
        R[Session存储]
    end
    
    A --> D
    B --> A
    C --> A
    D --> E
    D --> F
    E --> G
    G --> H
    G --> I
    G --> J
    H --> K
    K --> L
    K --> M
    K --> N
    K --> O
    H --> P
    I --> Q
    D --> R
    
    style A fill:#e1f5fe
    style G fill:#f3e5f5
    style K fill:#fff3e0
    style P fill:#e8f5e8
```

### 数据流架构

```mermaid
sequenceDiagram
    participant U as 用户界面
    participant A as API服务
    participant M as 多智能体系统
    participant AI as Gemini AI
    participant D as 数据库
    
    U->>A: 上传医疗数据
    A->>M: 启动分析流程
    M->>AI: 编排代理分析
    AI->>M: 影像分析结果
    AI->>M: 实验室分析结果
    AI->>M: 病史分析结果
    M->>AI: 综合分析请求
    AI->>M: 完整分析报告
    M->>D: 保存分析结果
    M->>A: 返回分析报告
    A->>U: 展示分析结果
    
    Note over U,D: 实时进度更新通过WebSocket推送
```

### 技术栈架构

```mermaid
graph LR
    subgraph "前端技术栈"
        A1[React 18.3.1]
        A2[TypeScript 5.6.3]
        A3[Tailwind CSS]
        A4[Radix UI]
        A5[Vite 5.4.19]
    end
    
    subgraph "后端技术栈"
        B1[Node.js]
        B2[Express 4.21.2]
        B3[TypeScript]
        B4[Drizzle ORM]
        B5[PostgreSQL]
    end
    
    subgraph "AI技术栈"
        C1[Google Gemini 2.5]
        C2[多智能体系统]
        C3[自然语言处理]
        C4[多模态分析]
    end
    
    subgraph "DevOps技术栈"
        D1[Docker]
        D2[GitHub Actions]
        D3[环境配置管理]
        D4[自动化部署]
    end
    
    A1 --> B1
    B4 --> B5
    B2 --> C1
    C1 --> C2
    D1 --> D2
    
    style A1 fill:#61dafb
    style B2 fill:#68a063
    style C1 fill:#4285f4
    style D1 fill:#0db7ed
```

---

## 🚀 快速开始

### 📋 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **PostgreSQL**: >= 14.0
- **Google AI API Key**: Gemini 2.5 Flash访问权限

### ⚡ 一键启动

```bash
# 1. 克隆项目
git clone https://github.com/your-username/med-agentic-ai.git
cd med-agentic-ai

# 2. 安装依赖
npm install

# 3. 环境配置
cp .env.example .env
# 编辑 .env 文件，配置数据库和API密钥

# 4. 数据库初始化
npm run db:push

# 5. 启动开发服务器
npm run dev
```

### 🔧 环境配置

创建 `.env` 文件：

```env
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/med_agentic_ai"

# Google AI配置
GEMINI_API_KEY="your_gemini_api_key_here"
GOOGLE_AI_API_KEY="your_google_ai_api_key_here"

# 会话配置
SESSION_SECRET="your_super_secure_session_secret"

# 服务配置
NODE_ENV="development"
PORT=5000
```

### 🏃‍♂️ 启动服务

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 生产启动
npm start

# 类型检查
npm run check
```

---

## 📖 使用指南

### 👤 用户注册与登录

1. **访问应用**：打开浏览器访问 `http://localhost:5000`
2. **注册账户**：点击"注册"按钮，填写用户名和密码
3. **登录系统**：使用注册的账户信息登录系统

### 📊 医疗数据分析

#### 1. 上传医疗数据
- 支持文本报告、医学影像（JPG、PNG）、检查视频（MP4）
- 填写患者基本信息：姓名、年龄、性别、检查日期
- 粘贴或上传体检报告内容

#### 2. 智能分析流程
- **编排代理**：协调整个分析流程
- **影像分析代理**：处理医学影像数据
- **实验室分析代理**：解读化验检查结果
- **病史分析代理**：分析既往病史信息
- **综合分析**：生成完整的健康评估报告

#### 3. 分析报告解读
- **执行摘要**：主要发现、核心风险、首要建议
- **详细分析**：影像发现、化验异常、临床推理
- **风险评估**：整体评估、诊断结论、行动建议
- **患者解释**：通俗易懂的健康状况说明

### 📈 历史数据管理

- **查看历史**：浏览所有历史检查记录
- **数据对比**：选择多份报告进行智能对比
- **趋势分析**：追踪健康指标变化趋势
- **报告导出**：PDF格式导出和打印

### 💬 AI智能问答

- **基于报告咨询**：针对分析报告提出问题
- **健康建议**：获取个性化健康建议
- **医学知识**：专业医学术语解释
- **随访指导**：后续检查和治疗建议

---

## 🔧 配置说明

### 📊 数据库配置

```javascript
// drizzle.config.ts
export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
};
```

### 🤖 AI服务配置

```typescript
// server/services/gemini.ts
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY 
});
```

### 🔒 安全配置

```typescript
// server/index.ts
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24小时
  }
}));
```

---

## 🚀 部署指南

### 🐳 Docker部署

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
  
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: med_agentic_ai
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### ☁️ 云平台部署

#### AWS部署
- **ECS**: 容器化部署
- **RDS**: PostgreSQL数据库
- **S3**: 文件存储
- **CloudFront**: CDN加速

#### Google Cloud部署
- **Cloud Run**: 无服务器部署
- **Cloud SQL**: 托管数据库
- **Cloud Storage**: 文件存储

#### Azure部署
- **Container Instances**: 容器部署
- **Azure Database**: PostgreSQL服务
- **Blob Storage**: 文件存储

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详细信息。

### 🔧 开发流程

1. **Fork项目** 到您的GitHub账户
2. **创建特性分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送分支** (`git push origin feature/AmazingFeature`)
5. **创建Pull Request**

### 📝 代码规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 代码格式规范
- 编写单元测试和集成测试
- 提交信息遵循 Conventional Commits 规范

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详情。

---

## 🙏 致谢

- [Google Gemini](https://ai.google.dev/) - 强大的AI分析能力
- [React](https://reactjs.org/) - 现代化前端框架
- [Tailwind CSS](https://tailwindcss.com/) - 优雅的样式框架
- [Radix UI](https://www.radix-ui.com/) - 高质量组件库
- [Drizzle ORM](https://orm.drizzle.team/) - 类型安全的ORM

---

## 📞 联系我们

- **项目主页**: [https://github.com/your-username/med-agentic-ai](https://github.com/your-username/med-agentic-ai)
- **问题反馈**: [Issues](https://github.com/your-username/med-agentic-ai/issues)
- **功能请求**: [Feature Requests](https://github.com/your-username/med-agentic-ai/discussions)

---

<div align="center">

**🏥 Med Agentic-AI - 让AI助力医疗，让健康更智能 🤖**

Made with ❤️ by the Med Agentic-AI Team

</div> 