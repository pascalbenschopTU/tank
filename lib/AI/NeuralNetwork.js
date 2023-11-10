const tf = require('@tensorflow/tfjs-node');

Error.stackTraceLimit = Infinity;

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

    /**
     * Get the neural network
     * @returns {tf.LayersModel} The neural network
     */
    getNetwork() {
        return this.network;
    }

    /**
     * @param {tf.Tensor} state
     * @returns {number} The action chosen by the model from 0 to numactions
     */
    chooseAction(state, eps) {
        if (Math.random() < eps) {
            return Math.floor(Math.random() * this.numActions);
        }
        return tf.tidy(() => {
            var stateTensor = tf.tensor2d([state], [1, this.numStates])
            return this.network.predict(stateTensor).argMax(-1).dataSync()[0];
        });
    }

    /**
     * Copies the model
     * @param {tf.LayersModel} network 
     * @param {number} variation
     * @returns {tf.LayersModel} The copied model
     */
    copy(variation=0.5) {
        let newModel =  new Model(this.hiddenLayerSizesOrModel, this.numStates, this.numActions, this.batchSize, this.verbose);
        if (this.network != null) {
            let weights = this.network.getWeights();
            let newWeights = [];
            for (let i = 0; i < weights.length; i++) {
                let shape = weights[i].shape;
                let values = weights[i].dataSync().slice();
                for (let j = 0; j < values.length; j++) {
                    values[j] += variation * (Math.random() * 2 - 1);
                }
                let newTensor = tf.tensor(values, shape);
                newWeights.push(newTensor);
            }
            newModel.network.setWeights(newWeights);
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

        this.network.weights.forEach(w => {
            const newVals = tf.randomNormal(w.shape, 0, 1);
            w.val.assign(newVals);
        });

        this.network.compile({optimizer: 'adam', loss: 'meanSquaredError'});
    }

    /**
     * @param {tf.Tensor | tf.Tensor[]} states
     * @returns {tf.Tensor | tf.Tensor} The predictions of the best actions
     */
    predict(states) {
        if (states.length != this.batchSize) {
            throw new Error("States length does not match batch size");
        }
        return tf.tidy(() => {
            var batch = tf.tensor2d(states, [states.length, this.numStates])

            var t = this.network.predictOnBatch(batch);
            
            var min = t.min(1)
            var max = t.max(1)

            return tf.div(t, tf.reshape(tf.sub(max, min), [-1, 1]));
        });
    }

    /**
     * @param {tf.Tensor[]} xBatch
     * @param {tf.Tensor[]} yBatch
     */
    async train(x, y) {
        var xBatch = tf.tensor2d(x, [x.length, this.numStates])
        var yBatch = tf.tensor2d(y, [y.length, this.numActions])
    
        await this.network.fit(xBatch, yBatch, {epochs: 1, verbose: this.verbose});
    }
}

module.exports = Model