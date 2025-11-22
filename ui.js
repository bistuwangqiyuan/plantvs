// ========================================
// UI Controller - Handles all UI interactions and menus
// ========================================

let gameEngineInstance = null;
let playerProgress = null;

/**
 * Initialize UI Controller
 * @param {GameEngine} gameEngine - The game engine instance
 */
function initializeUI(gameEngine) {
    gameEngineInstance = gameEngine;
    
    // Load player progress
    playerProgress = Storage.load();
    
    // Bind all UI event listeners
    bindMainMenuEvents();
    bindLevelSelectEvents();
    bindGameUIEvents();
    bindPauseMenuEvents();
    bindVictoryScreenEvents();
    bindDefeatScreenEvents();
    bindModalEvents();
    bindOrientationCheck();
    
    console.log('UI Controller initialized');
}

// ========================================
// MAIN MENU EVENTS
// ========================================

function bindMainMenuEvents() {
    const btnStartGame = document.getElementById('btnStartGame');
    const btnGameRules = document.getElementById('btnGameRules');
    const btnPlantAlmanac = document.getElementById('btnPlantAlmanac');
    const btnResetProgress = document.getElementById('btnResetProgress');
    
    if (btnStartGame) {
        btnStartGame.addEventListener('click', () => {
            showLevelSelect();
        });
    }
    
    if (btnGameRules) {
        btnGameRules.addEventListener('click', () => {
            showGameRules();
        });
    }
    
    if (btnPlantAlmanac) {
        btnPlantAlmanac.addEventListener('click', () => {
            showPlantAlmanac();
        });
    }
    
    if (btnResetProgress) {
        btnResetProgress.addEventListener('click', () => {
            showResetConfirmation();
        });
    }
}

function showLevelSelect() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('levelSelect').style.display = 'flex';
    
    // Populate level list
    populateLevelList();
}

function populateLevelList() {
    const levelList = document.getElementById('levelList');
    if (!levelList) return;
    
    levelList.innerHTML = '';
    
    LEVELS.forEach(level => {
        const isUnlocked = playerProgress.unlockedLevels.includes(level.id);
        
        const levelCard = document.createElement('div');
        levelCard.className = `level-card ${isUnlocked ? '' : 'locked'}`;
        
        levelCard.innerHTML = `
            <div class="level-number">关卡 ${level.id}</div>
            <div class="level-name">${level.name}</div>
            <div class="level-difficulty">${'⭐'.repeat(level.difficulty)}</div>
        `;
        
        if (isUnlocked) {
            levelCard.addEventListener('click', () => {
                startLevel(level.id);
            });
        } else {
            levelCard.addEventListener('click', () => {
                showTooltip('请先完成前面的关卡');
            });
        }
        
        levelList.appendChild(levelCard);
    });
}

function startLevel(levelId) {
    document.getElementById('levelSelect').style.display = 'none';
    
    if (gameEngineInstance) {
        const success = gameEngineInstance.loadLevel(levelId);
        if (success) {
            // Show plant selection bar
            showPlantSelectionBar();
        } else {
            showTooltip('关卡加载失败');
            showLevelSelect();
        }
    }
}

// ========================================
// GAME UI EVENTS
// ========================================

function bindGameUIEvents() {
    // This will be dynamically created
    // Plant cards are rendered in the game canvas
}

function showPlantSelectionBar() {
    // Plant selection is part of the game UI
    // Rendered by the game engine on the canvas
    console.log('Plant selection bar shown');
}

// ========================================
// PAUSE MENU EVENTS
// ========================================

function bindPauseMenuEvents() {
    const btnResume = document.getElementById('btnResume');
    const btnRestartLevel = document.getElementById('btnRestartLevel');
    const btnExitToLevelSelect = document.getElementById('btnExitToLevelSelect');
    
    if (btnResume) {
        btnResume.addEventListener('click', () => {
            if (gameEngineInstance) {
                gameEngineInstance.resume();
            }
        });
    }
    
    if (btnRestartLevel) {
        btnRestartLevel.addEventListener('click', () => {
            if (gameEngineInstance) {
                document.getElementById('pauseMenu').style.display = 'none';
                gameEngineInstance.restart();
            }
        });
    }
    
    if (btnExitToLevelSelect) {
        btnExitToLevelSelect.addEventListener('click', () => {
            if (gameEngineInstance) {
                document.getElementById('pauseMenu').style.display = 'none';
                gameEngineInstance.exitToMenu();
                showLevelSelect();
            }
        });
    }
}

// Add pause button to game canvas area
function createPauseButton() {
    const pauseBtn = document.createElement('button');
    pauseBtn.id = 'pauseButton';
    pauseBtn.className = 'btn btn-secondary pause-btn';
    pauseBtn.innerHTML = '⏸️ 暂停';
    pauseBtn.style.position = 'absolute';
    pauseBtn.style.top = '10px';
    pauseBtn.style.right = '10px';
    pauseBtn.style.zIndex = '50';
    
    pauseBtn.addEventListener('click', () => {
        if (gameEngineInstance) {
            gameEngineInstance.pause();
        }
    });
    
    document.querySelector('.game-container').appendChild(pauseBtn);
}

// ========================================
// VICTORY SCREEN EVENTS
// ========================================

function bindVictoryScreenEvents() {
    const btnNextLevel = document.getElementById('btnNextLevel');
    const btnReplay = document.getElementById('btnReplay');
    const btnVictoryToLevelSelect = document.getElementById('btnVictoryToLevelSelect');
    
    if (btnNextLevel) {
        btnNextLevel.addEventListener('click', () => {
            if (gameEngineInstance) {
                const currentLevel = gameEngineInstance.gameState.currentLevel;
                const nextLevel = currentLevel + 1;
                
                document.getElementById('victoryScreen').style.display = 'none';
                
                if (nextLevel <= 3) {
                    startLevel(nextLevel);
                } else {
                    // All levels completed
                    showTooltip('恭喜！你已完成所有关卡！');
                    showLevelSelect();
                }
            }
        });
    }
    
    if (btnReplay) {
        btnReplay.addEventListener('click', () => {
            if (gameEngineInstance) {
                document.getElementById('victoryScreen').style.display = 'none';
                gameEngineInstance.restart();
            }
        });
    }
    
    if (btnVictoryToLevelSelect) {
        btnVictoryToLevelSelect.addEventListener('click', () => {
            document.getElementById('victoryScreen').style.display = 'none';
            showLevelSelect();
        });
    }
}

// ========================================
// DEFEAT SCREEN EVENTS
// ========================================

function bindDefeatScreenEvents() {
    const btnRetry = document.getElementById('btnRetry');
    const btnDefeatToLevelSelect = document.getElementById('btnDefeatToLevelSelect');
    
    if (btnRetry) {
        btnRetry.addEventListener('click', () => {
            if (gameEngineInstance) {
                document.getElementById('defeatScreen').style.display = 'none';
                gameEngineInstance.restart();
            }
        });
    }
    
    if (btnDefeatToLevelSelect) {
        btnDefeatToLevelSelect.addEventListener('click', () => {
            document.getElementById('defeatScreen').style.display = 'none';
            showLevelSelect();
        });
    }
}

// ========================================
// LEVEL SELECT EVENTS
// ========================================

function bindLevelSelectEvents() {
    const btnBackToMenu = document.getElementById('btnBackToMenu');
    
    if (btnBackToMenu) {
        btnBackToMenu.addEventListener('click', () => {
            document.getElementById('levelSelect').style.display = 'none';
            document.getElementById('mainMenu').style.display = 'flex';
        });
    }
}

// ========================================
// MODAL EVENTS
// ========================================

function bindModalEvents() {
    // Game Rules Modal
    const btnCloseRules = document.getElementById('btnCloseRules');
    if (btnCloseRules) {
        btnCloseRules.addEventListener('click', () => {
            document.getElementById('gameRulesModal').style.display = 'none';
        });
    }
    
    // Plant Almanac Modal
    const btnCloseAlmanac = document.getElementById('btnCloseAlmanac');
    if (btnCloseAlmanac) {
        btnCloseAlmanac.addEventListener('click', () => {
            document.getElementById('plantAlmanacModal').style.display = 'none';
        });
    }
    
    // Plant Detail Modal
    const btnClosePlantDetail = document.getElementById('btnClosePlantDetail');
    if (btnClosePlantDetail) {
        btnClosePlantDetail.addEventListener('click', () => {
            document.getElementById('plantDetailModal').style.display = 'none';
        });
    }
    
    // Reset Confirmation Modal
    const btnConfirmReset = document.getElementById('btnConfirmReset');
    const btnCancelReset = document.getElementById('btnCancelReset');
    
    if (btnConfirmReset) {
        btnConfirmReset.addEventListener('click', () => {
            if (Storage.reset()) {
                playerProgress = Storage.load();
                showTooltip('进度已重置');
                document.getElementById('resetConfirmModal').style.display = 'none';
                
                // Refresh level select if open
                if (document.getElementById('levelSelect').style.display === 'flex') {
                    populateLevelList();
                }
            } else {
                showTooltip('重置失败');
            }
        });
    }
    
    if (btnCancelReset) {
        btnCancelReset.addEventListener('click', () => {
            document.getElementById('resetConfirmModal').style.display = 'none';
        });
    }
    
    // Close modals on background click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

function showGameRules() {
    document.getElementById('gameRulesModal').style.display = 'flex';
}

function showPlantAlmanac() {
    const modal = document.getElementById('plantAlmanacModal');
    const almanacList = document.getElementById('plantAlmanacList');
    
    if (!almanacList) return;
    
    almanacList.innerHTML = '';
    
    Object.entries(PLANT_CONFIGS).forEach(([type, config]) => {
        const card = document.createElement('div');
        card.className = 'plant-almanac-card';
        
        card.innerHTML = `
            <div class="plant-icon">${config.emoji}</div>
            <div class="plant-name">${config.name}</div>
            <div class="plant-cost">☀️ ${config.cost}</div>
            <div class="plant-cooldown">⏱️ ${config.cooldown}秒</div>
        `;
        
        card.addEventListener('click', () => {
            showPlantDetail(type, config);
        });
        
        almanacList.appendChild(card);
    });
    
    modal.style.display = 'flex';
}

function showPlantDetail(type, config) {
    const modal = document.getElementById('plantDetailModal');
    const nameEl = document.getElementById('plantDetailName');
    const contentEl = document.getElementById('plantDetailContent');
    
    if (!modal || !nameEl || !contentEl) return;
    
    nameEl.textContent = config.name;
    
    let detailHTML = `
        <div class="plant-detail-header">
            <div class="plant-detail-icon">${config.emoji}</div>
        </div>
        <table class="plant-stats-table">
            <tr><td>阳光消耗:</td><td>${config.cost}</td></tr>
            <tr><td>冷却时间:</td><td>${config.cooldown}秒</td></tr>
    `;
    
    if (config.maxHealth) {
        detailHTML += `<tr><td>生命值:</td><td>${config.maxHealth}</td></tr>`;
    }
    
    if (config.attackPower) {
        detailHTML += `<tr><td>攻击力:</td><td>${config.attackPower}</td></tr>`;
    }
    
    if (config.attackSpeed) {
        detailHTML += `<tr><td>攻击速度:</td><td>每${config.attackSpeed}秒</td></tr>`;
    }
    
    if (config.productionInterval) {
        detailHTML += `<tr><td>生产阳光:</td><td>每${config.productionInterval}秒${config.sunProduced}个</td></tr>`;
    }
    
    if (config.explosionDamage) {
        detailHTML += `<tr><td>爆炸伤害:</td><td>${config.explosionDamage}</td></tr>`;
        detailHTML += `<tr><td>爆炸范围:</td><td>${config.explosionRadius}像素</td></tr>`;
    }
    
    if (config.slowEffect) {
        detailHTML += `<tr><td>减速效果:</td><td>${(config.slowEffect * 100).toFixed(0)}%</td></tr>`;
        detailHTML += `<tr><td>减速持续:</td><td>${config.slowDuration}秒</td></tr>`;
    }
    
    detailHTML += `
        </table>
        <div class="plant-description">${config.description}</div>
    `;
    
    contentEl.innerHTML = detailHTML;
    modal.style.display = 'flex';
}

function showResetConfirmation() {
    document.getElementById('resetConfirmModal').style.display = 'flex';
}

// ========================================
// ORIENTATION CHECK
// ========================================

function bindOrientationCheck() {
    function checkOrientation() {
        const isPortrait = window.innerHeight > window.innerWidth;
        const warning = document.getElementById('landscapeWarning');
        
        if (warning) {
            if (isPortrait) {
                warning.style.display = 'none';
            } else {
                // Show warning only on mobile devices
                if (window.innerWidth < 768) {
                    warning.style.display = 'flex';
                }
            }
        }
    }
    
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    // Initial check
    checkOrientation();
}

// ========================================
// PLANT CARD UI (Rendered on Canvas)
// ========================================

// These functions will be called by the renderer to draw plant selection UI
function getPlantCardLayout(availablePlants, canvasWidth) {
    const cardWidth = GAME_CONSTANTS.PLANT_CARD_WIDTH;
    const cardHeight = GAME_CONSTANTS.PLANT_CARD_HEIGHT;
    const spacing = 5;
    const topMargin = 60;
    
    const cards = [];
    
    availablePlants.forEach((plantType, index) => {
        const config = PLANT_CONFIGS[plantType];
        const x = 10 + (cardWidth + spacing) * index;
        const y = topMargin;
        
        cards.push({
            type: plantType,
            config: config,
            x: x,
            y: y,
            width: cardWidth,
            height: cardHeight
        });
    });
    
    return cards;
}

// Check if click is on a plant card
function checkPlantCardClick(x, y, gameState) {
    if (!gameState.levelConfig) return null;
    
    const cards = getPlantCardLayout(gameState.levelConfig.availablePlants, gameEngineInstance.canvas.width);
    
    for (const card of cards) {
        if (x >= card.x && x <= card.x + card.width &&
            y >= card.y && y <= card.y + card.height) {
            return card.type;
        }
    }
    
    return null;
}

// Extend the renderer to draw plant cards
if (typeof Renderer !== 'undefined') {
    const originalDrawUI = Renderer.prototype.drawUI;
    
    Renderer.prototype.drawUI = function(gameState) {
        // Call original drawUI
        if (originalDrawUI) {
            originalDrawUI.call(this, gameState);
        }
        
        // Draw plant selection cards
        if (gameState.levelConfig) {
            this.drawPlantCards(gameState);
        }
    };
    
    Renderer.prototype.drawPlantCards = function(gameState) {
        const cards = getPlantCardLayout(gameState.levelConfig.availablePlants, this.ctx.canvas.width);
        
        cards.forEach(card => {
            this.ctx.save();
            
            // Check if plant is available
            const canAfford = gameState.sun >= card.config.cost;
            const cooldown = gameState.plantCooldowns.get(card.type) || 0;
            const isOnCooldown = cooldown > 0;
            const isSelected = gameState.selectedPlantType === card.type;
            
            // Card background
            if (isSelected) {
                this.ctx.fillStyle = '#FFD700';
            } else if (!canAfford || isOnCooldown) {
                this.ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
            } else {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            }
            
            this.ctx.fillRect(card.x, card.y, card.width, card.height);
            this.ctx.strokeStyle = isSelected ? '#FFD700' : '#333';
            this.ctx.lineWidth = isSelected ? 4 : 2;
            this.ctx.strokeRect(card.x, card.y, card.width, card.height);
            
            // Plant emoji
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = '#000';
            this.ctx.fillText(card.config.emoji, card.x + card.width / 2, card.y + 30);
            
            // Sun cost
            this.ctx.font = 'bold 14px Arial';
            this.ctx.fillStyle = canAfford ? '#000' : '#f00';
            this.ctx.fillText(`☀️${card.config.cost}`, card.x + card.width / 2, card.y + card.height - 15);
            
            // Cooldown overlay
            if (isOnCooldown) {
                const cooldownPercent = cooldown / (card.config.cooldown * 1000);
                const overlayHeight = card.height * cooldownPercent;
                
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                this.ctx.fillRect(card.x, card.y, card.width, overlayHeight);
                
                // Cooldown text
                this.ctx.fillStyle = '#fff';
                this.ctx.font = 'bold 16px Arial';
                this.ctx.fillText((cooldown / 1000).toFixed(1), card.x + card.width / 2, card.y + 45);
            }
            
            this.ctx.restore();
        });
    };
}

// Extend InputHandler to handle plant card clicks
if (typeof InputHandler !== 'undefined') {
    const originalHandlePointerDown = InputHandler.prototype.handlePointerDown;
    
    InputHandler.prototype.handlePointerDown = function(event) {
        const coords = this.getCanvasCoordinates(event);
        
        if (this.engine.gameState.phase === GamePhase.PLAYING && !this.engine.gameState.isPaused) {
            // Check plant card click first
            const plantType = checkPlantCardClick(coords.x, coords.y, this.engine.gameState);
            if (plantType) {
                this.engine.selectPlant(plantType);
                return;
            }
        }
        
        // Call original handler
        if (originalHandlePointerDown) {
            originalHandlePointerDown.call(this, event);
        }
    };
}

// ========================================
// LOADING PROGRESS SIMULATION
// ========================================

window.addEventListener('DOMContentLoaded', () => {
    const progressBar = document.getElementById('loadingProgress');
    const loadingText = document.getElementById('loadingText');
    
    if (!progressBar || !loadingText) return;
    
    let progress = 0;
    const loadingSteps = [
        { progress: 20, text: '加载资源...' },
        { progress: 40, text: '初始化游戏引擎...' },
        { progress: 60, text: '加载关卡数据...' },
        { progress: 80, text: '准备游戏界面...' },
        { progress: 100, text: '完成！' }
    ];
    
    let currentStep = 0;
    const interval = setInterval(() => {
        if (currentStep >= loadingSteps.length) {
            clearInterval(interval);
            return;
        }
        
        const step = loadingSteps[currentStep];
        progress = step.progress;
        
        progressBar.style.width = progress + '%';
        loadingText.textContent = step.text;
        
        currentStep++;
    }, 200);
});

