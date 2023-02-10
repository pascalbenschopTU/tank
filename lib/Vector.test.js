const Vector = require("./Vector")

test("Correct Distance", () => {
    let a = new Vector(2,0)
    let b = new Vector(0,2)
    expect(a.distance(b)).toBeCloseTo(Math.sqrt(8))
}) 

test("Correct angle with other", () => {
    let a = new Vector(1,1);
    let b = new Vector(2,0);
    expect(a.angleWith(b)).toBeCloseTo(Math.sqrt(2) / 2);
})