# Quick Start Guide: 竖屏网页版植物大战僵尸

**Feature**: 竖屏网页版植物大战僵尸游戏  
**Version**: 1.0  
**Date**: 2025-10-08

本文档帮助开发者快速设置开发环境、理解项目结构并开始开发。

---

## 环境要求

### 必需软件
- **现代浏览器**（任意一个）:
  - Google Chrome 90+ 
  - Mozilla Firefox 88+
  - Microsoft Edge 90+
  - Safari 14+（用于测试macOS/iOS）
  
- **代码编辑器**（推荐）:
  - Visual Studio Code
  - Sublime Text
  - WebStorm
  - 或任何文本编辑器

- **本地服务器**（可选但推荐）:
  - Python 3: `python -m http.server`
  - Node.js: `npx serve`
  - VS Code扩展: Live Server

### 可选工具
- **Git**: 版本控制
- **Netlify CLI**: 本地测试部署配置
- **Chrome DevTools**: 调试和性能分析

---

## 项目设置

### 1. 获取代码

```bash
# 如果使用Git
git clone <repository-url>
cd plantvs

# 或直接创建项目文件夹
mkdir plantvs
cd plantvs
```

### 2. 项目结构

```
plantvs/
├── index.html           # 主HTML文件 - 游戏容器
├── styles.css           # 全局样式 - 布局和UI
├── game.js              # 游戏引擎 - 主循环和渲染
├── entities.js          # 游戏实体 - Plant、Zombie、Bullet、Sun类
├── levels.js            # 关卡配置 - 3个关卡数据
├── ui.js                # UI控制器 - 菜单和界面交互
├── storage.js           # 存储管理 - localStorage封装
├── utils.js             # 工具函数 - 碰撞检测、数学计算
├── README.md            # 项目说明
└── netlify.toml         # Netlify部署配置（可选）
```

### 3. 启动开发服务器

#### 方式1: Python HTTP服务器
```bash
# Python 3
python -m http.server 8000

# 然后在浏览器访问
# http://localhost:8000
```

#### 方式2: Node.js serve
```bash
# 安装serve（仅首次）
npm install -g serve

# 启动服务器
serve -p 8000

# 访问 http://localhost:8000
```

#### 方式3: VS Code Live Server
1. 安装 "Live Server" 扩展
2. 右键 `index.html`
3. 选择 "Open with Live Server"

### 4. 验证安装

打开浏览器访问 http://localhost:8000，应该看到：
- 游戏主界面加载
- "植物大战僵尸" 标题显示
- "开始游戏" 按钮可点击
- 控制台无错误信息

---

## 项目架构

### 文件依赖关系

```
index.html
    ├── Bootstrap (CDN)
    ├── styles.css
    └── JavaScript 加载顺序：
        1. utils.js      (无依赖)
        2. storage.js    (无依赖)
        3. entities.js   (依赖 utils.js)
        4. levels.js     (依赖 entities.js)
        5. ui.js         (依赖 game.js, storage.js)
        6. game.js       (依赖所有)
```

**重要**: 必须按此顺序加载JavaScript文件，否则会出现未定义错误。

### 核心模块说明

#### game.js - 游戏引擎
```javascript
// 主要类和函数
class GameEngine {
  constructor(canvas, config)
  start()
  gameLoop(timestamp)
  update(deltaTime)
  render(interpolation)
  loadLevel(levelId)
}

class InputHandler {
  handlePointerDown(event)
  getCanvasCoordinates(event)
}

class Renderer {
  drawPlant(plant)
  drawZombie(zombie)
  drawUI(gameState)
}
```

#### entities.js - 游戏实体
```javascript
// 实体类
class Plant {
  update(deltaTime)
  takeDamage(amount)
  performAttack()
}

class Zombie {
  update(deltaTime)
  move(deltaTime)
  attackPlant(plant)
}

class Projectile {
  update(deltaTime)
  checkCollision(zombies)
}

class Sun {
  update(deltaTime)
  collect(targetPos)
}

// 对象池
ProjectilePool.get() / .release(projectile)
SunPool.get() / .release(sun)
```

#### levels.js - 关卡配置
```javascript
// 关卡数据
const LEVEL_1 = {
  id: 1,
  initialSun: 50,
  availablePlants: [PlantType.SUNFLOWER, ...],
  waves: [...]
};

const LEVELS = [LEVEL_1, LEVEL_2, LEVEL_3];
```

#### ui.js - UI控制器
```javascript
class UIController {
  showMenu()
  showLevelSelect()
  showPauseMenu()
  showVictoryScreen()
  showTooltip(message)
}
```

#### storage.js - 存储管理
```javascript
const Storage = {
  save(progress)
  load()
  reset()
};
```

#### utils.js - 工具函数
```javascript
function checkCollision(entity1, entity2)
function getDistance(x1, y1, x2, y2)
function clamp(value, min, max)
```

---

## 开发工作流

### 1. 添加新植物类型

**步骤**:

1. 在 `entities.js` 的 `PlantType` 枚举中添加新类型:
```javascript
const PlantType = {
  // ...existing types
  NEW_PLANT: 'new_plant'
};
```

2. 在 `PLANT_CONFIGS` 中添加配置:
```javascript
[PlantType.NEW_PLANT]: {
  name: '新植物',
  cost: 150,
  cooldown: 10,
  maxHealth: 300,
  attackPower: 30,
  attackSpeed: 1.0,
  description: '新植物的描述'
}
```

3. 在 `Plant` 类的 `update()` 方法中添加特殊逻辑（如需要）

4. 在 `Renderer` 类的 `drawPlant()` 方法中添加绘制逻辑

5. 在关卡配置（`levels.js`）中将新植物添加到 `availablePlants` 列表

### 2. 添加新僵尸类型

**步骤**:

1. 在 `ZombieType` 枚举中添加新类型
2. 在 `ZOMBIE_CONFIGS` 中添加配置
3. 在 `drawZombie()` 中添加绘制逻辑
4. 在关卡波次配置中使用新僵尸

### 3. 创建新关卡

**步骤**:

1. 在 `levels.js` 中定义新关卡对象:
```javascript
const LEVEL_4 = {
  id: 4,
  name: '第四关',
  difficulty: 4,
  initialSun: 50,
  availablePlants: [...],
  waves: [
    {
      waveNumber: 1,
      delay: 10,
      zombies: [
        {type: ZombieType.NORMAL, row: 0, delay: 0},
        // ... more zombies
      ]
    },
    // ... more waves
  ]
};
```

2. 将新关卡添加到 `LEVELS` 数组

3. 更新关卡选择UI显示新关卡

### 4. 调整游戏平衡

**配置文件位置**: `entities.js` 中的 `PLANT_CONFIGS` 和 `ZOMBIE_CONFIGS`

**可调整参数**:
- 植物: `cost`, `cooldown`, `maxHealth`, `attackPower`, `attackSpeed`
- 僵尸: `maxHealth`, `speed`, `attackPower`
- 阳光: `SUN_DROP_INTERVAL`, `SUN_VALUE_SKY`（在 `game.js` 中）

**调整建议**:
1. 先调整单个参数
2. 测试完整关卡
3. 记录调整前后的胜率
4. 迭代优化

---

## 调试技巧

### 1. 浏览器开发工具

**打开方式**:
- Chrome/Edge: F12 或 Ctrl+Shift+I
- Firefox: F12 或 Ctrl+Shift+K
- Safari: Cmd+Option+I

**常用面板**:
- **Console**: 查看日志和错误
- **Elements**: 检查DOM和CSS
- **Sources**: 调试JavaScript代码
- **Network**: 检查资源加载
- **Performance**: 分析性能瓶颈
- **Memory**: 检测内存泄漏

### 2. 添加调试日志

```javascript
// 在关键位置添加日志
console.log('僵尸生成:', zombie);
console.log('当前阳光:', this.state.sun);

// 使用console.table查看数组
console.table(this.state.plants);

// 性能测量
console.time('update');
this.update(deltaTime);
console.timeEnd('update');
```

### 3. 断点调试

```javascript
// 代码中设置断点
debugger;

// 或在浏览器Sources面板中点击行号设置断点
```

### 4. 游戏状态检查器

在 `game.js` 中添加调试辅助函数:

```javascript
// 添加到window对象以便在控制台访问
window.debugGame = {
  getState: () => this.gameState,
  getSun: () => this.gameState.sun,
  addSun: (amount) => { this.gameState.sun += amount; },
  spawnZombie: (type, row) => { /* spawn logic */ },
  killAllZombies: () => { this.gameState.zombies = []; }
};

// 在控制台使用
// debugGame.addSun(1000);
// debugGame.killAllZombies();
```

### 5. 帧率监控

```javascript
// 添加到game.js的render方法
let lastFrameTime = 0;
let frameCount = 0;

function showFPS() {
  frameCount++;
  const now = performance.now();
  if (now - lastFrameTime >= 1000) {
    console.log('FPS:', frameCount);
    frameCount = 0;
    lastFrameTime = now;
  }
}
```

---

## 测试指南

### 手动测试清单

#### 功能测试
- [ ] 主菜单显示正常
- [ ] 点击开始游戏进入关卡选择
- [ ] 关卡1可以进入游戏
- [ ] 阳光掉落和收集正常
- [ ] 能够种植每种植物
- [ ] 植物冷却正常工作
- [ ] 僵尸正常生成和移动
- [ ] 豌豆射手正常攻击僵尸
- [ ] 僵尸攻击植物正常
- [ ] 僵尸到达边界触发失败
- [ ] 消灭所有僵尸触发胜利
- [ ] 暂停/继续功能正常
- [ ] 关卡解锁机制正常
- [ ] 进度保存和加载正常

#### 兼容性测试
- [ ] Chrome浏览器正常运行
- [ ] Firefox浏览器正常运行
- [ ] Safari浏览器正常运行（Mac/iOS）
- [ ] Edge浏览器正常运行
- [ ] 桌面端显示正常
- [ ] 手机竖屏显示正常
- [ ] 触控操作流畅
- [ ] 横屏提示正常显示

#### 性能测试
- [ ] 页面加载时间 <5秒
- [ ] 游戏帧率 ≥30fps
- [ ] 操作响应时间 <100ms
- [ ] 长时间游玩无卡顿
- [ ] 内存使用稳定（无泄漏）

#### 边界测试
- [ ] 阳光不足时无法种植（显示提示）
- [ ] 植物冷却中无法种植（显示提示）
- [ ] 已占用格子无法种植（显示提示）
- [ ] 阳光达到上限（9990）提示
- [ ] 清空localStorage后游戏正常

---

## 性能优化建议

### 1. 渲染优化

```javascript
// 使用离屏Canvas预渲染静态背景
const bgCanvas = document.createElement('canvas');
const bgCtx = bgCanvas.getContext('2d');
// 绘制背景到bgCanvas
// 在主渲染中使用：
ctx.drawImage(bgCanvas, 0, 0);
```

### 2. 对象池使用

```javascript
// 避免频繁创建销毁对象
const projectile = ProjectilePool.get();
// 使用完毕后
ProjectilePool.release(projectile);
```

### 3. 减少绘制调用

```javascript
// 批量绘制相同类型实体
ctx.save();
// 设置共同样式
for (const plant of plants) {
  // 仅改变位置和特定属性
  drawPlant(plant);
}
ctx.restore();
```

### 4. 空间分区优化碰撞检测

```javascript
// 按行分组僵尸，只检测同行碰撞
const zombiesByRow = groupByRow(zombies);
for (const projectile of projectiles) {
  const zombiesInRow = zombiesByRow[projectile.row];
  projectile.checkCollision(zombiesInRow);
}
```

---

## 常见问题

### Q: 游戏无法启动，控制台显示 "XXX is not defined"
**A**: 检查JavaScript文件加载顺序，必须按依赖顺序加载。

### Q: Canvas显示空白
**A**: 
1. 检查Canvas尺寸是否设置
2. 检查是否成功获取2D上下文
3. 查看控制台是否有JavaScript错误

### Q: 触控操作不响应（移动端）
**A**:
1. 确认事件监听器已绑定
2. 检查CSS `touch-action` 属性
3. 确认坐标转换正确

### Q: 帧率过低
**A**:
1. 使用Chrome DevTools Performance分析瓶颈
2. 检查是否有大量对象创建（使用对象池）
3. 减少复杂绘制操作
4. 考虑降低游戏逻辑更新频率

### Q: localStorage保存失败
**A**:
1. 检查浏览器是否启用localStorage
2. 检查是否超出容量限制（5-10MB）
3. 确认数据序列化正确

### Q: 部署到Netlify后无法访问
**A**:
1. 检查文件路径是否正确（区分大小写）
2. 确认所有文件都已上传
3. 查看Netlify部署日志

---

## 部署到Netlify

### 方式1: 拖放部署

1. 访问 https://app.netlify.com
2. 登录或注册账号
3. 点击 "Add new site" → "Deploy manually"
4. 将项目文件夹拖放到上传区域
5. 等待部署完成，获取URL

### 方式2: Git部署

1. 将代码推送到GitHub/GitLab
2. 在Netlify中点击 "Add new site" → "Import an existing project"
3. 选择仓库
4. 配置构建设置（静态站点留空）
5. 点击 "Deploy"

### netlify.toml 配置（可选）

```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=3600"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000"
```

---

## 下一步

完成快速开始后，建议：

1. **阅读详细文档**:
   - [data-model.md](./data-model.md) - 理解数据结构
   - [contracts/game-engine.md](./contracts/game-engine.md) - 游戏引擎接口
   - [contracts/entities.md](./contracts/entities.md) - 实体接口
   - [contracts/game-state.md](./contracts/game-state.md) - 状态管理

2. **实践开发任务**:
   - 修改现有植物参数，观察游戏平衡变化
   - 添加一个新的植物类型
   - 创建第4个关卡
   - 优化游戏性能

3. **贡献代码**（如果是团队项目）:
   - 遵循代码规范
   - 测试所有修改
   - 提交Pull Request

---

## 获取帮助

- **项目文档**: 查看 `specs/` 文件夹中的详细文档
- **参考资料**:
  - [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
  - [JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
  - [Netlify Docs](https://docs.netlify.com)

---

**Happy Coding! 🎮🌻🧟**

