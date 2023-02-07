const Constants = require("../lib/Constants");
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
        this.levels.push(this.levelFour());
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


    levelFour() {
        var level = [
            ["******W**************"],
            ["******W*****W*****B**"],
            ["*P****W*****W********"],
            ["*****WW*****WWW***B**"],
            ["*********************"],
            ["*******WWW********B**"],
            ["*********W****W******"],
            ["************WWW***B**"],
            ["*****WWW****W********"],
            ["*****W************B**"],
            ["*****W*******WW******"],
            ["**************W***B**"]
        ]

        return this.makeLevel(level);
    }


    /**
     * Make a level.
     * @param {Array} level 
     */
    makeLevel(level) {
        var gm = new GameMap();
        gm.setLevelSize(new Vector(level[0][0].length, level.length))
        gm.setLevelData(level);

        var y = Constants.CANVAS_HEIGHT / level.length
        var new_y = y / 2
        for (let i = 0; i < level.length; i++) {
            var x = Constants.CANVAS_WIDTH / level[i][0].length
            var new_x = x / 2
            var string = level[i][0];
            for (let j = 0; j < string.length; j++) {
                switch(string[j]) {
                    case "W":
                        gm.makeWall(new Vector(new_x, new_y), x + 1, y + 1); // To make walls more overlapping add small value
                        break;
                    case "B":
                        gm.makeBot(new Vector(new_x, new_y));
                        break;
                    case "P":
                        gm.makePlayerPosition(new Vector(new_x, new_y));
                        break;
                    default:
                        break;
                }
                new_x += x;
            }
            new_y += y;
        }
        return gm;
    }
}

module.exports = Level