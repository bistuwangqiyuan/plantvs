# Research & Technology Decisions

**Feature**: 竖屏网页版植物大战僵尸游戏  
**Date**: 2025-10-08  
**Status**: Completed

本文档记录了项目技术选型和设计决策的研究结果。

---

## 1. Canvas游戏渲染架构

### Decision
采用HTML5 Canvas 2D Context + requestAnimationFrame实现游戏渲染循环

### Rationale
- **性能优势**: Canvas提供硬件加速的2D图形渲染，适合实时游戏
- **跨平台兼容性**: 所有现代浏览器原生支持，无需插件
- **灵活性**: 完全控制渲染流程，可优化绘制顺序和频率
- **简单性**: API简单直观，学习曲线平缓

### Alternatives Considered
1. **SVG + CSS动画**
   - ❌ 拒绝理由: DOM操作开销大，大量实体时性能不足
   - ❌ 不适合高频率更新的游戏场景
   
2. **WebGL**
   - ❌ 拒绝理由: 2D游戏无需3D能力，增加复杂度
   - ❌ 学习曲线陡峭，不符合"简单快速"要求

3. **游戏引擎（Phaser.js, PixiJS等）**
   - ❌ 拒绝理由: 增加页面体积（违反<3MB限制）
   - ❌ 框架学习成本，不如原生灵活
   - ❌ 用户要求尽量简单的技术栈

### Implementation Details
```javascript
// 游戏循环结构
function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTimestamp;
  
  update(deltaTime);  // 更新游戏状态
  render();           // 渲染到Canvas
  
  requestAnimationFrame(gameLoop);
}
```

**性能优化策略**:
- 使用离屏Canvas预渲染静态元素
- 实现脏矩形算法，只重绘变化区域
- 对象池模式复用子弹和阳光对象
- 限制帧率到30fps（移动端）/60fps（桌面端）

---

## 2. 竖屏布局设计模式

### Decision
采用固定宽高比（9:16）的竖屏Canvas布局，使用CSS媒体查询实现响应式适配

### Rationale
- **移动优先**: 手机竖屏是主要使用场景
- **视觉一致性**: 固定宽高比确保游戏在不同设备上比例一致
- **触控友好**: 竖屏布局更符合单手操作习惯

### Layout Structure
```
+-------------------+
|   阳光计数器       |  顶部UI栏（60px）
|  [50]  波次 1/5   |
+-------------------+
|                   |
|   植物卡片栏       |  植物选择区（80px）
| [🌻][🌰][🥜][💣]  |
|                   |
+-------------------+
|  ┌─┬─┬─┐         |
|  ├─┼─┼─┤         |  游戏区域（5行×3列）
|  ├─┼─┼─┤         |  Canvas主区域
|  ├─┼─┼─┤         |
|  └─┴─┴─┘         |
|                   |
+-------------------+
|   暂停按钮         |  底部控制栏（50px）
+-------------------+
```

### Grid System
- **5行×3列**: 适合竖屏，行数多于列数
- **格子尺寸**: 80×80px（移动端），100×100px（桌面端）
- **间距**: 4px行间距，便于视觉区分

### Alternatives Considered
1. **横屏布局（原版植物大战僵尸）**
   - ❌ 拒绝理由: 手机横屏操作不便，违背用户需求
   
2. **可旋转布局**
   - ❌ 拒绝理由: 增加复杂度，用户明确要求竖屏

3. **6行×2列或4行×4列**
   - ❌ 拒绝理由: 测试后发现5×3平衡性最佳

### Responsive Implementation
```css
/* 移动端（<768px） */
.game-container {
  width: 100vw;
  max-width: 500px;
  aspect-ratio: 9 / 16;
}

/* 桌面端 */
@media (min-width: 768px) {
  .game-container {
    width: 450px;
    margin: 0 auto;
  }
}
```

---

## 3. 移动端触控优化

### Decision
实现统一的输入抽象层，同时支持触控（touch events）和鼠标（mouse events），最小触控目标44×44px

### Rationale
- **无障碍性**: 符合WCAG 2.1触控目标尺寸标准
- **用户体验**: 避免误触，提升操作准确性
- **兼容性**: 桌面端也可用鼠标操作

### Touch Event Handling
```javascript
// 统一输入事件处理
function getInputPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX || event.touches[0].clientX) - rect.left;
  const y = (event.clientY || event.touches[0].clientY) - rect.top;
  return { x, y };
}

// 同时监听触控和鼠标
canvas.addEventListener('mousedown', handleInput);
canvas.addEventListener('touchstart', handleInput);
```

### Touch Target Sizes
| Element | Desktop Size | Mobile Size | Touch Area |
|---------|-------------|-------------|------------|
| 植物卡片 | 60×80px | 70×90px | 74×94px (padding) |
| 游戏格子 | 100×100px | 80×80px | 自身已符合标准 |
| 阳光 | 40×40px | 50×50px | 54×54px (扩大点击区) |
| 按钮 | 40×40px | 50×50px | 50×50px |

### Alternatives Considered
1. **仅支持触控**
   - ❌ 拒绝理由: 桌面端用户无法操作

2. **使用触控手势（滑动、捏合）**
   - ❌ 拒绝理由: 增加学习成本，点击已足够

### Anti-Patterns Avoided
- ❌ 阻止默认滚动行为（会影响页面导航）
- ✅ 使用`touch-action: manipulation`减少点击延迟
- ✅ 避免hover状态（移动端无hover）

---

## 4. 游戏循环与性能优化

### Decision
采用固定时间步长（Fixed Time Step）+ 可变渲染的混合游戏循环模型

### Rationale
- **确定性**: 游戏逻辑更新频率固定，避免帧率波动影响游戏平衡
- **流畅性**: 渲染不受逻辑帧率限制，可以插值平滑
- **性能**: 低端设备可降低逻辑更新频率而不影响可玩性

### Game Loop Architecture
```javascript
const FIXED_TIMESTEP = 1000 / 30; // 30次逻辑更新/秒
let accumulator = 0;
let lastTime = 0;

function gameLoop(currentTime) {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  accumulator += deltaTime;
  
  // 固定时间步长更新游戏逻辑
  while (accumulator >= FIXED_TIMESTEP) {
    updateGame(FIXED_TIMESTEP);
    accumulator -= FIXED_TIMESTEP;
  }
  
  // 可变频率渲染
  const interpolation = accumulator / FIXED_TIMESTEP;
  render(interpolation);
  
  requestAnimationFrame(gameLoop);
}
```

### Performance Optimizations

#### 1. 对象池模式
```javascript
// 子弹对象池，避免频繁创建销毁
const bulletPool = {
  pool: [],
  get() {
    return this.pool.pop() || new Bullet();
  },
  release(bullet) {
    bullet.reset();
    this.pool.push(bullet);
  }
};
```

#### 2. 空间分区（网格优化碰撞检测）
```javascript
// 按行分组，只检测同行的碰撞
const rows = [[], [], [], [], []];
for (let zombie of zombies) {
  rows[zombie.row].push(zombie);
}
```

#### 3. 渲染优化
- 静态背景预渲染到离屏Canvas
- 批量绘制相同类型的实体
- 裁剪可视区域外的绘制

### Performance Targets
| Metric | Target | Measurement |
|--------|--------|-------------|
| 帧率 | ≥30fps | `performance.now()` |
| 帧时间 | ≤33ms | 逻辑+渲染总时间 |
| 内存 | <100MB | Chrome DevTools Memory |
| 启动时间 | <5秒 | 加载到可交互 |

### Alternatives Considered
1. **每帧更新一次逻辑**
   - ❌ 拒绝理由: 帧率波动导致游戏速度不稳定

2. **完全固定帧率（锁60fps）**
   - ❌ 拒绝理由: 低端设备无法达到，导致卡顿

---

## 5. 数据持久化方案

### Decision
使用localStorage存储关卡解锁进度，JSON格式序列化

### Rationale
- **简单性**: 原生API，无需第三方库
- **容量足够**: localStorage 5-10MB限制，游戏数据<10KB
- **同步读写**: 无需处理异步，简化代码
- **隐私友好**: 数据仅存本地，无服务器传输

### Data Schema
```javascript
// 存储结构
{
  "version": "1.0",
  "unlockedLevels": [1, 2, 3],  // 已解锁关卡
  "lastPlayed": "2025-10-08T10:30:00Z"
}
```

### Implementation
```javascript
// 存储管理模块
const Storage = {
  KEY: 'plantsvszombies_progress',
  
  save(progress) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(progress));
      return true;
    } catch (e) {
      console.error('保存失败', e);
      return false;
    }
  },
  
  load() {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : this.getDefault();
    } catch (e) {
      console.error('读取失败', e);
      return this.getDefault();
    }
  },
  
  getDefault() {
    return {
      version: '1.0',
      unlockedLevels: [1],
      lastPlayed: null
    };
  },
  
  reset() {
    localStorage.removeItem(this.KEY);
  }
};
```

### Error Handling
1. **localStorage不可用**: 降级为内存存储（仅当前会话有效）
2. **容量超限**: 不应发生（数据极小），仍需捕获异常
3. **数据损坏**: 使用默认值恢复

### Alternatives Considered
1. **IndexedDB**
   - ❌ 拒绝理由: 过于复杂，异步API增加代码量
   - ❌ 数据量小，不需要数据库级别的能力

2. **Cookie**
   - ❌ 拒绝理由: 容量限制小（4KB），每次请求都发送

3. **服务器存储**
   - ❌ 拒绝理由: 需要后端，违背纯前端要求

### Security Considerations
- ✅ 数据非敏感（仅游戏进度）
- ✅ 无需加密
- ✅ 用户可手动清除（浏览器设置）
- ⚠️ 用户可能手动篡改进度（可接受，单机游戏）

---

## 6. Netlify部署配置

### Decision
使用Netlify静态站点托管，直接拖放部署或Git自动部署

### Rationale
- **零配置**: 静态HTML/CSS/JS自动识别
- **CDN加速**: 全球CDN节点，加载速度快
- **HTTPS**: 自动SSL证书
- **免费**: 个人项目免费额度充足

### Deployment Structure
```
plantvs/
├── index.html
├── *.css
├── *.js
└── netlify.toml (可选)
```

### netlify.toml Configuration
```toml
# 可选配置文件
[build]
  publish = "."  # 发布根目录

[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=3600"  # 缓存1小时
    
[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"  # JS文件缓存1年

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000"  # CSS文件缓存1年

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200  # SPA重定向（本项目单页，可选）
```

### Deployment Steps
1. **方式一：拖放部署**
   - 登录Netlify
   - 拖放项目文件夹到部署区
   - 自动发布

2. **方式二：Git部署**
   - 连接GitHub/GitLab仓库
   - 自动检测静态站点
   - 每次push自动重新部署

### Performance Optimization
- ✅ 启用Gzip/Brotli压缩（Netlify自动）
- ✅ 使用CDN缓存（Netlify自动）
- ✅ 设置缓存头（通过netlify.toml）
- ✅ 图片优化（如使用图片，压缩到最优）

### Alternatives Considered
1. **GitHub Pages**
   - ❌ 拒绝理由: 无自定义headers，HTTPS配置麻烦

2. **Vercel**
   - ✅ 同样优秀，但Netlify更简单

3. **AWS S3 + CloudFront**
   - ❌ 拒绝理由: 配置复杂，成本高，过度设计

---

## 7. 图形资源策略

### Decision
使用Canvas API绘制简单几何图形和文字，不使用外部图片资源

### Rationale
- **性能**: 无需加载图片资源，减少HTTP请求
- **体积**: 大幅降低页面大小（<500KB总计）
- **灵活性**: 可动态调整颜色、大小
- **简单性**: 无需图片处理工具

### Visual Style
- **植物**: 圆形+颜色+文字标识
  - 向日葵: 黄色圆形 + "🌻"
  - 豌豆射手: 绿色圆形 + "🌰"
  - 坚果墙: 棕色矩形 + "🥜"
- **僵尸**: 矩形+颜色渐变
  - 普通僵尸: 灰色
  - 路障僵尸: 灰色+橙色路障
  - 铁桶僵尸: 灰色+银色铁桶
- **UI**: Bootstrap组件 + 自定义CSS

### Drawing Examples
```javascript
// 向日葵
ctx.fillStyle = '#FFD700';
ctx.beginPath();
ctx.arc(x, y, 30, 0, Math.PI * 2);
ctx.fill();
ctx.font = '40px Arial';
ctx.textAlign = 'center';
ctx.fillText('🌻', x, y + 10);

// 僵尸
ctx.fillStyle = '#8B8B8B';
ctx.fillRect(x, y, 60, 80);
ctx.fillStyle = '#FF0000';
ctx.fillText('🧟', x + 30, y + 40);
```

### Alternatives Considered
1. **使用Sprite图集**
   - ❌ 拒绝理由: 增加资源大小，加载时间
   - ❌ 需要图片处理，增加开发成本

2. **使用Emoji作为图形**
   - ✅ 部分采用: 结合几何图形和Emoji
   - ⚠️ Emoji在不同系统显示不一致

3. **SVG图标**
   - ❌ 拒绝理由: 需要转换和嵌入，增加复杂度

---

## 8. 浏览器兼容性策略

### Decision
仅支持现代浏览器（Chrome 90+, Firefox 88+, Safari 14+, Edge 90+），使用特性检测提示不支持的浏览器

### Rationale
- **简化开发**: 无需polyfill，直接使用现代API
- **用户基础**: 95%+用户使用现代浏览器
- **性能**: 现代浏览器性能更好

### Feature Detection
```javascript
// 检测必需功能
function checkBrowserSupport() {
  const checks = [
    !!document.createElement('canvas').getContext,
    !!window.localStorage,
    !!window.requestAnimationFrame
  ];
  
  if (!checks.every(Boolean)) {
    alert('您的浏览器不支持该游戏，请使用最新版Chrome、Firefox、Safari或Edge浏览器。');
    return false;
  }
  return true;
}
```

### Polyfills (Minimal)
```javascript
// requestAnimationFrame fallback
window.requestAnimationFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) {
    return setTimeout(callback, 1000 / 60);
  };
```

### Alternatives Considered
1. **支持IE11**
   - ❌ 拒绝理由: 已停止支持，市场份额<1%

2. **完整polyfill方案**
   - ❌ 拒绝理由: 增加体积，违反<3MB限制

---

## Research Summary

所有关键技术决策已完成，无遗留NEEDS CLARIFICATION项。技术栈选择符合以下原则：

✅ **简单性**: 原生HTML/CSS/JS，无框架依赖  
✅ **性能**: Canvas渲染，对象池优化，<3MB体积  
✅ **兼容性**: 现代浏览器支持，移动端优先  
✅ **可维护性**: 扁平结构，清晰职责分离  
✅ **可部署性**: 静态资源，Netlify一键部署

**准备进入Phase 1**: 数据模型设计和接口契约定义

