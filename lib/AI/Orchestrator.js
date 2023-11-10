const SimpleEnemy = require("../../server/entities/SimpleEnemy");
const Model = require("./NeuralNetwork")

const Util = require("../Util")
const Vector = require("../Vector");
const Level = require("../../server/level/Level");

const MAX_EPSILON = 0.3;
const DEFAULT_DISCOUNT = 0.9

class Orchestrator {
    /**
     * Create an orchestrator
     * @param {SimpleEnemy[]} agents
     * @param {Model} model
     * @param {Level} level
     */
    constructor(agents, model, level) {
        this.agents = agents;
        this.model = model;
        this.level = level

        this.eps = MAX_EPSILON;

        this.steps = 0;
        this.maxStepsPerModelUpdate = 100;
        this.maxStepsPerGame = 500;

        this.modelPerAgent = new Array(this.agents.length).fill(this.model.copy(this.eps));
        this.rewardPerAgent = new Array(this.agents.length).fill(0);
    }

    updateEpsilon() {
        this.eps = this.eps * DEFAULT_DISCOUNT
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
        this.modelPerAgent = new Array(this.agents.length).fill(this.model.copy(this.eps));    
        this.rewardPerAgent = new Array(this.agents.length).fill(0);
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
     * Get the next move of an agent
     * @param {SimpleEnemy} agent 
     * @returns {Number} The next move
     */
    getNextMove(agent) {
        const state = agent.getObservationTensor();

        return this.model.chooseAction(state, this.eps);
    }

    /**
     * Update the agents
     */
    updateAgents() {
        var projectiles = [];
        for (var i = 0; i < this.agents.length; i++) {
            const agent = this.agents[i];
            const observation = agent.getObservationTensor();
            const model = this.modelPerAgent[i];
            const move = model.chooseAction(observation, this.eps);
            projectiles = projectiles.concat(agent.updateAI(move));
        }

        return projectiles;
    }

    /**
     * Train the agents
     */
    trainAgents() {
        this.updateAgents() // ignore bullets
        this.rewardPerAgent = this.agents.map(agent => agent.getDistanceToPlayer());
        this.steps += 1;

        if (this.steps % this.maxStepsPerModelUpdate == 0) {
            // Get the best agent, i.e. the agent that was closest to the player
            const bestAgent = this.rewardPerAgent.indexOf(Math.min(...this.rewardPerAgent));
            const bestModel = this.modelPerAgent[bestAgent];
            // TODO remove later
            console.log("Best agent: " + bestAgent + " with reward: " + this.rewardPerAgent[bestAgent]);
            // Update the variation of the weights
            this.updateEpsilon();
            // Update the model for each agent
            this.modelPerAgent = new Array(this.agents.length - 1).fill(bestModel.copy(this.eps));
            this.modelPerAgent.push(bestModel);
        }

        if (this.steps % this.maxStepsPerGame == 0) {
            this.resetEpsilon();
            // Reset agents to original position
            for (var i = 0; i < this.agents.length; i++) {
                this.agents[i].position = this.level.gameBotPositions[i];
            }
        }
    }
}
    

module.exports = Orchestrator