# 📚 小朋友学习记录系统

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/SQLite-3-blue.svg" alt="SQLite">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
</p>

一个专为记录小朋友学习成长而设计的全栈应用，包含前台展示和后台管理功能。通过游戏化的练习、智能语音识别阅读、错字本追踪等功能，帮助孩子快乐学习，家长轻松记录。

## 🎬 功能演示

> 🚧 截图占位符 - 建议添加以下截图：
> - 首页学习记录界面
> - 练习页面（拼音/数学/语文/英语）
> - 智能阅读界面（朗读高亮效果）
> - 错字本页面
> - 后台管理界面

## ✨ 功能特性

### 📊 前台功能
- **实时统计**：记录数、学习时长、平均表现、积分一目了然
- **多小朋友管理**：支持添加多个孩子，个性化颜色区分
- **学习记录**：支持多科目、评分、心情、备注
- **成就墙**：激励孩子持续学习
- **响应式设计**：支持手机、平板、电脑访问

### 🎯 互动练习
| 类型 | 内容 | 难度 |
|------|------|------|
| 🔤 拼音练习 | 单韵母、复韵母、词语拼音、声调练习 | 3级 |
| 🔢 数学口算 | 加减乘除、连加连减、填空题 | 3级 |
| 📚 语文识字 | 常用汉字、四季方位、成语词汇 | 3级 |
| 🇬🇧 英语单词 | 日常词汇、动物植物、形容词 | 3级 |

**游戏化设计**：
- ⭐ 连击奖励系统
- 🎉 鼓励动画和星星特效
- 📈 练习成绩自动保存到学习记录

### 📖 智能阅读
- 🎤 **语音识别**：实时识别小朋友朗读的语音
- 💡 **逐字高亮**：读到哪个字，哪个字就会亮起来
- ❌ **错误标注**：读错的字变红色并记录到错字本
- 📊 **实时统计**：正确率、正确/错误字数实时显示
- 🔊 **发音功能**：点击汉字可听标准发音

**智能容错**：
- ✅ 同音字识别（音调容错）
- ✅ 前后鼻音容错（in/ing, en/eng）
- ✅ 平翘舌容错（z/zh, c/ch, s/sh）
- ✅ 形近字识别（天/夫、人/入等）
- ✅ n/l 容错

**内置文章**：
- 咏鹅、静夜思、春晓等古诗
- 小兔子乖乖等儿歌
- 三字经节选
- 支持自定义添加文章

### 📝 错字本
- **自动记录**：阅读时读错的字自动加入错字本
- **状态跟踪**：新错字 → 练习中 → 已掌握
- **复习计数**：记录每个字的练习次数
- **发音功能**：点击可听正确发音
- **图形记忆**：展示汉字形象化解释和字源
- **AI生成文章**：根据错字生成包含该字的练习文章
- **专项练习**：针对单个错字的拼音练习

### 🔧 后台管理
- 📈 数据仪表盘，总览所有小朋友学习情况
- 👶 小朋友信息管理（增删改查）
- 📝 学习记录管理
- 📖 科目管理
- 🏆 成就管理
- 💎 积分调整
- 🔐 密码保护（默认密码：123456）

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | HTML5 + CSS3 + JavaScript (原生) |
| 后端 | Node.js + Express |
| 数据库 | SQLite（轻量级，无需配置） |
| API | RESTful API |
| 语音 | Web Speech API |

## 📦 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm 或 yarn

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/yourusername/kids-learning-record.git
cd kids-learning-record

# 2. 安装依赖
npm install

# 3. 启动服务器
npm start
```

### 开发模式（热重载）

```bash
npm run dev
```

## 🌐 访问地址

启动后访问以下地址：

| 页面 | 地址 |
|------|------|
| 前台首页 | http://localhost:3000 |
| 后台管理 | http://localhost:3000/admin |
| 练习页面 | http://localhost:3000/practice.html |
| 智能阅读 | http://localhost:3000/reading.html |
| 错字本 | http://localhost:3000/mistakes.html |

**后台管理密码**：`123456`

## 📁 项目结构

```
.
├── server.js              # Express 服务器
├── database.sql           # 数据库表结构
├── package.json           # 项目配置
├── README.md              # 说明文档
├── .gitignore             # Git 忽略文件
├── public/                # 前台静态文件
│   ├── index.html         # 首页 - 学习记录
│   ├── index.js           # 首页脚本
│   ├── practice.html      # 练习页面
│   ├── practice.js        # 练习功能
│   ├── reading.html       # 智能阅读页面
│   ├── reading.js         # 阅读功能
│   ├── mistakes.html      # 错字本页面
│   └── mistakes.js        # 错字本功能
├── admin/                 # 后台管理
│   ├── index.html         # 后台页面
│   └── admin.js           # 后台脚本
└── scripts/               # 工具脚本
    └── init-db.js         # 数据库初始化
```

## 🔌 API 接口文档

### 小朋友管理
```
GET    /api/kids              # 获取所有小朋友
GET    /api/kids/:id          # 获取单个小朋友
POST   /api/kids              # 添加小朋友
PUT    /api/kids/:id          # 更新小朋友
DELETE /api/kids/:id          # 删除小朋友
```

### 学习记录
```
GET    /api/records?kid_id=   # 获取学习记录列表
GET    /api/records/:id       # 获取单个记录
POST   /api/records           # 添加学习记录
PUT    /api/records/:id       # 更新记录
DELETE /api/records/:id       # 删除记录
```

### 科目管理
```
GET    /api/subjects          # 获取所有科目
POST   /api/subjects          # 添加科目
PUT    /api/subjects/:id      # 更新科目
DELETE /api/subjects/:id      # 删除科目
```

### 成就管理
```
GET    /api/achievements      # 获取成就列表
POST   /api/achievements      # 添加成就
DELETE /api/achievements/:id  # 删除成就
```

### 统计数据
```
GET    /api/stats/:kid_id          # 获取小朋友统计
GET    /api/stats/daily/:kid_id    # 获取每日汇总
GET    /api/stats/subjects/:kid_id # 获取科目统计
```

## 🗄️ 数据库表结构

### kids（小朋友表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| name | VARCHAR | 姓名 |
| nickname | VARCHAR | 昵称 |
| birth_date | DATE | 出生日期 |
| grade | VARCHAR | 年级 |
| favorite_color | VARCHAR | 喜欢的颜色 |

### subjects（科目表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| name | VARCHAR | 科目名称 |
| icon | VARCHAR | 图标 |
| color | VARCHAR | 颜色 |

### learning_records（学习记录表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| kid_id | INTEGER | 小朋友ID |
| subject_id | INTEGER | 科目ID |
| learning_date | DATE | 学习日期 |
| duration | INTEGER | 学习时长（分钟）|
| content | TEXT | 学习内容 |
| performance | INTEGER | 表现评分 1-5 |
| mood | VARCHAR | 心情 emoji |
| notes | TEXT | 备注 |

### mistake_book（错字本 - localStorage）
```javascript
{
  char: "字",              // 汉字
  pinyin: "zì",            // 拼音
  recognized: "学",        // 读成的字
  source: "静夜思",        // 来源文章
  count: 3,                // 读错次数
  reviewCount: 5,          // 复习次数
  status: "practicing",    // 状态：new/practicing/mastered
  createdAt: "...",        // 创建时间
  lastWrong: "..."         // 最后读错时间
}
```

## 🎯 使用指南

### 首次使用
1. 访问 http://localhost:3000/admin
2. 输入密码 `123456` 进入后台
3. 点击"小朋友管理" → "添加小朋友"
4. 填写孩子信息后保存

### 记录学习
1. 回到首页 http://localhost:3000
2. 选择孩子头像
3. 点击右下角 "+" 按钮
4. 填写学习信息后保存

### 智能阅读
1. 点击顶部 "📖 阅读" 按钮
2. 选择一篇文章或添加自定义文章
3. 点击 "开始朗读"
4. **允许浏览器使用麦克风**
5. 大声朗读，系统会自动识别并标注对错

### 练习错字
1. 读完后进入错字本查看读错的字
2. 点击 "🔊 发音" 听正确读音
3. 点击 "练习" 进行拼音练习
4. 掌握后点击 "掌握" 移出重点列表

## 🚀 部署

### 本地网络访问
在同一网络下的其他设备访问：
```bash
# 查看本机IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# 其他设备访问 http://<你的IP>:3000
```

### 公网访问（临时）
使用 cloudflared 创建临时隧道：
```bash
cloudflared tunnel --url http://localhost:3000
```

或使用 ngrok：
```bash
ngrok http 3000
```

### Docker 部署（可选）
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# 构建并运行
docker build -t kids-learning .
docker run -p 3000:3000 -v $(pwd)/data:/app/data kids-learning
```

## ⚠️ 注意事项

1. **浏览器兼容性**：智能阅读功能需要使用 Chrome 或 Edge 浏览器，并允许麦克风权限
2. **数据存储**：SQLite 数据库文件 `kids_learning.db` 保存在项目根目录，建议定期备份
3. **语音合成**：发音功能依赖浏览器的 Web Speech API，不同浏览器支持程度可能不同
4. **后台密码**：默认密码为 `123456`，生产环境请修改 `admin/index.html` 中的密码

## 📝 更新日志

### v1.0.0 (2026-03-13)
- ✨ 初始版本发布
- 🎯 互动练习功能（拼音、数学、语文、英语）
- 📖 智能阅读功能（语音识别、逐字高亮）
- 📝 错字本功能（自动记录、复习追踪）
- 🔧 后台管理系统
- 🔊 汉字发音功能
- 🎨 图形化汉字展示

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT License

---

<p align="center">
  Made with ❤️ for kids learning
</p>
