const Vector = require("../../../lib/Vector");
const Player = require("../../../server/entities/Player");

test("Creating a new player", () => {
      const player = Player.create(new Vector(0, 0), "test", "test");
      expect(player).toBeInstanceOf(Player);
});


