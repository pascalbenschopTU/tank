const SimpleEnemy = require("../../server/entities/SimpleEnemy");
const Model = require("../AI/QLearning")

const tf = require('@tensorflow/tfjs-node-gpu');
const Vector = require("../Vector");

const MIN_EPSILON = 0.01;
const MAX_EPSILON = 0.2;
const LAMBDA = 0.01;
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

    /**
     * 
     * @param {SimpleEnemy[]} agents 
     */
    updateAgents(agents) {
        this.agents = agents.forEach(agent => {
            let state = agent.getStateTensor();
            const action = this.model.chooseAction(state, this.eps);
            const done = agent.move(this.model.getAction(action));
            const reward = this.computeReward(agent);
            const next_state = agent.getStateTensor();

            this.memory.addSample([state, action, reward, next_state]);

            this.steps += 1;
            this.eps = MIN_EPSILON + (MAX_EPSILON - MIN_EPSILON) * Math.exp(-LAMBDA * this.steps);

            if (done) return;
        })
        if (this.steps % 200 == 0) {
            this.trainModel().then(console.log("done"));
        }
        
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
                const currentQ = qsa[index];
                currentQ[action] = reward + this.discount_rate * qsad[index].max().dataSync();
                x.push(state.dataSync());
                y.push(currentQ.dataSync());
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


    /**
     * 
     * @param {SimpleEnemy} agent 
     */
    computeReward(agent) {
        let reward = 0;
        if (agent.getNextState() == 0) {
            var new_position = Vector.add(agent.position, agent.velocity);
            let distance = agent.getDistanceToPlayer(new_position)
            reward = Math.max(100 - (distance / 10), 0);
        } else {
            reward = -10;
        }
        return reward;
    }
}

module.exports = Orchestrator