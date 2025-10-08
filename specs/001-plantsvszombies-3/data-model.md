# Data Model: 游戏实体与状态结构

**Feature**: 竖屏网页版植物大战僵尸游戏  
**Date**: 2025-10-08  
**Status**: Completed

本文档定义游戏中所有数据实体、状态结构和关系。

---

## 核心实体 (Core Entities)

### 1. Plant（植物）

植物是玩家种植的防御单位，具有多种类型和能力。

#### 属性 (Properties)

| 属性名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `id` | string | 唯一标识符 | "plant_123" |
| `type` | PlantType | 植物类型枚举 | PEASHOOTER |
| `position` | GridPosition | 网格位置 | {row: 2, col: 1} |
| `health` | number | 当前血量 | 300 |
| `maxHealth` | number | 最大血量 | 300 |
| `cooldown` | number | 冷却时间（秒） | 7.5 |
| `cost` | number | 阳光消耗 | 100 |
| `attackPower` | number | 攻击力（若适用） | 20 |
| `attackSpeed` | number | 攻击间隔（秒） | 1.4 |
| `state` | PlantState | 当前状态 | ACTIVE |
| `lastAttackTime` | number | 上次攻击时间戳 | 1696745600000 |
| `productionTimer` | number | 生产计时器（向日葵） | 24.0 |

#### 枚举类型

**PlantType** (植物类型):
```javascript
const PlantType = {
  SUNFLOWER: 'sunflower',       // 向日葵
  PEASHOOTER: 'peashooter',     // 豌豆射手
  WALLNUT: 'wallnut',           // 坚果墙
  CHERRY_BOMB: 'cherry_bomb',   // 樱桃炸弹
  SNOW_PEA: 'snow_pea'          // 寒冰射手
};
```

**PlantState** (植物状态):
```javascript
const PlantState = {
  ACTIVE: 'active',       // 正常运作
  DAMAGED: 'damaged',     // 受损（血量<50%）
  EXPLODING: 'exploding', // 爆炸中（樱桃炸弹）
  DESTROYED: 'destroyed'  // 已销毁
};
```

#### 行为方法 (Behaviors)

- `update(deltaTime)`: 更新植物状态（攻击计时、生产阳光等）
- `takeDamage(amount)`: 受到伤害
- `canAttack()`: 检查是否可以攻击
- `performAttack()`: 执行攻击（生成子弹）
- `produceSun()`: 生产阳光（向日葵特有）

#### 植物类型配置数据

```javascript
const PLANT_CONFIGS = {
  [PlantType.SUNFLOWER]: {
    name: '向日葵',
    cost: 50,
    cooldown: 7.5,
    maxHealth: 300,
    productionInterval: 24,
    sunProduced: 25,
    description: '生产阳光的基础植物'
  },
  [PlantType.PEASHOOTER]: {
    name: '豌豆射手',
    cost: 100,
    cooldown: 7.5,
    maxHealth: 300,
    attackPower: 20,
    attackSpeed: 1.4,
    projectileSpeed: 200,
    description: '发射豌豆攻击僵尸'
  },
  [PlantType.WALLNUT]: {
    name: '坚果墙',
    cost: 50,
    cooldown: 30,
    maxHealth: 4000,
    description: '高血量防御植物'
  },
  [PlantType.CHERRY_BOMB]: {
    name: '樱桃炸弹',
    cost: 150,
    cooldown: 50,
    explosionDelay: 1.0,
    explosionDamage: 1800,
    explosionRadius: 150,
    description: '爆炸范围伤害'
  },
  [PlantType.SNOW_PEA]: {
    name: '寒冰射手',
    cost: 175,
    cooldown: 7.5,
    maxHealth: 300,
    attackPower: 20,
    attackSpeed: 1.4,
    projectileSpeed: 200,
    slowEffect: 0.5,  // 减速50%
    slowDuration: 10,  // 减速持续10秒
    description: '发射寒冰豌豆并减速僵尸'
  }
};
```

---

### 2. Zombie（僵尸）

僵尸是敌对单位，从右向左移动并攻击植物。

#### 属性 (Properties)

| 属性名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `id` | string | 唯一标识符 | "zombie_456" |
| `type` | ZombieType | 僵尸类型枚举 | NORMAL |
| `row` | number | 所在行（0-4） | 2 |
| `x` | number | X坐标（像素） | 450 |
| `y` | number | Y坐标（像素） | 240 |
| `health` | number | 当前血量 | 200 |
| `maxHealth` | number | 最大血量 | 200 |
| `speed` | number | 移动速度（px/s） | 30 |
| `attackPower` | number | 攻击力 | 100 |
| `state` | ZombieState | 当前状态 | WALKING |
| `targetPlant` | Plant | 攻击目标植物 | null |
| `slowMultiplier` | number | 减速倍率 | 1.0 |
| `slowEndTime` | number | 减速结束时间 | 0 |

#### 枚举类型

**ZombieType** (僵尸类型):
```javascript
const ZombieType = {
  NORMAL: 'normal',         // 普通僵尸
  CONE_HEAD: 'cone_head',   // 路障僵尸
  BUCKET_HEAD: 'bucket_head' // 铁桶僵尸
};
```

**ZombieState** (僵尸状态):
```javascript
const ZombieState = {
  WALKING: 'walking',   // 行走中
  ATTACKING: 'attacking', // 攻击植物
  SLOWED: 'slowed',     // 被减速
  DYING: 'dying',       // 死亡动画
  DEAD: 'dead'          // 已死亡
};
```

#### 行为方法 (Behaviors)

- `update(deltaTime)`: 更新僵尸状态（移动、攻击）
- `move(deltaTime)`: 向左移动
- `takeDamage(amount, effects)`: 受到伤害和效果（减速等）
- `attackPlant(plant)`: 攻击植物
- `applySlow(multiplier, duration)`: 应用减速效果
- `checkBoundary()`: 检查是否到达边界

#### 僵尸类型配置数据

```javascript
const ZOMBIE_CONFIGS = {
  [ZombieType.NORMAL]: {
    name: '普通僵尸',
    maxHealth: 200,
    speed: 30,
    attackPower: 100,
    attackSpeed: 1.0,  // 每秒攻击次数
    description: '最基础的僵尸'
  },
  [ZombieType.CONE_HEAD]: {
    name: '路障僵尸',
    maxHealth: 640,
    speed: 30,
    attackPower: 100,
    attackSpeed: 1.0,
    description: '戴路障的僵尸，血量更高'
  },
  [ZombieType.BUCKET_HEAD]: {
    name: '铁桶僵尸',
    maxHealth: 1370,
    speed: 30,
    attackPower: 100,
    attackSpeed: 1.0,
    description: '戴铁桶的僵尸，血量极高'
  }
};
```

---

### 3. Projectile（子弹）

植物发射的攻击单位。

#### 属性 (Properties)

| 属性名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `id` | string | 唯一标识符 | "projectile_789" |
| `type` | ProjectileType | 子弹类型 | PEA |
| `x` | number | X坐标 | 150 |
| `y` | number | Y坐标 | 250 |
| `row` | number | 所在行 | 2 |
| `damage` | number | 伤害值 | 20 |
| `speed` | number | 移动速度（px/s） | 200 |
| `effects` | Object | 特殊效果 | {slow: 0.5} |
| `active` | boolean | 是否激活 | true |

#### 枚举类型

**ProjectileType** (子弹类型):
```javascript
const ProjectileType = {
  PEA: 'pea',           // 普通豌豆
  SNOW_PEA: 'snow_pea'  // 寒冰豌豆
};
```

#### 行为方法 (Behaviors)

- `update(deltaTime)`: 更新子弹位置
- `checkCollision(zombies)`: 检测与僵尸的碰撞
- `hit(zombie)`: 命中僵尸
- `reset()`: 重置（对象池复用）

---

### 4. Sun（阳光）

游戏货币资源。

#### 属性 (Properties)

| 属性名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `id` | string | 唯一标识符 | "sun_012" |
| `x` | number | X坐标 | 200 |
| `y` | number | Y坐标 | 100 |
| `value` | number | 阳光值 | 25 |
| `source` | SunSource | 来源类型 | SKY |
| `state` | SunState | 当前状态 | FALLING |
| `targetX` | number | 目标X坐标（收集时） | 50 |
| `targetY` | number | 目标Y坐标（收集时） | 20 |
| `fallSpeed` | number | 下落速度 | 50 |
| `lifetime` | number | 生存时间（秒） | 10 |

#### 枚举类型

**SunSource** (阳光来源):
```javascript
const SunSource = {
  SKY: 'sky',           // 天空掉落
  SUNFLOWER: 'sunflower' // 向日葵生产
};
```

**SunState** (阳光状态):
```javascript
const SunState = {
  FALLING: 'falling',       // 下落中
  IDLE: 'idle',             // 静止等待收集
  COLLECTING: 'collecting', // 被收集中
  COLLECTED: 'collected'    // 已收集
};
```

#### 行为方法 (Behaviors)

- `update(deltaTime)`: 更新阳光状态（下落、移动到计数器）
- `collect(targetPos)`: 被收集
- `checkExpire()`: 检查是否过期

---

### 5. GridCell（网格单元）

游戏区域的种植格子。

#### 属性 (Properties)

| 属性名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `row` | number | 行索引（0-4） | 2 |
| `col` | number | 列索引（0-2） | 1 |
| `x` | number | X坐标（像素） | 150 |
| `y` | number | Y坐标（像素） | 240 |
| `width` | number | 宽度 | 80 |
| `height` | number | 高度 | 80 |
| `plant` | Plant | 已种植的植物 | null |
| `plantable` | boolean | 是否可种植 | true |

#### 行为方法 (Behaviors)

- `isEmpty()`: 检查是否为空
- `plantSeed(plantType)`: 种植植物
- `removePlant()`: 移除植物
- `containsPoint(x, y)`: 检查坐标是否在格子内

---

## 游戏状态结构 (Game State)

### GameState（游戏状态）

游戏的全局运行时状态。

#### 属性 (Properties)

| 属性名 | 类型 | 说明 |
|--------|------|------|
| `currentLevel` | number | 当前关卡编号 |
| `levelConfig` | LevelConfig | 关卡配置 |
| `sun` | number | 当前阳光数量 |
| `wave` | number | 当前波次 |
| `totalWaves` | number | 总波次数 |
| `plants` | Plant[] | 场上所有植物 |
| `zombies` | Zombie[] | 场上所有僵尸 |
| `projectiles` | Projectile[] | 场上所有子弹 |
| `suns` | Sun[] | 场上所有阳光 |
| `grid` | GridCell[][] | 游戏网格（5行×3列） |
| `selectedPlantType` | PlantType | 当前选中的植物类型 |
| `plantCooldowns` | Map<PlantType, number> | 植物冷却计时器 |
| `gamePhase` | GamePhase | 游戏阶段 |
| `isPaused` | boolean | 是否暂停 |
| `startTime` | number | 关卡开始时间 |
| `elapsedTime` | number | 已用时间（秒） |

#### 枚举类型

**GamePhase** (游戏阶段):
```javascript
const GamePhase = {
  MENU: 'menu',               // 主菜单
  LEVEL_SELECT: 'level_select', // 关卡选择
  PLAYING: 'playing',         // 游戏中
  PAUSED: 'paused',           // 暂停
  VICTORY: 'victory',         // 胜利
  DEFEAT: 'defeat'            // 失败
};
```

#### 状态转换规则

```
MENU ──[点击开始游戏]──> LEVEL_SELECT
LEVEL_SELECT ──[选择关卡]──> PLAYING
PLAYING ──[点击暂停]──> PAUSED
PAUSED ──[点击继续]──> PLAYING
PLAYING ──[所有僵尸被消灭]──> VICTORY
PLAYING ──[僵尸到达边界]──> DEFEAT
VICTORY ──[下一关/重玩]──> LEVEL_SELECT
DEFEAT ──[重玩/退出]──> LEVEL_SELECT
```

---

### LevelConfig（关卡配置）

单个关卡的静态配置数据。

#### 属性 (Properties)

| 属性名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `id` | number | 关卡编号 | 1 |
| `name` | string | 关卡名称 | "第一关" |
| `difficulty` | number | 难度星级（1-5） | 1 |
| `initialSun` | number | 初始阳光 | 50 |
| `availablePlants` | PlantType[] | 可用植物 | [SUNFLOWER, PEASHOOTER] |
| `waves` | WaveConfig[] | 僵尸波次配置 | [{delay: 10, zombies: [...]}] |
| `backgroundMusic` | string | 背景音乐（未实现） | null |
| `description` | string | 关卡描述 | "新手教学关卡" |

#### WaveConfig（波次配置）

单次僵尸波的配置。

| 属性名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `waveNumber` | number | 波次编号 | 1 |
| `delay` | number | 延迟时间（秒） | 10 |
| `zombies` | ZombieSpawn[] | 僵尸生成配置 | [{type: NORMAL, row: 2, delay: 0}] |

#### ZombieSpawn（僵尸生成）

单个僵尸的生成配置。

| 属性名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `type` | ZombieType | 僵尸类型 | NORMAL |
| `row` | number | 生成行（0-4） | 2 |
| `delay` | number | 波内延迟（秒） | 0 |

#### 示例关卡配置

```javascript
const LEVEL_1 = {
  id: 1,
  name: '第一关：新手训练',
  difficulty: 1,
  initialSun: 50,
  availablePlants: [
    PlantType.SUNFLOWER,
    PlantType.PEASHOOTER,
    PlantType.WALLNUT
  ],
  waves: [
    {
      waveNumber: 1,
      delay: 10,
      zombies: [
        { type: ZombieType.NORMAL, row: 2, delay: 0 },
        { type: ZombieType.NORMAL, row: 1, delay: 5 },
        { type: ZombieType.NORMAL, row: 3, delay: 8 }
      ]
    },
    {
      waveNumber: 2,
      delay: 20,
      zombies: [
        { type: ZombieType.NORMAL, row: 0, delay: 0 },
        { type: ZombieType.NORMAL, row: 2, delay: 3 },
        { type: ZombieType.NORMAL, row: 4, delay: 6 },
        { type: ZombieType.NORMAL, row: 1, delay: 10 }
      ]
    },
    {
      waveNumber: 3,
      delay: 25,
      zombies: [
        { type: ZombieType.NORMAL, row: 1, delay: 0 },
        { type: ZombieType.NORMAL, row: 2, delay: 2 },
        { type: ZombieType.NORMAL, row: 3, delay: 4 },
        { type: ZombieType.NORMAL, row: 0, delay: 6 },
        { type: ZombieType.NORMAL, row: 4, delay: 8 }
      ]
    }
  ],
  description: '学习基础玩法，使用向日葵和豌豆射手抵御僵尸'
};
```

---

### PlayerProgress（玩家进度）

玩家的游戏进度数据，存储在localStorage。

#### 属性 (Properties)

| 属性名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `version` | string | 数据版本 | "1.0" |
| `unlockedLevels` | number[] | 已解锁关卡 | [1, 2] |
| `levelStats` | Map<number, LevelStats> | 关卡统计 | {1: {...}} |
| `lastPlayed` | string | 最后游玩时间（ISO） | "2025-10-08T10:00:00Z" |

#### LevelStats（关卡统计）

单个关卡的统计信息（可选，用于未来扩展）。

| 属性名 | 类型 | 说明 |
|--------|------|------|
| `completed` | boolean | 是否完成 |
| `bestTime` | number | 最佳完成时间（秒） |
| `attempts` | number | 尝试次数 |

---

## 实体关系图

```
GameState
├── currentLevel ──────> LevelConfig
├── plants[] ──────────> Plant[]
│   └── position ─────> GridCell
├── zombies[] ─────────> Zombie[]
│   └── targetPlant ──> Plant
├── projectiles[] ─────> Projectile[]
├── suns[] ────────────> Sun[]
├── grid[][] ──────────> GridCell[][]
│   └── plant ────────> Plant
└── plantCooldowns ───> Map<PlantType, number>

PlayerProgress
└── unlockedLevels[] ──> LevelConfig[]
```

---

## 数据验证规则

### Plant Validation
- `health` 必须 ≥0 且 ≤maxHealth
- `position` 必须在网格范围内（row: 0-4, col: 0-2）
- `cost` 必须 >0
- `attackSpeed` 必须 >0（如果是攻击型植物）

### Zombie Validation
- `health` 必须 ≥0 且 ≤maxHealth
- `row` 必须在0-4范围内
- `x` 必须 ≥0（屏幕左侧边界）
- `speed` 必须 >0
- `slowMultiplier` 必须在0.1-1.0范围内

### GameState Validation
- `sun` 必须 ≥0 且 ≤9990（阳光上限）
- `wave` 必须 ≥1 且 ≤totalWaves
- `grid` 必须是5行×3列

---

## 常量定义

```javascript
const GAME_CONSTANTS = {
  // 网格配置
  GRID_ROWS: 5,
  GRID_COLS: 3,
  CELL_SIZE: 80,  // 移动端
  CELL_SIZE_DESKTOP: 100,  // 桌面端
  CELL_SPACING: 4,
  
  // 游戏区域
  GAME_WIDTH: 260,  // 3列 * 80 + 间距
  GAME_HEIGHT: 420, // 5行 * 80 + 间距
  
  // 阳光系统
  SUN_VALUE_SKY: 25,
  SUN_VALUE_SUNFLOWER: 25,
  SUN_DROP_INTERVAL: 7000,  // 7秒
  SUN_LIFETIME: 10000,      // 10秒
  MAX_SUN: 9990,
  
  // 性能
  TARGET_FPS: 30,
  FIXED_TIMESTEP: 1000 / 30,
  
  // 边界
  ZOMBIE_START_X: 500,
  ZOMBIE_DEFEAT_X: 0,
  
  // 对象池大小
  PROJECTILE_POOL_SIZE: 50,
  SUN_POOL_SIZE: 20
};
```

---

## 数据流图

### 游戏循环数据流

```
[Input Events] ──> [Input Handler]
                        │
                        ↓
                   [Game State]
                        │
                        ├──> [Update Logic]
                        │    ├── Update Plants
                        │    ├── Update Zombies
                        │    ├── Update Projectiles
                        │    ├── Update Suns
                        │    └── Check Win/Lose
                        │
                        ↓
                   [Render Pipeline]
                        │
                        ├──> Draw Background
                        ├──> Draw Grid
                        ├──> Draw Plants
                        ├──> Draw Zombies
                        ├──> Draw Projectiles
                        ├──> Draw Suns
                        └──> Draw UI
                        │
                        ↓
                   [Canvas Display]
```

### 植物种植数据流

```
[点击植物卡片] ──> selectedPlantType = type
                        │
                        ↓
                 [检查阳光是否足够]
                        │
                        ├─[不足]─> 显示提示
                        │
                        └─[足够]─> [点击网格格子]
                                      │
                                      ↓
                               [检查格子是否为空]
                                      │
                                      ├─[已占用]─> 显示提示
                                      │
                                      └─[空]─> 创建Plant实例
                                               ├─ 减少阳光
                                               ├─ 添加到plants[]
                                               ├─ 设置格子plant引用
                                               └─ 启动冷却计时器
```

---

## 总结

本数据模型定义了：
- ✅ 8个核心实体（Plant, Zombie, Projectile, Sun, GridCell, GameState, LevelConfig, PlayerProgress）
- ✅ 所有实体的属性、类型和行为方法
- ✅ 游戏状态管理和状态转换规则
- ✅ 关卡配置数据结构
- ✅ 数据验证规则和常量定义
- ✅ 实体关系和数据流图

**准备进入合约定义**: 基于此数据模型创建API接口契约

