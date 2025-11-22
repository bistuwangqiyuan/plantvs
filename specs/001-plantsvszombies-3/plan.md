# Implementation Plan: 竖屏网页版植物大战僵尸游戏

**Branch**: `001-plantsvszombies-3` | **Date**: 2025-10-08 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-plantsvszombies-3/spec.md`

## Summary

开发一个竖屏布局的植物大战僵尸网页游戏，支持移动端和桌面端浏览器。游戏包含3个难度递进的关卡，玩家通过收集阳光、种植植物来抵御僵尸进攻。采用纯前端技术栈（HTML5 Canvas + CSS + 原生JavaScript），无需后端服务器，游戏进度保存在本地localStorage。部署到Netlify平台，确保快速加载（<5秒）和流畅运行（30fps+）。

## Technical Context

**Language/Version**: JavaScript ES6+ (原生JavaScript，无需编译)  
**Primary Dependencies**: Bootstrap 5 (通过CDN引入，仅用于UI组件和响应式布局)  
**Storage**: localStorage（本地浏览器存储，保存关卡解锁进度）  
**Testing**: 手动测试 + 浏览器开发工具（无需测试框架，功能简单直接）  
**Target Platform**: 现代Web浏览器（Chrome 90+, Firefox 88+, Safari 14+, Edge 90+）  
**Project Type**: 单页Web应用（Single Page Application）- 所有文件在根目录  
**Performance Goals**: 
- 首次加载时间 <5秒（4G网络）
- 游戏运行帧率 ≥30fps（移动端和桌面端）
- 操作响应时间 <100ms
- 页面进入可交互状态 <5秒

**Constraints**: 
- 总页面大小 ≤3MB（包含所有资源）
- 文件结构扁平化（尽量不建文件夹）
- 纯前端实现（无后端API）
- 竖屏优先布局（适配手机竖屏使用）
- 触控目标 ≥44x44px（移动端友好）
- 支持触控和鼠标两种输入方式

**Scale/Scope**: 
- 3个关卡
- 5种植物类型
- 3种僵尸类型
- 5行×3列游戏网格（竖屏布局）
- 预计代码量 <2000行JavaScript
- 单页应用，无路由切换

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

由于项目constitution文件为空模板，此处基于Web游戏开发最佳实践进行检查：

### ✅ Architecture Principles

1. **Simplicity First**: ✅ PASS
   - 使用原生JavaScript，无框架依赖
   - 扁平文件结构，避免过度工程化
   - 直接Canvas渲染，无复杂渲染引擎

2. **Performance-Oriented**: ✅ PASS
   - Canvas API直接绘制，性能优先
   - requestAnimationFrame实现游戏循环
   - 资源大小控制（<3MB总大小）
   - 对象池模式减少垃圾回收

3. **Offline-First**: ✅ PASS
   - 纯静态资源，一次加载后可离线游玩
   - localStorage本地存储，无需网络请求
   - 适合静态托管（Netlify）

4. **Mobile-First**: ✅ PASS
   - 竖屏布局优先
   - 触控优化（44x44px最小触控区域）
   - 响应式设计

### ⚠️ Potential Concerns (Addressed)

1. **No Automated Tests**: JUSTIFIED
   - 游戏逻辑相对简单，手动测试成本低
   - Canvas绘制难以自动化测试
   - 快速迭代优先，节省开发时间

2. **Flat File Structure**: JUSTIFIED
   - 代码量小（<2000行），不需要复杂分层
   - 用户明确要求扁平结构
   - 部署简单，文件依赖清晰

3. **No Build Process**: JUSTIFIED
   - 原生JavaScript，无需编译
   - 快速开发部署
   - 降低技术复杂度

**Gate Status**: ✅ PASSED - Architecture aligns with project constraints and user requirements

## Project Structure

### Documentation (this feature)

```
specs/001-plantsvszombies-3/
├── spec.md              # Feature specification
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0: Technical research and decisions
├── data-model.md        # Phase 1: Game entities and state model
├── quickstart.md        # Phase 1: Developer setup guide
├── contracts/           # Phase 1: Game API contracts
│   ├── game-engine.md   # Core engine interfaces
│   ├── entities.md      # Plant, Zombie, Bullet interfaces
│   └── game-state.md    # State management contract
└── checklists/
    └── requirements.md  # Quality validation checklist
```

### Source Code (repository root)

```
plantvs/
├── index.html           # 主HTML文件 - 游戏容器和DOM结构
├── styles.css           # 全局样式 - 布局、UI、响应式设计
├── game.js              # 游戏核心引擎 - 主循环、渲染、状态管理
├── entities.js          # 游戏实体 - Plant、Zombie、Bullet类定义
├── levels.js            # 关卡配置 - 关卡数据、波次配置
├── ui.js                # UI控制器 - 菜单、按钮、提示、界面切换
├── storage.js           # 存储管理 - localStorage封装
├── utils.js             # 工具函数 - 碰撞检测、数学计算
├── README.md            # 项目说明文档
└── netlify.toml         # Netlify部署配置（可选）
```

**Structure Decision**: 

采用扁平文件结构，所有JavaScript文件在根目录。文件按职责划分：
- **index.html**: 单一HTML入口，包含Canvas和UI容器
- **styles.css**: 所有CSS样式，包含响应式媒体查询
- **game.js**: 核心游戏循环、渲染管道、输入处理
- **entities.js**: 游戏对象类（Plant, Zombie, Bullet, Sun）
- **levels.js**: 关卡配置数据（JSON格式）
- **ui.js**: UI层逻辑（菜单切换、按钮事件、提示显示）
- **storage.js**: localStorage读写封装
- **utils.js**: 通用辅助函数

文件总数8个（不含文档），符合扁平化要求。通过`<script>`标签按依赖顺序加载：
1. utils.js（无依赖）
2. storage.js（无依赖）
3. entities.js（依赖utils）
4. levels.js（依赖entities）
5. ui.js（依赖game、storage）
6. game.js（依赖所有）

## Complexity Tracking

*本项目无Constitution违规项，此表为空*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       | N/A        | N/A                                 |

---

## Phase 0: Research & Technology Decisions

**Status**: ✅ COMPLETED  
**Output**: [research.md](./research.md)

### Research Tasks Completed

1. ✅ Canvas游戏渲染最佳实践
2. ✅ 竖屏游戏布局设计模式
3. ✅ 移动端触控优化策略
4. ✅ 游戏循环和性能优化
5. ✅ localStorage数据持久化方案
6. ✅ Netlify静态部署配置

详细研究结果参见 [research.md](./research.md)

---

## Phase 1: Design & Contracts

**Status**: ✅ COMPLETED  
**Prerequisites**: research.md complete  
**Outputs**: 
- [data-model.md](./data-model.md) - 游戏实体和状态模型
- [contracts/](./contracts/) - 游戏API接口定义
- [quickstart.md](./quickstart.md) - 开发者快速开始指南

### Design Artifacts

1. **Data Model** (data-model.md):
   - 游戏实体定义（Plant, Zombie, Bullet, Sun, GridCell）
   - 游戏状态结构（GameState, LevelConfig, PlayerProgress）
   - 状态转换规则

2. **API Contracts** (contracts/):
   - game-engine.md: 游戏引擎核心接口
   - entities.md: 实体类接口和行为契约
   - game-state.md: 状态管理接口

3. **Developer Guide** (quickstart.md):
   - 环境设置
   - 本地运行说明
   - 代码结构导航
   - 部署流程

---

## Phase 2: Task Breakdown

**Status**: ⏸️ PENDING  
**Command**: Run `/speckit.tasks` to generate detailed task breakdown  
**Output**: tasks.md (NOT created by this command)

Phase 2将由单独的`/speckit.tasks`命令生成，包含：
- 详细的实现任务列表
- 任务依赖关系
- 预估工作量
- 验收标准

---

## Next Steps

1. ✅ Phase 0 & 1 completed by this command
2. ⏭️ Run `/speckit.tasks` to generate Phase 2 task breakdown
3. ⏭️ Begin implementation following tasks.md
4. ⏭️ Test against spec.md acceptance criteria
5. ⏭️ Deploy to Netlify

**Ready for Task Generation**: All design artifacts completed, proceed with `/speckit.tasks`
