const Util = require('../../lib/Util')

test('Value above 2 PI should be normalized', () => {
    expect(Util.normalizeAngle(2*Math.PI + 0.1)).toBeCloseTo(0.1);
});

test("Value above PI should be normalized", () => {
    expect(Util.normalizeAngle(Math.PI + 0.01)).toBeCloseTo(-Math.PI + 0.01)
})

test("Value above 0 should be normalized", () => {
    expect(Util.normalizeAngle(0.01)).toBeCloseTo(0.01)
})

test("Argmax should return the largest value", () => {
    expect(Util.argmax([-1, 0, 2])).toBe(2);
});