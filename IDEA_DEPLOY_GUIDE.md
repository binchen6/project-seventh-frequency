# IDEA Tomcat 部署指南

> 手写 `.idea` 配置文件容易出错，建议通过 IDEA 界面配置。

---

## 方法一：从现有目录创建项目（推荐）

### 步骤 1：打开项目
1. 打开 IntelliJ IDEA
2. `File` → `Open`
3. 选择 `project-seventh-frequency` 目录
4. 点击 `OK`

### 步骤 2：配置项目 SDK
1. `File` → `Project Structure`（或快捷键 `Ctrl+Alt+Shift+S`）
2. 左侧选 `Project`
3. `Project SDK` → 选择 Java 11（或你安装的 JDK）
4. `Project language level` → 选择 `11`
5. 点击 `Apply`

### 步骤 3：添加 Web 模块
1. `File` → `Project Structure` → 左侧选 `Modules`
2. 点击 `+` → `Add Module` → `Java Enterprise`
3. 模块名称：`seventh-frequency`
4. 勾选 `Web Application`
5. 点击 `Next` → `Finish`

### 步骤 4：配置 Web 资源目录（关键！）
1. `File` → `Project Structure` → 左侧选 `Facets`
2. 找到 `seventh-frequency/web/Web`
3. 右侧 `Web Resource Directories` 区域：
   - 点击 `+` → `Add`
   - Path: 选择项目根目录下的 `web` 文件夹
   - Relative Path: `/`
4. `Deployment Descriptors` → 确认指向 `web/WEB-INF/web.xml`
5. 点击 `Apply`

### 步骤 5：配置 Artifact
1. `File` → `Project Structure` → 左侧选 `Artifacts`
2. 点击 `+` → `Web Application: Exploded` → `From Modules...`
3. 选择 `seventh-frequency` 模块
4. Name: `seventh-frequency:war exploded`
5. 右侧 Output Layout 中，确保有 `Web'web'` 节点
6. 点击 `Apply` → `OK`

### 步骤 6：配置 Tomcat Server
1. `Run` → `Edit Configurations`
2. 点击 `+` → `Tomcat Server` → `Local`
3. `Name`: `Tomcat 9.0.41`
4. `Application server`: 选择你的 Tomcat 安装路径
5. `HTTP port`: 8080
6. 切到 `Deployment` 标签页
7. 点击 `+` → `Artifact`
8. 选择 `seventh-frequency:war exploded`
9. `Application context`: `/seventh-frequency`
10. 切到 `Server` 标签页，勾选 `After launch: Chrome`
11. 点击 `OK`

### 步骤 7：启动
1. 点击 `Run` 按钮（绿色三角）
2. IDEA 会自动启动 Tomcat 并部署项目
3. 浏览器自动打开 `http://localhost:8080/seventh-frequency/`

---

## 方法二：快速验证（不依赖 IDEA）

如果 IDEA 配置有问题，可以先用 Python 快速验证游戏本身能跑：

```bash
cd project-seventh-frequency\web
python -m http.server 18795
```

访问：`http://localhost:18795/`

---

## 常见问题

### Q: "工件部署时出错"
**原因**：Web Facet 没有正确指向 `web/` 目录  
**解决**：`Project Structure` → `Facets` → `web/Web` → 检查 `Web Resource Directories` 是否指向 `web/` 目录

### Q: "HTTP Status 404"
**原因**：Application context 配置错误  
**解决**：检查 Deployment 的 Application context 是否为 `/seventh-frequency`

### Q: Tomcat 8080 端口被占用
```bash
netstat -ano | findstr 8080
# 找到 PID 后杀掉进程
taskkill /PID <PID> /F
```

### Q: "找不到或无法加载主类"
**原因**：Java 模块配置错误  
**解决**：这个项目是纯前端 JSP 项目，不需要 Java 源代码。在 `Project Structure` → `Modules` 中移除 `src` 源目录标记即可。

---

*配置指南 v2.0 — 2026-05-02*
