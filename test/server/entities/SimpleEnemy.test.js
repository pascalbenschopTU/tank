const Vector = require("../../../lib/Vector")
const Level = require("../../../server/level/Level")
const SimpleEnemy = require("../../../server/entities/SimpleEnemy");
const Player = require("../../../server/entities/Player");


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

test("Update turret angle in positive clockwise direction", () => {
    let l = new Level();
    let p = new Vector(0,0);
    let s = new SimpleEnemy(p,l);
    s.turretAngle = -3.1;
    let playerToBotAngle = 3.1 

    s.updateTurretAngle(playerToBotAngle)
    expect(s.turretAngle).toBeCloseTo(-3.12)
})

test("Update turret angle in positive clockwise direction over boundary", () => {
    let l = new Level();
    let p = new Vector(0,0);
    let s = new SimpleEnemy(p,l);
    s.turretAngle = -3.14;
    let playerToBotAngle = 3.1 

    s.updateTurretAngle(playerToBotAngle)
    expect(s.turretAngle).toBeCloseTo(3.12)
})

test("Update turret angle in negative clockwise direction over boundary", () => {
    let l = new Level();
    let p = new Vector(0,0);
    let s = new SimpleEnemy(p,l);
    s.turretAngle = 3.14;
    let playerToBotAngle = -3.1 

    s.updateTurretAngle(playerToBotAngle)
    expect(s.turretAngle).toBeCloseTo(-3.12)
})

test("Update turret angle in negative clockwise direction", () => {
    let l = new Level();
    let p = new Vector(0,0);
    let s = new SimpleEnemy(p,l);
    s.turretAngle = 3.1;
    let playerToBotAngle = -3.1 

    s.updateTurretAngle(playerToBotAngle)
    expect(s.turretAngle).toBeCloseTo(3.12)
})

test("Distance to player is 0", () => {
    let agent = getAgent(new Vector(0,0), new Vector(0,0));

    expect(agent.getDistanceToPlayer()).toBeCloseTo(0);
})

test("Distance to player is 100", () => {
    let agent = getAgent(new Vector(0,0), new Vector(0,100));

    expect(agent.getDistanceToPlayer()).toBeCloseTo(100);

    let agent2 = getAgent(new Vector(0,0), new Vector(-100,0));

    expect(agent2.getDistanceToPlayer()).toBeCloseTo(100);
})

