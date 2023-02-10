const Vector = require("./Vector")

test("Correct Distance", () => {
    let a = new Vector(2,0)
    let b = new Vector(0,2)
    expect(a.distance(b)).toBeCloseTo(Math.sqrt(8))
}) 