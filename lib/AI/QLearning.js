const Util = require('../Util')
const tf = require('@tensorflow/tfjs');


const DEFAULT_DISCOUNT = 0.9
const EPSILON = 0.05
const LEARNINGRATE = 0.1

const map = {
    0: "TURNLEFT",
    1: "BACKWARD",
    2: "TURNRIGHT",
    3: "FORWARD"
}

class QLearner {

    constructor(num_states, num_actions, discount=DEFAULT_DISCOUNT, learning_rate = LEARNINGRATE) {
        this.num_states = num_states;
        this.num_actions = num_actions;
        this.discount = discount;
        this.learning_rate = learning_rate;

        this.q = Array.from(new Array(num_states), _ => Array(num_actions).fill(0));
        this.steps = 0;
        this.steps_metric = [];
        this.epsilon = 1;
        this.epsilons = [];
    }

    reset_episode() {
        this.steps_metric.push(this.steps);
        this.steps = 0;
    }

    process_experience(state, action, next_state, reward, done) {
        if (done) {
            this.q[state][action] = ((1- this.learning_rate) * this.q[state][action]) + (this.learning_rate * reward);
            this.epsilons.push(this.epsilon);
            this.epsilon = this.epsilon * (1.0 - EPSILON);
        } else {
            this.q[state][action] = ((1- this.learning_rate) * this.q[state][action]) + 
                (this.learning_rate * (reward + this.discount * Math.max(this.q[next_state])));
        }
    }

    select_action(state) {
        this.steps += 1;
        if (Util.randRange(0,1) < this.epsilon || sum(this.q[state]) == 0) {
            return Util.randRangeInt(0, this.num_actions);
        } else {
            return Util.argmax(this.q[state]);
        }
    }

    get_policy() {
        result = Array(this.q.length).fill(0);
        moves = [];
        for (var i = 0; i < this.q.length; i++) {
            result[i] = Util.argmax(this.q[i]);
            moves.push(map(result[i]));
        }

        return moves;
    }

    get_action(action) {
        return map(action);
    }
}

/**
 * Model from Github: "TensorFlow.js Example: Reinforcement Learning with Mountain Car Simulation"
 */
class Model {
    /**
     * @param {number} numStates
     * @param {number} numActions
     * @param {number} batchSize
     */

    constructor(hiddenLayerSizesOrModel, numStates, numActions, batchSize) {
      this.numStates = numStates;
      this.numActions = numActions;
      this.batchSize = batchSize;

      if (hiddenLayerSizesOrModel instanceof tf.LayersModel) {
        this.network = hiddenLayerSizesOrModel;
        this.network.summary();
        this.network.compile({optimizer: 'adam', loss: 'meanSquaredError'});
     } else {
        this.defineModel(hiddenLayerSizesOrModel);
      }
    }

    defineModel(hiddenLayerSizes) {

        if (!Array.isArray(hiddenLayerSizes)) {
            hiddenLayerSizes = [hiddenLayerSizes];
        }
        this.network = tf.sequential();
        hiddenLayerSizes.forEach((hiddenLayerSize, i) => {
            this.network.add(tf.layers.dense({
                units: hiddenLayerSize,
                activation: 'relu',
                // `inputShape` is required only for the first layer.
                inputShape: i === 0 ? [this.numStates] : undefined
            }));
        });
        this.network.add(tf.layers.dense({units: this.numActions}));

        this.network.summary();
        this.network.compile({optimizer: 'adam', loss: 'meanSquaredError'});
    }

    /**
     * @param {tf.Tensor | tf.Tensor[]} states
     * @returns {tf.Tensor | tf.Tensor} The predictions of the best actions
     */
    predict(states) {
        return tf.tidy(() => this.network.predict(states));
    }

    /**
     * @param {tf.Tensor[]} xBatch
     * @param {tf.Tensor[]} yBatch
     */
    async train(xBatch, yBatch) {
        await this.network.fit(xBatch, yBatch);
    }

    /**
     * @param {tf.Tensor} state
     * @returns {number} The action chosen by the model (-1 | 0 | 1)
     */
    chooseAction(state, eps) {
        if (Math.random() < eps) {
            return Math.floor(Math.random() * this.numActions) - 1;
        } else {
            return tf.tidy(() => {
                const logits = this.network.predict(state);
                const sigmoid = tf.sigmoid(logits);
                const probs = tf.div(sigmoid, tf.sum(sigmoid));
                return tf.multinomial(probs, 1).dataSync()[0] - 1;
            });
        }
    }
}

module.exports = QLearner, Model