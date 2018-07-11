/*
 * Load each of the game states
 */
import start from "./states/start.js";
import play from "./states/play.js";
import hud from "./states/hud.js";
import gameover from "./states/gameover.js";

/*
 * Configure the game
 */
const config = {
    pixelArt: true, // This disables anti-aliasing
    width: 600,
    height: 400,
    physics: {
        // This turns on axis aligned bounding box (AABB) physics
        default: "arcade",
    },
};

/*
 * Create a new game from the config
 */
const game = new Phaser.Game(config);

/*
 * This adds each of the scenes
 */
game.scene.add("start", start);

game.scene.add("play", play);
game.scene.add("hud", hud);

game.scene.add("gameover", gameover);

/*
 * This starts the game
 */
game.scene.start("start");
