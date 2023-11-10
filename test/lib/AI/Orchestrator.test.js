const Orchestrator = require("../../../lib/AI/Orchestrator")
const Model = require("../../../lib/AI/NeuralNetwork");
const Memory = require("../../../lib/AI/Memory");
const Level = require("../../../server/level/Level");
const SimpleEnemy = require("../../../server/entities/SimpleEnemy");
const Vector = require("../../../lib/Vector");
const Player = require("../../../server/entities/Player");

function getModel(batch_size=1) {
    var layers = [128, 128];
    var num_states = 7;
    var num_actions = 4;
    var verbose = 0;
    var model = new Model(layers, num_states, num_actions, batch_size, verbose);

    return model;
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


test('Orchestrator constructor', () => {
    var model = getModel();
    var level = new Level();
    var orchestrator = new Orchestrator([], model, level);

    expect(orchestrator.agents).toEqual([]);
    expect(orchestrator.model).toEqual(model);
    expect(orchestrator.level).toEqual(level);
    expect(orchestrator.eps).toEqual(0.3);
    expect(orchestrator.steps).toEqual(0);
    expect(orchestrator.maxStepsPerModelUpdate).toEqual(100);
    expect(orchestrator.maxStepsPerGame).toEqual(500);
    expect(orchestrator.modelPerAgent).toEqual(new Array(0).fill(model));
    expect(orchestrator.rewardPerAgent).toEqual(new Array(0).fill(0));
});

test("Get move from agent", () => {
    var model = getModel();
    var level = new Level();
    var orchestrator = new Orchestrator([], model, level);

    var agent = getAgent(new Vector(0, 0), new Vector(0, 0));
    var move = orchestrator.getNextMove(agent);

    // Expect move to be within 0 to 3
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThanOrEqual(3);
});