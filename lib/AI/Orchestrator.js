const SimpleEnemy = require("../../server/entities/SimpleEnemy");
const Model = require("../AI/NeuralNetwork")

const tf = require('@tensorflow/tfjs-node');
tf.setBackend('tensorflow');
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
    constructor(agents, model, memory) {
        this.agents = agents;
        this.model = model;
        this.memory = memory;

        this.eps = MAX_EPSILON;

        this.steps = 0;
        this.maxStepsPerGame = 500;

        this.discount_rate = DEFAULT_DISCOUNT;

        this.rewardPerAgent = new Array(this.agents.length).fill(0);
        this.previousStatePerAgent = new Array(this.agents.length).fill(null)
            .map((_, i) => this.agents[i].getObservationTensor());
    }

    resetEpsilon() {
        this.eps = MAX_EPSILON;
        this.steps = 0;
    }

    /**
     * Add agents to the orchestrator
     * @param {SimpleEnemy} agents 
     */
    addAgents(agents) {
        this.agents = this.agents.concat(agents);
        this.rewardPerAgent = new Array(this.agents.length).fill(0);
        this.previousStatePerAgent = new Array(this.agents.length).fill(null)
            .map((_, i) => this.agents[i].getObservationTensor());
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

    getAgents() {
        return this.agents;
    }

    /**
     * Train the agents
     */
    updateAgents() {
        for (var i = 0; i < this.agents.length; i++) {
            this.updateAgent(this.agents[i], i);
        }

        if (this.steps % 50 == 0) {
            console.log(this.steps);
            this.trainModel();
        }
    }

    /**
     * Update an agent
     * @param {SimpleEnemy} agent 
     */
    updateAgent(agent, index) {
        const previousState = this.previousStatePerAgent[index]; 
        const previousAction = this.model.chooseAction(previousState, this.eps);
        const done = agent.move(this.model.getAction(previousAction));
        const currentReward = this.computeReward(agent);
        const currentState = agent.getObservationTensor();

        this.memory.addSample([previousState, previousAction, currentReward, currentState]);
        this.previousStatePerAgent[index] = currentState;

        
        this.eps = MIN_EPSILON + (MAX_EPSILON - MIN_EPSILON) * Math.exp(-LAMBDA * this.steps);

        this.rewardPerAgent[index] += currentReward;
        this.steps += 1;
    }

    /**
     * Compute the reward of an agent after an action
     * @param {SimpleEnemy} agent 
     */
    computeReward(agent) {
        let agentPositionWithHitBox = 
            Vector.add(
                agent.position, 
                Vector.scale(
                    agent.velocity.isZero ? agent.velocity : agent.velocity.normalize, 
                    agent.hitboxSize * 2
                )
            )
        let agentInWall = agent.isNextStateInWall(agentPositionWithHitBox)
        if (!agentInWall && agent.isDirectionTowardPlayer() && agent.velocity != Vector.zero()) {
            let distance = agent.getDistanceToPlayer()
            return Math.max(Math.ceil(100 - (distance / 10)), -100) / 100; // reward for going towards player
        } else if (agentInWall){
            return -0.1; // punish going into a wall
        } else {
            return -0.01; // punish not moving
        }
    }

    /**
     * Train the model
     */
    trainModel() {
        const batch = this.memory.sample(this.model.batchSize);
        const states = batch.map(([state, , , ]) => state);
        const nextStates = batch.map(([, , , nextState]) => nextState);
        console.log("where go wrong? before predict")
        // Predict the values of each action at each state
        const qsa = this.model.predict(states);
        // Predict the values of each action at each next state
        const qsad = this.model.predict(nextStates);

        let x = new Array();
        let y = new Array();
        console.log("where go wrong? before batch for each")

        batch.forEach(
            ([state, action, reward, next_state], index) => {
                let currentQ = qsa.dataSync().slice(index*4,index*4+4); // predicted state
                // Update the action with reward (negative is do the action less, positive is do more)
                // Model loss = {(r + y * max(Q'(s',a')) - Q(s,a)}^2  (mse)
                currentQ[action] = reward + this.discount_rate * tf.slice(qsad, index, 1).max().dataSync()[0];

                x.push(state);
                y.push(currentQ);
            }
        )
 
        qsa.dispose();
        qsad.dispose();
        
        var new_x = tf.concat(x, 0);
        var new_y = tf.tensor2d(y, [y.length, this.model.numActions])

        this.model.train(new_x, new_y);

        x.forEach(state => tf.dispose(state));
        y.forEach(state => tf.dispose(state));
        new_x.dispose();
        new_y.dispose();
        
    }


    /**
     * Update the model used for the agents to the previous best one.
     */
    async updateModelToBestModel() {
        if (network != null) {
            await network.save('file://./best_model')
            console.log("Saved model, updated new models with weights, updated model with reward ", reward);
        } else {
            await tf.loadLayersModel('file://./best_model/model.json').then(model => {
                network = model;
            })
            console.log("Loaded model, updated new models with weights");
        }

        this.orchestrators.length = 0;
        this.entityManagement.bots.forEach(bot => {
            this.orchestrators.push(new Orchestrator(bot, this.model.copy(network), this.memory));
        })
    }
}
    

module.exports = Orchestrator