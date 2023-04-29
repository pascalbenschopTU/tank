const tf = require('@tensorflow/tfjs-node');
tf.setBackend('tensorflow');

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

    constructor(hiddenLayerSizesOrModel, numStates, numActions, batchSize, verbose=1) {
        this.hiddenLayerSizesOrModel = hiddenLayerSizesOrModel
        this.numStates = numStates;
        this.numActions = numActions;
        this.batchSize = batchSize;
        this.verbose = verbose;

        this.canTrain = true;

        if (hiddenLayerSizesOrModel instanceof tf.LayersModel) {
            this.network = hiddenLayerSizesOrModel;
            if (this.verbose == 1) this.network.summary();
            this.network.compile({optimizer: 'adam', loss: 'meanSquaredError'});
        } else {
            this.defineModel(hiddenLayerSizesOrModel);
        }
    }

    getNetwork() {
        return this.network;
    }

    copy(network) {
        let newModel =  new Model(this.hiddenLayerSizesOrModel, this.numStates, this.numActions, this.batchSize, this.verbose);
        if (network != null) {
            newModel.network.setWeights(network.getWeights());
        }
        return newModel;
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

        if (this.verbose == 1) this.network.summary();

        this.network.compile({optimizer: 'adam', loss: 'meanSquaredError'});
    }

    /**
     * @param {tf.Tensor | tf.Tensor[]} states
     * @returns {tf.Tensor | tf.Tensor} The predictions of the best actions
     */
    predict(states) {
        try {
            states.forEach((state) => tf.cast(state, 'float32'));
            var batch = tf.concat(states, 0)
        } catch (e) {
            for (let i = 0; i < states.length; i++) {
                console.log(`Shape of tensor ${i}: ${states[i].shape}`);
                console.log(`dtype of tensor ${i}: ${states[i].dtype}`);
            }
            console.log(e)
            console.log(tf.backend, tf.backend().memory())
        }
        return this.network.predictOnBatch(batch);
    }

    /**
     * @param {tf.Tensor[]} xBatch
     * @param {tf.Tensor[]} yBatch
     */
    train(xBatch, yBatch) {
        tf.tidy(() => {
            this.network.fit(xBatch, yBatch, {epochs: 1, verbose: this.verbose});
        });
    }

    /**
     * @param {tf.Tensor} state
     * @returns {number} The action chosen by the model from 0 to numactions
     */
    chooseAction(state, eps) {
        if (Math.random() < eps) {
            return Math.floor(Math.random() * this.numActions);
        } else {
            return this.network.predict(state).argMax(-1).dataSync()[0];
        }
    }

    getAction(action) {
        return map[action];
    }
}

module.exports = Model