# 本地开发环境设置

## 🚨 问题说明

当直接在浏览器中打开HTML文件时，由于浏览器的安全策略，Fetch API无法加载本地文件系统中的HTML文件。这是正常的浏览器安全机制。

## ✅ 解决方案

### 方法1: 启动本地HTTP服务器（推荐）

```bash
# 在frontend目录下运行
./start-server.sh
```

或者手动运行：

```bash
# 使用Python 3
python3 -m http.server 8000

# 或使用Node.js
npx serve . --port 8000

# 或使用PHP
php -S localhost:8000
```

然后在浏览器中访问：
```
http://localhost:8000
```

### 方法2: 使用备用内容

如果无法启动HTTP服务器，系统会自动使用内嵌的备用页面内容，虽然功能有限但可以正常导航。

## 🔍 调试工具

在浏览器控制台中可以使用以下命令：

```javascript
// 测试导航功能
window.testStaticNavigation();
window.testNavigationClick('professionals');

// 检查系统状态
window.checkSPAStatus();
window.getNavigationSystemStatus();

// 强制重新绑定事件监听器
window.forceRebindNavigation();
```

## 📋 支持的页面

- ⚖️ AI法律服务 (`ai-legal`)
- 🤖 AI CRM系统 (`ai-crm`)
- 📚 知识库 (`knowledge`)
- 👥 专业人才 (`professionals`)
- 🌟 生活方式 (`lifestyle`)
- 🎓 教育培训 (`education`)
- 💼 劳务服务 (`labor`)
- 🐾 宠物服务 (`pet`)
- ✈️ 旅游服务 (`tourism`)
- 🌐 社区交流 (`community`)

## 🛠️ 开发建议

1. **始终使用HTTP服务器**进行开发和测试
2. **定期检查控制台日志**以确认系统状态
3. **使用调试工具**验证导航功能
4. **在本地环境测试完成后再部署**

## ⚡ 快速启动

```bash
cd frontend
./start-server.sh
# 在浏览器中打开 http://localhost:8000
```

享受无障碍的导航体验！🎉