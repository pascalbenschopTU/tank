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
     * Make a copy of this object
     * @returns {Memory}
     */
    copy() {
        return new Memory(this.maxMemory);
    }

    /**
     * @param {Array} sample
     */
    addSample(sample) {
        this.samples.push(sample);
        if (this.samples.length > this.maxMemory) {
            this.samples.shift();
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