# 《第七频率》JS 引擎说明

## 单一引擎体系

项目已经完成引擎合并。当前唯一运行引擎是：

- `engine.js`：游戏运行时，负责剧本加载、Canvas背景、角色立绘、对话、选择、存档、BGM、回响触发和全局 API。
- `game-core.js`：旧入口兼容壳，只负责在旧页面仍引用它时加载 `engine.js`。

`game.jsp` 只加载 `engine.js`。`game-engine.jsp` 不再维护第二套实验引擎，访问时会自动跳转到 `game.jsp`。

## 保留模块

以下文件暂时作为功能模块和后续扩展素材保留，但默认游戏流程不加载它们：

- `audio.js`：Web Audio API、7830Hz 频率、摩尔斯音效和频谱可视化。
- `scenes.js`：场景数据加载工具。
- `echoes.js`：更复杂的回响/蝴蝶效应渲染。
- `ui.js`：模块化 UI 控制器原型。
- `puzzles.js`：频率匹配、摩尔斯电码、声波拼图。

后续接入这些模块时，以 `engine.js` 的状态和存档格式为准，不再新增第二套入口。

## 验证

运行浏览器冒烟测试：

```powershell
$env:NODE_PATH='C:\Users\binchen\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
& 'C:\Users\binchen\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\smoke-test.cjs
```

测试覆盖：

- `jsp/game.jsp` 能加载第一章
- 对话能推进到选择
- 选择能跳转到下一场景
- `jsp/index.jsp` 和 `jsp/game-engine.jsp` 旧入口别名有效

---

*更新：2026-05-02，引擎合并完成*
