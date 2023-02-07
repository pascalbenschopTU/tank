// class ReplayMemory(object):
//     # ReplayMemory should store the last "size" experiences
//     # and be able to return a randomly sampled batch of experiences
//     def __init__(self, size):
//         self.size = size
//         self.memory = []
//         self.index = 0

//     # Store experience in memory
//     def store_experience(self, prev_obs, action, observation, reward, done):
//         if len(self.memory) < self.size:
//             self.memory.append(None)  
//         self.memory[self.index] = (prev_obs, action, observation, reward, done)
//         self.index = (self.index + 1) % self.size

//     # Randomly sample "batch_size" experiences from the memory and return them
//     def sample_batch(self, batch_size):
//         batch = random.sample(self.memory, batch_size)
//         prev_obs, actions, observations, rewards, dones = zip(*batch)
//         return np.array(prev_obs), np.array(actions), np.array(observations), np.array(rewards), np.array(dones)
import { sampleSize } from 'lodash';

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
            let [state,,, nextState] = this.samples.shift();
            state.dispose();
            nextState.dispose();
        }
    }

    /**
     * @param {number} nSamples
     * @returns {Array} Randomly selected samples
     */
    sample(nSamples) {
        return sampleSize(this.samples, nSamples);
    }
}

module.exports = Memory;