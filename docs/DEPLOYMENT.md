# 🚀 Med Agentic-AI 部署指南

## 📋 目录

- [环境要求](#环境要求)
- [快速部署](#快速部署)
- [生产环境部署](#生产环境部署)
- [Docker 部署](#docker-部署)
- [云平台部署](#云平台部署)
- [监控与维护](#监控与维护)
- [故障排除](#故障排除)
- [安全配置](#安全配置)
- [备份策略](#备份策略)

---

## 📋 环境要求

### 最低系统要求

- **操作系统**: Linux (Ubuntu 20.04+), macOS 10.15+, Windows 10+
- **CPU**: 2核心以上
- **内存**: 4GB RAM (推荐 8GB+)
- **存储**: 20GB 可用空间
- **网络**: 稳定的互联网连接

### 软件依赖

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **PostgreSQL**: >= 14.0
- **Docker**: >= 20.10 (可选)
- **Docker Compose**: >= 2.0 (可选)

### API 服务要求

- **Google Gemini API Key**: 用于AI分析服务
- **PostgreSQL 数据库**: 用于数据存储

---

## ⚡ 快速部署

### 1. 克隆项目

```bash
git clone https://github.com/your-username/med-agentic-ai.git
cd med-agentic-ai
```

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

### 4. 配置环境变量

```env
# AI服务配置
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/medagentic

# 会话配置
SESSION_SECRET=your_super_secure_session_secret_here

# 服务配置
NODE_ENV=development
PORT=5000
```

### 5. 数据库初始化

```bash
# 创建数据库
createdb medagentic

# 运行数据库迁移
npm run db:push
```

### 6. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

---

## 🏭 生产环境部署

### 1. 服务器准备

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PostgreSQL
sudo apt install postgresql postgresql-contrib

# 安装 PM2 (进程管理器)
sudo npm install -g pm2
```

### 2. 数据库配置

```bash
# 创建数据库用户
sudo -u postgres createuser --interactive medagentic_user

# 创建数据库
sudo -u postgres createdb medagentic

# 设置数据库权限
sudo -u postgres psql
ALTER USER medagentic_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE medagentic TO medagentic_user;
\q
```

### 3. 应用部署

```bash
# 克隆项目到生产目录
git clone https://github.com/your-username/med-agentic-ai.git /var/www/med-agentic-ai
cd /var/www/med-agentic-ai

# 安装生产依赖
npm ci --only=production

# 构建应用
npm run build

# 创建上传目录
mkdir -p uploads
chmod 755 uploads

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件配置生产环境变量
```

### 4. PM2 配置

```bash
# 创建 PM2 配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'med-agentic-ai',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# 创建日志目录
mkdir -p logs

# 启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save
```

### 5. Nginx 反向代理

```bash
# 安装 Nginx
sudo apt install nginx

# 创建 Nginx 配置
sudo cat > /etc/nginx/sites-available/med-agentic-ai << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态文件缓存
    location /uploads/ {
        alias /var/www/med-agentic-ai/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 启用站点
sudo ln -s /etc/nginx/sites-available/med-agentic-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL 证书配置

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加以下行
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🐳 Docker 部署

### 1. Dockerfile

```dockerfile
# 多阶段构建
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码并构建
COPY . .
RUN npm run build

# 生产镜像
FROM node:18-alpine AS production

WORKDIR /app

# 安装必要的系统包
RUN apk add --no-cache \
    postgresql-client \
    curl

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 创建上传目录
RUN mkdir -p uploads && chown -R nextjs:nodejs uploads

# 切换到非 root 用户
USER nextjs

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

EXPOSE 5000

CMD ["npm", "start"]
```

### 2. Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: med-agentic-ai
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - uploads_data:/app/uploads
      - app_logs:/app/logs
    networks:
      - med-agentic-network

  db:
    image: postgres:14-alpine
    container_name: med-agentic-db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - med-agentic-network

  nginx:
    image: nginx:alpine
    container_name: med-agentic-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - uploads_data:/var/www/uploads
    depends_on:
      - app
    networks:
      - med-agentic-network

volumes:
  postgres_data:
  uploads_data:
  app_logs:

networks:
  med-agentic-network:
    driver: bridge
```

### 3. 环境变量文件

```bash
# .env.docker
POSTGRES_DB=medagentic
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password
GEMINI_API_KEY=your_gemini_api_key
SESSION_SECRET=your_session_secret
```

### 4. 部署命令

```bash
# 构建并启动服务
docker-compose --env-file .env.docker up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart
```

---

## ☁️ 云平台部署

### AWS 部署

#### 1. EC2 实例配置

```bash
# 创建 EC2 实例
aws ec2 run-instances \
    --image-id ami-0c55b159cbfafe1d0 \
    --count 1 \
    --instance-type t3.medium \
    --key-name your-key-pair \
    --security-group-ids sg-your-security-group \
    --subnet-id subnet-your-subnet

# 连接到实例
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### 2. RDS 数据库配置

```bash
# 创建 RDS 实例
aws rds create-db-instance \
    --db-instance-identifier med-agentic-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username postgres \
    --master-user-password your-password \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-your-db-security-group
```

#### 3. S3 文件存储配置

```bash
# 创建 S3 存储桶
aws s3 mb s3://med-agentic-uploads

# 设置存储桶策略
aws s3api put-bucket-policy \
    --bucket med-agentic-uploads \
    --policy file://bucket-policy.json
```

### Google Cloud 部署

#### 1. Cloud Run 部署

```bash
# 构建并推送镜像
gcloud builds submit --tag gcr.io/PROJECT-ID/med-agentic-ai

# 部署到 Cloud Run
gcloud run deploy med-agentic-ai \
    --image gcr.io/PROJECT-ID/med-agentic-ai \
    --platform managed \
    --region us-central1 \
    --set-env-vars GEMINI_API_KEY=your-key \
    --set-env-vars DATABASE_URL=your-db-url \
    --allow-unauthenticated
```

#### 2. Cloud SQL 配置

```bash
# 创建 Cloud SQL 实例
gcloud sql instances create med-agentic-db \
    --database-version POSTGRES_14 \
    --tier db-f1-micro \
    --region us-central1

# 创建数据库
gcloud sql databases create medagentic \
    --instance med-agentic-db
```

### Azure 部署

#### 1. Container Instances 部署

```bash
# 创建资源组
az group create --name med-agentic-rg --location eastus

# 部署容器实例
az container create \
    --resource-group med-agentic-rg \
    --name med-agentic-ai \
    --image your-registry/med-agentic-ai:latest \
    --dns-name-label med-agentic-ai \
    --ports 5000 \
    --environment-variables \
        GEMINI_API_KEY=your-key \
        DATABASE_URL=your-db-url
```

---

## 📊 监控与维护

### 1. 应用监控

```bash
# PM2 监控
pm2 monit

# 查看应用状态
pm2 status

# 查看日志
pm2 logs med-agentic-ai

# 重启应用
pm2 restart med-agentic-ai
```

### 2. 系统监控

```bash
# 安装系统监控工具
sudo apt install htop iotop

# 查看系统资源使用
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

### 3. 数据库监控

```sql
-- 查看数据库连接
SELECT * FROM pg_stat_activity;

-- 查看数据库大小
SELECT pg_size_pretty(pg_database_size('medagentic'));

-- 查看表大小
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public';
```

### 4. 日志管理

```bash
# 设置日志轮转
sudo cat > /etc/logrotate.d/med-agentic-ai << 'EOF'
/var/www/med-agentic-ai/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nodejs nodejs
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

---

## 🔧 故障排除

### 常见问题解决

#### 1. 应用启动失败

```bash
# 检查端口占用
sudo netstat -tlnp | grep :5000

# 检查环境变量
printenv | grep -E "(NODE_ENV|DATABASE_URL|GEMINI_API_KEY)"

# 检查应用日志
pm2 logs med-agentic-ai --lines 100
```

#### 2. 数据库连接问题

```bash
# 测试数据库连接
psql $DATABASE_URL -c "SELECT 1;"

# 检查数据库服务状态
sudo systemctl status postgresql

# 重启数据库服务
sudo systemctl restart postgresql
```

#### 3. 文件上传问题

```bash
# 检查上传目录权限
ls -la uploads/

# 修复权限
sudo chown -R nodejs:nodejs uploads/
chmod 755 uploads/

# 检查磁盘空间
df -h
```

#### 4. API 调用失败

```bash
# 测试 Gemini API
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
     https://generativelanguage.googleapis.com/v1beta/models

# 检查网络连接
ping google.com

# 检查防火墙设置
sudo ufw status
```

---

## 🔒 安全配置

### 1. 防火墙配置

```bash
# 配置 UFW 防火墙
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 5000/tcp  # 阻止直接访问应用端口
```

### 2. SSL/TLS 配置

```nginx
# Nginx SSL 配置
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # 其他配置...
}
```

### 3. 应用安全

```javascript
// 安全中间件配置
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 💾 备份策略

### 1. 数据库备份

```bash
# 创建备份脚本
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/med-agentic-ai"
mkdir -p $BACKUP_DIR

pg_dump $DATABASE_URL > $BACKUP_DIR/db_backup_$DATE.sql
gzip $BACKUP_DIR/db_backup_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-db.sh

# 设置定时备份
crontab -e
# 添加：0 2 * * * /usr/local/bin/backup-db.sh
```

### 2. 文件备份

```bash
# 创建文件备份脚本
cat > /usr/local/bin/backup-files.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/med-agentic-ai"
APP_DIR="/var/www/med-agentic-ai"

tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C $APP_DIR uploads/

# 删除30天前的备份
find $BACKUP_DIR -name "uploads_backup_*.tar.gz" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-files.sh
```

### 3. 备份恢复

```bash
# 恢复数据库
gunzip -c /var/backups/med-agentic-ai/db_backup_YYYYMMDD_HHMMSS.sql.gz | psql $DATABASE_URL

# 恢复文件
tar -xzf /var/backups/med-agentic-ai/uploads_backup_YYYYMMDD_HHMMSS.tar.gz -C /var/www/med-agentic-ai/
```

---

## 📈 性能优化

### 1. 应用优化

```javascript
// 启用 gzip 压缩
const compression = require('compression');
app.use(compression());

// 设置静态文件缓存
app.use(express.static('public', {
  maxAge: '1y',
  etag: false
}));
```

### 2. 数据库优化

```sql
-- 创建索引
CREATE INDEX CONCURRENTLY idx_reports_user_id ON reports(user_id);
CREATE INDEX CONCURRENTLY idx_reports_created_at ON reports(created_at);

-- 分析表统计信息
ANALYZE reports;
ANALYZE uploaded_files;
```

### 3. 系统优化

```bash
# 调整系统参数
echo 'net.core.somaxconn = 65535' >> /etc/sysctl.conf
echo 'fs.file-max = 100000' >> /etc/sysctl.conf
sysctl -p

# Node.js 内存优化
export NODE_OPTIONS="--max-old-space-size=4096"
```

---

## 📚 参考资料

- [PM2 官方文档](https://pm2.keymetrics.io/docs/)
- [Nginx 配置指南](https://nginx.org/en/docs/)
- [PostgreSQL 管理指南](https://www.postgresql.org/docs/)
- [Docker 部署最佳实践](https://docs.docker.com/develop/dev-best-practices/)
- [AWS 部署指南](https://docs.aws.amazon.com/)
- [Google Cloud 部署指南](https://cloud.google.com/docs)

---

*本部署指南持续更新中，如有问题请提交Issue或联系技术支持。* 