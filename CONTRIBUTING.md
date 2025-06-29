# 🤝 Contributing to Med Agentic-AI

感谢您对 Med Agentic-AI 项目的关注！我们欢迎所有形式的贡献，无论是代码、文档、问题报告还是功能建议。

## 📋 目录

- [行为准则](#行为准则)
- [贡献方式](#贡献方式)
- [开发环境设置](#开发环境设置)
- [贡献流程](#贡献流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [测试指南](#测试指南)
- [文档贡献](#文档贡献)
- [问题报告](#问题报告)
- [功能请求](#功能请求)

---

## 🌟 行为准则

### 我们的承诺

为了营造一个开放且友好的环境，我们作为贡献者和维护者承诺：无论年龄、体型、残疾、种族、性别认同和表达、经验水平、国籍、个人形象、种族、宗教或性取向如何，参与我们项目和社区的每个人都能获得无骚扰的体验。

### 我们的标准

有助于创造积极环境的行为包括：

- 使用友好和包容的语言
- 尊重不同的观点和经历
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

不可接受的行为包括：

- 使用性化的语言或图像，以及不受欢迎的性关注或性骚扰
- 恶意评论、侮辱/贬损评论，以及个人或政治攻击
- 公开或私下骚扰
- 未经明确许可，发布他人的私人信息，如物理或电子地址
- 在专业环境中可能被合理认为不适当的其他行为

---

## 🚀 贡献方式

### 🐛 报告Bug
- 使用 GitHub Issues 报告问题
- 提供详细的问题描述和复现步骤
- 包含系统环境信息

### 💡 提出新功能
- 在 GitHub Discussions 中讨论新想法
- 创建详细的功能请求 Issue
- 考虑功能的实用性和可行性

### 📝 改进文档
- 修复文档中的错误
- 添加缺失的文档
- 改进代码注释

### 🔧 提交代码
- 修复已知的 Bug
- 实现新功能
- 优化性能
- 重构代码

---

## 🛠️ 开发环境设置

### 1. Fork 项目

```bash
# 点击 GitHub 页面右上角的 "Fork" 按钮
# 然后克隆你的 fork
git clone https://github.com/YOUR-USERNAME/med-agentic-ai.git
cd med-agentic-ai
```

### 2. 添加上游仓库

```bash
git remote add upstream https://github.com/original-owner/med-agentic-ai.git
```

### 3. 安装依赖

```bash
# 安装项目依赖
npm install

# 安装开发工具
npm install -g typescript tsx
```

### 4. 环境配置

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
# 至少需要配置 GEMINI_API_KEY 和 DATABASE_URL
```

### 5. 数据库设置

```bash
# 创建开发数据库
createdb medagentic_dev

# 运行数据库迁移
npm run db:push
```

### 6. 启动开发服务器

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:5000
```

---

## 🔄 贡献流程

### 1. 创建功能分支

```bash
# 确保在最新的 main 分支上
git checkout main
git pull upstream main

# 创建新的功能分支
git checkout -b feature/your-feature-name
# 或者修复分支
git checkout -b fix/your-bug-fix
```

### 2. 进行开发

```bash
# 进行你的更改
# 编辑文件，添加功能或修复bug

# 定期提交更改
git add .
git commit -m "feat: add new feature description"
```

### 3. 保持分支更新

```bash
# 定期从上游拉取更新
git fetch upstream
git rebase upstream/main
```

### 4. 运行测试

```bash
# 运行类型检查
npm run check

# 运行构建测试
npm run build

# 运行开发服务器测试
npm run dev
```

### 5. 推送分支

```bash
# 推送到你的 fork
git push origin feature/your-feature-name
```

### 6. 创建 Pull Request

1. 访问你的 fork 在 GitHub 上的页面
2. 点击 "Compare & pull request" 按钮
3. 填写 PR 模板
4. 等待代码审查

---

## 📏 代码规范

### TypeScript 规范

```typescript
// 使用 TypeScript 严格模式
// 总是声明类型
interface User {
  id: number;
  email: string;
  createdAt: Date;
}

// 使用 const assertions
const API_ENDPOINTS = {
  USERS: '/api/users',
  REPORTS: '/api/reports',
} as const;

// 使用泛型
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return response.json();
}
```

### React 组件规范

```tsx
// 使用函数组件和 Hooks
import { useState, useEffect } from 'react';

interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

export default function MyComponent({ title, onSubmit }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // 副作用逻辑
  }, []);
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      {/* 组件内容 */}
    </div>
  );
}
```

### 样式规范

```tsx
// 使用 Tailwind CSS 类名
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-lg font-semibold text-gray-900">标题</h2>
  <button className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
    按钮
  </button>
</div>

// 使用 clsx 处理条件类名
import { clsx } from 'clsx';

const buttonClasses = clsx(
  'px-4 py-2 rounded font-medium',
  {
    'bg-blue-600 text-white': variant === 'primary',
    'bg-gray-200 text-gray-900': variant === 'secondary',
  }
);
```

### API 规范

```typescript
// 使用统一的错误处理
app.post('/api/endpoint', async (req, res) => {
  try {
    const result = await someOperation();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Operation failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 使用 Zod 进行输入验证
import { z } from 'zod';

const requestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

app.post('/api/users', (req, res) => {
  const validation = requestSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }
  // 处理有效数据
});
```

---

## 📝 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 提交类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式修改
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 提交格式

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 示例

```bash
# 新功能
git commit -m "feat(auth): add user registration endpoint"

# Bug 修复
git commit -m "fix(ui): resolve button alignment issue"

# 文档更新
git commit -m "docs: update API documentation"

# 重构
git commit -m "refactor(services): optimize medical analysis service"

# 重大变更
git commit -m "feat!: change API response format

BREAKING CHANGE: API responses now use camelCase instead of snake_case"
```

---

## 🧪 测试指南

### 运行测试

```bash
# 类型检查
npm run check

# 构建测试
npm run build

# 开发服务器测试
npm run dev
```

### 测试新功能

1. **功能测试**：确保新功能按预期工作
2. **回归测试**：确保没有破坏现有功能
3. **边界测试**：测试边界情况和错误处理
4. **用户体验测试**：确保用户界面友好

### 测试清单

- [ ] 功能在不同浏览器中正常工作
- [ ] 响应式设计在移动设备上正常显示
- [ ] 错误处理正确显示用户友好的消息
- [ ] 加载状态和进度指示器正常工作
- [ ] API 端点返回正确的数据格式
- [ ] 数据库操作正确执行

---

## 📚 文档贡献

### 文档类型

1. **README.md**: 项目概述和快速开始
2. **API 文档**: 接口说明和示例
3. **技术文档**: 架构设计和实现细节
4. **用户指南**: 功能使用说明
5. **部署文档**: 部署和运维指南

### 文档规范

- 使用清晰的标题结构
- 提供代码示例
- 包含截图和图表
- 保持内容更新
- 使用中文编写

### Markdown 规范

```markdown
# 一级标题

## 二级标题

### 三级标题

- 无序列表项
- 另一个列表项

1. 有序列表项
2. 另一个有序列表项

`内联代码`

\```typescript
// 代码块
const example = "Hello World";
\```

> 引用文本

[链接文本](https://example.com)

![图片描述](image-url)
```

---

## 🐛 问题报告

### 报告 Bug

使用以下模板报告问题：

```markdown
## Bug 描述
简要描述遇到的问题

## 复现步骤
1. 进入页面 '...'
2. 点击按钮 '...'
3. 滚动到 '...'
4. 看到错误

## 预期行为
描述你期望发生的情况

## 实际行为
描述实际发生的情况

## 截图
如果适用，添加截图来帮助解释问题

## 环境信息
- 操作系统: [例如 macOS 12.0]
- 浏览器: [例如 Chrome 95.0]
- Node.js 版本: [例如 18.0.0]
- 项目版本: [例如 1.0.0]

## 附加信息
添加任何其他相关信息
```

### 安全问题报告

如果发现安全漏洞，请不要公开报告。发送邮件到 security@example.com 或使用 GitHub 的安全报告功能。

---

## 💡 功能请求

### 提出新功能

使用以下模板提出功能请求：

```markdown
## 功能描述
清晰简洁地描述你想要的功能

## 问题背景
这个功能解决了什么问题？

## 解决方案
描述你希望如何实现这个功能

## 替代方案
描述你考虑过的其他解决方案

## 附加信息
添加任何其他相关信息、截图或示例
```

### 功能优先级

我们根据以下标准评估功能请求：

1. **用户价值**：对用户的价值和影响
2. **技术可行性**：实现的技术难度
3. **维护成本**：长期维护的成本
4. **项目一致性**：与项目目标的一致性

---

## 🎯 开发最佳实践

### 代码质量

1. **编写清晰的代码**：使用有意义的变量名和函数名
2. **添加注释**：解释复杂的逻辑和业务规则
3. **保持简洁**：避免过度复杂的实现
4. **遵循 DRY 原则**：不要重复代码
5. **错误处理**：正确处理错误情况

### 性能考虑

1. **避免不必要的重新渲染**：使用 React.memo 和 useMemo
2. **优化图片**：使用适当的图片格式和大小
3. **懒加载**：对大型组件使用动态导入
4. **缓存策略**：合理使用浏览器缓存

### 安全考虑

1. **输入验证**：验证所有用户输入
2. **SQL 注入防护**：使用参数化查询
3. **XSS 防护**：正确转义用户内容
4. **认证授权**：确保 API 端点有适当的权限检查

---

## 📞 获取帮助

如果你需要帮助或有疑问：

1. **查看文档**：首先查看项目文档
2. **搜索 Issues**：查看是否有相似的问题
3. **GitHub Discussions**：参与社区讨论
4. **创建 Issue**：如果找不到答案，创建新的 Issue

---

## 🙏 致谢

感谢所有为 Med Agentic-AI 项目做出贡献的开发者！

### 贡献者

- 查看 [Contributors](https://github.com/your-username/med-agentic-ai/graphs/contributors) 页面

### 特别感谢

- Google AI 团队提供的 Gemini API
- React 和 TypeScript 社区
- 所有开源项目的维护者

---

## 📄 许可证

通过贡献代码，你同意你的贡献将在 [MIT License](LICENSE) 下获得许可。

---

*感谢你的贡献！让我们一起让 Med Agentic-AI 变得更好！* 🚀 