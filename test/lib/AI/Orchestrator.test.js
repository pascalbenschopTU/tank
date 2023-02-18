const Orchestrator = require("../../../lib/AI/Orchestrator")
const Model = require("../../../lib/AI/NeuralNetwork");
const Memory = require("../../../lib/AI/Memory");
const Level = require("../../../server/Level");
const SimpleEnemy = require("../../../server/entities/SimpleEnemy");
const Vector = require("../../../lib/Vector");
const Player = require("../../../server/entities/Player");
const { exp } = require("@tensorflow/tfjs");

const testLevels = [
    [
        ["..."],
        ["..."],
        ["..."],
    ]
]

function getModel() {
    var layers = [128, 128];
    var num_states = 7;
    var num_actions = 4;
    var batch_size = 128;
    var verbose = 0;
    var model = new Model(layers, num_states, num_actions, batch_size, verbose);

    return model;
}

function getMemory() {
    var memorySize = 10000
    var memory = new Memory(memorySize)

    return memory;
}

function getPlayer(position) {
    var player = new Player("test", "")
    player.position = position;

    return player;
}

function getAgent(position, closestPlayerPosition) {
    var level = new Level()
    var agent = new SimpleEnemy(position, level)
    var player = getPlayer(closestPlayerPosition)

    agent.closestPlayer = player;

    return agent;
}



test("Model does learn for positive experience", async () => {
    let agent = getAgent(new Vector(0,0), new Vector(0,0))
    let model = getModel();
    let memory = getMemory();
    let orchestrator = new Orchestrator(agent, model, memory)

    let state = agent.getObservationTensor();

    let chosenAction = model.chooseAction(state); // initial model choice

    let action = (chosenAction + 1) %  model.numActions // choose a different action for training
    let reward = 0.5
    let next_state = agent.getObservationTensor();

    expect(chosenAction).not.toBe(action);

    memory.addSample([state,action,reward,next_state]);

    const hasfitted = await orchestrator.trainModel()
    expect(hasfitted).toBe(true);

    expect(model.chooseAction(agent.getObservationTensor())).toBe(action);
})

test("Model does not learn for neutral experience", async () => {
    let agent = getAgent(new Vector(0,0), new Vector(0,0))
    let model = getModel();
    let memory = getMemory();
    let orchestrator = new Orchestrator(agent, model, memory)

    let state = agent.getObservationTensor();
    let chosenAction = model.chooseAction(state); // initial model choice
    let action = (chosenAction + 1) %  model.numActions // choose a different action for training
    let reward = 0
    let next_state = agent.getObservationTensor();

    expect(chosenAction).not.toBe(action);

    memory.addSample([state,action,reward,next_state]);

    const hasfitted = await orchestrator.trainModel()
    expect(hasfitted).toBe(true);

    expect(model.chooseAction(agent.getObservationTensor())).toBe(chosenAction);
})

test("Model does learn for negative experience", async () => {
    let agent = getAgent(new Vector(0,0), new Vector(0,0))
    let model = getModel();
    let memory = getMemory();
    let orchestrator = new Orchestrator(agent, model, memory)

    let state = agent.getObservationTensor();
    let chosenAction = model.chooseAction(state); // initial model choice
    let action = chosenAction // keep same action
    let reward = -0.3
    let next_state = agent.getObservationTensor();

    memory.addSample([state,action,reward,next_state]);

    const hasfitted = await orchestrator.trainModel()
    expect(hasfitted).toBe(true);

    expect(model.chooseAction(agent.getObservationTensor())).not.toBe(chosenAction); // expect a different action
})