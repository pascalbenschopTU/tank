const lodash = require('lodash');

class Memory {
    /**
     * @param {number} maxMemory
     */
    constructor(maxMemory) {
        this.maxMemory = maxMemory;
        this.samples = new Array();
    }

    /**
     * @param {Array} sample
     */
    addSample(sample) {
        this.samples.push(sample);
        if (this.samples.length > this.maxMemory) {
            let [state, , , nextState] = this.samples.shift();
            state.dispose();
            nextState.dispose();
        }
    }

    length() {
        return this.samples.length;
    }

    /**
     * @param {number} nSamples
     * @returns {Array} Randomly selected samples
     */
    sample(nSamples) {
        return lodash.sampleSize(this.samples, nSamples);
    }
}

module.exports = Memory;