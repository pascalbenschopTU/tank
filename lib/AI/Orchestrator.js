const SimpleEnemy = require("../../server/entities/SimpleEnemy");
const Model = require("../AI/QLearning")

const MIN_EPSILON = 0.01;
const MAX_EPSILON = 0.2;
const LAMBDA = 0.01;

class Orchestrator {
    /**
     * 
     * @param {SimpleEnemy} agent 
     * @param {Model} model 
     * @param {Memory} memory 
     * @param {*} discount_rate 
     * @param {*} max_steps_per_game 
     */
    constructor(agent, model, memory, discount_rate, max_steps_per_game) {
        this.agent = agent;
        this.model = model;
        this.memory = memory;

        this.eps = MAX_EPSILON;

        this.steps = 0;
        this.max_steps_per_game = max_steps_per_game;

        this.discount_rate = discount_rate;

        this.rewards = [];
    }


    computeReward() {
        let reward = 0;
        let distance = this.agent.getDistanceToPlayer()
        reward = Math.max(100 - (distance / 10), 0);
    }

    async run() {
        let state = this.agent.getStateTensor();
        let total_reward = 0;
        let step = 0;
        
        while (step < this.max_steps_per_game) {

        }

    }
}

module.exports = Orchestrator