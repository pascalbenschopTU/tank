const SimpleEnemy = require("../../server/entities/SimpleEnemy");
const Model = require("../AI/NeuralNetwork")

const tf = require('@tensorflow/tfjs-node-gpu');
const QLearner = require("./QLearning");
const Vector = require("../Vector");

const MIN_EPSILON = 0.01;
const MAX_EPSILON = 1.0;
const LAMBDA = 0.005;
const DEFAULT_DISCOUNT = 0.9

class Orchestrator {
    /**
     * Create an orchestrator
     * @param {Model} model 
     * @param {Memory} memory 
     */
    constructor(model, memory) {
        this.agents = [];
        this.model = model;
        this.memory = memory;

        this.eps = MAX_EPSILON;

        this.steps = 0;
        this.max_steps_per_game = 100;

        this.discount_rate = DEFAULT_DISCOUNT;

        this.rewards = [];
    }

    resetEpsilon() {
        this.eps = MAX_EPSILON;
        this.steps = 0;
    }

    /**
     * 
     * @param {SimpleEnemy[]} agents 
     */
    updateAgents(agents) {
        this.agents = agents.forEach(agent => {
            const state = agent.getStateTensor();
            const action = this.model.chooseAction(state, this.eps);
            const new_position = agent.move(this.model.getAction(action));
            const reward = this.computeReward(agent, new_position);
            const next_state = agent.getNextStateTensor(new_position);

            console.log(reward, this.eps);

            this.memory.addSample([state, action, reward, next_state]);

            this.steps += 1;
            this.eps = MIN_EPSILON + (MAX_EPSILON - MIN_EPSILON) * Math.exp(-LAMBDA * this.steps);
        })
        if (this.steps % 20 == 0 && this.model.canTrain) {
            this.trainModel().then(console.log("done"));
        } else if (!this.model.canTrain){
            this.processExperience();
        }
    }

    /**
     * 
     * @param {SimpleEnemy} agent 
     */
    computeReward(agent, new_position) {
        let reward = 0;
        let agentPositionWithHitBox = Vector.add(agent.position, Vector.scale(agent.velocity.mag2 > 0 ? agent.velocity.normalize : agent.velocity, agent.hitboxSize * 2))
        let agentInWall = agent.isNextStateInWall(agentPositionWithHitBox)
        if (!agentInWall && agent.isDirectionTowardPlayer()) {
            let distance = agent.getDistanceToPlayer(new_position)
            reward = Math.ceil(Math.max(100 - (distance / 10), 0)) // / 10) * 10;
        } else if (agentInWall){
            reward = -1000000000;
        }
        return reward;
    }

    async trainModel() {
        const batch = this.memory.sample(this.model.batchSize);
        const states = batch.map(([state, , , ]) => state);
        const nextStates = batch.map(
            ([, , , nextState]) => nextState
        );
        // Predict the values of each action at each state
        const qsa = states.map((state) => this.model.predict(state));
        // Predict the values of each action at each next state
        const qsad = nextStates.map((nextState) => this.model.predict(nextState));

        let x = new Array();
        let y = new Array();

        batch.forEach(
            ([state, action, reward, next_state], index) => {
                let currentQ = qsa[index].dataSync();
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

    processExperience() {
        const batch = this.memory.sample(this.model.batchSize);
        batch.forEach(
            ([state, action, reward, next_state], index) => {
                this.model.processExperience(state.dataSync(), action, reward, next_state.dataSync())
            }
        )
    }
}
    

module.exports = Orchestrator