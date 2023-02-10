const tf = require('@tensorflow/tfjs-node-gpu');

const map = {
    0: "TURNLEFT",
    1: "BACKWARD",
    2: "TURNRIGHT",
    3: "FORWARD"
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
        this.hiddenLayerSizesOrModel = hiddenLayerSizesOrModel
        this.numStates = numStates;
        this.numActions = numActions;
        this.batchSize = batchSize;

        this.canTrain = true;

        if (hiddenLayerSizesOrModel instanceof tf.LayersModel) {
            this.network = hiddenLayerSizesOrModel;
            //this.network.summary();
            this.network.compile({optimizer: 'adam', loss: 'meanSquaredError'});
        } else {
            this.defineModel(hiddenLayerSizesOrModel);
        }
    }

    /**
     * Make a copy of this model
     * @returns {Model}
     */
    copy() {
        return new Model(this.hiddenLayerSizesOrModel, this.numStates, this.numActions, this.batchSize);
    }

    /**
     * Create the neural network
     * @param {Array | number} hiddenLayerSizes 
     */
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

        //this.network.summary();
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
        await this.network.fit(xBatch, yBatch, {epochs: 1, verbose: 0});
    }

    /**
     * @param {tf.Tensor} state
     * @returns {number} The action chosen by the model from 0 to numactions
     */
    chooseAction(state, eps) {
        if (Math.random() < eps) {
            return Math.floor(Math.random() * this.numActions);
        } else {
            return tf.tidy(() => {
                return this.network.predict(state).argMax(-1).dataSync()[0];
                // const logits = this.network.predict(state);
                // const sigmoid = tf.sigmoid(logits);
                // const probs = tf.div(sigmoid, tf.sum(sigmoid));
                // //console.log(logits.dataSync(),tf.multinomial(probs, this.numActions).dataSync()[0], logits.argMax(-1).dataSync())
                // return tf.multinomial(probs, this.numActions).dataSync()[0];
            });
        }
    }

    getAction(action) {
        return map[action];
    }
}

module.exports = Model