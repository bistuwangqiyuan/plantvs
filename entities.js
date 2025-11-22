// ========================================
// Game Entities - Plants, Zombies, Projectiles, Sun
// ========================================

// ========================================
// ENUMS
// ========================================

const PlantType = {
    SUNFLOWER: 'sunflower',
    PEASHOOTER: 'peashooter',
    WALLNUT: 'wallnut',
    CHERRY_BOMB: 'cherry_bomb',
    SNOW_PEA: 'snow_pea'
};

const PlantState = {
    ACTIVE: 'active',
    DAMAGED: 'damaged',
    EXPLODING: 'exploding',
    DESTROYED: 'destroyed'
};

const ZombieType = {
    NORMAL: 'normal',
    CONE_HEAD: 'cone_head',
    BUCKET_HEAD: 'bucket_head'
};

const ZombieState = {
    WALKING: 'walking',
    ATTACKING: 'attacking',
    SLOWED: 'slowed',
    DYING: 'dying',
    DEAD: 'dead'
};

const ProjectileType = {
    PEA: 'pea',
    SNOW_PEA: 'snow_pea'
};

const SunSource = {
    SKY: 'sky',
    SUNFLOWER: 'sunflower'
};

const SunState = {
    FALLING: 'falling',
    IDLE: 'idle',
    COLLECTING: 'collecting',
    COLLECTED: 'collected'
};

// ========================================
// PLANT CONFIGURATIONS
// ========================================

const PLANT_CONFIGS = {
    [PlantType.SUNFLOWER]: {
        name: '向日葵',
        emoji: '🌻',
        cost: 50,
        cooldown: 7.5,
        maxHealth: 300,
        productionInterval: 24,  // seconds
        sunProduced: 25,
        description: '生产阳光的基础植物',
        width: 40,
        height: 40
    },
    [PlantType.PEASHOOTER]: {
        name: '豌豆射手',
        emoji: '🌰',
        cost: 100,
        cooldown: 7.5,
        maxHealth: 300,
        attackPower: 20,
        attackSpeed: 1.4,  // seconds between attacks
        projectileSpeed: 200,  // pixels per second
        description: '发射豌豆攻击僵尸',
        width: 40,
        height: 40
    },
    [PlantType.WALLNUT]: {
        name: '坚果墙',
        emoji: '🥜',
        cost: 50,
        cooldown: 30,
        maxHealth: 4000,
        description: '高血量防御植物',
        width: 40,
        height: 40
    },
    [PlantType.CHERRY_BOMB]: {
        name: '樱桃炸弹',
        emoji: '💣',
        cost: 150,
        cooldown: 50,
        explosionDelay: 1.0,  // seconds
        explosionDamage: 1800,
        explosionRadius: 150,  // pixels
        description: '爆炸范围伤害',
        width: 40,
        height: 40
    },
    [PlantType.SNOW_PEA]: {
        name: '寒冰射手',
        emoji: '❄️',
        cost: 175,
        cooldown: 7.5,
        maxHealth: 300,
        attackPower: 20,
        attackSpeed: 1.4,
        projectileSpeed: 200,
        slowEffect: 0.5,  // 50% slow
        slowDuration: 10,  // seconds
        description: '发射寒冰豌豆并减速僵尸',
        width: 40,
        height: 40
    }
};

// ========================================
// ZOMBIE CONFIGURATIONS
// ========================================

const ZOMBIE_CONFIGS = {
    [ZombieType.NORMAL]: {
        name: '普通僵尸',
        emoji: '🧟',
        maxHealth: 200,
        speed: 30,  // pixels per second
        attackPower: 100,  // damage per second
        attackSpeed: 1.0,
        description: '最基础的僵尸',
        width: 40,
        height: 60
    },
    [ZombieType.CONE_HEAD]: {
        name: '路障僵尸',
        emoji: '🧟‍♂️',
        maxHealth: 640,
        speed: 30,
        attackPower: 100,
        attackSpeed: 1.0,
        description: '戴路障的僵尸，血量更高',
        width: 40,
        height: 60
    },
    [ZombieType.BUCKET_HEAD]: {
        name: '铁桶僵尸',
        emoji: '🧟‍♀️',
        maxHealth: 1370,
        speed: 30,
        attackPower: 100,
        attackSpeed: 1.0,
        description: '戴铁桶的僵尸，血量极高',
        width: 40,
        height: 60
    }
};

// ========================================
// PLANT CLASS
// ========================================

class Plant {
    constructor(type, position, config) {
        this.id = `plant_${Date.now()}_${Math.random()}`;
        this.type = type;
        this.position = position;  // {row, col}
        this.config = config;
        
        // Position in pixels (calculated based on grid)
        this.x = 0;
        this.y = 0;
        this.width = config.width;
        this.height = config.height;
        
        // Stats
        this.health = config.maxHealth || 300;
        this.maxHealth = config.maxHealth || 300;
        this.state = PlantState.ACTIVE;
        
        // Attack properties
        this.lastAttackTime = 0;
        this.attackTimer = 0;
        
        // Production properties (for sunflower)
        this.productionTimer = 0;
        
        // Explosion properties (for cherry bomb)
        this.explosionTimer = 0;
    }
    
    update(deltaTime) {
        if (this.state === PlantState.DESTROYED) return;
        
        const deltaSeconds = deltaTime / 1000;
        
        // Update attack timer
        if (this.attackTimer > 0) {
            this.attackTimer -= deltaSeconds;
        }
        
        // Handle different plant types
        switch (this.type) {
            case PlantType.SUNFLOWER:
                this.updateSunflower(deltaSeconds);
                break;
                
            case PlantType.CHERRY_BOMB:
                this.updateCherryBomb(deltaSeconds);
                break;
        }
    }
    
    updateSunflower(deltaSeconds) {
        this.productionTimer += deltaSeconds;
        
        if (this.productionTimer >= this.config.productionInterval) {
            // Signal to produce sun (will be handled by game engine)
            this.productionTimer = 0;
            return {action: 'produceSun'};
        }
    }
    
    updateCherryBomb(deltaSeconds) {
        this.explosionTimer += deltaSeconds;
        
        if (this.explosionTimer >= this.config.explosionDelay) {
            this.state = PlantState.EXPLODING;
            return {action: 'explode'};
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        if (this.health <= 0) {
            this.health = 0;
            this.state = PlantState.DESTROYED;
            return false;  // Plant is dead
        }
        
        if (this.health < this.maxHealth * 0.5) {
            this.state = PlantState.DAMAGED;
        }
        
        return true;  // Plant is still alive
    }
    
    canAttack() {
        if (this.type !== PlantType.PEASHOOTER && this.type !== PlantType.SNOW_PEA) {
            return false;
        }
        
        if (this.state !== PlantState.ACTIVE && this.state !== PlantState.DAMAGED) {
            return false;
        }
        
        return this.attackTimer <= 0;
    }
    
    performAttack() {
        if (!this.canAttack()) return null;
        
        // Reset attack timer
        this.attackTimer = this.config.attackSpeed;
        
        // Create projectile
        const projectileType = this.type === PlantType.SNOW_PEA ? 
            ProjectileType.SNOW_PEA : ProjectileType.PEA;
        
        const effects = this.type === PlantType.SNOW_PEA ? {
            slow: this.config.slowEffect,
            slowDuration: this.config.slowDuration
        } : {};
        
        return {
            type: projectileType,
            damage: this.config.attackPower,
            speed: this.config.projectileSpeed,
            effects: effects
        };
    }
    
    produceSun() {
        if (this.type !== PlantType.SUNFLOWER) return null;
        
        return {
            value: this.config.sunProduced,
            x: this.x,
            y: this.y
        };
    }
    
    explode() {
        if (this.type !== PlantType.CHERRY_BOMB) return null;
        
        this.state = PlantState.DESTROYED;
        
        return {
            x: this.x,
            y: this.y,
            radius: this.config.explosionRadius,
            damage: this.config.explosionDamage
        };
    }
}

// ========================================
// ZOMBIE CLASS
// ========================================

class Zombie {
    constructor(type, row, config) {
        this.id = `zombie_${Date.now()}_${Math.random()}`;
        this.type = type;
        this.row = row;
        this.config = config;
        
        // Position
        this.x = GAME_CONSTANTS.ZOMBIE_START_X;
        this.y = 0;  // Will be set based on row
        this.width = config.width;
        this.height = config.height;
        
        // Stats
        this.health = config.maxHealth;
        this.maxHealth = config.maxHealth;
        this.speed = config.speed;
        this.state = ZombieState.WALKING;
        
        // Attack
        this.targetPlant = null;
        this.attackTimer = 0;
        
        // Slow effect
        this.slowMultiplier = 1.0;
        this.slowEndTime = 0;
    }
    
    update(deltaTime) {
        if (this.state === ZombieState.DEAD) return;
        
        const deltaSeconds = deltaTime / 1000;
        
        // Update slow effect
        if (this.slowEndTime > 0 && Date.now() > this.slowEndTime) {
            this.slowMultiplier = 1.0;
            this.slowEndTime = 0;
        }
        
        // Update based on state
        switch (this.state) {
            case ZombieState.WALKING:
                this.move(deltaSeconds);
                break;
                
            case ZombieState.ATTACKING:
                this.updateAttack(deltaSeconds);
                break;
        }
        
        // Check if reached boundary
        if (this.checkBoundary()) {
            return {action: 'reachedBoundary'};
        }
    }
    
    move(deltaSeconds) {
        const effectiveSpeed = this.speed * this.slowMultiplier;
        this.x -= effectiveSpeed * deltaSeconds;
    }
    
    updateAttack(deltaSeconds) {
        this.attackTimer += deltaSeconds;
        
        if (this.targetPlant && this.attackTimer >= (1 / this.config.attackSpeed)) {
            return {
                action: 'attack',
                target: this.targetPlant,
                damage: this.config.attackPower * (this.attackTimer)
            };
        }
    }
    
    takeDamage(amount, effects = {}) {
        this.health -= amount;
        
        // Apply effects
        if (effects.slow) {
            this.applySlow(effects.slow, effects.slowDuration);
        }
        
        if (this.health <= 0) {
            this.health = 0;
            this.state = ZombieState.DYING;
            // After dying animation, set to DEAD
            setTimeout(() => {
                this.state = ZombieState.DEAD;
            }, 500);
            return false;  // Zombie is dead
        }
        
        return true;  // Zombie is still alive
    }
    
    applySlow(multiplier, duration) {
        this.slowMultiplier = Math.min(this.slowMultiplier, multiplier);
        this.slowEndTime = Date.now() + (duration * 1000);
    }
    
    attackPlant(plant) {
        if (!plant || this.state !== ZombieState.ATTACKING) return;
        
        const damagePerFrame = this.config.attackPower * (this.attackTimer);
        if (damagePerFrame > 0) {
            plant.takeDamage(damagePerFrame);
            this.attackTimer = 0;
        }
    }
    
    checkBoundary() {
        return this.x <= GAME_CONSTANTS.ZOMBIE_DEFEAT_X;
    }
}

// ========================================
// PROJECTILE CLASS
// ========================================

class Projectile {
    constructor(type, x, y, row, damage, effects = {}) {
        this.id = `projectile_${Date.now()}_${Math.random()}`;
        this.type = type;
        this.x = x;
        this.y = y;
        this.row = row;
        this.damage = damage;
        this.effects = effects;
        this.speed = 200;  // pixels per second
        this.active = true;
        this.width = 10;
        this.height = 10;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        const deltaSeconds = deltaTime / 1000;
        this.x += this.speed * deltaSeconds;
        
        // Deactivate if off screen
        if (this.x > GAME_CONSTANTS.ZOMBIE_START_X + 100) {
            this.active = false;
        }
    }
    
    checkCollision(zombies) {
        if (!this.active) return null;
        
        for (const zombie of zombies) {
            if (zombie.row !== this.row) continue;
            if (zombie.state === ZombieState.DEAD) continue;
            
            const distance = Math.abs(zombie.x - this.x);
            if (distance < 20) {  // Collision threshold
                return zombie;
            }
        }
        
        return null;
    }
    
    hit(zombie) {
        if (!zombie) return;
        
        zombie.takeDamage(this.damage, this.effects);
        this.active = false;
    }
    
    reset() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.damage = 0;
        this.effects = {};
    }
}

// ========================================
// SUN CLASS
// ========================================

class Sun {
    constructor(x, y, value, source) {
        this.id = `sun_${Date.now()}_${Math.random()}`;
        this.x = x;
        this.y = y;
        this.value = value;
        this.source = source;
        this.state = source === SunSource.SKY ? SunState.FALLING : SunState.IDLE;
        
        this.targetX = x;
        this.targetY = source === SunSource.SKY ? y + 200 : y;
        this.fallSpeed = GAME_CONSTANTS.SUN_FALL_SPEED;
        this.lifetime = GAME_CONSTANTS.SUN_LIFETIME;
        this.createdAt = Date.now();
        
        this.width = 40;
        this.height = 40;
    }
    
    update(deltaTime) {
        const deltaSeconds = deltaTime / 1000;
        
        switch (this.state) {
            case SunState.FALLING:
                this.y += this.fallSpeed * deltaSeconds;
                if (this.y >= this.targetY) {
                    this.y = this.targetY;
                    this.state = SunState.IDLE;
                }
                break;
                
            case SunState.IDLE:
                // Check if expired
                if (Date.now() - this.createdAt > this.lifetime) {
                    this.state = SunState.COLLECTED;  // Mark for removal
                }
                break;
                
            case SunState.COLLECTING:
                // Move towards target (sun counter)
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 5) {
                    this.state = SunState.COLLECTED;
                } else {
                    const moveSpeed = 300;  // Fast collection animation
                    this.x += (dx / distance) * moveSpeed * deltaSeconds;
                    this.y += (dy / distance) * moveSpeed * deltaSeconds;
                }
                break;
        }
    }
    
    collect(targetPos) {
        if (this.state !== SunState.IDLE && this.state !== SunState.FALLING) return;
        
        this.state = SunState.COLLECTING;
        this.targetX = targetPos.x;
        this.targetY = targetPos.y;
    }
    
    checkExpire() {
        return this.state === SunState.COLLECTED || 
               (this.state === SunState.IDLE && Date.now() - this.createdAt > this.lifetime);
    }
    
    reset() {
        this.state = SunState.COLLECTED;
        this.x = 0;
        this.y = 0;
        this.value = 0;
    }
}

// ========================================
// OBJECT POOLS
// ========================================

const ProjectilePool = {
    pool: [],
    
    get() {
        return this.pool.pop() || new Projectile(ProjectileType.PEA, 0, 0, 0, 0);
    },
    
    release(projectile) {
        if (projectile) {
            projectile.reset();
            if (this.pool.length < GAME_CONSTANTS.PROJECTILE_POOL_SIZE) {
                this.pool.push(projectile);
            }
        }
    }
};

const SunPool = {
    pool: [],
    
    get() {
        return this.pool.pop() || new Sun(0, 0, 25, SunSource.SKY);
    },
    
    release(sun) {
        if (sun) {
            sun.reset();
            if (this.pool.length < GAME_CONSTANTS.SUN_POOL_SIZE) {
                this.pool.push(sun);
            }
        }
    }
};

