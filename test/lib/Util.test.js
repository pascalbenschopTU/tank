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

test("inBound returns correct boolean", () => {
    expect(Util.inBound(1, 0, 2)).toBe(true);
    expect(Util.inBound(1, 2, 0)).toBe(true);
    expect(Util.inBound(0, 1, 2)).toBe(false);
    expect(Util.inBound(0, 2, 1)).toBe(false);
})

test("bound returns correct value", () => {
    expect(Util.bound(1, 0, 2)).toBe(1);
    expect(Util.bound(3, 0, 2)).toBe(2);
    expect(Util.bound(3, 2, 0)).toBe(2);
})

test("reverseBound returns correct value", () => {
    expect(Util.reverseBound(0, 0, 0, 2)).toBe(0);
    expect(Util.reverseBound(0, 2, 0, 2)).toBe(2);
    expect(Util.reverseBound(2, 0, 0, 2)).toBe(0);
})

test("reverseBounce returns correct boolean", () => {
    expect(Util.reverseBounce(0, 0, 0, 2)).toBe(false);
    expect(Util.reverseBounce(0, 2, 0, 2)).toBe(false);
    expect(Util.reverseBounce(2, 0, 0, 2)).toBe(false);
    expect(Util.reverseBounce(1.9, 2.1, 0, 2)).toBe(true);
    expect(Util.reverseBounce(2.1, 1.9, 2, 0)).toBe(true);
})

test("randRange returns correct random", () => {
    expect(Util.randRange(0, 2)).toBeGreaterThanOrEqual(0);
    expect(Util.randRange(2, 0)).toBeLessThanOrEqual(2);
})

test("randRangeInt returns correct random int", () => {
    expect([0, 1, 2]).toContain(Util.randRangeInt(0, 2));
    expect([0, 1, 2]).toContain(Util.randRangeInt(2, 0))
})

test("choiceArray returns correct random element", () => {
    expect([0, 1, 2]).toContain(Util.choiceArray([0, 1, 2]));
    expect([0, 1, 2]).not.toContain(Util.choiceArray([3, 4, 5]));
})

test("sum returns correct sum", () => {
    expect(Util.sum([0, 1, 2])).toBe(3);
    expect(Util.sum([])).toBe(0);
})

test("Argmax should return the largest value", () => {
    expect(Util.argmax([-1, 0, 2])).toBe(2);
    expect(Util.argmax([])).toBe(0)
});