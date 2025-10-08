# Game Engine Contract

**Feature**: 竖屏网页版植物大战僵尸游戏  
**Version**: 1.0  
**Date**: 2025-10-08

本文档定义游戏引擎的核心接口和行为契约。

---

## GameEngine（游戏引擎）

游戏引擎是整个游戏的核心控制器，负责初始化、游戏循环、状态管理和渲染。

### 接口定义

```javascript
class GameEngine {
  /**
   * 初始化游戏引擎
   * @param {HTMLCanvasElement} canvas - Canvas元素
   * @param {Object} config - 配置选项
   */
  constructor(canvas, config);
  
  /**
   * 启动游戏引擎
   * @returns {void}
   */
  start();
  
  /**
   * 停止游戏引擎
   * @returns {void}
   */
  stop();
  
  /**
   * 主游戏循环（由requestAnimationFrame调用）
   * @param {number} timestamp - 当前时间戳（毫秒）
   * @returns {void}
   */
  gameLoop(timestamp);
  
  /**
   * 更新游戏逻辑
   * @param {number} deltaTime - 时间增量（毫秒）
   * @returns {void}
   */
  update(deltaTime);
  
  /**
   * 渲染游戏画面
   * @param {number} interpolation - 插值因子（0-1）
   * @returns {void}
   */
  render(interpolation);
  
  /**
   * 加载关卡
   * @param {number} levelId - 关卡ID
   * @returns {Promise<void>}
   */
  loadLevel(levelId);
  
  /**
   * 暂停游戏
   * @returns {void}
   */
  pause();
  
  /**
   * 继续游戏
   * @returns {void}
   */
  resume();
  
  /**
   * 重启当前关卡
   * @returns {void}
   */
  restart();
  
  /**
   * 退出到主菜单
   * @returns {void}
   */
  exitToMenu();
}
```

### 行为契约

#### 1. 初始化（constructor）

**前置条件**:
- `canvas` 必须是有效的HTMLCanvasElement
- Canvas必须支持2D上下文

**后置条件**:
- 游戏引擎实例化完成
- Canvas上下文已获取
- 游戏状态初始化为MENU阶段
- 输入处理器已绑定

**异常**:
- 如果Canvas不支持，抛出错误并显示浏览器不兼容提示

---

#### 2. 启动（start）

**前置条件**:
- 游戏引擎已初始化
- 未处于运行状态

**后置条件**:
- 游戏循环开始运行
- 首帧渲染完成
- 时间戳记录已初始化

**调用示例**:
```javascript
const engine = new GameEngine(canvas, config);
engine.start();
// 游戏循环自动开始
```

---

#### 3. 游戏循环（gameLoop）

**前置条件**:
- 引擎已启动

**执行流程**:
1. 计算deltaTime（当前时间 - 上次时间）
2. 累加到accumulator
3. 当accumulator ≥ FIXED_TIMESTEP时：
   - 调用update(FIXED_TIMESTEP)
   - accumulator -= FIXED_TIMESTEP
   - 重复直到accumulator < FIXED_TIMESTEP
4. 计算插值因子 = accumulator / FIXED_TIMESTEP
5. 调用render(interpolation)
6. 使用requestAnimationFrame调度下一帧

**性能保证**:
- 逻辑更新频率固定为30Hz
- 渲染帧率不低于30fps
- 单帧总时间不超过33ms（移动端）

**伪代码**:
```javascript
gameLoop(timestamp) {
  if (!this.running) return;
  
  const deltaTime = timestamp - this.lastTimestamp;
  this.lastTimestamp = timestamp;
  this.accumulator += deltaTime;
  
  // 固定时间步长更新
  while (this.accumulator >= FIXED_TIMESTEP) {
    this.update(FIXED_TIMESTEP);
    this.accumulator -= FIXED_TIMESTEP;
  }
  
  // 可变帧率渲染
  const interpolation = this.accumulator / FIXED_TIMESTEP;
  this.render(interpolation);
  
  this.frameId = requestAnimationFrame((ts) => this.gameLoop(ts));
}
```

---

#### 4. 更新逻辑（update）

**前置条件**:
- 游戏处于PLAYING状态
- deltaTime > 0

**更新顺序**（严格执行）:
1. 更新计时器（阳光掉落、僵尸生成）
2. 更新阳光（下落、收集动画）
3. 更新植物（攻击计时、生产阳光）
4. 更新僵尸（移动、攻击）
5. 更新子弹（移动）
6. 碰撞检测（子弹-僵尸、僵尸-植物、僵尸-边界）
7. 清理死亡实体
8. 检查胜利/失败条件
9. 更新UI状态

**后置条件**:
- 所有实体状态更新完成
- 游戏状态一致性保持
- 无效实体已移除

**性能要求**:
- update()执行时间 <15ms

---

#### 5. 渲染（render）

**前置条件**:
- Canvas上下文可用
- 游戏状态已更新

**渲染顺序**（严格执行）:
1. 清空Canvas
2. 绘制背景
3. 绘制网格
4. 绘制植物
5. 绘制僵尸
6. 绘制子弹
7. 绘制阳光
8. 绘制UI（阳光计数器、波次、植物卡片）
9. 绘制提示信息（如有）

**后置条件**:
- Canvas显示最新游戏画面
- 所有实体正确渲染
- UI信息正确显示

**性能要求**:
- render()执行时间 <15ms
- 总帧时间（update + render）<33ms

**插值渲染**:
```javascript
// 使用插值因子平滑移动
const displayX = zombie.lastX + (zombie.x - zombie.lastX) * interpolation;
ctx.drawZombie(displayX, zombie.y);
```

---

#### 6. 加载关卡（loadLevel）

**前置条件**:
- levelId 有效（1-3）
- 关卡配置数据已加载

**执行流程**:
1. 清空当前游戏状态
2. 加载关卡配置
3. 初始化网格
4. 设置初始阳光
5. 配置可用植物
6. 加载僵尸波次
7. 切换到PLAYING阶段
8. 开始第一波倒计时

**后置条件**:
- 游戏状态重置为关卡初始状态
- 所有实体列表为空
- 关卡配置已应用
- 游戏阶段为PLAYING

**异常**:
- 如果关卡不存在，返回关卡选择界面并提示错误

**示例**:
```javascript
await engine.loadLevel(1);
// 第一关加载完成，游戏开始
```

---

#### 7. 暂停/继续（pause/resume）

**暂停前置条件**:
- 游戏处于PLAYING状态

**暂停后置条件**:
- 游戏阶段切换为PAUSED
- update()不再执行
- 渲染暂停画面（半透明遮罩 + 暂停菜单）
- 计时器停止

**继续前置条件**:
- 游戏处于PAUSED状态

**继续后置条件**:
- 游戏阶段恢复为PLAYING
- 重置时间累加器
- update()继续执行
- 计时器继续

**示例**:
```javascript
engine.pause();
// 显示暂停菜单

engine.resume();
// 游戏继续
```

---

## InputHandler（输入处理器）

输入处理器负责统一处理鼠标和触控输入。

### 接口定义

```javascript
class InputHandler {
  /**
   * 构造函数
   * @param {HTMLCanvasElement} canvas - Canvas元素
   * @param {GameEngine} engine - 游戏引擎引用
   */
  constructor(canvas, engine);
  
  /**
   * 绑定事件监听器
   * @returns {void}
   */
  bindEvents();
  
  /**
   * 移除事件监听器
   * @returns {void}
   */
  unbindEvents();
  
  /**
   * 处理点击/触控开始
   * @param {Event} event - 事件对象
   * @returns {void}
   */
  handlePointerDown(event);
  
  /**
   * 处理移动
   * @param {Event} event - 事件对象
   * @returns {void}
   */
  handlePointerMove(event);
  
  /**
   * 处理释放
   * @param {Event} event - 事件对象
   * @returns {void}
   */
  handlePointerUp(event);
  
  /**
   * 获取标准化的输入坐标
   * @param {Event} event - 事件对象
   * @returns {{x: number, y: number}} 相对Canvas的坐标
   */
  getCanvasCoordinates(event);
}
```

### 行为契约

#### 1. 绑定事件（bindEvents）

**监听事件**:
- `mousedown` / `touchstart`
- `mousemove` / `touchmove`
- `mouseup` / `touchend`
- `touchcancel`

**事件选项**:
- `passive: false` （需要preventDefault）
- `capture: false`

**示例**:
```javascript
canvas.addEventListener('mousedown', this.handlePointerDown);
canvas.addEventListener('touchstart', this.handlePointerDown, {passive: false});
```

---

#### 2. 处理点击（handlePointerDown）

**前置条件**:
- 事件有效
- Canvas可见

**执行流程**:
1. 阻止默认行为（防止触控滚动）
2. 获取Canvas坐标
3. 根据游戏阶段分发：
   - MENU: 检查按钮点击
   - LEVEL_SELECT: 检查关卡选择
   - PLAYING: 检查植物卡片/网格/阳光点击
   - PAUSED: 检查暂停菜单按钮
4. 触发相应的游戏逻辑

**点击优先级**（从高到低）:
1. UI按钮（暂停、菜单按钮等）
2. 阳光（如果点击位置包含阳光）
3. 植物卡片（如果点击植物栏）
4. 网格（如果已选中植物）

**伪代码**:
```javascript
handlePointerDown(event) {
  event.preventDefault();
  const {x, y} = this.getCanvasCoordinates(event);
  
  // 检查UI按钮
  if (this.checkUIButtons(x, y)) return;
  
  // 检查阳光
  const sun = this.engine.findSunAt(x, y);
  if (sun) {
    this.engine.collectSun(sun);
    return;
  }
  
  // 检查植物卡片
  const plantType = this.engine.getPlantCardAt(x, y);
  if (plantType) {
    this.engine.selectPlant(plantType);
    return;
  }
  
  // 检查网格
  if (this.engine.selectedPlantType) {
    const cell = this.engine.getGridCellAt(x, y);
    if (cell) {
      this.engine.plantSeed(cell, this.engine.selectedPlantType);
    }
  }
}
```

---

#### 3. 获取Canvas坐标（getCanvasCoordinates）

**前置条件**:
- 事件有效

**返回值**:
- `{x: number, y: number}` - 相对Canvas左上角的坐标

**实现**:
```javascript
getCanvasCoordinates(event) {
  const rect = this.canvas.getBoundingClientRect();
  const scaleX = this.canvas.width / rect.width;
  const scaleY = this.canvas.height / rect.height;
  
  const clientX = event.clientX || (event.touches && event.touches[0].clientX);
  const clientY = event.clientY || (event.touches && event.touches[0].clientY);
  
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}
```

---

## Renderer（渲染器）

渲染器负责所有绘制操作。

### 接口定义

```javascript
class Renderer {
  /**
   * 构造函数
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} config - 配置选项
   */
  constructor(ctx, config);
  
  /**
   * 清空Canvas
   * @returns {void}
   */
  clear();
  
  /**
   * 绘制背景
   * @returns {void}
   */
  drawBackground();
  
  /**
   * 绘制网格
   * @param {GridCell[][]} grid - 网格数组
   * @returns {void}
   */
  drawGrid(grid);
  
  /**
   * 绘制植物
   * @param {Plant} plant - 植物实例
   * @param {number} interpolation - 插值因子
   * @returns {void}
   */
  drawPlant(plant, interpolation);
  
  /**
   * 绘制僵尸
   * @param {Zombie} zombie - 僵尸实例
   * @param {number} interpolation - 插值因子
   * @returns {void}
   */
  drawZombie(zombie, interpolation);
  
  /**
   * 绘制子弹
   * @param {Projectile} projectile - 子弹实例
   * @param {number} interpolation - 插值因子
   * @returns {void}
   */
  drawProjectile(projectile, interpolation);
  
  /**
   * 绘制阳光
   * @param {Sun} sun - 阳光实例
   * @param {number} interpolation - 插值因子
   * @returns {void}
   */
  drawSun(sun, interpolation);
  
  /**
   * 绘制UI元素
   * @param {GameState} gameState - 游戏状态
   * @returns {void}
   */
  drawUI(gameState);
  
  /**
   * 绘制文本提示
   * @param {string} message - 提示信息
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {Object} style - 样式选项
   * @returns {void}
   */
  drawText(message, x, y, style);
}
```

### 绘制规范

#### 1. 坐标系统
- 原点：Canvas左上角
- X轴：向右为正
- Y轴：向下为正

#### 2. 颜色规范
```javascript
const COLORS = {
  BACKGROUND: '#87CEEB',      // 天蓝色背景
  GRID_LINE: '#D3D3D3',       // 浅灰网格线
  GRID_HIGHLIGHT: '#FFFF00',  // 黄色高亮（可种植）
  
  PLANT_SUNFLOWER: '#FFD700', // 金黄色
  PLANT_PEASHOOTER: '#228B22', // 深绿色
  PLANT_WALLNUT: '#8B4513',   // 棕色
  
  ZOMBIE_NORMAL: '#8B8B8B',   // 灰色
  ZOMBIE_DAMAGED: '#FF0000',  // 红色（受伤）
  
  SUN_COLOR: '#FFFF00',       // 黄色
  
  UI_TEXT: '#000000',         // 黑色文字
  UI_BACKGROUND: 'rgba(255,255,255,0.8)' // 半透明白色
};
```

#### 3. 字体规范
```javascript
const FONTS = {
  TITLE: 'bold 32px Arial',
  BUTTON: '20px Arial',
  UI: '16px Arial',
  TOOLTIP: '14px Arial'
};
```

---

## 性能契约

### 帧率保证
- **目标**: 30fps（移动端）/ 60fps（桌面端）
- **测量**: 使用`performance.now()`
- **降级策略**: 如果帧率<25fps，降低粒子效果

### 内存管理
- **对象池**: Projectile和Sun使用对象池
- **垃圾回收**: 避免在游戏循环中创建临时对象
- **监控**: Chrome DevTools Memory Profiler

### 响应时间
- **输入延迟**: <100ms
- **UI反馈**: 立即（同帧）

---

## 错误处理契约

### 1. 初始化失败
```javascript
try {
  const engine = new GameEngine(canvas, config);
} catch (error) {
  showError('游戏初始化失败，请刷新页面重试');
  console.error(error);
}
```

### 2. 渲染错误
```javascript
try {
  this.render(interpolation);
} catch (error) {
  console.error('渲染错误', error);
  this.stop();
  showError('渲染出错，游戏已停止');
}
```

### 3. 状态不一致
- 检测到状态不一致时，记录错误并重启关卡
- 避免游戏卡死

---

## 总结

游戏引擎契约定义了：
- ✅ GameEngine核心接口和行为契约
- ✅ 游戏循环的固定时间步长实现
- ✅ InputHandler输入处理规范
- ✅ Renderer渲染接口和绘制规范
- ✅ 性能保证和错误处理契约

所有实现必须遵守此契约，确保游戏的稳定性和一致性。

