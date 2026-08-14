# KeepDoing 部署指南

完整的部署解决方案，支持 Docker、本地和云环境部署。

---

## 📋 目录

- [快速开始](#快速开始)
- [Docker 部署](#docker-部署)
- [本地生产部署](#本地生产部署)
- [云平台部署](#云平台部署)
- [环境变量配置](#环境变量配置)
- [故障排除](#故障排除)

---

## 快速开始

### 使用 Docker 一键部署

#### Linux / macOS

```bash
bash deploy.sh start
```

#### Windows

```bash
deploy.bat start
```

### 支持的命令

- `start` - 启动应用
- `stop` - 停止应用
- `restart` - 重启应用
- `build` - 构建镜像
- `logs` - 查看日志
- `clean` - 清理数据

---

## Docker 部署

### 前置条件

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 使用 Docker Compose（推荐）

1. **克隆项目**

```bash
git clone https://github.com/eve20041216-creator/keepdoing.git
cd keepdoing
```

2. **启动应用**

```bash
docker-compose up -d
```

3. **访问应用**

打开浏览器访问 `http://localhost:5000`

### 使用 Docker CLI

```bash
# 构建镜像
docker build -t keepdoing:latest .

# 运行容器
docker run -d \
  --name keepdoing \
  -p 5000:5000 \
  -v keepdoing-data:/app/data \
  keepdoing:latest

# 查看日志
docker logs -f keepdoing
```

### Docker 常用命令

```bash
# 停止应用
docker-compose down

# 查看日志
docker-compose logs -f

# 进入容器
docker exec -it keepdoing sh

# 查看容器状态
docker-compose ps
```

---

## 本地生产部署

### 方式 1：使用 PM2 部署（Node.js）

1. **安装依赖**

```bash
npm install -g pm2

# 后端
cd backend
npm install --production

# 前端
cd ../frontend
npm install --production
```

2. **构建项目**

```bash
# 后端
cd backend
npm run build

# 前端
cd ../frontend
npm run build
```

3. **创建 PM2 配置文件** `ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    {
      name: 'keepdoing-backend',
      script: './backend/dist/index.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        DATABASE_PATH: './data/keepdoing.db',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
```

4. **启动应用**

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

5. **监控应用**

```bash
pm2 monit
pm2 logs
```

### 方式 2：使用 Systemd（Linux）

创建服务文件 `/etc/systemd/system/keepdoing.service`：

```ini
[Unit]
Description=KeepDoing Application
After=network.target

[Service]
Type=simple
User=keepdoing
WorkingDirectory=/opt/keepdoing
Environment="NODE_ENV=production"
Environment="PORT=5000"
ExecStart=/usr/bin/node /opt/keepdoing/backend/dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启用和启动：

```bash
sudo systemctl enable keepdoing
sudo systemctl start keepdoing
```

---

## 云平台部署

### Heroku 部署

1. **安装 Heroku CLI**

```bash
curl https://cli.heroku.com/install.sh | sh
```

2. **创建 Heroku 应用**

```bash
heroku login
heroku create your-app-name
```

3. **部署**

```bash
git push heroku main
```

### Railway 部署

1. 访问 [Railway.app](https://railway.app)
2. 连接 GitHub 仓库
3. 自动部署

### Render 部署

1. 访问 [Render.com](https://render.com)
2. 点击 "Deploy to Render"
3. 连接 GitHub 仓库

### AWS EC2 部署

```bash
# 1. 连接到实例
ssh -i your-key.pem ec2-user@your-instance

# 2. 安装 Docker
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker

# 3. 拉取代码并启动
git clone https://github.com/eve20041216-creator/keepdoing.git
cd keepdoing
docker-compose up -d
```

---

## 环境变量配置

### 创建 `.env` 文件

```bash
cp .env.example .env
```

### 常用配置

```env
# 后端配置
PORT=5000
NODE_ENV=production
DATABASE_PATH=/app/data/keepdoing.db

# 前端配置
VITE_API_URL=http://localhost:5000

# CORS 配置
ALLOWED_ORIGINS=http://localhost:5000,http://yourdomian.com
```

---

## 数据持久化

### Docker 卷配置

```yaml
volumes:
  keepdoing-data:
    driver: local
```

### 备份数据

```bash
# 备份数据库
docker exec keepdoing cp /app/data/keepdoing.db /app/data/backup.db

# 导出数据
docker cp keepdoing:/app/data/keepdoing.db ./backup/
```

### 恢复数据

```bash
# 复制备份到容器
docker cp ./backup/keepdoing.db keepdoing:/app/data/

# 重启应用
docker-compose restart
```

---

## 性能优化

### 1. 数据库优化

```javascript
// 在 backend/src/database/db.ts 中启用 WAL 模式
db.run('PRAGMA journal_mode = WAL');
db.run('PRAGMA synchronous = NORMAL');
```

### 2. 缓存配置

```javascript
// 添加缓存头
app.use((req, res, next) => {
  if (req.url.match(/\.(js|css|png|jpg|gif)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000');
  }
  next();
});
```

### 3. 压缩响应

```bash
npm install compression
```

```javascript
import compression from 'compression';
app.use(compression());
```

---

## 监控和日志

### 使用 Docker 查看日志

```bash
docker-compose logs -f --tail=100
```

### 使用 PM2 查看日志

```bash
pm2 logs keepdoing-backend
pm2 monit
```

### 健康检查

```bash
curl http://localhost:5000/health
```

---

## 故障排除

### 端口被占用

```bash
# Linux/macOS
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Docker 镜像构建失败

```bash
# 清理旧镜像
docker system prune -a

# 重新构建
docker-compose build --no-cache
```

### 数据库连接错误

```bash
# 检查数据卷
docker volume ls
docker volume inspect keepdoing-data

# 删除并重建
docker-compose down -v
docker-compose up -d
```

### 应用无法启动

```bash
# 查看详细日志
docker-compose logs

# 进入容器调试
docker exec -it keepdoing sh
```

---

## 安全建议

1. **使用反向代理**（nginx、Apache）
2. **启用 HTTPS/SSL**
3. **定期备份数据**
4. **限制 API 速率**
5. **使用防火墙规则**
6. **定期更新依赖**

```bash
# 检查漏洞
npm audit
npm audit fix
```

---

## 支持

遇到问题？请查看 [GitHub Issues](https://github.com/eve20041216-creator/keepdoing/issues)

---

**祝部署顺利！🚀**
