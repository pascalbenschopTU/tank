const Vector = require("../lib/Vector");
const GameMap = require("./GameMap");

/**
 * Class Level.
 */
class Level {

    constructor() {
        this.levels = [];
        this.currentLevel = 0;
    }

    /**
     * Create a level object.
     * @returns {Level} level
     */
    static create() {
        const l = new Level();
        l.init();

        return l;
    }

    /**
     * Initialize.
     */
    init() {
        this.levels.push(this.levelOne());
        this.levels.push(this.levelTwo());
    }

    /**
     * Return current level.
     * @returns {GameMap} current level.
     */
    current() {
        if (this.levels.length > this.currentLevel) {
            var levelToReturn = this.levels[this.currentLevel];
            this.currentLevel++;

            return levelToReturn;
        } else {
            this.currentLevel = 0;
            var levelToReturn = this.levels[this.currentLevel];

            return levelToReturn;
        }
        
    }

    /**
     * Make a level.
     * @returns {GameMap} level
     */
    levelOne() {
        var level = [
            ["*****W******"],
            ["*****W**B***"],
            ["*****W******"],
            ["*****W******"],
            ["P****W******"],
            ["************"],
            ["************"],
            ["************"]

        ]

        return this.makeLevel(level);
    }


    levelTwo() {
        var level = [
            ["*****W******"],
            ["P****W**B***"],
            ["*****W******"],
            ["*****W******"],
            ["************"],
            ["*****W******"],
            ["P****W**B***"],
            ["*****W******"]

        ]

        return this.makeLevel(level);
    }


    /**
     * Make a level.
     * @param {Array} level 
     */
    makeLevel(level) {
        var gm = new GameMap();
        var x = 0;
        var y = 0;
        for (let i = 0; i < level.length; i++) {
            x = 0;
            var string = level[i][0];
            for (let j = 0; j < string.length; j++) {
                x += 100;
                switch(string[j]) {
                    case "W":
                        gm.makeWall(new Vector(x, y), 100, 200);
                        break;
                    case "B":
                        gm.makeBot(new Vector(x, y));
                        break;
                    case "P":
                        gm.makePlayerPosition(new Vector(x, y));
                        break;
                    default:
                        break;
                }
            }

            y += 100;
        }

        return gm;
    }
}

module.exports = Level