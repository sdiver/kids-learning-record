# Docker 部署指南（群晖 NAS）

## 方案一：自动更新（推荐）

使用 Watchtower 自动检测镜像更新并重启容器。

```bash
# 1. 构建并启动
docker-compose up -d

# 2. 查看日志
docker-compose logs -f parenting
```

### 自动更新触发方式

**方式 A：GitHub Actions 自动构建（推荐）**

1. 将代码推送到 GitHub
2. 配置 GitHub Actions 自动构建镜像并推送到 Docker Hub
3. Watchtower 自动检测新镜像并更新

**方式 B：本地手动更新**

```bash
# 重新构建镜像
docker-compose build --no-cache

# 重启容器（Watchtower 会检测到本地镜像更新）
docker-compose up -d parenting
```

## 方案二：简单部署（无自动更新）

```bash
docker-compose -f docker-compose.simple.yml up -d
```

## 群晖 Container Manager 部署步骤

1. **安装 Container Manager**
   - 打开群晖 DSM → 套件中心 → 搜索并安装 "Container Manager"

2. **上传项目文件**
   - 通过 File Station 将项目文件夹上传到 `/docker/parenting/`

3. **构建镜像**
   ```bash
   ssh 登录群晖
   cd /volume1/docker/parenting
   sudo docker build -t parenting-app:latest .
   ```

4. **启动容器**
   ```bash
   sudo docker-compose up -d
   ```

5. **查看运行状态**
   - 打开 Container Manager → 容器 → 查看 `parenting-app`

## 数据持久化

- 数据库文件 `kids_learning.db` 映射到宿主机
- 容器重启不会丢失数据
- 建议定期备份 `kids_learning.db` 文件

## 更新应用

### 方法 1：Git 更新 + 重建（推荐）

```bash
cd /volume1/docker/parenting
git pull
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

### 方法 2：Watchtower 自动更新

配合 GitHub Actions 使用，代码推送后自动更新容器。

### 方法 3：手动拉取新镜像

```bash
sudo docker pull your-dockerhub-username/parenting-app:latest
sudo docker-compose up -d parenting
```

## 端口说明

- 3000：应用访问端口
- 访问地址：`http://群晖IP:3000`

## 常用命令

```bash
# 查看日志
docker-compose logs -f parenting

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 进入容器内部
docker exec -it parenting-app sh
```