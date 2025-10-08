// ========================================
// Level Configurations
// ========================================

/**
 * Level 1 Configuration - Tutorial/Easy
 * - 3 waves of zombies
 * - Only normal zombies
 * - Available plants: Sunflower, Peashooter, Wallnut
 */
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
            delay: 10,  // Start after 10 seconds
            zombies: [
                { type: ZombieType.NORMAL, row: 2, delay: 0 },
                { type: ZombieType.NORMAL, row: 1, delay: 5 },
                { type: ZombieType.NORMAL, row: 3, delay: 8 }
            ]
        },
        {
            waveNumber: 2,
            delay: 20,  // 20 seconds after wave 1
            zombies: [
                { type: ZombieType.NORMAL, row: 0, delay: 0 },
                { type: ZombieType.NORMAL, row: 2, delay: 3 },
                { type: ZombieType.NORMAL, row: 4, delay: 6 },
                { type: ZombieType.NORMAL, row: 1, delay: 10 },
                { type: ZombieType.NORMAL, row: 3, delay: 12 }
            ]
        },
        {
            waveNumber: 3,
            delay: 25,  // Final wave
            zombies: [
                { type: ZombieType.NORMAL, row: 1, delay: 0 },
                { type: ZombieType.NORMAL, row: 2, delay: 2 },
                { type: ZombieType.NORMAL, row: 3, delay: 4 },
                { type: ZombieType.NORMAL, row: 0, delay: 6 },
                { type: ZombieType.NORMAL, row: 4, delay: 8 },
                { type: ZombieType.NORMAL, row: 2, delay: 12 },
                { type: ZombieType.NORMAL, row: 1, delay: 15 }
            ]
        }
    ],
    description: '学习基础玩法，使用向日葵和豌豆射手抵御僵尸'
};

/**
 * Level 2 Configuration - Medium
 * - 4 waves of zombies
 * - Normal and Cone Head zombies
 * - Available plants: Sunflower, Peashooter, Wallnut, Cherry Bomb
 */
const LEVEL_2 = {
    id: 2,
    name: '第二关：进阶挑战',
    difficulty: 2,
    initialSun: 50,
    availablePlants: [
        PlantType.SUNFLOWER,
        PlantType.PEASHOOTER,
        PlantType.WALLNUT,
        PlantType.CHERRY_BOMB
    ],
    waves: [
        {
            waveNumber: 1,
            delay: 10,
            zombies: [
                { type: ZombieType.NORMAL, row: 1, delay: 0 },
                { type: ZombieType.NORMAL, row: 3, delay: 3 },
                { type: ZombieType.CONE_HEAD, row: 2, delay: 8 }
            ]
        },
        {
            waveNumber: 2,
            delay: 18,
            zombies: [
                { type: ZombieType.NORMAL, row: 0, delay: 0 },
                { type: ZombieType.NORMAL, row: 2, delay: 2 },
                { type: ZombieType.NORMAL, row: 4, delay: 4 },
                { type: ZombieType.CONE_HEAD, row: 1, delay: 8 },
                { type: ZombieType.CONE_HEAD, row: 3, delay: 10 },
                { type: ZombieType.NORMAL, row: 2, delay: 12 }
            ]
        },
        {
            waveNumber: 3,
            delay: 20,
            zombies: [
                { type: ZombieType.CONE_HEAD, row: 0, delay: 0 },
                { type: ZombieType.NORMAL, row: 1, delay: 2 },
                { type: ZombieType.CONE_HEAD, row: 2, delay: 4 },
                { type: ZombieType.NORMAL, row: 3, delay: 6 },
                { type: ZombieType.CONE_HEAD, row: 4, delay: 8 },
                { type: ZombieType.NORMAL, row: 2, delay: 12 },
                { type: ZombieType.NORMAL, row: 1, delay: 14 },
                { type: ZombieType.NORMAL, row: 3, delay: 16 }
            ]
        },
        {
            waveNumber: 4,
            delay: 25,
            zombies: [
                { type: ZombieType.NORMAL, row: 0, delay: 0 },
                { type: ZombieType.CONE_HEAD, row: 1, delay: 2 },
                { type: ZombieType.NORMAL, row: 2, delay: 4 },
                { type: ZombieType.CONE_HEAD, row: 3, delay: 6 },
                { type: ZombieType.NORMAL, row: 4, delay: 8 },
                { type: ZombieType.CONE_HEAD, row: 2, delay: 10 },
                { type: ZombieType.NORMAL, row: 1, delay: 12 },
                { type: ZombieType.NORMAL, row: 3, delay: 14 }
            ]
        }
    ],
    description: '面对更强的路障僵尸，使用樱桃炸弹应对密集僵尸群'
};

/**
 * Level 3 Configuration - Hard
 * - 5 waves of zombies
 * - All zombie types including Bucket Head
 * - All plants available including Snow Pea
 */
const LEVEL_3 = {
    id: 3,
    name: '第三关：终极考验',
    difficulty: 3,
    initialSun: 50,
    availablePlants: [
        PlantType.SUNFLOWER,
        PlantType.PEASHOOTER,
        PlantType.WALLNUT,
        PlantType.CHERRY_BOMB,
        PlantType.SNOW_PEA
    ],
    waves: [
        {
            waveNumber: 1,
            delay: 10,
            zombies: [
                { type: ZombieType.NORMAL, row: 1, delay: 0 },
                { type: ZombieType.CONE_HEAD, row: 3, delay: 3 },
                { type: ZombieType.NORMAL, row: 2, delay: 6 },
                { type: ZombieType.BUCKET_HEAD, row: 0, delay: 10 }
            ]
        },
        {
            waveNumber: 2,
            delay: 15,
            zombies: [
                { type: ZombieType.CONE_HEAD, row: 0, delay: 0 },
                { type: ZombieType.NORMAL, row: 2, delay: 2 },
                { type: ZombieType.CONE_HEAD, row: 4, delay: 4 },
                { type: ZombieType.BUCKET_HEAD, row: 1, delay: 6 },
                { type: ZombieType.NORMAL, row: 3, delay: 8 },
                { type: ZombieType.NORMAL, row: 2, delay: 10 },
                { type: ZombieType.CONE_HEAD, row: 1, delay: 12 }
            ]
        },
        {
            waveNumber: 3,
            delay: 18,
            zombies: [
                { type: ZombieType.BUCKET_HEAD, row: 2, delay: 0 },
                { type: ZombieType.CONE_HEAD, row: 1, delay: 2 },
                { type: ZombieType.CONE_HEAD, row: 3, delay: 4 },
                { type: ZombieType.NORMAL, row: 0, delay: 6 },
                { type: ZombieType.BUCKET_HEAD, row: 4, delay: 8 },
                { type: ZombieType.NORMAL, row: 2, delay: 10 },
                { type: ZombieType.CONE_HEAD, row: 1, delay: 12 },
                { type: ZombieType.NORMAL, row: 3, delay: 14 },
                { type: ZombieType.CONE_HEAD, row: 0, delay: 16 }
            ]
        },
        {
            waveNumber: 4,
            delay: 20,
            zombies: [
                { type: ZombieType.NORMAL, row: 0, delay: 0 },
                { type: ZombieType.CONE_HEAD, row: 1, delay: 2 },
                { type: ZombieType.BUCKET_HEAD, row: 2, delay: 4 },
                { type: ZombieType.CONE_HEAD, row: 3, delay: 6 },
                { type: ZombieType.NORMAL, row: 4, delay: 8 },
                { type: ZombieType.NORMAL, row: 1, delay: 10 },
                { type: ZombieType.BUCKET_HEAD, row: 3, delay: 12 },
                { type: ZombieType.CONE_HEAD, row: 2, delay: 14 },
                { type: ZombieType.NORMAL, row: 0, delay: 16 },
                { type: ZombieType.CONE_HEAD, row: 4, delay: 18 }
            ]
        },
        {
            waveNumber: 5,
            delay: 25,
            zombies: [
                { type: ZombieType.BUCKET_HEAD, row: 0, delay: 0 },
                { type: ZombieType.BUCKET_HEAD, row: 4, delay: 2 },
                { type: ZombieType.CONE_HEAD, row: 1, delay: 4 },
                { type: ZombieType.CONE_HEAD, row: 3, delay: 6 },
                { type: ZombieType.BUCKET_HEAD, row: 2, delay: 8 },
                { type: ZombieType.NORMAL, row: 0, delay: 10 },
                { type: ZombieType.CONE_HEAD, row: 2, delay: 12 },
                { type: ZombieType.NORMAL, row: 4, delay: 14 },
                { type: ZombieType.CONE_HEAD, row: 1, delay: 16 },
                { type: ZombieType.BUCKET_HEAD, row: 3, delay: 18 },
                { type: ZombieType.NORMAL, row: 2, delay: 20 },
                { type: ZombieType.NORMAL, row: 1, delay: 22 },
                { type: ZombieType.NORMAL, row: 3, delay: 24 }
            ]
        }
    ],
    description: '终极挑战！大量铁桶僵尸来袭，使用寒冰射手减速它们'
};

/**
 * All levels array
 */
const LEVELS = [LEVEL_1, LEVEL_2, LEVEL_3];

/**
 * Get level configuration by ID
 * @param {number} levelId - Level ID (1-3)
 * @returns {Object} Level configuration or null
 */
function getLevelConfig(levelId) {
    return LEVELS.find(level => level.id === levelId) || null;
}

/**
 * Get total zombie count for a level
 * @param {Object} level - Level configuration
 * @returns {number} Total number of zombies
 */
function getTotalZombieCount(level) {
    return level.waves.reduce((total, wave) => {
        return total + wave.zombies.length;
    }, 0);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LEVELS, getLevelConfig, getTotalZombieCount };
}

