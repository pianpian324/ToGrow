


## 功能特点

ToGrow提供以下核心功能：

1. **种植天气预报**：显示当前二十四节气信息（包括太阳和地球相对位置的可视化），提供用户所在地的天气预报（温度、湿度、降水、风力等），并根据天气情况发出适当预警。

2. **种植指导**：根据用户所在位置和当前时节，推荐适合种植的蔬菜和香草。每种植物以卡片形式呈现，包含适宜温度条件、土壤要求和完整的生长周期农事操作指南。

3. **种植日记**：用户可以记录植物生长状态，创建个性化的种植日记，积累可靠的种植经验。

4. **社区交流**：用户可以分享种植日记、经验和成果，与其他种植爱好者交流互动。

5. **数字农场**：用户可以在地图上标记自己的种植点位，并通过数字孪生技术实时查看自己的植物生长状态。

## 快速开始

### 非开发人员使用指南

如果您不是开发人员，但想要运行ToGrow应用，请按照以下步骤操作：

1. **安装必要软件**：
   - 安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - 安装 [Node.js](https://nodejs.org/) (推荐v16或更高版本)

2. **下载项目**：
   - 从GitHub下载ToGrow项目：`git clone https://github.com/yourusername/ToGrow.git`
   - 如果您不熟悉Git，也可以直接下载ZIP压缩包并解压

3. **配置天气API**：
   - 注册 [OpenWeatherMap](https://openweathermap.org/) 账号并获取免费API密钥
   - 在`js`文件夹中复制`.env.example`文件并重命名为`.env`
   - 编辑`.env`文件，将您的API密钥填入`WEATHER_API_KEY=`后面

4. **启动应用**：
   - 打开命令提示符或PowerShell
   - 进入项目的backend目录：`cd 项目路径\ToGrow\backend`
   - 启动数据库：`docker-compose -f docker-compose-mysql-only.yml up -d`
   - 初始化数据库（首次运行时）：`node init-database.js --with-sample-data`
   - 启动应用服务器：`node app.js`

5. **访问应用**：
   - 在浏览器中打开：`http://localhost:3000`
   - 允许位置访问以获取本地天气信息

### 与应用交互

在浏览器中打开应用后，您可以：

- 查看当前节气和天气信息
- 浏览适合当前季节的植物推荐
- 创建种植日记记录您的种植过程
- 在社区中分享您的种植经验
- 查看您的数字农场

## 开发者指南

如果您是开发人员想要贡献代码或自定义应用，请参考以下信息：

### 技术栈

- 前端：原生JavaScript、HTML、CSS
- 后端：Node.js、Express
- 数据库：MySQL
- API：OpenWeatherMap（天气数据）

### 项目结构

- `/backend` - 后端代码和API实现
- `/js` - 前端JavaScript模块
- `/css` - 样式文件
- `/components` - 前端组件
- `/config` - 配置文件

### 开发设置

1. 克隆仓库：`git clone https://github.com/yourusername/ToGrow.git`
2. 安装依赖：`cd ToGrow/backend && npm install`
3. 配置环境变量（参考上面的非开发人员指南）
4. 启动开发服务器：`node app.js`

### API文档

API端点和使用方法请参考`backend/DEPLOYMENT.md`文件。

## 许可证

[MIT License](LICENSE)

## 贡献

欢迎提交问题和贡献代码，请参考[贡献指南](CONTRIBUTING.md)。
