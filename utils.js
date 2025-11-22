// ========================================
// Utility Functions
// ========================================

/**
 * Check collision between two entities using bounding box detection
 * @param {Object} entity1 - First entity with x, y, width, height
 * @param {Object} entity2 - Second entity with x, y, width, height
 * @returns {boolean} True if entities are colliding
 */
function checkCollision(entity1, entity2) {
    return entity1.x < entity2.x + entity2.width &&
           entity1.x + entity1.width > entity2.x &&
           entity1.y < entity2.y + entity2.height &&
           entity1.y + entity1.height > entity2.y;
}

/**
 * Calculate distance between two points
 * @param {number} x1 - First point X coordinate
 * @param {number} y1 - First point Y coordinate
 * @param {number} x2 - Second point X coordinate
 * @param {number} y2 - Second point Y coordinate
 * @returns {number} Distance between points
 */
function getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Game Constants
 */
const GAME_CONSTANTS = {
    // Grid Configuration
    GRID_ROWS: 5,
    GRID_COLS: 3,
    CELL_SIZE_MOBILE: 80,
    CELL_SIZE_DESKTOP: 100,
    CELL_SPACING: 4,
    
    // Game Area Dimensions (Mobile - 竖屏)
    GAME_WIDTH: 260,   // 3 cols * 80 + spacing
    GAME_HEIGHT: 420,  // 5 rows * 80 + spacing
    
    // Sun System
    SUN_VALUE_SKY: 25,
    SUN_VALUE_SUNFLOWER: 25,
    SUN_DROP_INTERVAL: 7000,  // 7 seconds in milliseconds
    SUN_LIFETIME: 10000,       // 10 seconds
    SUN_FALL_SPEED: 50,        // pixels per second
    MAX_SUN: 9990,
    
    // Performance Targets
    TARGET_FPS: 30,
    FIXED_TIMESTEP: 1000 / 30,  // ~33.33ms per frame
    MAX_FRAME_TIME: 100,         // Maximum time for single frame
    
    // Zombie Boundaries
    ZOMBIE_START_X: 500,
    ZOMBIE_DEFEAT_X: 0,
    ZOMBIE_BOUNDARY_WARNING: 100,  // Show warning when zombie < 100px from edge
    
    // Object Pool Sizes
    PROJECTILE_POOL_SIZE: 50,
    SUN_POOL_SIZE: 20,
    
    // Touch/Input
    MIN_TOUCH_TARGET: 44,  // Minimum 44x44px for touch targets
    
    // Auto-pause
    IDLE_PAUSE_TIME: 300000,  // 300 seconds (5 minutes) of no input triggers pause
    
    // Plant Card UI
    PLANT_CARD_WIDTH: 70,
    PLANT_CARD_HEIGHT: 90
};


