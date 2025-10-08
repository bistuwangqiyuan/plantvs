// ========================================
// Game Engine - Main game loop, rendering, and logic
// ========================================

// Game Phase enum
const GamePhase = {
    MENU: 'menu',
    LEVEL_SELECT: 'level_select',
    PLAYING: 'playing',
    PAUSED: 'paused',
    VICTORY: 'victory',
    DEFEAT: 'defeat'
};

// ========================================
// GAME ENGINE CLASS
// ========================================

class GameEngine {
    constructor(canvas, config = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        if (!this.ctx) {
            throw new Error('Canvas 2D context not supported');
        }
        
        // Setup canvas size
        this.setupCanvas();
        
        // Game state
        this.gameState = {
            phase: GamePhase.MENU,
            currentLevel: 0,
            levelConfig: null,
            sun: 0,
            wave: 0,
            totalWaves: 0,
            plants: [],
            zombies: [],
            projectiles: [],
            suns: [],
            grid: [],
            selectedPlantType: null,
            plantCooldowns: new Map(),
            isPaused: false,
            startTime: 0,
            elapsedTime: 0,
            zombiesKilled: 0,
            sunCollected: 0,
            plantsPlanted: 0
        };
        
        // Wave management
        this.currentWaveIndex = 0;
        this.waveTimer = 0;
        this.waveSpawnQueue = [];
        
        // Sun drop timer
        this.sunDropTimer = 0;
        
        // Game loop
        this.running = false;
        this.lastTimestamp = 0;
        this.accumulator = 0;
        this.frameId = null;
        
        // Input handler
        this.inputHandler = new InputHandler(this.canvas, this);
        
        // Renderer
        this.renderer = new Renderer(this.ctx, config);
        
        // Last input time (for auto-pause)
        this.lastInputTime = Date.now();
        
        console.log('GameEngine initialized');
    }
    
    setupCanvas() {
        // Set canvas size based on container
        const container = this.canvas.parentElement;
        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
            this.canvas.width = Math.min(window.innerWidth, 500);
            this.canvas.height = window.innerHeight * 0.8;
        } else {
            this.canvas.width = 450;
            this.canvas.height = 720;
        }
        
        console.log(`Canvas size: ${this.canvas.width}x${this.canvas.height}`);
    }
    
    start() {
        if (this.running) return;
        
        this.running = true;
        this.lastTimestamp = performance.now();
        this.gameLoop(this.lastTimestamp);
        
        console.log('Game loop started');
    }
    
    stop() {
        this.running = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        
        console.log('Game loop stopped');
    }
    
    gameLoop(timestamp) {
        if (!this.running) return;
        
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        this.accumulator += deltaTime;
        
        // Fixed time step update
        while (this.accumulator >= GAME_CONSTANTS.FIXED_TIMESTEP) {
            if (this.gameState.phase === GamePhase.PLAYING && !this.gameState.isPaused) {
                this.update(GAME_CONSTANTS.FIXED_TIMESTEP);
            }
            this.accumulator -= GAME_CONSTANTS.FIXED_TIMESTEP;
        }
        
        // Render
        const interpolation = this.accumulator / GAME_CONSTANTS.FIXED_TIMESTEP;
        this.render(interpolation);
        
        // Continue loop
        this.frameId = requestAnimationFrame((ts) => this.gameLoop(ts));
    }
    
    update(deltaTime) {
        // Check for auto-pause (5 seconds of no input)
        if (Date.now() - this.lastInputTime > GAME_CONSTANTS.IDLE_PAUSE_TIME) {
            this.pause();
            showTooltip('游戏已暂停，点击继续');
            this.lastInputTime = Date.now();  // Reset to avoid constant pausing
            return;
        }
        
        // Update elapsed time
        this.gameState.elapsedTime += deltaTime / 1000;
        
        // Update sun drop timer
        this.updateSunDrop(deltaTime);
        
        // Update suns
        this.updateSuns(deltaTime);
        
        // Update plants
        this.updatePlants(deltaTime);
        
        // Update zombies
        this.updateZombies(deltaTime);
        
        // Update projectiles
        this.updateProjectiles(deltaTime);
        
        // Collision detection
        this.checkProjectileZombieCollision();
        this.checkZombiePlantCollision();
        
        // Update wave spawning
        this.updateWaveSpawning(deltaTime);
        
        // Update plant cooldowns
        this.updatePlantCooldowns(deltaTime);
        
        // Clean up dead entities
        this.cleanupEntities();
        
        // Check victory/defeat conditions
        this.checkGameConditions();
    }
    
    updateSunDrop(deltaTime) {
        this.sunDropTimer += deltaTime;
        
        if (this.sunDropTimer >= GAME_CONSTANTS.SUN_DROP_INTERVAL) {
            this.sunDropTimer = 0;
            this.spawnSkySun();
        }
    }
    
    spawnSkySun() {
        const x = Math.random() * (this.canvas.width - 100) + 50;
        const y = 50;
        const sun = new Sun(x, y, GAME_CONSTANTS.SUN_VALUE_SKY, SunSource.SKY);
        this.gameState.suns.push(sun);
    }
    
    updateSuns(deltaTime) {
        this.gameState.suns.forEach(sun => {
            const result = sun.update(deltaTime);
            
            // Check if sun animation completed collection
            if (sun.state === SunState.COLLECTED) {
                // Sun will be removed in cleanup
            }
        });
    }
    
    updatePlants(deltaTime) {
        this.gameState.plants.forEach(plant => {
            const result = plant.update(deltaTime);
            
            if (result) {
                switch (result.action) {
                    case 'produceSun':
                        const sunData = plant.produceSun();
                        if (sunData) {
                            const sun = new Sun(
                                plant.x + 20,
                                plant.y - 20,
                                sunData.value,
                                SunSource.SUNFLOWER
                            );
                            this.gameState.suns.push(sun);
                        }
                        break;
                        
                    case 'explode':
                        const explosionData = plant.explode();
                        if (explosionData) {
                            this.handleExplosion(explosionData);
                        }
                        break;
                }
            }
            
            // Handle plant attacks
            if (plant.canAttack()) {
                // Check if there are zombies in this row
                const zombiesInRow = this.gameState.zombies.filter(z => 
                    z.row === plant.position.row && z.state !== ZombieState.DEAD
                );
                
                if (zombiesInRow.length > 0) {
                    const projectileData = plant.performAttack();
                    if (projectileData) {
                        const projectile = new Projectile(
                            projectileData.type,
                            plant.x + plant.width,
                            plant.y + plant.height / 2,
                            plant.position.row,
                            projectileData.damage,
                            projectileData.effects
                        );
                        this.gameState.projectiles.push(projectile);
                    }
                }
            }
        });
    }
    
    updateZombies(deltaTime) {
        this.gameState.zombies.forEach(zombie => {
            const result = zombie.update(deltaTime);
            
            if (result) {
                switch (result.action) {
                    case 'reachedBoundary':
                        // Game over
                        this.transitionToDefeat();
                        break;
                        
                    case 'attack':
                        if (result.target) {
                            zombie.attackPlant(result.target);
                        }
                        break;
                }
            }
            
            // Check for boundary warning
            if (zombie.x < GAME_CONSTANTS.ZOMBIE_BOUNDARY_WARNING && zombie.x > GAME_CONSTANTS.ZOMBIE_DEFEAT_X) {
                // Show warning (implement in UI)
                this.showBoundaryWarning = true;
            }
        });
    }
    
    updateProjectiles(deltaTime) {
        this.gameState.projectiles.forEach(projectile => {
            projectile.update(deltaTime);
        });
    }
    
    updateWaveSpawning(deltaTime) {
        if (this.currentWaveIndex >= this.gameState.totalWaves) return;
        
        this.waveTimer += deltaTime / 1000;  // Convert to seconds
        
        // Check if it's time to spawn the next wave
        const currentWave = this.gameState.levelConfig.waves[this.currentWaveIndex];
        if (this.waveTimer >= currentWave.delay) {
            this.spawnWave(currentWave);
            this.currentWaveIndex++;
            this.gameState.wave = this.currentWaveIndex;
            this.waveTimer = 0;
        }
        
        // Spawn individual zombies from queue
        this.waveSpawnQueue = this.waveSpawnQueue.filter(spawn => {
            spawn.timer += deltaTime / 1000;
            if (spawn.timer >= spawn.delay) {
                this.spawnZombie(spawn.type, spawn.row);
                return false;  // Remove from queue
            }
            return true;  // Keep in queue
        });
    }
    
    spawnWave(waveConfig) {
        console.log(`Spawning wave ${waveConfig.waveNumber}`);
        
        waveConfig.zombies.forEach(zombieSpawn => {
            this.waveSpawnQueue.push({
                type: zombieSpawn.type,
                row: zombieSpawn.row,
                delay: zombieSpawn.delay,
                timer: 0
            });
        });
    }
    
    spawnZombie(type, row) {
        const config = ZOMBIE_CONFIGS[type];
        const zombie = new Zombie(type, row, config);
        
        // Calculate Y position based on row
        const cellHeight = this.canvas.height / (GAME_CONSTANTS.GRID_ROWS + 2);  // +2 for top UI
        zombie.y = cellHeight * (row + 1) + cellHeight / 2 - zombie.height / 2;
        
        this.gameState.zombies.push(zombie);
        console.log(`Spawned ${type} zombie in row ${row}`);
    }
    
    checkProjectileZombieCollision() {
        this.gameState.projectiles.forEach(projectile => {
            if (!projectile.active) return;
            
            const zombiesInRow = this.gameState.zombies.filter(z => z.row === projectile.row);
            const hitZombie = projectile.checkCollision(zombiesInRow);
            
            if (hitZombie) {
                projectile.hit(hitZombie);
                if (hitZombie.state === ZombieState.DYING || hitZombie.state === ZombieState.DEAD) {
                    this.gameState.zombiesKilled++;
                }
            }
        });
    }
    
    checkZombiePlantCollision() {
        this.gameState.zombies.forEach(zombie => {
            if (zombie.state === ZombieState.DEAD) return;
            
            // Find plants in the same row
            const plantsInRow = this.gameState.plants.filter(p => 
                p.position.row === zombie.row && 
                p.state !== PlantState.DESTROYED
            );
            
            // Find the nearest plant in front of the zombie
            let nearestPlant = null;
            let nearestDistance = Infinity;
            
            plantsInRow.forEach(plant => {
                if (plant.x > zombie.x - zombie.width) {
                    const distance = Math.abs(plant.x - zombie.x);
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestPlant = plant;
                    }
                }
            });
            
            // Check collision with nearest plant
            if (nearestPlant && nearestDistance < 50) {
                zombie.state = ZombieState.ATTACKING;
                zombie.targetPlant = nearestPlant;
            } else if (zombie.targetPlant) {
                // No longer colliding, return to walking
                zombie.state = ZombieState.WALKING;
                zombie.targetPlant = null;
            }
        });
    }
    
    handleExplosion(explosionData) {
        // Find all zombies in explosion radius
        this.gameState.zombies.forEach(zombie => {
            const distance = getDistance(zombie.x, zombie.y, explosionData.x, explosionData.y);
            if (distance <= explosionData.radius) {
                zombie.takeDamage(explosionData.damage);
                if (zombie.state === ZombieState.DYING || zombie.state === ZombieState.DEAD) {
                    this.gameState.zombiesKilled++;
                }
            }
        });
        
        console.log('Explosion triggered!');
    }
    
    updatePlantCooldowns(deltaTime) {
        for (const [plantType, cooldown] of this.gameState.plantCooldowns) {
            const newCooldown = Math.max(0, cooldown - deltaTime);
            this.gameState.plantCooldowns.set(plantType, newCooldown);
        }
    }
    
    cleanupEntities() {
        // Remove dead plants
        this.gameState.plants = this.gameState.plants.filter(p => {
            if (p.state === PlantState.DESTROYED) {
                // Clear from grid
                if (this.gameState.grid[p.position.row] && this.gameState.grid[p.position.row][p.position.col]) {
                    this.gameState.grid[p.position.row][p.position.col].plant = null;
                }
                return false;
            }
            return true;
        });
        
        // Remove dead zombies
        this.gameState.zombies = this.gameState.zombies.filter(z => z.state !== ZombieState.DEAD);
        
        // Remove inactive projectiles
        this.gameState.projectiles = this.gameState.projectiles.filter(p => p.active);
        
        // Remove collected suns
        this.gameState.suns = this.gameState.suns.filter(s => !s.checkExpire());
    }
    
    checkGameConditions() {
        // Check victory
        if (this.currentWaveIndex >= this.gameState.totalWaves && 
            this.waveSpawnQueue.length === 0 &&
            this.gameState.zombies.length === 0) {
            this.transitionToVictory();
        }
        
        // Defeat is checked in updateZombies when boundary is reached
    }
    
    render(interpolation) {
        // Clear canvas
        this.renderer.clear();
        
        // Only render game if in playing state
        if (this.gameState.phase === GamePhase.PLAYING) {
            // Draw background
            this.renderer.drawBackground();
            
            // Draw grid
            this.renderer.drawGrid(this.gameState.grid);
            
            // Draw plants
            this.gameState.plants.forEach(plant => {
                this.renderer.drawPlant(plant, interpolation);
            });
            
            // Draw zombies
            this.gameState.zombies.forEach(zombie => {
                this.renderer.drawZombie(zombie, interpolation);
            });
            
            // Draw projectiles
            this.gameState.projectiles.forEach(projectile => {
                this.renderer.drawProjectile(projectile, interpolation);
            });
            
            // Draw suns
            this.gameState.suns.forEach(sun => {
                this.renderer.drawSun(sun, interpolation);
            });
            
            // Draw UI
            this.renderer.drawUI(this.gameState);
        }
    }
    
    loadLevel(levelId) {
        console.log(`Loading level ${levelId}`);
        
        const levelConfig = getLevelConfig(levelId);
        if (!levelConfig) {
            console.error(`Level ${levelId} not found`);
            return false;
        }
        
        // Reset game state
        this.gameState.phase = GamePhase.PLAYING;
        this.gameState.currentLevel = levelId;
        this.gameState.levelConfig = levelConfig;
        this.gameState.sun = levelConfig.initialSun;
        this.gameState.wave = 0;
        this.gameState.totalWaves = levelConfig.waves.length;
        this.gameState.plants = [];
        this.gameState.zombies = [];
        this.gameState.projectiles = [];
        this.gameState.suns = [];
        this.gameState.selectedPlantType = null;
        this.gameState.plantCooldowns.clear();
        this.gameState.isPaused = false;
        this.gameState.startTime = Date.now();
        this.gameState.elapsedTime = 0;
        this.gameState.zombiesKilled = 0;
        this.gameState.sunCollected = 0;
        this.gameState.plantsPlanted = 0;
        
        // Reset wave management
        this.currentWaveIndex = 0;
        this.waveTimer = 0;
        this.waveSpawnQueue = [];
        this.sunDropTimer = 0;
        
        // Initialize grid
        this.initializeGrid();
        
        // Hide loading screen and show game
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('levelSelect').style.display = 'none';
        
        console.log(`Level ${levelId} loaded successfully`);
        return true;
    }
    
    initializeGrid() {
        this.gameState.grid = [];
        const cellWidth = this.canvas.width / (GAME_CONSTANTS.GRID_COLS + 1);
        const cellHeight = this.canvas.height / (GAME_CONSTANTS.GRID_ROWS + 2);
        
        for (let row = 0; row < GAME_CONSTANTS.GRID_ROWS; row++) {
            this.gameState.grid[row] = [];
            for (let col = 0; col < GAME_CONSTANTS.GRID_COLS; col++) {
                this.gameState.grid[row][col] = {
                    row: row,
                    col: col,
                    x: cellWidth * (col + 0.5),
                    y: cellHeight * (row + 1.5),
                    width: cellWidth * 0.8,
                    height: cellHeight * 0.8,
                    plant: null
                };
            }
        }
    }
    
    pause() {
        if (this.gameState.phase !== GamePhase.PLAYING) return;
        
        this.gameState.isPaused = true;
        document.getElementById('pauseMenu').style.display = 'flex';
        console.log('Game paused');
    }
    
    resume() {
        if (this.gameState.phase !== GamePhase.PLAYING) return;
        
        this.gameState.isPaused = false;
        document.getElementById('pauseMenu').style.display = 'none';
        this.lastInputTime = Date.now();  // Reset idle timer
        console.log('Game resumed');
    }
    
    restart() {
        this.loadLevel(this.gameState.currentLevel);
    }
    
    exitToMenu() {
        this.gameState.phase = GamePhase.MENU;
        document.getElementById('pauseMenu').style.display = 'none';
        document.getElementById('mainMenu').style.display = 'flex';
    }
    
    transitionToVictory() {
        if (this.gameState.phase !== GamePhase.PLAYING) return;
        
        this.gameState.phase = GamePhase.VICTORY;
        console.log('Victory!');
        
        // Unlock next level
        const nextLevel = this.gameState.currentLevel + 1;
        if (nextLevel <= 3) {
            const progress = Storage.load();
            if (!progress.unlockedLevels.includes(nextLevel)) {
                progress.unlockedLevels.push(nextLevel);
                Storage.save(progress);
            }
        }
        
        // Show victory screen
        document.getElementById('victoryScreen').style.display = 'flex';
        document.getElementById('victoryStats').innerHTML = `
            <p>用时: ${Math.floor(this.gameState.elapsedTime)}秒</p>
            <p>剩余阳光: ${this.gameState.sun}</p>
            <p>击杀僵尸: ${this.gameState.zombiesKilled}</p>
        `;
    }
    
    transitionToDefeat() {
        if (this.gameState.phase !== GamePhase.PLAYING) return;
        
        this.gameState.phase = GamePhase.DEFEAT;
        console.log('Defeat!');
        
        // Show defeat screen
        document.getElementById('defeatScreen').style.display = 'flex';
    }
    
    selectPlant(plantType) {
        const config = PLANT_CONFIGS[plantType];
        
        // Check sun cost
        if (this.gameState.sun < config.cost) {
            showTooltip(`阳光不足！需要${config.cost}阳光`);
            return false;
        }
        
        // Check cooldown
        const cooldown = this.gameState.plantCooldowns.get(plantType) || 0;
        if (cooldown > 0) {
            showTooltip(`冷却中，还需${(cooldown / 1000).toFixed(1)}秒`);
            return false;
        }
        
        // Check if available in this level
        if (!this.gameState.levelConfig.availablePlants.includes(plantType)) {
            showTooltip('该关卡不可使用此植物');
            return false;
        }
        
        this.gameState.selectedPlantType = plantType;
        this.lastInputTime = Date.now();
        return true;
    }
    
    plantSeed(cell) {
        if (!this.gameState.selectedPlantType) return false;
        
        // Check if cell is empty
        if (cell.plant) {
            showTooltip('该位置已有植物');
            return false;
        }
        
        const plantType = this.gameState.selectedPlantType;
        const config = PLANT_CONFIGS[plantType];
        
        // Double-check sun cost
        if (this.gameState.sun < config.cost) {
            showTooltip(`阳光不足！需要${config.cost}阳光`);
            return false;
        }
        
        // Create plant
        const plant = new Plant(plantType, {row: cell.row, col: cell.col}, config);
        plant.x = cell.x;
        plant.y = cell.y;
        
        // Add to game state
        this.gameState.plants.push(plant);
        cell.plant = plant;
        
        // Consume sun
        this.gameState.sun -= config.cost;
        this.gameState.plantsPlanted++;
        
        // Start cooldown
        this.gameState.plantCooldowns.set(plantType, config.cooldown * 1000);
        
        // Deselect
        this.gameState.selectedPlantType = null;
        
        this.lastInputTime = Date.now();
        console.log(`Planted ${plantType} at (${cell.row}, ${cell.col})`);
        return true;
    }
    
    collectSun(sun) {
        if (sun.state !== SunState.IDLE && sun.state !== SunState.FALLING) return false;
        
        // Check sun cap
        if (this.gameState.sun >= GAME_CONSTANTS.MAX_SUN) {
            showTooltip('阳光已达上限');
            return false;
        }
        
        // Start collection animation
        const targetPos = {x: 50, y: 20};  // Sun counter position
        sun.collect(targetPos);
        
        // Add sun after animation (delayed)
        setTimeout(() => {
            this.gameState.sun = Math.min(GAME_CONSTANTS.MAX_SUN, this.gameState.sun + sun.value);
            this.gameState.sunCollected += sun.value;
        }, 500);
        
        this.lastInputTime = Date.now();
        return true;
    }
    
    getGridCellAt(x, y) {
        for (let row of this.gameState.grid) {
            for (let cell of row) {
                if (x >= cell.x - cell.width / 2 &&
                    x <= cell.x + cell.width / 2 &&
                    y >= cell.y - cell.height / 2 &&
                    y <= cell.y + cell.height / 2) {
                    return cell;
                }
            }
        }
        return null;
    }
    
    findSunAt(x, y) {
        for (let sun of this.gameState.suns) {
            if (sun.state !== SunState.IDLE && sun.state !== SunState.FALLING) continue;
            
            const distance = getDistance(x, y, sun.x, sun.y);
            if (distance < sun.width / 2 + 20) {  // Extended click area
                return sun;
            }
        }
        return null;
    }
}

// ========================================
// INPUT HANDLER CLASS
// ========================================

class InputHandler {
    constructor(canvas, engine) {
        this.canvas = canvas;
        this.engine = engine;
        this.bindEvents();
    }
    
    bindEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handlePointerDown(e);
        }, {passive: false});
    }
    
    handlePointerDown(event) {
        const coords = this.getCanvasCoordinates(event);
        
        // Check what was clicked based on game phase
        if (this.engine.gameState.phase === GamePhase.PLAYING && !this.engine.gameState.isPaused) {
            // Priority: Sun > Plant Card > Grid
            
            // Check for sun click
            const sun = this.engine.findSunAt(coords.x, coords.y);
            if (sun) {
                this.engine.collectSun(sun);
                return;
            }
            
            // Check for plant card click (in UI, handled by UIController)
            
            // Check for grid click
            if (this.engine.gameState.selectedPlantType) {
                const cell = this.engine.getGridCellAt(coords.x, coords.y);
                if (cell) {
                    this.engine.plantSeed(cell);
                }
            }
        }
    }
    
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
}

// ========================================
// RENDERER CLASS
// ========================================

class Renderer {
    constructor(ctx, config) {
        this.ctx = ctx;
        this.config = config;
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.ctx.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    
    drawGrid(grid) {
        this.ctx.strokeStyle = '#D3D3D3';
        this.ctx.lineWidth = 2;
        
        grid.forEach(row => {
            row.forEach(cell => {
                this.ctx.strokeRect(
                    cell.x - cell.width / 2,
                    cell.y - cell.height / 2,
                    cell.width,
                    cell.height
                );
            });
        });
    }
    
    drawPlant(plant, interpolation) {
        if (plant.state === PlantState.DESTROYED) return;
        
        this.ctx.save();
        
        // Draw plant emoji
        const config = PLANT_CONFIGS[plant.type];
        this.ctx.font = '40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(config.emoji, plant.x, plant.y);
        
        // Draw health bar
        if (plant.health < plant.maxHealth) {
            const barWidth = 40;
            const barHeight = 5;
            const healthPercent = plant.health / plant.maxHealth;
            
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(plant.x - barWidth / 2, plant.y - 30, barWidth, barHeight);
            
            this.ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : '#f00';
            this.ctx.fillRect(plant.x - barWidth / 2, plant.y - 30, barWidth * healthPercent, barHeight);
        }
        
        this.ctx.restore();
    }
    
    drawZombie(zombie, interpolation) {
        if (zombie.state === ZombieState.DEAD) return;
        
        this.ctx.save();
        
        // Draw zombie emoji
        const config = ZOMBIE_CONFIGS[zombie.type];
        this.ctx.font = '50px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Apply slow effect tint
        if (zombie.slowMultiplier < 1.0) {
            this.ctx.globalAlpha = 0.7;
        }
        
        this.ctx.fillText(config.emoji, zombie.x, zombie.y);
        
        // Draw health bar
        const barWidth = 40;
        const barHeight = 5;
        const healthPercent = zombie.health / zombie.maxHealth;
        
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(zombie.x - barWidth / 2, zombie.y - 40, barWidth, barHeight);
        
        this.ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : '#f00';
        this.ctx.fillRect(zombie.x - barWidth / 2, zombie.y - 40, barWidth * healthPercent, barHeight);
        
        this.ctx.restore();
    }
    
    drawProjectile(projectile, interpolation) {
        if (!projectile.active) return;
        
        this.ctx.save();
        this.ctx.fillStyle = projectile.type === ProjectileType.SNOW_PEA ? '#00BFFF' : '#90EE90';
        this.ctx.beginPath();
        this.ctx.arc(projectile.x, projectile.y, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    drawSun(sun, interpolation) {
        if (sun.state === SunState.COLLECTED) return;
        
        this.ctx.save();
        
        // Draw sun
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(sun.x, sun.y, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw sun rays
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x1 = sun.x + Math.cos(angle) * 15;
            const y1 = sun.y + Math.sin(angle) * 15;
            const x2 = sun.x + Math.cos(angle) * 25;
            const y2 = sun.y + Math.sin(angle) * 25;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
        
        // Draw value
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(sun.value, sun.x, sun.y);
        
        this.ctx.restore();
    }
    
    drawUI(gameState) {
        // Draw sun counter
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(10, 10, 100, 40);
        this.ctx.strokeStyle = '#333';
        this.ctx.strokeRect(10, 10, 100, 40);
        
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`☀️ ${gameState.sun}`, 60, 30);
        
        // Draw wave counter
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const waveX = this.ctx.canvas.width / 2 - 60;
        this.ctx.fillRect(waveX, 10, 120, 40);
        this.ctx.strokeStyle = '#333';
        this.ctx.strokeRect(waveX, 10, 120, 40);
        
        this.ctx.fillStyle = '#000';
        this.ctx.fillText(`第${gameState.wave}波/共${gameState.totalWaves}波`, waveX + 60, 30);
        
        this.ctx.restore();
    }
}

// ========================================
// INITIALIZATION
// ========================================

let gameEngine;

// Global error handler for uncaught exceptions
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    showErrorMessage('游戏发生错误，请刷新页面重试。');
    return true; // Prevent default error handling
});

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showErrorMessage('游戏发生错误，请刷新页面重试。');
    event.preventDefault();
});

// Wait for page load
window.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing game...');
    
    // Check browser support
    if (!checkBrowserSupport()) {
        showErrorMessage('您的浏览器不支持该游戏，请使用最新版Chrome、Firefox、Safari或Edge浏览器。');
        return;
    }
    
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        showErrorMessage('游戏加载失败，请刷新页面重试。');
        return;
    }
    
    try {
        gameEngine = new GameEngine(canvas);
        gameEngine.start();
        
        // Initialize UI Controller
        initializeUI(gameEngine);
        
        // Setup keyboard shortcuts
        setupKeyboardShortcuts();
        
        // Hide loading screen after a short delay
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
        }, 1000);
        
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showErrorMessage('游戏初始化失败：' + error.message);
    }
});

/**
 * Check if browser supports required features
 * @returns {boolean} True if all required features are supported
 */
function checkBrowserSupport() {
    const checks = [
        !!document.createElement('canvas').getContext,
        !!window.localStorage,
        !!window.requestAnimationFrame
    ];
    
    return checks.every(Boolean);
}

/**
 * Setup keyboard shortcuts for game controls
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        if (!gameEngine) return;
        
        switch (event.key) {
            case ' ':
            case 'Spacebar':
                // Space to pause/resume
                event.preventDefault();
                if (gameEngine.gameState.phase === GamePhase.PLAYING) {
                    if (gameEngine.gameState.isPaused) {
                        gameEngine.resume();
                    } else {
                        gameEngine.pause();
                    }
                }
                break;
                
            case 'Escape':
            case 'Esc':
                // Escape to go back to menu
                event.preventDefault();
                if (gameEngine.gameState.phase === GamePhase.PLAYING) {
                    gameEngine.pause();
                } else if (gameEngine.gameState.phase === GamePhase.PAUSED) {
                    gameEngine.exitToMenu();
                    document.getElementById('mainMenu').style.display = 'flex';
                }
                break;
                
            case 'r':
            case 'R':
                // R to restart level (when paused)
                if (gameEngine.gameState.phase === GamePhase.PAUSED) {
                    event.preventDefault();
                    document.getElementById('pauseMenu').style.display = 'none';
                    gameEngine.restart();
                }
                break;
        }
    });
}

/**
 * Show user-friendly error message
 * @param {string} message - Error message to display
 */
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(220, 53, 69, 0.95);
        color: white;
        padding: 2rem;
        border-radius: 10px;
        max-width: 80%;
        text-align: center;
        z-index: 10000;
        font-size: 1.2rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    `;
    errorDiv.innerHTML = `
        <h3>⚠️ 错误</h3>
        <p>${message}</p>
        <button onclick="location.reload()" style="
            margin-top: 1rem;
            padding: 0.5rem 1.5rem;
            background: white;
            color: #dc3545;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1rem;
        ">刷新页面</button>
    `;
    document.body.appendChild(errorDiv);
}

/**
 * Show tooltip message to user
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds (default 2000)
 */
function showTooltip(message, duration = 2000) {
    const tooltip = document.getElementById('tooltip');
    const content = document.getElementById('tooltipContent');
    
    if (tooltip && content) {
        content.textContent = message;
        tooltip.style.display = 'block';
        tooltip.style.left = '50%';
        tooltip.style.top = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
        
        setTimeout(() => {
            tooltip.style.display = 'none';
        }, duration);
    }
}

