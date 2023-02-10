const Vector = require("../../lib/Vector")
const Level = require("../Level")
const SimpleEnemy = require("./SimpleEnemy")

test("Update turret angle 1", () => {
    let l = new Level();
    let p = new Vector(0,0);
    let s = new SimpleEnemy(p,l);
    s.turretAngle = -3.1;
    let playerToBotAngle = 3.1 

    s.updateTurretAngle(playerToBotAngle)
    expect(s.turretAngle).toBeCloseTo(-3.12)
})

test("Update turret angle 2", () => {
    let l = new Level();
    let p = new Vector(0,0);
    let s = new SimpleEnemy(p,l);
    s.turretAngle = -3.14;
    let playerToBotAngle = 3.1 

    s.updateTurretAngle(playerToBotAngle)
    expect(s.turretAngle).toBeCloseTo(3.12)
})

test("Update turret angle 3", () => {
    let l = new Level();
    let p = new Vector(0,0);
    let s = new SimpleEnemy(p,l);
    s.turretAngle = 3.14;
    let playerToBotAngle = -3.1 

    s.updateTurretAngle(playerToBotAngle)
    expect(s.turretAngle).toBeCloseTo(-3.12)
})

test("Update turret angle 4", () => {
    let l = new Level();
    let p = new Vector(0,0);
    let s = new SimpleEnemy(p,l);
    s.turretAngle = 3.1;
    let playerToBotAngle = -3.1 

    s.updateTurretAngle(playerToBotAngle)
    expect(s.turretAngle).toBeCloseTo(3.12)
})