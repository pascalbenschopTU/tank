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
        this.levels.push(this.levelThree());
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

    levelThree() {
        var level = [
            ["*****W******"],
            ["P****W**BB**"],
            ["*****W**BB**"],
            ["**W**WWW****"],
            ["**W*********"],
            ["**WWWW**BB**"],
            ["P****W**BB**"],
            ["**W**W******"]

        ]

        return this.makeLevel(level);
    }


    /**
     * Make a level.
     * @param {Array} level 
     */
    makeLevel(level) {
        var gm = new GameMap();
        var y = 50;
        for (let i = 0; i < level.length; i++) {
            var x = 50;
            var string = level[i][0];
            for (let j = 0; j < string.length; j++) {
                switch(string[j]) {
                    case "W":
                        gm.makeWall(new Vector(x, y), 100, 100);
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
                x += 100;
            }

            y += 100;
        }

        return gm;
    }
}

module.exports = Level