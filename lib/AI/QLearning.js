const Util = require('../Util')

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

        this.canTrain = false;
    }

    reset_episode() {
        this.steps_metric.push(this.steps);
        this.steps = 0;
    }

    processExperience(state, action, next_state, reward, done) {
        if (done) {
            this.q[state][action] = ((1- this.learning_rate) * this.q[state][action]) + (this.learning_rate * reward);
            this.epsilons.push(this.epsilon);
            this.epsilon = this.epsilon * (1.0 - EPSILON);
        } else {
            this.q[state][action] = ((1- this.learning_rate) * this.q[state][action]) + 
                (this.learning_rate * (reward + this.discount * Math.max(this.q[next_state])));
        }
    }

    chooseAction(state, eps) {
        this.steps += 1;
        if (Util.randRange(0,1) < eps || Util.sum(this.q[state]) == 0) {
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

    getAction(action) {
        return map(action);
    }
}

module.exports = QLearner