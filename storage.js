// ========================================
// Storage Management - localStorage wrapper
// ========================================

/**
 * Storage object for managing game progress persistence
 */
const Storage = {
    KEY: 'plantsvszombies_progress',
    
    /**
     * Save game progress to localStorage
     * @param {Object} progress - Progress object to save
     * @returns {boolean} True if save successful
     */
    save(progress) {
        try {
            const dataToSave = {
                ...progress,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem(this.KEY, JSON.stringify(dataToSave));
            console.log('Progress saved successfully:', dataToSave);
            return true;
        } catch (error) {
            console.error('Failed to save progress:', error);
            // Show user-friendly error
            if (typeof showTooltip === 'function') {
                showTooltip('保存进度失败');
            }
            return false;
        }
    },
    
    /**
     * Load game progress from localStorage
     * @returns {Object} Progress object or default progress if not found
     */
    load() {
        try {
            const data = localStorage.getItem(this.KEY);
            
            if (!data) {
                console.log('No saved progress found, using default');
                return this.getDefault();
            }
            
            const progress = JSON.parse(data);
            
            // Version check
            if (!progress.version || progress.version !== '1.0') {
                console.warn('Progress version mismatch, using default');
                return this.getDefault();
            }
            
            console.log('Progress loaded successfully:', progress);
            return progress;
            
        } catch (error) {
            console.error('Failed to load progress:', error);
            return this.getDefault();
        }
    },
    
    /**
     * Get default progress object
     * @returns {Object} Default progress with only level 1 unlocked
     */
    getDefault() {
        return {
            version: '1.0',
            unlockedLevels: [1],  // Only first level unlocked by default
            lastPlayed: null,
            levelStats: {}        // Optional: track stats per level
        };
    },
    
    /**
     * Reset all progress (requires confirmation)
     * @returns {boolean} True if reset successful
     */
    reset() {
        try {
            localStorage.removeItem(this.KEY);
            console.log('Progress reset successfully');
            return true;
        } catch (error) {
            console.error('Failed to reset progress:', error);
            return false;
        }
    },
    
    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is supported
     */
    isAvailable() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.warn('localStorage not available:', error);
            return false;
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}


