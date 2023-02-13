const SimpleEnemy = require("../../server/entities/SimpleEnemy");
const Model = require("../AI/NeuralNetwork")

const tf = require('@tensorflow/tfjs-node-gpu');
const QLearner = require("./QLearning");
const Vector = require("../Vector");

const MIN_EPSILON = 0.01;
const MAX_EPSILON = 0.3;
const LAMBDA = 0.005;
const DEFAULT_DISCOUNT = 0.9

class Orchestrator {
    /**
     * Create an orchestrator
     * @param {Model} model 
     * @param {Memory} memory 
     */
    constructor(agent, model, memory) {
        this.agent = agent;
        this.model = model;
        this.memory = memory;

        this.eps = MAX_EPSILON;

        this.steps = 0;
        this.max_steps_per_game = 500;

        this.previous_state = agent.getObservationTensor();

        this.discount_rate = DEFAULT_DISCOUNT;

        this.totalReward = 0;
    }

    resetEpsilon() {
        this.eps = MAX_EPSILON;
        this.steps = 0;
    }

    /**
     * Return the average reward.
     * @returns {number}
     */
    getTotalReward() {
        return this.totalReward;
    }

    getModel() {
        return this.model;
    }

    getMemory() {
        return this.memory;
    }

    getAgent() {
        return this.agent;
    }

    /**
     * 
     * @param {SimpleEnemy[]} agents 
     */
    updateAgent() {
        const previous_state = this.previous_state; 
        const action = this.model.chooseAction(previous_state, this.eps);
        const done = this.agent.move(this.model.getAction(action));
        const reward = this.computeReward();
        const next_state = this.agent.getObservationTensor();

        this.memory.addSample([previous_state, action, reward, next_state]);

        this.eps = MIN_EPSILON + (MAX_EPSILON - MIN_EPSILON) * Math.exp(-LAMBDA * this.steps);

        if (this.steps % 100 == 0)
            this.trainModel();

        if (this.steps == this.max_steps_per_game || done) {
            return true;
        }

        this.totalReward += reward;
        this.steps += 1;
        this.previous_state = next_state;

        return false;
    }

    /**
     * 
     * @param {SimpleEnemy} agent 
     */
    computeReward() {
        let agentPositionWithHitBox = 
            Vector.add(
                this.agent.position, 
                Vector.scale(
                    this.agent.velocity.isZero ? this.agent.velocity : this.agent.velocity.normalize, 
                    this.agent.hitboxSize * 2
                )
            )
        let agentInWall = this.agent.isNextStateInWall(agentPositionWithHitBox)
        if (!agentInWall && this.agent.isDirectionTowardPlayer() && this.agent.velocity != Vector.zero()) {
            let distance = this.agent.getDistanceToPlayer()
            return Math.max(Math.ceil(100 - (distance / 10), 0), -100); // reward for going towards player
        } else if (agentInWall){
            return -0.1; // punish going into a wall
        } else {
            return -0.01; // punish not moving
        }
    }

    async trainModel() {
        const batch = this.memory.sample(this.model.batchSize);
        const states = batch.map(([state, , , ]) => state);
        const nextStates = batch.map(([, , , nextState]) => nextState);
        // Predict the values of each action at each state
        const qsa = states.map((state) => this.model.predict(state));
        // Predict the values of each action at each next state
        const qsad = nextStates.map((nextState) => this.model.predict(nextState));

        let x = new Array();
        let y = new Array();

        batch.forEach(
            ([state, action, reward, next_state], index) => {
                let currentQ = qsa[index].dataSync(); // predicted state
                // Update the action with reward (negative is do the action less, positive is do more)
                currentQ[action] = reward + this.discount_rate * qsad[index].max().dataSync();
                x.push(state.dataSync());
                y.push(currentQ);
            }
        )

        qsa.forEach((state) => state.dispose());
        qsad.forEach((state) => state.dispose());

        x = tf.tensor2d(x, [x.length, this.model.numStates])
        y = tf.tensor2d(y, [y.length, this.model.numActions])

        await (this.model.train(x, y));

        x.dispose();
        y.dispose();
    }
}
    

module.exports = Orchestrator