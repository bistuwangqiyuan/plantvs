# Game State Management Contract

**Feature**: 竖屏网页版植物大战僵尸游戏  
**Version**: 1.0  
**Date**: 2025-10-08

本文档定义游戏状态管理的接口契约和状态转换规范。

---

## GameStateManager（游戏状态管理器）

游戏状态管理器负责维护游戏的全局状态，处理状态转换和数据持久化。

### 接口定义

```javascript
class GameStateManager {
  /**
   * 构造函数
   * @param {Object} initialState - 初始状态配置
   */
  constructor(initialState);
  
  /**
   * 获取当前游戏状态
   * @returns {GameState} 游戏状态对象
   */
  getState();
  
  /**
   * 更新游戏状态
   * @param {Object} updates - 部分状态更新
   * @returns {void}
   */
  setState(updates);
  
  /**
   * 切换游戏阶段
   * @param {GamePhase} newPhase - 新阶段
   * @param {Object} context - 上下文数据
   * @returns {boolean} 是否切换成功
   */
  transitionTo(newPhase, context = {});
  
  /**
   * 重置游戏状态
   * @returns {void}
   */
  reset();
  
  /**
   * 保存游戏进度
   * @returns {boolean} 是否保存成功
   */
  saveProgress();
  
  /**
   * 加载游戏进度
   * @returns {PlayerProgress|null} 玩家进度，失败返回null
   */
  loadProgress();
  
  /**
   * 检查关卡是否解锁
   * @param {number} levelId - 关卡ID
   * @returns {boolean} 是否解锁
   */
  isLevelUnlocked(levelId);
  
  /**
   * 解锁关卡
   * @param {number} levelId - 关卡ID
   * @returns {void}
   */
  unlockLevel(levelId);
}
```

---

## GameState（游戏状态）

游戏的核心运行时状态结构。

### 状态结构契约

```javascript
{
  // 游戏阶段
  phase: GamePhase,  // MENU | LEVEL_SELECT | PLAYING | PAUSED | VICTORY | DEFEAT
  
  // 关卡信息
  currentLevel: number,      // 当前关卡ID (1-3)
  levelConfig: LevelConfig,  // 关卡配置对象
  
  // 游戏资源
  sun: number,              // 当前阳光数量 (0-9990)
  
  // 波次信息
  wave: number,             // 当前波次 (1-totalWaves)
  totalWaves: number,       // 总波次数
  waveTimer: number,        // 下一波倒计时（秒）
  
  // 游戏实体
  plants: Plant[],          // 场上植物列表
  zombies: Zombie[],        // 场上僵尸列表
  projectiles: Projectile[], // 场上子弹列表
  suns: Sun[],              // 场上阳光列表
  
  // 网格系统
  grid: GridCell[][],       // 5行×3列网格
  
  // 植物系统
  selectedPlantType: PlantType|null, // 当前选中的植物类型
  plantCooldowns: Map<PlantType, number>, // 植物冷却计时器（毫秒）
  
  // 时间信息
  startTime: number,        // 关卡开始时间戳
  elapsedTime: number,      // 已用时间（秒）
  isPaused: boolean,        // 是否暂停
  
  // 统计信息
  zombiesKilled: number,    // 已击杀僵尸数
  sunCollected: number,     // 已收集阳光总数
  plantsPlanted: number,    // 已种植植物数
  
  // UI状态
  showTooltip: boolean,     // 是否显示提示
  tooltipText: string,      // 提示文字
  tooltipDuration: number   // 提示持续时间（毫秒）
}
```

### 状态验证规则

```javascript
/**
 * 验证游戏状态的一致性
 * @param {GameState} state - 游戏状态
 * @returns {{valid: boolean, errors: string[]}} 验证结果
 */
function validateGameState(state) {
  const errors = [];
  
  // 阳光范围检查
  if (state.sun < 0 || state.sun > 9990) {
    errors.push(`阳光数量异常: ${state.sun}`);
  }
  
  // 波次检查
  if (state.wave < 1 || state.wave > state.totalWaves) {
    errors.push(`波次异常: ${state.wave}/${state.totalWaves}`);
  }
  
  // 网格检查
  if (!state.grid || state.grid.length !== 5) {
    errors.push('网格行数必须为5');
  }
  if (state.grid.some(row => row.length !== 3)) {
    errors.push('网格列数必须为3');
  }
  
  // 植物位置检查
  for (const plant of state.plants) {
    const {row, col} = plant.position;
    if (row < 0 || row >= 5 || col < 0 || col >= 3) {
      errors.push(`植物位置超出范围: row=${row}, col=${col}`);
    }
  }
  
  // 僵尸行检查
  for (const zombie of state.zombies) {
    if (zombie.row < 0 || zombie.row >= 5) {
      errors.push(`僵尸行号超出范围: row=${zombie.row}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## 状态转换契约

### 状态转换图

```
┌──────┐     点击开始游戏      ┌──────────────┐
│ MENU │ ──────────────────> │ LEVEL_SELECT │
└──────┘                      └──────────────┘
                                      │
                                选择关卡│
                                      ↓
                              ┌────────────┐
                              │  PLAYING   │<──┐
                              └────────────┘   │
                                │  │  │        │
                         暂停───┘  │  └───胜利/失败
                                   │
                                   ↓
                              ┌────────────┐
                              │   PAUSED   │
                              └────────────┘
                                   │
                            继续────┘

┌──────────┐     下一关/重玩      ┌──────────────┐
│ VICTORY  │ <──────────────────> │ LEVEL_SELECT │
└──────────┘                      └──────────────┘
                                        ^
                                        │
┌──────────┐     重玩/退出             │
│  DEFEAT  │ ───────────────────────────┘
└──────────┘
```

### 转换规则

#### 1. MENU → LEVEL_SELECT

```javascript
/**
 * 从主菜单进入关卡选择
 * @returns {boolean} 是否成功
 */
transitionToLevelSelect() {
  // 前置条件
  if (this.state.phase !== GamePhase.MENU) {
    return false;
  }
  
  // 执行转换
  this.setState({
    phase: GamePhase.LEVEL_SELECT
  });
  
  // 加载玩家进度
  const progress = this.loadProgress();
  if (progress) {
    this.applyProgress(progress);
  }
  
  return true;
}
```

**前置条件**:
- 当前阶段为 MENU

**后置条件**:
- 阶段切换为 LEVEL_SELECT
- 玩家进度已加载
- 显示关卡列表和解锁状态

---

#### 2. LEVEL_SELECT → PLAYING

```javascript
/**
 * 从关卡选择进入游戏
 * @param {number} levelId - 关卡ID
 * @returns {boolean} 是否成功
 */
transitionToPlaying(levelId) {
  // 前置条件
  if (this.state.phase !== GamePhase.LEVEL_SELECT) {
    return false;
  }
  
  if (!this.isLevelUnlocked(levelId)) {
    this.showTooltip('该关卡尚未解锁');
    return false;
  }
  
  // 加载关卡
  const levelConfig = this.loadLevelConfig(levelId);
  if (!levelConfig) {
    this.showTooltip('关卡加载失败');
    return false;
  }
  
  // 执行转换
  this.setState({
    phase: GamePhase.PLAYING,
    currentLevel: levelId,
    levelConfig: levelConfig,
    sun: levelConfig.initialSun,
    wave: 0,
    totalWaves: levelConfig.waves.length,
    plants: [],
    zombies: [],
    projectiles: [],
    suns: [],
    selectedPlantType: null,
    plantCooldowns: new Map(),
    startTime: Date.now(),
    elapsedTime: 0,
    isPaused: false,
    zombiesKilled: 0,
    sunCollected: 0,
    plantsPlanted: 0
  });
  
  // 初始化网格
  this.initializeGrid();
  
  // 启动第一波倒计时
  this.startWaveTimer(levelConfig.waves[0].delay);
  
  return true;
}
```

**前置条件**:
- 当前阶段为 LEVEL_SELECT
- 关卡已解锁
- 关卡配置有效

**后置条件**:
- 阶段切换为 PLAYING
- 游戏状态重置为关卡初始状态
- 网格初始化完成
- 第一波倒计时开始

---

#### 3. PLAYING → PAUSED

```javascript
/**
 * 暂停游戏
 * @returns {boolean} 是否成功
 */
transitionToPaused() {
  // 前置条件
  if (this.state.phase !== GamePhase.PLAYING) {
    return false;
  }
  
  // 执行转换
  this.setState({
    phase: GamePhase.PAUSED,
    isPaused: true
  });
  
  // 停止计时器
  this.pauseTimers();
  
  return true;
}
```

**前置条件**:
- 当前阶段为 PLAYING

**后置条件**:
- 阶段切换为 PAUSED
- `isPaused` 设置为 true
- 游戏更新停止
- 显示暂停菜单

---

#### 4. PAUSED → PLAYING

```javascript
/**
 * 继续游戏
 * @returns {boolean} 是否成功
 */
transitionToResumed() {
  // 前置条件
  if (this.state.phase !== GamePhase.PAUSED) {
    return false;
  }
  
  // 执行转换
  this.setState({
    phase: GamePhase.PLAYING,
    isPaused: false
  });
  
  // 恢复计时器
  this.resumeTimers();
  
  return true;
}
```

**前置条件**:
- 当前阶段为 PAUSED

**后置条件**:
- 阶段切换为 PLAYING
- `isPaused` 设置为 false
- 游戏更新继续
- 时间累加器重置

---

#### 5. PLAYING → VICTORY

```javascript
/**
 * 游戏胜利
 * @returns {boolean} 是否成功
 */
transitionToVictory() {
  // 前置条件
  if (this.state.phase !== GamePhase.PLAYING) {
    return false;
  }
  
  // 检查胜利条件
  if (!this.checkVictoryCondition()) {
    return false;
  }
  
  // 执行转换
  this.setState({
    phase: GamePhase.VICTORY,
    isPaused: true
  });
  
  // 解锁下一关
  const nextLevel = this.state.currentLevel + 1;
  if (nextLevel <= 3) {
    this.unlockLevel(nextLevel);
  }
  
  // 保存进度
  this.saveProgress();
  
  // 显示胜利界面
  this.showVictoryScreen();
  
  return true;
}

/**
 * 检查胜利条件
 * @returns {boolean} 是否满足胜利条件
 */
checkVictoryCondition() {
  // 所有波次已出现
  if (this.state.wave < this.state.totalWaves) {
    return false;
  }
  
  // 场上没有僵尸
  if (this.state.zombies.length > 0) {
    return false;
  }
  
  return true;
}
```

**前置条件**:
- 当前阶段为 PLAYING
- 所有僵尸波次已出现
- 场上所有僵尸已被消灭

**后置条件**:
- 阶段切换为 VICTORY
- 下一关已解锁（如果有）
- 进度已保存
- 显示胜利界面

---

#### 6. PLAYING → DEFEAT

```javascript
/**
 * 游戏失败
 * @returns {boolean} 是否成功
 */
transitionToDefeat() {
  // 前置条件
  if (this.state.phase !== GamePhase.PLAYING) {
    return false;
  }
  
  // 检查失败条件
  if (!this.checkDefeatCondition()) {
    return false;
  }
  
  // 执行转换
  this.setState({
    phase: GamePhase.DEFEAT,
    isPaused: true
  });
  
  // 显示失败界面
  this.showDefeatScreen();
  
  return true;
}

/**
 * 检查失败条件
 * @returns {boolean} 是否满足失败条件
 */
checkDefeatCondition() {
  // 检查是否有僵尸到达边界
  for (const zombie of this.state.zombies) {
    if (zombie.x <= ZOMBIE_DEFEAT_X) {
      return true;
    }
  }
  
  return false;
}
```

**前置条件**:
- 当前阶段为 PLAYING
- 至少一个僵尸到达左侧边界

**后置条件**:
- 阶段切换为 DEFEAT
- 显示失败界面
- 提供重玩或退出选项

---

#### 7. VICTORY/DEFEAT → LEVEL_SELECT

```javascript
/**
 * 返回关卡选择
 * @returns {boolean} 是否成功
 */
transitionToLevelSelectFromEnd() {
  // 前置条件
  if (this.state.phase !== GamePhase.VICTORY && 
      this.state.phase !== GamePhase.DEFEAT) {
    return false;
  }
  
  // 执行转换
  this.setState({
    phase: GamePhase.LEVEL_SELECT,
    currentLevel: 0,
    isPaused: false
  });
  
  // 清空游戏实体
  this.clearGameEntities();
  
  return true;
}
```

**前置条件**:
- 当前阶段为 VICTORY 或 DEFEAT

**后置条件**:
- 阶段切换为 LEVEL_SELECT
- 游戏实体已清空
- 可以选择新关卡

---

## 植物种植状态管理

### 选择植物

```javascript
/**
 * 选择植物类型
 * @param {PlantType} plantType - 植物类型
 * @returns {boolean} 是否成功选择
 */
selectPlant(plantType) {
  // 检查阳光是否足够
  const config = PLANT_CONFIGS[plantType];
  if (this.state.sun < config.cost) {
    this.showTooltip(`阳光不足！需要${config.cost}阳光`);
    return false;
  }
  
  // 检查是否在冷却中
  const cooldown = this.state.plantCooldowns.get(plantType) || 0;
  if (cooldown > 0) {
    this.showTooltip(`冷却中，还需${(cooldown / 1000).toFixed(1)}秒`);
    return false;
  }
  
  // 检查关卡是否可用该植物
  if (!this.state.levelConfig.availablePlants.includes(plantType)) {
    this.showTooltip('该关卡不可使用此植物');
    return false;
  }
  
  // 选择植物
  this.setState({
    selectedPlantType: plantType
  });
  
  return true;
}
```

---

### 种植植物

```javascript
/**
 * 在网格格子种植植物
 * @param {GridCell} cell - 网格格子
 * @param {PlantType} plantType - 植物类型
 * @returns {boolean} 是否成功种植
 */
plantSeed(cell, plantType) {
  // 检查格子是否为空
  if (!cell.isEmpty()) {
    this.showTooltip('该位置已有植物');
    return false;
  }
  
  // 检查阳光（再次确认）
  const config = PLANT_CONFIGS[plantType];
  if (this.state.sun < config.cost) {
    this.showTooltip(`阳光不足！需要${config.cost}阳光`);
    return false;
  }
  
  // 创建植物
  const plant = new Plant(plantType, cell.position, config);
  
  // 更新状态
  this.setState({
    plants: [...this.state.plants, plant],
    sun: this.state.sun - config.cost,
    selectedPlantType: null,
    plantsPlanted: this.state.plantsPlanted + 1
  });
  
  // 设置格子引用
  cell.plant = plant;
  
  // 启动冷却
  this.startPlantCooldown(plantType, config.cooldown);
  
  return true;
}
```

---

### 冷却管理

```javascript
/**
 * 启动植物冷却
 * @param {PlantType} plantType - 植物类型
 * @param {number} cooldownSeconds - 冷却时间（秒）
 * @returns {void}
 */
startPlantCooldown(plantType, cooldownSeconds) {
  const cooldownMs = cooldownSeconds * 1000;
  this.state.plantCooldowns.set(plantType, cooldownMs);
}

/**
 * 更新植物冷却
 * @param {number} deltaTime - 时间增量（毫秒）
 * @returns {void}
 */
updatePlantCooldowns(deltaTime) {
  for (const [plantType, cooldown] of this.state.plantCooldowns) {
    const newCooldown = Math.max(0, cooldown - deltaTime);
    this.state.plantCooldowns.set(plantType, newCooldown);
  }
}
```

---

## 阳光管理

### 收集阳光

```javascript
/**
 * 收集阳光
 * @param {Sun} sun - 阳光实例
 * @returns {boolean} 是否成功收集
 */
collectSun(sun) {
  // 检查阳光状态
  if (sun.state !== SunState.IDLE && sun.state !== SunState.FALLING) {
    return false;
  }
  
  // 检查阳光上限
  if (this.state.sun >= 9990) {
    this.showTooltip('阳光已达上限');
    return false;
  }
  
  // 收集阳光
  const targetPos = {x: 50, y: 20}; // 阳光计数器位置
  sun.collect(targetPos);
  
  // 延迟增加阳光（等动画完成）
  setTimeout(() => {
    this.setState({
      sun: Math.min(9990, this.state.sun + sun.value),
      sunCollected: this.state.sunCollected + sun.value
    });
    
    // 移除阳光
    this.removeSun(sun);
  }, 500);
  
  return true;
}
```

---

## 僵尸波次管理

### 生成僵尸波

```javascript
/**
 * 生成僵尸波
 * @param {number} waveNumber - 波次编号
 * @returns {void}
 */
spawnWave(waveNumber) {
  const waveConfig = this.state.levelConfig.waves[waveNumber - 1];
  if (!waveConfig) return;
  
  // 更新波次
  this.setState({
    wave: waveNumber
  });
  
  // 生成僵尸
  for (const spawnConfig of waveConfig.zombies) {
    setTimeout(() => {
      this.spawnZombie(spawnConfig);
    }, spawnConfig.delay * 1000);
  }
  
  // 设置下一波倒计时
  if (waveNumber < this.state.totalWaves) {
    const nextWaveConfig = this.state.levelConfig.waves[waveNumber];
    this.startWaveTimer(nextWaveConfig.delay);
  }
}

/**
 * 生成单个僵尸
 * @param {ZombieSpawn} spawnConfig - 生成配置
 * @returns {void}
 */
spawnZombie(spawnConfig) {
  const config = ZOMBIE_CONFIGS[spawnConfig.type];
  const zombie = new Zombie(spawnConfig.type, spawnConfig.row, config);
  
  this.setState({
    zombies: [...this.state.zombies, zombie]
  });
}
```

---

## 数据持久化契约

### 保存进度

```javascript
/**
 * 保存游戏进度到localStorage
 * @returns {boolean} 是否成功
 */
saveProgress() {
  try {
    const progress = {
      version: '1.0',
      unlockedLevels: this.getUnlockedLevels(),
      lastPlayed: new Date().toISOString()
    };
    
    localStorage.setItem('plantsvszombies_progress', JSON.stringify(progress));
    return true;
  } catch (error) {
    console.error('保存进度失败', error);
    this.showTooltip('保存进度失败');
    return false;
  }
}
```

**异常处理**:
- localStorage不可用：降级为会话存储
- 容量超限：清理旧数据（不应发生）
- 写入失败：提示用户，但不影响游戏

---

### 加载进度

```javascript
/**
 * 从localStorage加载游戏进度
 * @returns {PlayerProgress|null} 玩家进度，失败返回null
 */
loadProgress() {
  try {
    const data = localStorage.getItem('plantsvszombies_progress');
    if (!data) {
      return this.getDefaultProgress();
    }
    
    const progress = JSON.parse(data);
    
    // 版本检查
    if (progress.version !== '1.0') {
      console.warn('进度版本不匹配，使用默认进度');
      return this.getDefaultProgress();
    }
    
    return progress;
  } catch (error) {
    console.error('加载进度失败', error);
    return this.getDefaultProgress();
  }
}

/**
 * 获取默认进度
 * @returns {PlayerProgress} 默认进度
 */
getDefaultProgress() {
  return {
    version: '1.0',
    unlockedLevels: [1], // 默认第一关解锁
    lastPlayed: null
  };
}
```

---

### 重置进度

```javascript
/**
 * 重置游戏进度
 * @returns {boolean} 是否成功
 */
resetProgress() {
  // 确认对话框（由UI层处理）
  if (!confirm('确定要重置所有进度吗？此操作不可撤销。')) {
    return false;
  }
  
  try {
    localStorage.removeItem('plantsvszombies_progress');
    
    // 重置状态
    this.applyProgress(this.getDefaultProgress());
    
    this.showTooltip('进度已重置');
    return true;
  } catch (error) {
    console.error('重置进度失败', error);
    this.showTooltip('重置进度失败');
    return false;
  }
}
```

---

## UI状态管理

### 显示提示

```javascript
/**
 * 显示临时提示信息
 * @param {string} message - 提示内容
 * @param {number} duration - 持续时间（毫秒），默认2000
 * @returns {void}
 */
showTooltip(message, duration = 2000) {
  this.setState({
    showTooltip: true,
    tooltipText: message,
    tooltipDuration: duration
  });
  
  // 自动隐藏
  setTimeout(() => {
    this.setState({
      showTooltip: false
    });
  }, duration);
}
```

---

## 状态快照与调试

### 创建状态快照

```javascript
/**
 * 创建游戏状态快照（用于调试）
 * @returns {Object} 状态快照
 */
createSnapshot() {
  return {
    timestamp: Date.now(),
    phase: this.state.phase,
    level: this.state.currentLevel,
    wave: this.state.wave,
    sun: this.state.sun,
    plantCount: this.state.plants.length,
    zombieCount: this.state.zombies.length,
    elapsedTime: this.state.elapsedTime
  };
}
```

---

## 总结

游戏状态管理契约定义了：
- ✅ GameStateManager接口和职责
- ✅ GameState结构和验证规则
- ✅ 7种状态转换规则和前后置条件
- ✅ 植物种植流程和冷却管理
- ✅ 阳光收集和管理机制
- ✅ 僵尸波次生成逻辑
- ✅ 数据持久化（保存/加载/重置）
- ✅ UI状态和提示管理

所有状态操作必须遵守此契约，确保游戏状态的一致性和可追溯性。

