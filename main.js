import start from "./states/start.js";
import play from "./states/play.js";
import hud from "./states/hud.js";
import gameover from "./states/gameover.js";

const config = {
    pixelArt: true,
    width: 600,
    height: 400,
    physics: {
        default: "arcade",
    },
};

const game = new Phaser.Game(config);

game.scene.add("start", start);

game.scene.add("play", play);
game.scene.add("hud", hud);

game.scene.add("gameover", gameover);

game.scene.start("start");
