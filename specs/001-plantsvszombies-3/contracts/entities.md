# Entities Contract

**Feature**: 竖屏网页版植物大战僵尸游戏  
**Version**: 1.0  
**Date**: 2025-10-08

本文档定义游戏实体类的接口契约和行为规范。

---

## Plant（植物）

植物是玩家种植的防御单位，所有植物类型都必须实现此接口。

### 构造函数契约

```javascript
/**
 * 创建植物实例
 * @param {PlantType} type - 植物类型
 * @param {GridPosition} position - 网格位置 {row, col}
 * @param {Object} config - 植物配置（来自PLANT_CONFIGS）
 */
constructor(type, position, config);
```

**前置条件**:
- `type` 必须是有效的PlantType枚举值
- `position` 必须在网格范围内（row: 0-4, col: 0-2）
- `config` 必须包含该植物类型的所有必需属性

**后置条件**:
- 植物实例化完成，所有属性正确设置
- `health` 初始化为 `maxHealth`
- `state` 初始化为 `ACTIVE`
- 如果是向日葵，`productionTimer` 初始化为0
- 如果是攻击型植物，`lastAttackTime` 初始化为0

---

### 核心方法契约

#### 1. update(deltaTime)

更新植物状态。

```javascript
/**
 * 更新植物状态
 * @param {number} deltaTime - 时间增量（毫秒）
 * @returns {void}
 */
update(deltaTime);
```

**前置条件**:
- `deltaTime` > 0
- 植物未被销毁（state !== DESTROYED）

**执行逻辑**（根据植物类型）:
- **向日葵**: 
  - 增加productionTimer
  - 如果达到productionInterval，生产阳光并重置计时器
- **攻击型植物（豌豆射手、寒冰射手）**:
  - 检测同行是否有僵尸
  - 如果有且冷却完成，执行攻击
- **樱桃炸弹**:
  - 增加爆炸倒计时
  - 到达explosionDelay时爆炸
- **坚果墙**:
  - 无特殊逻辑，仅存在即可

**后置条件**:
- 状态更新完成
- 如果生产阳光，通知游戏引擎
- 如果执行攻击，创建子弹
- 如果爆炸，造成范围伤害并标记为DESTROYED

---

#### 2. takeDamage(amount)

植物受到伤害。

```javascript
/**
 * 植物受到伤害
 * @param {number} amount - 伤害值
 * @returns {boolean} 是否仍存活
 */
takeDamage(amount);
```

**前置条件**:
- `amount` >= 0
- 植物处于ACTIVE或DAMAGED状态

**执行流程**:
1. `health -= amount`
2. 如果 `health <= 0`:
   - 设置 `state = DESTROYED`
   - 播放死亡动画（可选）
   - 返回 false
3. 如果 `health < maxHealth * 0.5`:
   - 设置 `state = DAMAGED`（视觉效果：变暗或破损）
4. 返回 true

**后置条件**:
- 血量减少
- 状态更新
- 如果死亡，从游戏中移除

**示例**:
```javascript
const alive = plant.takeDamage(100);
if (!alive) {
  removeFromGame(plant);
}
```

---

#### 3. canAttack()

检查是否可以攻击（仅攻击型植物）。

```javascript
/**
 * 检查是否可以攻击
 * @returns {boolean} 是否可以攻击
 */
canAttack();
```

**返回true的条件**:
- 植物是攻击型（PEASHOOTER, SNOW_PEA）
- 植物处于ACTIVE状态
- 距离上次攻击时间 >= attackSpeed
- 同行存在至少一个僵尸

**返回false的情况**:
- 植物不是攻击型
- 植物已销毁
- 还在冷却中
- 同行没有僵尸

---

#### 4. performAttack()

执行攻击（仅攻击型植物）。

```javascript
/**
 * 执行攻击，创建子弹
 * @returns {Projectile|null} 创建的子弹，如果无法攻击返回null
 */
performAttack();
```

**前置条件**:
- `canAttack()` 返回 true

**执行流程**:
1. 根据植物类型确定子弹类型
2. 创建子弹实例：
   - 位置：植物位置稍右侧
   - 行：植物所在行
   - 伤害：植物attackPower
   - 效果：如果是寒冰射手，附加减速效果
3. 更新 `lastAttackTime` 为当前时间
4. 返回子弹实例

**后置条件**:
- 子弹已创建并添加到游戏
- 攻击冷却开始

**示例**:
```javascript
if (plant.canAttack()) {
  const projectile = plant.performAttack();
  gameState.projectiles.push(projectile);
}
```

---

#### 5. produceSun()

生产阳光（仅向日葵）。

```javascript
/**
 * 生产阳光
 * @returns {Sun} 创建的阳光实例
 */
produceSun();
```

**前置条件**:
- 植物类型为SUNFLOWER
- productionTimer 达到 productionInterval

**执行流程**:
1. 创建Sun实例：
   - 位置：植物位置
   - 来源：SUNFLOWER
   - 值：25
2. 重置 productionTimer 为 0
3. 返回Sun实例

**后置条件**:
- 阳光已创建
- 计时器重置

---

### 特殊植物行为

#### 樱桃炸弹 (Cherry Bomb)

```javascript
/**
 * 樱桃炸弹爆炸
 * @returns {Array<Zombie>} 受影响的僵尸列表
 */
explode();
```

**前置条件**:
- 植物类型为CHERRY_BOMB
- 已过explosionDelay时间

**执行流程**:
1. 获取爆炸范围内所有僵尸（半径explosionRadius）
2. 对每个僵尸造成explosionDamage伤害
3. 设置自身state为DESTROYED
4. 播放爆炸动画
5. 返回受影响的僵尸列表

**范围计算**:
```javascript
const distance = Math.sqrt(
  Math.pow(zombie.x - plant.x, 2) + 
  Math.pow(zombie.y - plant.y, 2)
);
if (distance <= explosionRadius) {
  zombie.takeDamage(explosionDamage);
}
```

---

## Zombie（僵尸）

僵尸是敌对单位，所有僵尸类型都必须实现此接口。

### 构造函数契约

```javascript
/**
 * 创建僵尸实例
 * @param {ZombieType} type - 僵尸类型
 * @param {number} row - 生成行（0-4）
 * @param {Object} config - 僵尸配置（来自ZOMBIE_CONFIGS）
 */
constructor(type, row, config);
```

**前置条件**:
- `type` 必须是有效的ZombieType枚举值
- `row` 必须在0-4范围内
- `config` 必须包含该僵尸类型的所有必需属性

**后置条件**:
- 僵尸实例化完成
- `x` 初始化为 ZOMBIE_START_X（屏幕右侧外）
- `y` 根据row计算
- `health` 初始化为 `maxHealth`
- `state` 初始化为 WALKING
- `slowMultiplier` 初始化为 1.0（无减速）

---

### 核心方法契约

#### 1. update(deltaTime)

更新僵尸状态。

```javascript
/**
 * 更新僵尸状态
 * @param {number} deltaTime - 时间增量（毫秒）
 * @returns {void}
 */
update(deltaTime);
```

**前置条件**:
- `deltaTime` > 0
- 僵尸未死亡（state !== DEAD）

**执行流程**:
1. 更新减速效果（如果有）
2. 根据状态执行相应逻辑：
   - **WALKING**: 调用 `move(deltaTime)`
   - **ATTACKING**: 调用 `attackPlant(targetPlant)`
3. 检查前方是否有植物：
   - 如果有，切换到ATTACKING状态
   - 如果没有且正在攻击，切换回WALKING状态
4. 检查是否到达边界：
   - 如果 `x <= ZOMBIE_DEFEAT_X`，触发游戏失败

**后置条件**:
- 位置更新
- 状态更新
- 如果攻击植物，植物血量减少

---

#### 2. move(deltaTime)

僵尸向左移动。

```javascript
/**
 * 僵尸移动
 * @param {number} deltaTime - 时间增量（毫秒）
 * @returns {void}
 */
move(deltaTime);
```

**前置条件**:
- state === WALKING
- deltaTime > 0

**执行逻辑**:
```javascript
const effectiveSpeed = this.speed * this.slowMultiplier;
this.x -= effectiveSpeed * (deltaTime / 1000);
```

**后置条件**:
- `x` 减少
- 如果被减速，移动速度降低

---

#### 3. takeDamage(amount, effects)

僵尸受到伤害。

```javascript
/**
 * 僵尸受到伤害
 * @param {number} amount - 伤害值
 * @param {Object} effects - 附加效果 {slow: number, slowDuration: number}
 * @returns {boolean} 是否仍存活
 */
takeDamage(amount, effects = {});
```

**前置条件**:
- `amount` >= 0
- 僵尸未死亡

**执行流程**:
1. `health -= amount`
2. 应用附加效果（如减速）
3. 如果 `health <= 0`:
   - 设置 `state = DYING`
   - 播放死亡动画（0.5秒）
   - 之后设置 `state = DEAD`
   - 返回 false
4. 返回 true

**后置条件**:
- 血量减少
- 效果已应用
- 如果死亡，从游戏中移除

---

#### 4. applySlow(multiplier, duration)

应用减速效果。

```javascript
/**
 * 应用减速效果
 * @param {number} multiplier - 速度倍率（0.5 = 减速50%）
 * @param {number} duration - 持续时间（秒）
 * @returns {void}
 */
applySlow(multiplier, duration);
```

**前置条件**:
- `multiplier` 在 0.1-1.0 范围内
- `duration` > 0

**执行流程**:
1. 设置 `slowMultiplier = multiplier`
2. 设置 `slowEndTime = currentTime + duration`
3. 如果已有减速效果，延长时间

**后置条件**:
- 僵尸移动速度降低
- 减速计时器设置

**效果叠加规则**:
- 多个减速效果取最慢的（最小multiplier）
- 持续时间取最长的

---

#### 5. attackPlant(plant)

攻击植物。

```javascript
/**
 * 攻击植物
 * @param {Plant} plant - 目标植物
 * @returns {void}
 */
attackPlant(plant);
```

**前置条件**:
- `plant` 不为null
- 僵尸与植物碰撞
- state === ATTACKING

**执行流程**:
1. 计算攻击伤害（基于attackSpeed和deltaTime）
2. 对植物造成伤害
3. 如果植物死亡，设置targetPlant = null，切换回WALKING

**攻击频率**:
```javascript
// 每秒造成attackPower伤害
const damage = this.attackPower * (deltaTime / 1000);
plant.takeDamage(damage);
```

---

#### 6. checkBoundary()

检查是否到达边界。

```javascript
/**
 * 检查是否到达左侧边界
 * @returns {boolean} 是否到达边界
 */
checkBoundary();
```

**返回值**:
- `true`: 如果 `x <= ZOMBIE_DEFEAT_X`（游戏失败）
- `false`: 否则

---

## Projectile（子弹）

子弹是植物发射的攻击单位。

### 构造函数契约

```javascript
/**
 * 创建子弹实例
 * @param {ProjectileType} type - 子弹类型
 * @param {number} x - 初始X坐标
 * @param {number} y - 初始Y坐标
 * @param {number} row - 所在行
 * @param {number} damage - 伤害值
 * @param {Object} effects - 特殊效果
 */
constructor(type, x, y, row, damage, effects = {});
```

**后置条件**:
- 子弹实例化完成
- `active` 初始化为 true
- 根据type设置速度（PEA: 200px/s, SNOW_PEA: 200px/s）

---

### 核心方法契约

#### 1. update(deltaTime)

更新子弹位置。

```javascript
/**
 * 更新子弹位置
 * @param {number} deltaTime - 时间增量（毫秒）
 * @returns {void}
 */
update(deltaTime);
```

**执行流程**:
```javascript
this.x += this.speed * (deltaTime / 1000);

// 超出屏幕范围标记为不活跃
if (this.x > CANVAS_WIDTH) {
  this.active = false;
}
```

---

#### 2. checkCollision(zombies)

检测与僵尸的碰撞。

```javascript
/**
 * 检测与僵尸碰撞
 * @param {Zombie[]} zombies - 同行的僵尸列表
 * @returns {Zombie|null} 碰撞的僵尸，无碰撞返回null
 */
checkCollision(zombies);
```

**碰撞检测**:
```javascript
for (const zombie of zombies) {
  if (zombie.row !== this.row) continue;
  
  const distance = Math.abs(zombie.x - this.x);
  if (distance < COLLISION_THRESHOLD) {
    return zombie;
  }
}
return null;
```

**COLLISION_THRESHOLD**: 20px

---

#### 3. hit(zombie)

命中僵尸。

```javascript
/**
 * 命中僵尸
 * @param {Zombie} zombie - 被命中的僵尸
 * @returns {void}
 */
hit(zombie);
```

**执行流程**:
1. 对僵尸造成伤害
2. 应用特殊效果（如减速）
3. 标记自身为不活跃
4. 释放到对象池

```javascript
zombie.takeDamage(this.damage, this.effects);
this.active = false;
ProjectilePool.release(this);
```

---

#### 4. reset()

重置子弹状态（对象池复用）。

```javascript
/**
 * 重置子弹到初始状态
 * @returns {void}
 */
reset();
```

**执行流程**:
- 重置所有属性到默认值
- `active = false`

---

## Sun（阳光）

阳光是游戏货币资源。

### 构造函数契约

```javascript
/**
 * 创建阳光实例
 * @param {number} x - 初始X坐标
 * @param {number} y - 初始Y坐标
 * @param {number} value - 阳光值（25或50）
 * @param {SunSource} source - 来源类型
 */
constructor(x, y, value, source);
```

**后置条件**:
- 阳光实例化完成
- `state` 初始化为 FALLING（天空掉落）或 IDLE（向日葵生产）
- `lifetime` 初始化为 10秒

---

### 核心方法契约

#### 1. update(deltaTime)

更新阳光状态。

```javascript
/**
 * 更新阳光状态
 * @param {number} deltaTime - 时间增量（毫秒）
 * @returns {void}
 */
update(deltaTime);
```

**执行流程（根据状态）**:
- **FALLING**: 
  - `y += fallSpeed * (deltaTime / 1000)`
  - 到达目标高度后，切换到IDLE
- **IDLE**: 
  - `lifetime -= deltaTime`
  - 如果 `lifetime <= 0`，标记为过期
- **COLLECTING**: 
  - 向目标位置移动（阳光计数器）
  - 到达后，切换到COLLECTED

---

#### 2. collect(targetPos)

收集阳光。

```javascript
/**
 * 收集阳光
 * @param {{x: number, y: number}} targetPos - 目标位置（阳光计数器）
 * @returns {void}
 */
collect(targetPos);
```

**执行流程**:
1. 设置 `state = COLLECTING`
2. 设置 `targetX = targetPos.x`, `targetY = targetPos.y`
3. 计算移动路径

---

#### 3. checkExpire()

检查是否过期。

```javascript
/**
 * 检查阳光是否过期
 * @returns {boolean} 是否过期
 */
checkExpire();
```

**返回值**:
- `true`: 如果 `lifetime <= 0` 且 `state === IDLE`
- `false`: 否则

---

## 碰撞检测契约

### 子弹-僵尸碰撞

```javascript
/**
 * 检测子弹与僵尸碰撞
 * @param {Projectile[]} projectiles - 子弹列表
 * @param {Zombie[]} zombies - 僵尸列表
 * @returns {void}
 */
function checkProjectileZombieCollision(projectiles, zombies) {
  for (const projectile of projectiles) {
    if (!projectile.active) continue;
    
    // 只检测同行僵尸
    const zombiesInRow = zombies.filter(z => z.row === projectile.row);
    const hitZombie = projectile.checkCollision(zombiesInRow);
    
    if (hitZombie) {
      projectile.hit(hitZombie);
    }
  }
}
```

---

### 僵尸-植物碰撞

```javascript
/**
 * 检测僵尸与植物碰撞
 * @param {Zombie[]} zombies - 僵尸列表
 * @param {Plant[]} plants - 植物列表
 * @returns {void}
 */
function checkZombiePlantCollision(zombies, plants) {
  for (const zombie of zombies) {
    if (zombie.state === ZombieState.DEAD) continue;
    
    // 查找同行最近的植物
    const nearestPlant = findNearestPlantInRow(zombie.row, zombie.x, plants);
    
    if (nearestPlant && isColliding(zombie, nearestPlant)) {
      zombie.state = ZombieState.ATTACKING;
      zombie.targetPlant = nearestPlant;
    } else if (zombie.targetPlant && !isColliding(zombie, zombie.targetPlant)) {
      zombie.state = ZombieState.WALKING;
      zombie.targetPlant = null;
    }
  }
}

function isColliding(zombie, plant) {
  return Math.abs(zombie.x - plant.x) < 40 && zombie.row === plant.position.row;
}
```

---

## 对象池契约

### ProjectilePool（子弹对象池）

```javascript
class ProjectilePool {
  static pool = [];
  
  /**
   * 从对象池获取子弹
   * @returns {Projectile} 子弹实例
   */
  static get() {
    return this.pool.pop() || new Projectile();
  }
  
  /**
   * 归还子弹到对象池
   * @param {Projectile} projectile - 子弹实例
   * @returns {void}
   */
  static release(projectile) {
    projectile.reset();
    if (this.pool.length < PROJECTILE_POOL_SIZE) {
      this.pool.push(projectile);
    }
  }
}
```

### SunPool（阳光对象池）

```javascript
class SunPool {
  static pool = [];
  
  static get() {
    return this.pool.pop() || new Sun();
  }
  
  static release(sun) {
    sun.reset();
    if (this.pool.length < SUN_POOL_SIZE) {
      this.pool.push(sun);
    }
  }
}
```

---

## 总结

实体契约定义了：
- ✅ Plant接口和5种植物类型的行为规范
- ✅ Zombie接口和3种僵尸类型的行为规范
- ✅ Projectile接口和碰撞检测规范
- ✅ Sun接口和状态管理规范
- ✅ 碰撞检测算法
- ✅ 对象池模式实现

所有实体实现必须遵守此契约，确保游戏逻辑的一致性和可预测性。

