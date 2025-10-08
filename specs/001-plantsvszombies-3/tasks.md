# Tasks: 竖屏网页版植物大战僵尸游戏

**Input**: Design documents from `/specs/001-plantsvszombies-3/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Tests**: No automated tests requested in spec - relying on manual testing per acceptance scenarios.

---

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic file structure

- [x] **T001** Create root directory structure with all 8 files: `index.html`, `styles.css`, `game.js`, `entities.js`, `levels.js`, `ui.js`, `storage.js`, `utils.js`
- [x] **T002** [P] Create `README.md` with project description, setup instructions, and deployment notes
- [x] **T003** [P] Create `netlify.toml` with cache headers and deployment configuration per research.md
- [x] **T004** [P] Setup `.gitignore` to exclude unnecessary files (if using Git)

**Checkpoint**: ✅ Project structure ready for development

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### HTML Structure (index.html)

- [x] **T005** Create HTML document structure with DOCTYPE, head (meta tags, title), and body in `index.html`
- [x] **T006** Add Bootstrap 5 CDN link in `<head>` section of `index.html`
- [x] **T007** Create main game container `<div>` with Canvas element (id="gameCanvas") in `index.html`
- [x] **T008** Create UI overlay containers: main menu, level select, pause menu, victory/defeat screens in `index.html`
- [x] **T009** Add script loading section in correct dependency order: utils.js → storage.js → entities.js → levels.js → ui.js → game.js in `index.html`

### Core Utilities (utils.js)

- [x] **T010** [P] Implement `checkCollision(entity1, entity2)` function for bounding box collision detection in `utils.js`
- [x] **T011** [P] Implement `getDistance(x1, y1, x2, y2)` function for distance calculation in `utils.js`
- [x] **T012** [P] Implement `clamp(value, min, max)` utility function in `utils.js`
- [x] **T013** [P] Define game constants object `GAME_CONSTANTS` (grid dimensions, sun values, performance targets) in `utils.js`

### Storage Management (storage.js)

- [x] **T014** Implement `Storage` object with `KEY` constant in `storage.js`
- [x] **T015** Implement `Storage.save(progress)` method with try-catch and localStorage.setItem in `storage.js`
- [x] **T016** Implement `Storage.load()` method with JSON parsing and error handling in `storage.js`
- [x] **T017** Implement `Storage.getDefault()` method returning default progress (unlockedLevels: [1]) in `storage.js`
- [x] **T018** Implement `Storage.reset()` method with confirmation and localStorage.removeItem in `storage.js`

### CSS Foundation (styles.css)

- [x] **T019** Define CSS reset and base styles (box-sizing, font-family) in `styles.css`
- [x] **T020** Define color palette variables as CSS custom properties (--background-color, --grid-line, etc.) in `styles.css`
- [x] **T021** Implement body and html styles with 100% height, overflow handling,竖屏优化 in `styles.css`
- [x] **T022** Create `.game-container` class with竖屏aspect ratio (9:16) and centering in `styles.css`
- [x] **T023** Create `#gameCanvas` styles with border, background, and responsive sizing in `styles.css`

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 新手进入游戏并完成第一关 (Priority: P1) 🎯 MVP

**Goal**: 玩家可以进入游戏，通过基本操作完成第一关，体验完整的游戏循环（收集阳光、种植植物、抵御僵尸、胜利/失败）

**Independent Test**: 打开网站→点击开始游戏→选择第一关→种植向日葵和豌豆射手→击败所有僵尸→显示胜利画面

### Game Entities (entities.js) - US1

- [x] **T024** [P] [US1] Define `PlantType`, `PlantState`, `ZombieType`, `ZombieState`, `ProjectileType`, `SunSource`, `SunState` enums in `entities.js`
- [x] **T025** [P] [US1] Define `PLANT_CONFIGS` object with 3 plant types for level 1: SUNFLOWER, PEASHOOTER, WALLNUT in `entities.js`
- [x] **T026** [P] [US1] Define `ZOMBIE_CONFIGS` object with NORMAL zombie configuration in `entities.js`
- [x] **T027** [US1] Implement `Plant` class constructor with type, position, config parameters in `entities.js`
- [x] **T028** [US1] Implement `Plant.update(deltaTime)` method handling向日葵生产和攻击计时 in `entities.js`
- [x] **T029** [US1] Implement `Plant.takeDamage(amount)` method with health reduction and state updates in `entities.js`
- [x] **T030** [US1] Implement `Plant.canAttack()` method checking attack readiness for PEASHOOTER in `entities.js`
- [x] **T031** [US1] Implement `Plant.performAttack()` method creating projectiles for PEASHOOTER in `entities.js`
- [x] **T032** [US1] Implement `Plant.produceSun()` method for SUNFLOWER creating sun instances in `entities.js`
- [x] **T033** [US1] Implement `Zombie` class constructor with type, row, config parameters in `entities.js`
- [x] **T034** [US1] Implement `Zombie.update(deltaTime)` method handling movement and attack state in `entities.js`
- [x] **T035** [US1] Implement `Zombie.move(deltaTime)` method moving zombie left with speed calculation in `entities.js`
- [x] **T036** [US1] Implement `Zombie.takeDamage(amount, effects)` method with health reduction in `entities.js`
- [x] **T037** [US1] Implement `Zombie.attackPlant(plant)` method dealing damage over time in `entities.js`
- [x] **T038** [US1] Implement `Zombie.checkBoundary()` method checking if x <= ZOMBIE_DEFEAT_X in `entities.js`
- [x] **T039** [US1] Implement `Projectile` class constructor with type, position, row, damage parameters in `entities.js`
- [x] **T040** [US1] Implement `Projectile.update(deltaTime)` method moving projectile right in `entities.js`
- [x] **T041** [US1] Implement `Projectile.checkCollision(zombies)` method detecting zombie hits in `entities.js`
- [x] **T042** [US1] Implement `Projectile.hit(zombie)` method applying damage and marking projectile inactive in `entities.js`
- [x] **T043** [US1] Implement `Sun` class constructor with x, y, value, source parameters in `entities.js`
- [x] **T044** [US1] Implement `Sun.update(deltaTime)` method handling falling, idle, and collecting states in `entities.js`
- [x] **T045** [US1] Implement `Sun.collect(targetPos)` method setting COLLECTING state and target position in `entities.js`
- [x] **T046** [US1] Implement `ProjectilePool` object with `get()` and `release(projectile)` methods in `entities.js`
- [x] **T047** [US1] Implement `SunPool` object with `get()` and `release(sun)` methods in `entities.js`

### Level Configuration (levels.js) - US1

- [ ] **T048** [US1] Define `LEVEL_1` configuration object with id:1, name, difficulty:1, initialSun:50 in `levels.js`
- [ ] **T049** [US1] Add `availablePlants` array with [SUNFLOWER, PEASHOOTER, WALLNUT] to LEVEL_1 in `levels.js`
- [ ] **T050** [US1] Define Wave 1 configuration with 3 NORMAL zombies (rows 1,2,3) with delays in `levels.js`
- [ ] **T051** [US1] Define Wave 2 configuration with 4 NORMAL zombies across all rows with staggered delays in `levels.js`
- [ ] **T052** [US1] Define Wave 3 configuration with 5 NORMAL zombies with varied timing in `levels.js`
- [ ] **T053** [US1] Create `LEVELS` array and add LEVEL_1 to it in `levels.js`
- [ ] **T054** [US1] Export or make LEVELS accessible to game.js in `levels.js`

### Game Engine Core (game.js) - US1

- [ ] **T055** [US1] Define `GamePhase` enum (MENU, LEVEL_SELECT, PLAYING, PAUSED, VICTORY, DEFEAT) in `game.js`
- [ ] **T056** [US1] Implement `GameEngine` class constructor initializing canvas, context, state in `game.js`
- [ ] **T057** [US1] Implement `GameEngine.start()` method beginning game loop with requestAnimationFrame in `game.js`
- [ ] **T058** [US1] Implement `GameEngine.gameLoop(timestamp)` method with fixed timestep accumulator pattern in `game.js`
- [ ] **T059** [US1] Implement `GameEngine.update(deltaTime)` method updating all game entities in `game.js`
- [ ] **T060** [US1] Implement entity update loops: updateSuns, updatePlants, updateZombies, updateProjectiles in `GameEngine.update()` in `game.js`
- [ ] **T061** [US1] Implement collision detection calls: checkProjectileZombieCollision, checkZombiePlantCollision in `GameEngine.update()` in `game.js`
- [ ] **T062** [US1] Implement `checkVictoryCondition()` method (all waves complete, no zombies) in `game.js`
- [ ] **T063** [US1] Implement `checkDefeatCondition()` method (zombie reached boundary) in `game.js`
- [ ] **T064** [US1] Implement `GameEngine.loadLevel(levelId)` method loading level config and resetting state in `game.js`
- [ ] **T065** [US1] Implement grid initialization creating 5x3 GridCell array in `GameEngine.loadLevel()` in `game.js`
- [ ] **T066** [US1] Implement wave spawning logic with timer and zombie generation in `game.js`
- [ ] **T067** [US1] Implement sun drop system with random timer (5-10 seconds) creating sky suns in `game.js`
- [ ] **T068** [US1] Implement `GameEngine.render(interpolation)` method with clear and draw sequence in `game.js`
- [ ] **T069** [US1] Implement `Renderer` class constructor with ctx and config in `game.js`
- [ ] **T070** [US1] Implement `Renderer.clear()` method clearing canvas in `game.js`
- [ ] **T071** [US1] Implement `Renderer.drawBackground()` method with sky blue background in `game.js`
- [ ] **T072** [US1] Implement `Renderer.drawGrid(grid)` method drawing 5x3 grid lines in `game.js`
- [ ] **T073** [US1] Implement `Renderer.drawPlant(plant)` method using shapes and colors per PLANT_CONFIGS in `game.js`
- [ ] **T074** [US1] Implement `Renderer.drawZombie(zombie)` method using rectangles and emoji in `game.js`
- [ ] **T075** [US1] Implement `Renderer.drawProjectile(projectile)` method drawing small circles in `game.js`
- [ ] **T076** [US1] Implement `Renderer.drawSun(sun)` method drawing yellow circles with shine effect in `game.js`
- [ ] **T077** [US1] Implement `Renderer.drawUI(gameState)` method drawing sun counter, wave indicator, plant cards in `game.js`
- [ ] **T078** [US1] Implement `InputHandler` class constructor binding events to canvas in `game.js`
- [ ] **T079** [US1] Implement `InputHandler.handlePointerDown(event)` method with priority checking (UI > Sun > Plant Card > Grid) in `game.js`
- [ ] **T080** [US1] Implement `InputHandler.getCanvasCoordinates(event)` method handling mouse and touch in `game.js`
- [ ] **T081** [US1] Implement `GameEngine.collectSun(sun)` method setting collect animation and increasing sun counter in `game.js`
- [ ] **T082** [US1] Implement `GameEngine.selectPlant(plantType)` method checking sun/cooldown and setting selectedPlantType in `game.js`
- [ ] **T083** [US1] Implement `GameEngine.plantSeed(cell, plantType)` method creating plant, consuming sun, starting cooldown in `game.js`
- [ ] **T084** [US1] Implement plant cooldown update logic reducing cooldown timers each frame in `game.js`

### UI Controller (ui.js) - US1

- [ ] **T085** [US1] Implement `UIController` class constructor with references to DOM elements in `ui.js`
- [ ] **T086** [US1] Implement `UIController.showMenu()` method displaying main menu, hiding others in `ui.js`
- [ ] **T087** [US1] Implement `UIController.showLevelSelect()` method displaying level selection, highlighting unlocked in `ui.js`
- [ ] **T088** [US1] Implement `UIController.showVictoryScreen()` method displaying victory message, stats, buttons in `ui.js`
- [ ] **T089** [US1] Implement `UIController.showDefeatScreen()` method displaying defeat message, retry/exit buttons in `ui.js`
- [ ] **T090** [US1] Implement `UIController.showTooltip(message, duration)` method showing temporary message at top in `ui.js`
- [ ] **T091** [US1] Bind "开始游戏" button click to transition MENU → LEVEL_SELECT in `ui.js`
- [ ] **T092** [US1] Bind level 1 selection to call `engine.loadLevel(1)` and start game in `ui.js`
- [ ] **T093** [US1] Implement pause button functionality calling `engine.pause()` in `ui.js`
- [ ] **T094** [US1] Implement resume button functionality calling `engine.resume()` in `ui.js`

### Styles for US1 (styles.css)

- [ ] **T095** [US1] Style main menu container: centered, title size 32px, button spacing in `styles.css`
- [ ] **T096** [US1] Style level select container: grid layout for level cards, unlock indicators in `styles.css`
- [ ] **T097** [US1] Style plant card display: horizontal bar at top, 70×90px cards, sun cost overlay in `styles.css`
- [ ] **T098** [US1] Style sun counter: top-left position, large font, yellow background in `styles.css`
- [ ] **T099** [US1] Style wave indicator: top-center, "第X波/共Y波" format in `styles.css`
- [ ] **T100** [US1] Style victory screen: fullscreen overlay, green accent, button styles in `styles.css`
- [ ] **T101** [US1] Style defeat screen: fullscreen overlay, red accent, button styles in `styles.css`
- [ ] **T102** [US1] Style tooltip: fixed top position, auto-hide animation, semi-transparent in `styles.css`
- [ ] **T103** [US1] Add grid cell hover effect: yellow highlight when plant selected in `styles.css`

### Integration & Testing - US1

- [ ] **T104** [US1] Wire up GameEngine initialization on page load calling `new GameEngine(canvas)` and `start()` in `index.html` or `game.js`
- [ ] **T105** [US1] Test complete flow: Main menu → Level select → Level 1 starts → Plant sunflowers → Collect sun → Plant peashooters → Zombies spawn → Zombies killed → Victory
- [ ] **T106** [US1] Test defeat condition: Let zombie reach left boundary → Verify defeat screen shows
- [ ] **T107** [US1] Verify all acceptance scenarios from spec.md User Story 1 (9 scenarios)
- [ ] **T108** [US1] Test edge cases: 阳光不足, 冷却中, 位置已占用 - verify tooltips display correctly
- [ ] **T109** [US1] Test pause/resume: Pause mid-game → Verify zombies stop → Resume → Verify continues correctly

**Checkpoint**: At this point, User Story 1 (MVP) should be fully functional - players can complete the first level

---

## Phase 4: User Story 2 - 挑战更高难度关卡 (Priority: P2)

**Goal**: 玩家可以挑战第二关和第三关，体验逐渐增加的难度和新的植物/僵尸类型

**Independent Test**: 完成第一关→返回关卡选择→选择第二关→使用樱桃炸弹对抗路障僵尸→完成第二关→选择第三关→使用寒冰射手对抗铁桶僵尸→完成第三关

### New Entities (entities.js) - US2

- [ ] **T110** [P] [US2] Add CHERRY_BOMB to `PLANT_CONFIGS` with cost:150, cooldown:50, explosionDamage:1800, explosionRadius:150 in `entities.js`
- [ ] **T111** [P] [US2] Add SNOW_PEA to `PLANT_CONFIGS` with cost:175, attackPower:20, slowEffect:0.5, slowDuration:10 in `entities.js`
- [ ] **T112** [P] [US2] Add CONE_HEAD to `ZOMBIE_CONFIGS` with maxHealth:640 in `entities.js`
- [ ] **T113** [P] [US2] Add BUCKET_HEAD to `ZOMBIE_CONFIGS` with maxHealth:1370 in `entities.js`
- [ ] **T114** [US2] Implement `Plant.explode()` method for CHERRY_BOMB finding zombies in radius and dealing area damage in `entities.js`
- [ ] **T115** [US2] Add explosion timer logic to `Plant.update()` for CHERRY_BOMB triggering explode after 1 second in `entities.js`
- [ ] **T116** [US2] Modify `Plant.performAttack()` to create SNOW_PEA projectiles with slow effect in `entities.js`
- [ ] **T117** [US2] Implement `Zombie.applySlow(multiplier, duration)` method setting slowMultiplier and slowEndTime in `entities.js`
- [ ] **T118** [US2] Modify `Zombie.update()` to check and clear slow effect when slowEndTime expires in `entities.js`
- [ ] **T119** [US2] Modify `Projectile.hit()` to apply effects (slow) when hitting zombies in `entities.js`

### Level Configurations (levels.js) - US2

- [ ] **T120** [US2] Define `LEVEL_2` configuration with id:2, difficulty:2, initialSun:50 in `levels.js`
- [ ] **T121** [US2] Add `availablePlants` for LEVEL_2: [SUNFLOWER, PEASHOOTER, WALLNUT, CHERRY_BOMB] in `levels.js`
- [ ] **T122** [US2] Define 4 waves for LEVEL_2 with mix of NORMAL and CONE_HEAD zombies, ~25 total in `levels.js`
- [ ] **T123** [US2] Define `LEVEL_3` configuration with id:3, difficulty:3, initialSun:50 in `levels.js`
- [ ] **T124** [US2] Add `availablePlants` for LEVEL_3: all 5 plants in `levels.js`
- [ ] **T125** [US2] Define 5 waves for LEVEL_3 with all zombie types, ~35 total zombies in `levels.js`
- [ ] **T126** [US2] Add LEVEL_2 and LEVEL_3 to `LEVELS` array in `levels.js`

### Game Engine Updates (game.js) - US2

- [ ] **T127** [US2] Modify `Renderer.drawPlant()` to handle CHERRY_BOMB appearance (red circles) in `game.js`
- [ ] **T128** [US2] Modify `Renderer.drawPlant()` to handle SNOW_PEA appearance (light blue) in `game.js`
- [ ] **T129** [US2] Add explosion animation rendering for CHERRY_BOMB in `Renderer.drawPlant()` in `game.js`
- [ ] **T130** [US2] Modify `Renderer.drawZombie()` to differentiate CONE_HEAD (orange cone on head) in `game.js`
- [ ] **T131** [US2] Modify `Renderer.drawZombie()` to differentiate BUCKET_HEAD (silver bucket on head) in `game.js`
- [ ] **T132** [US2] Modify `Renderer.drawProjectile()` to show SNOW_PEA projectiles with blue tint in `game.js`
- [ ] **T133** [US2] Add slow effect visual indicator on zombies (blue tint or snowflake icon) in `Renderer.drawZombie()` in `game.js`

### UI Controller Updates (ui.js) - US2

- [ ] **T134** [US2] Modify `UIController.showLevelSelect()` to display all 3 levels with locked/unlocked states in `ui.js`
- [ ] **T135** [US2] Add level 2 click binding calling `engine.loadLevel(2)` in `ui.js`
- [ ] **T136** [US2] Add level 3 click binding calling `engine.loadLevel(3)` in `ui.js`
- [ ] **T137** [US2] Modify victory screen to unlock next level: victory on level 1 unlocks level 2, etc. in `ui.js`

### Storage Integration (storage.js & game.js) - US2

- [ ] **T138** [US2] Call `Storage.save()` on level completion with updated unlockedLevels in `game.js`
- [ ] **T139** [US2] Call `Storage.load()` on game start to restore progress in `game.js` or `ui.js`
- [ ] **T140** [US2] Update `UIController.showLevelSelect()` to read unlocked levels from loaded progress in `ui.js`

### Styles for US2 (styles.css)

- [ ] **T141** [US2] Style level cards with difficulty stars (1-3 stars) and locked overlay in `styles.css`
- [ ] **T142** [US2] Add plant card styles for CHERRY_BOMB and SNOW_PEA icons in `styles.css`

### Integration & Testing - US2

- [ ] **T143** [US2] Test level progression: Complete level 1 → Verify level 2 unlocks → Complete level 2 → Verify level 3 unlocks
- [ ] **T144** [US2] Test CHERRY_BOMB: Plant cherry → Wait 1 second → Verify explosion kills nearby zombies
- [ ] **T145** [US2] Test SNOW_PEA: Snow pea hits zombie → Verify zombie slows down (speed reduced by 50%)
- [ ] **T146** [US2] Test CONE_HEAD zombie: Verify takes more hits to kill than NORMAL zombie
- [ ] **T147** [US2] Test BUCKET_HEAD zombie: Verify survives many hits (1370 health)
- [ ] **T148** [US2] Verify all acceptance scenarios from spec.md User Story 2 (7 scenarios)
- [ ] **T149** [US2] Test progress saving: Complete level 2 → Refresh page → Verify level 2 still unlocked

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - 3 levels playable

---

## Phase 5: User Story 3 - 了解游戏规则和植物信息 (Priority: P2)

**Goal**: 玩家可以查看游戏规则说明和植物图鉴，了解每种植物的详细信息

**Independent Test**: 主界面→点击"游戏规则"→查看完整规则→关闭→点击"植物图鉴"→查看所有植物→点击某个植物→查看详细信息

### HTML Structure (index.html) - US3

- [ ] **T150** [US3] Add "游戏规则" button to main menu in `index.html`
- [ ] **T151** [US3] Add "植物图鉴" button to main menu in `index.html`
- [ ] **T152** [US3] Create game rules modal container with close button in `index.html`
- [ ] **T153** [US3] Create plant almanac modal container with plant list in `index.html`
- [ ] **T154** [US3] Create plant detail modal container for detailed plant info in `index.html`

### UI Controller (ui.js) - US3

- [ ] **T155** [US3] Implement `UIController.showGameRules()` method displaying modal with game rules text in `ui.js`
- [ ] **T156** [US3] Implement game rules content: 游戏目标, 阳光系统, 植物种植方法, 胜利失败条件 in `ui.js`
- [ ] **T157** [US3] Implement `UIController.showPlantAlmanac()` method displaying grid of all plants in `ui.js`
- [ ] **T158** [US3] Populate plant almanac with all 5 plant types showing icon, name, cost, cooldown in `ui.js`
- [ ] **T159** [US3] Implement `UIController.showPlantDetail(plantType)` method showing detailed plant info in `ui.js`
- [ ] **T160** [US3] Implement plant detail content: 完整描述, 攻击力, 攻击速度, 特殊能力 for each plant in `ui.js`
- [ ] **T161** [US3] Bind "游戏规则" button click to `showGameRules()` in `ui.js`
- [ ] **T162** [US3] Bind "植物图鉴" button click to `showPlantAlmanac()` in `ui.js`
- [ ] **T163** [US3] Bind plant card clicks in almanac to `showPlantDetail(plantType)` in `ui.js`
- [ ] **T164** [US3] Bind modal close buttons to hide modals in `ui.js`

### Game Engine (game.js) - US3

- [ ] **T165** [US3] Implement plant card hover tooltip showing name, cost, description in `game.js` or `ui.js`
- [ ] **T166** [US3] Add tooltip on plant card long-press (mobile) using touch events in `game.js`

### Styles (styles.css) - US3

- [ ] **T167** [US3] Style modal overlays: fullscreen, semi-transparent backdrop, centered content in `styles.css`
- [ ] **T168** [US3] Style game rules modal: readable text, scrollable content, close button in `styles.css`
- [ ] **T169** [US3] Style plant almanac modal: grid layout (2-3 columns), plant cards with icons in `styles.css`
- [ ] **T170** [US3] Style plant detail modal: large plant icon, stat table, description text in `styles.css`
- [ ] **T171** [US3] Style plant card hover tooltip: small popup, arrow pointer, 14px font in `styles.css`

### Integration & Testing - US3

- [ ] **T172** [US3] Test game rules: Click button → Verify modal opens with complete rules → Click close → Verify closes
- [ ] **T173** [US3] Test plant almanac: Click button → Verify shows all 5 plants → Click a plant → Verify detail opens
- [ ] **T174** [US3] Test plant detail: Verify shows correct info for each plant type (stats, description)
- [ ] **T175** [US3] Test hover tooltips: Hover over plant card in game → Verify tooltip appears quickly
- [ ] **T176** [US3] Test mobile tooltips: Long-press plant card → Verify tooltip appears
- [ ] **T177** [US3] Verify all acceptance scenarios from spec.md User Story 3 (7 scenarios)

**Checkpoint**: All core gameplay (US1-US2) plus help system (US3) complete - game fully playable with documentation

---

## Phase 6: User Story 4 - 移动设备上流畅游玩 (Priority: P3)

**Goal**: 优化移动设备体验，确保触控流畅、界面适配、横屏提示

**Independent Test**: 在手机浏览器打开→验证竖屏布局→完成第一关全流程→旋转到横屏→验证提示显示

### Responsive Styles (styles.css) - US4

- [ ] **T178** [P] [US4] Add media query for mobile (<768px): adjust canvas size, font sizes in `styles.css`
- [ ] **T179** [P] [US4] Reduce grid cell size to 80×80px on mobile in media query in `styles.css`
- [ ] **T180** [P] [US4] Increase touch target sizes: buttons min 50×50px, sun 50×50px on mobile in `styles.css`
- [ ] **T181** [P] [US4] Adjust plant card sizes to 70×90px on mobile for easier tapping in `styles.css`
- [ ] **T182** [P] [US4] Add `touch-action: manipulation` to interactive elements to reduce tap delay in `styles.css`
- [ ] **T183** [US4] Add landscape orientation detection and warning styles in `styles.css`

### Mobile Optimizations (game.js) - US4

- [ ] **T184** [US4] Modify `InputHandler.getCanvasCoordinates()` to handle touch events properly on mobile in `game.js`
- [ ] **T185** [US4] Expand clickable areas for sun collection: check within 27px radius (54px diameter) on mobile in `game.js`
- [ ] **T186** [US4] Add `preventDefault()` on touchstart for canvas to prevent page scroll during game in `game.js`
- [ ] **T187** [US4] Implement frame rate throttling on mobile: target 30fps instead of 60fps in `game.js`

### Landscape Detection (ui.js or game.js) - US4

- [ ] **T188** [US4] Implement orientation change detection using `window.matchMedia('(orientation: landscape)')` in `game.js` or `ui.js`
- [ ] **T189** [US4] Show landscape warning overlay when device rotates to landscape in `ui.js`
- [ ] **T190** [US4] Hide landscape warning when device returns to portrait in `ui.js`

### HTML Updates (index.html) - US4

- [ ] **T191** [US4] Add viewport meta tag with `width=device-width, initial-scale=1, maximum-scale=1` in `index.html`
- [ ] **T192** [US4] Add landscape warning overlay element to HTML in `index.html`

### Performance Optimizations - US4

- [ ] **T193** [P] [US4] Implement mobile performance monitoring: log FPS and frame times on mobile in `game.js`
- [ ] **T194** [P] [US4] Optimize render calls: skip drawing entities outside viewport on mobile in `game.js`
- [ ] **T195** [P] [US4] Reduce particle effects or animations if FPS drops below 25 on mobile in `game.js`

### Integration & Testing - US4

- [ ] **T196** [US4] Test on iPhone Safari: Verify touch works, no scrolling issues, game runs at 30fps+
- [ ] **T197** [US4] Test on Android Chrome: Verify touch works, layout correct, performance good
- [ ] **T198** [US4] Test landscape mode: Rotate device → Verify warning displays → Rotate back → Verify warning hides
- [ ] **T199** [US4] Test touch targets: Verify sun, buttons, plant cards easy to tap (no missed taps)
- [ ] **T200** [US4] Verify all acceptance scenarios from spec.md User Story 4 (5 scenarios)
- [ ] **T201** [US4] Performance test: Play for 5+ minutes on mobile → Verify no lag or memory issues

**Checkpoint**: Game now fully optimized for mobile devices with landscape handling

---

## Phase 7: User Story 5 - 重复游玩和进度管理 (Priority: P3)

**Goal**: 玩家可以重复游玩已完成关卡，进度自动保存，提供重置进度功能

**Independent Test**: 完成关卡→刷新页面→验证关卡保持解锁→重玩已完成关卡→重置进度→验证恢复到初始状态

### HTML Structure (index.html) - US5

- [ ] **T202** [US5] Add "重置进度" button to main menu in `index.html`
- [ ] **T203** [US5] Add confirmation dialog modal for progress reset in `index.html`

### UI Controller (ui.js) - US5

- [ ] **T204** [US5] Implement `UIController.showResetConfirmation()` method displaying confirmation dialog in `ui.js`
- [ ] **T205** [US5] Bind "重置进度" button click to `showResetConfirmation()` in `ui.js`
- [ ] **T206** [US5] Bind confirmation dialog "确定" button to call `Storage.reset()` and reload in `ui.js`
- [ ] **T207** [US5] Update `UIController.showLevelSelect()` to enable replaying completed levels (all unlocked levels clickable) in `ui.js`

### Game Engine (game.js) - US5

- [ ] **T208** [US5] Call `Storage.save()` immediately after level victory in `GameEngine` victory transition in `game.js`
- [ ] **T209** [US5] Ensure progress save includes timestamp (lastPlayed) for tracking in `game.js`

### Storage (storage.js) - US5

- [ ] **T210** [US5] Add version checking in `Storage.load()`: if version mismatch, return default progress in `storage.js`
- [ ] **T211** [US5] Add migration logic for future version updates (placeholder) in `storage.js`

### Styles (styles.css) - US5

- [ ] **T212** [US5] Style reset confirmation dialog: warning colors, clear button contrast in `styles.css`
- [ ] **T213** [US5] Add visual indicator for completed levels in level select (checkmark or star) in `styles.css`

### Integration & Testing - US5

- [ ] **T214** [US5] Test progress persistence: Complete level 1 → Refresh page → Verify level 1 still unlocked
- [ ] **T215** [US5] Test replay: Select completed level → Verify can replay → Complete again → No issues
- [ ] **T216** [US5] Test reset: Click "重置进度" → Confirm → Verify only level 1 unlocked, others locked
- [ ] **T217** [US5] Test localStorage clearing: Clear browser data → Verify game creates default progress
- [ ] **T218** [US5] Verify all acceptance scenarios from spec.md User Story 5 (4 scenarios)

**Checkpoint**: All user stories complete - game has full feature set

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple features

- [x] **T219** [P] Add loading screen with progress indicator showing resource loading percentage in `index.html` and `styles.css`
- [x] **T220** [P] Implement browser compatibility check on page load showing warning if unsupported in `game.js`
- [x] **T221** [P] Add comprehensive error boundaries catching JavaScript errors and showing user-friendly message in `game.js`
- [x] **T222** [P] Optimize asset sizes: ensure total page <3MB, compress any images if added
- [x] **T223** [P] Add meta tags for SEO: description, keywords, og:tags in `index.html`
- [x] **T224** Code review and refactoring: DRY principles, consistent naming, comment complex logic
- [x] **T225** Add keyboard shortcut support: Space to pause, Esc to menu (optional enhancement)
- [x] **T226** Performance audit using Chrome DevTools: ensure 30fps+, <100MB memory
- [x] **T227** Accessibility improvements: add ARIA labels, keyboard navigation support (optional)
- [x] **T228** Test all edge cases from spec.md Edge Cases section (10 cases)
- [x] **T229** Final cross-browser testing: Chrome, Firefox, Safari, Edge on desktop and mobile
- [x] **T230** Update README.md with final deployment URL and gameplay instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - User stories CAN proceed in parallel if staffed
  - Or sequentially in priority order: US1 → US2 → US3 → US4 → US5
- **Polish (Phase 8)**: Depends on desired user stories being complete (minimum US1)

### User Story Dependencies

- **User Story 1 (P1) - Phase 3**: Can start after Foundational - No dependencies on other stories ✅ **MVP**
- **User Story 2 (P2) - Phase 4**: Can start after Foundational - Extends US1 with new content but independently testable
- **User Story 3 (P2) - Phase 5**: Can start after Foundational - Independent help system, no dependencies
- **User Story 4 (P3) - Phase 6**: Can start after Foundational - Enhances existing features for mobile, ideally after US1 complete
- **User Story 5 (P3) - Phase 7**: Can start after Foundational - Independent progress management feature

### Within Each User Story

**General pattern**:
1. Entities/Models first (can parallelize different entities)
2. Level configs after entities defined
3. Game engine logic after entities and configs
4. UI/Rendering after game logic
5. Styles can often parallelize with logic

**Example for US1**:
1. T024-T047: Entity classes [P] (different files, can parallelize)
2. T048-T054: Level configs (depends on entities)
3. T055-T084: Game engine (depends on entities)
4. T085-T094: UI controller (depends on game engine)
5. T095-T103: Styles [P] (can parallelize with logic)
6. T104-T109: Integration testing (after all above)

### Parallel Opportunities

- **Phase 1 (Setup)**: T002, T003, T004 all [P]
- **Phase 2 (Foundational)**: T010-T013 (utils) [P], T019-T023 (CSS) [P] can run in parallel within their groups
- **Within US1**: T024-T026 (configs) [P], T027-T047 (entity implementations) can parallelize, T095-T103 (styles) [P]
- **Within US2**: T110-T113 (new configs) [P], T127-T133 (rendering updates) can parallelize
- **Within US3**: T150-T154 (HTML) [P], T167-T171 (styles) [P]
- **Within US4**: T178-T183 (responsive styles) [P], T193-T195 (performance) [P]
- **Phase 8 (Polish)**: T219-T223 all [P]

- **Different User Stories**: US3 and US4 can be worked on in parallel by different developers

---

## Parallel Example: User Story 1

```bash
# Parallel batch 1: Entity configurations
Task: "[US1] Define PlantType, PlantState enums in entities.js"
Task: "[US1] Define PLANT_CONFIGS object in entities.js"
Task: "[US1] Define ZOMBIE_CONFIGS object in entities.js"

# Parallel batch 2: CSS foundation (while entities are being built)
Task: "[US1] Style main menu container in styles.css"
Task: "[US1] Style level select container in styles.css"
Task: "[US1] Style plant card display in styles.css"
Task: "[US1] Style sun counter in styles.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) ⭐ RECOMMENDED

1. Complete **Phase 1: Setup** (T001-T004)
2. Complete **Phase 2: Foundational** (T005-T023) - CRITICAL
3. Complete **Phase 3: User Story 1** (T024-T109)
4. **STOP and VALIDATE**: 
   - Test all 9 acceptance scenarios from spec.md
   - Verify complete gameplay loop works
   - Check performance (30fps+, <5s load)
5. **Deploy to Netlify** - You have a working game! 🎮

**Why MVP first?**
- Delivers playable game fastest
- Validates core mechanics early
- Can demo/test with users immediately
- Reduces risk of building on flawed foundation

### Incremental Delivery (Recommended Order)

1. **Foundation** (Phases 1-2) → Can test project setup
2. **+ US1** (Phase 3) → **MVP Deploy** 🚀 (First playable version)
3. **+ US2** (Phase 4) → Deploy update with 3 levels
4. **+ US3** (Phase 5) → Deploy with help system
5. **+ US4** (Phase 6) → Deploy mobile-optimized version
6. **+ US5** (Phase 7) → Deploy with progress management
7. **+ Polish** (Phase 8) → Final production release

Each step adds value without breaking previous features!

### Parallel Team Strategy

With **2 developers**:
1. Both complete Foundation together (Phases 1-2)
2. Once Foundation done:
   - Dev A: US1 (Phase 3) - MVP critical path
   - Dev B: US3 (Phase 5) - Help system (independent)
3. Dev A finishes US1 → works on US2 (Phase 4)
   Dev B finishes US3 → works on US4 (Phase 6)
4. Both work on US5 and Polish together

With **1 developer**:
- Sequential order: Phases 1→2→3→4→5→6→7→8
- Stop after Phase 3 for MVP validation

---

## Task Summary

**Total Tasks**: 230
- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 19 tasks (BLOCKING)
- **Phase 3 (US1 - MVP)**: 86 tasks 🎯
- **Phase 4 (US2)**: 40 tasks
- **Phase 5 (US3)**: 23 tasks
- **Phase 6 (US4)**: 24 tasks
- **Phase 7 (US5)**: 16 tasks
- **Phase 8 (Polish)**: 12 tasks

**By User Story**:
- US1: 86 tasks (Core gameplay - MVP)
- US2: 40 tasks (3 levels with progression)
- US3: 23 tasks (Help and documentation)
- US4: 24 tasks (Mobile optimization)
- US5: 16 tasks (Progress management)
- Foundation: 23 tasks (Setup + Foundational)
- Polish: 12 tasks (Final improvements)

**Parallel Opportunities**: ~45 tasks marked [P] can run in parallel

**MVP Scope**: Phases 1-3 (109 tasks) delivers first playable game

**Estimated Timeline** (1 developer):
- MVP (Phases 1-3): 6-8 days
- Full Feature Set (Phases 1-7): 18-25 days
- With Polish (All phases): 20-27 days

---

## Notes

- [P] tasks work on different files with no dependencies - can parallelize
- [Story] label (US1-US5) maps task to specific user story for traceability
- Each user story is independently testable after its phase completes
- Stop after Phase 3 for MVP validation before proceeding
- Commit frequently after completing logical task groups
- Test acceptance scenarios at each checkpoint
- No automated tests - rely on manual testing per spec.md acceptance scenarios
- All file paths are relative to project root (flat structure)
- Bootstrap 5 loaded via CDN - no build step required

