# 🔒 安全政策

## 🛡️ 支持的版本

我们仅为以下版本提供安全更新：

| 版本 | 支持状态 |
| --- | --- |
| 1.0.x | ✅ 支持 |
| < 1.0 | ❌ 不支持 |

## 🚨 报告安全漏洞

Med Agentic-AI 团队非常重视安全问题。如果您发现了安全漏洞，请**不要**通过公开的 GitHub Issues 报告。

### 报告流程

1. **私密报告**：请通过以下方式之一报告安全问题：
   - 发送邮件到：security@medagenticai.com
   - 使用 GitHub 的私密安全报告功能
   - 联系项目维护者

2. **包含信息**：
   - 漏洞的详细描述
   - 复现步骤
   - 潜在的影响范围
   - 建议的修复方案（如果有）

3. **响应时间**：
   - 我们将在 **24小时内** 确认收到您的报告
   - 在 **72小时内** 提供初步评估
   - 在 **7天内** 提供详细的修复计划

## 📊 严重程度分级

我们使用以下标准评估安全漏洞的严重程度：

### 🔴 严重 (Critical)
- 远程代码执行
- 完整系统访问权限获取
- 大规模数据泄露

**响应时间**: 24小时内修复

### 🟠 高危 (High)
- 权限提升
- 敏感数据泄露
- 绕过认证机制

**响应时间**: 72小时内修复

### 🟡 中危 (Medium)
- 拒绝服务攻击
- 信息泄露
- 会话劫持

**响应时间**: 1周内修复

### 🟢 低危 (Low)
- 信息收集
- 轻微的配置问题

**响应时间**: 2周内修复

## 🔐 安全最佳实践

### 开发者指南

#### 1. 输入验证
```typescript
// ✅ 正确的输入验证
import { z } from 'zod';

const userInputSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

app.post('/api/auth/login', (req, res) => {
  const validation = userInputSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: '输入验证失败' });
  }
  // 处理验证通过的数据
});
```

#### 2. SQL 注入防护
```typescript
// ✅ 使用参数化查询
const user = await db.select()
  .from(users)
  .where(eq(users.email, email))
  .limit(1);

// ❌ 避免字符串拼接
// const query = `SELECT * FROM users WHERE email = '${email}'`;
```

#### 3. XSS 防护
```tsx
// ✅ 自动转义用户输入
function UserProfile({ user }: { user: User }) {
  return (
    <div>
      <h1>{user.name}</h1> {/* React 自动转义 */}
      <div dangerouslySetInnerHTML={{ 
        __html: DOMPurify.sanitize(user.bio) // 手动清理 HTML
      }} />
    </div>
  );
}
```

#### 4. 认证和授权
```typescript
// ✅ 中间件验证
const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const sessionData = req.session as any;
  if (!sessionData?.userId) {
    return res.status(401).json({ error: '未授权访问' });
  }
  req.user = { id: sessionData.userId };
  next();
};

// 保护敏感端点
app.get('/api/reports', authenticateUser, getReports);
```

### 部署安全

#### 1. 环境变量
```bash
# ✅ 安全的环境变量配置
GEMINI_API_KEY=your_secure_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/db
SESSION_SECRET=random_64_character_string

# ❌ 避免在代码中硬编码
# const apiKey = "hardcoded_key"; // 不要这样做
```

#### 2. HTTPS 配置
```nginx
# Nginx SSL 配置
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/private-key.pem;
    
    # 强制使用强加密套件
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
}
```

#### 3. 防火墙配置
```bash
# UFW 防火墙配置
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 5000/tcp  # 阻止直接访问应用端口
```

### 应用安全

#### 1. 会话管理
```typescript
// 安全的会话配置
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // 防止 XSS
    maxAge: 24 * 60 * 60 * 1000, // 24小时
    sameSite: 'strict' // CSRF 保护
  }
}));
```

#### 2. 速率限制
```typescript
import rateLimit from 'express-rate-limit';

// API 速率限制
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100次请求
  message: '请求过于频繁，请稍后再试',
  standardHeaders: true,
  legacyHeaders: false,
});

// 登录速率限制
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 每个IP最多5次登录尝试
  skipSuccessfulRequests: true,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);
```

#### 3. 文件上传安全
```typescript
import multer from 'multer';
import path from 'path';

// 安全的文件上传配置
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      // 生成安全的文件名
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'file-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    // 白名单文件类型
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'video/mp4'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10
  }
});
```

## 🔍 安全监控

### 日志记录
```typescript
// 安全事件日志
const securityLogger = {
  logFailedLogin: (ip: string, email: string) => {
    console.log(JSON.stringify({
      event: 'failed_login',
      ip,
      email,
      timestamp: new Date().toISOString(),
      level: 'warning'
    }));
  },
  
  logSuspiciousActivity: (ip: string, activity: string) => {
    console.log(JSON.stringify({
      event: 'suspicious_activity',
      ip,
      activity,
      timestamp: new Date().toISOString(),
      level: 'critical'
    }));
  }
};
```

### 健康检查
```typescript
// 安全健康检查端点
app.get('/api/health', (req, res) => {
  const checks = {
    database: checkDatabaseConnection(),
    redis: checkRedisConnection(),
    storage: checkStorageAccess(),
    timestamp: new Date().toISOString()
  };
  
  const allHealthy = Object.values(checks).every(check => 
    check === true || check === 'connected'
  );
  
  res.status(allHealthy ? 200 : 503).json(checks);
});
```

## 📋 安全检查清单

### 开发阶段
- [ ] 所有用户输入都经过验证和清理
- [ ] 使用参数化查询防止 SQL 注入
- [ ] 实现适当的认证和授权机制
- [ ] 敏感数据加密存储
- [ ] 错误处理不泄露敏感信息
- [ ] 依赖项定期更新和安全扫描

### 部署阶段
- [ ] 使用 HTTPS 加密传输
- [ ] 配置安全的 HTTP 头
- [ ] 设置防火墙规则
- [ ] 环境变量安全配置
- [ ] 定期安全更新
- [ ] 监控和日志记录

### 运维阶段
- [ ] 定期安全审计
- [ ] 漏洞扫描
- [ ] 访问日志监控
- [ ] 异常行为检测
- [ ] 备份数据加密
- [ ] 灾难恢复计划

## 🆘 应急响应

### 安全事件响应流程

1. **检测和分析** (0-1小时)
   - 确认安全事件
   - 评估影响范围
   - 收集初步证据

2. **遏制和隔离** (1-4小时)
   - 隔离受影响系统
   - 阻止攻击传播
   - 保护关键资产

3. **消除和恢复** (4-24小时)
   - 清除恶意代码
   - 修复漏洞
   - 恢复正常服务

4. **后续活动** (1-7天)
   - 事件总结报告
   - 改进安全措施
   - 更新应急预案

### 联系信息

**安全团队**：security@medagenticai.com
**紧急联系**：+86-xxx-xxxx-xxxx
**值班时间**：7x24小时

## 🏆 安全奖励计划

我们感谢安全研究人员的贡献，并提供以下奖励：

- **严重漏洞**：$1000 - $5000
- **高危漏洞**：$500 - $1000
- **中危漏洞**：$100 - $500
- **低危漏洞**：$50 - $100

### 奖励条件
- 首次发现的漏洞
- 提供详细的漏洞报告
- 负责任的披露
- 不对服务造成损害

## 📚 参考资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [React Security Best Practices](https://snyk.io/blog/10-react-security-best-practices/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

---

**我们承诺保护用户数据和系统安全。如有任何安全问题，请及时联系我们。** 