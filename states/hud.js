export default class HUD extends Phaser.Scene {
    init(play) {
        this.scoreText = undefined;
        this.healthText = undefined;
        this.magicBulletText = undefined;
        this.play = play;

        this.play.events.addListener("updateHUD", () => {
            this.scoreText.setText(this.play.score.toString().padStart(3, "0"));
            this.healthText.setText(this.play.health.toString().padStart(3, "0"));
        }); 
        this.play.events.addListener("magicBullets", () => {     
            this.magicBulletText.setVisible(true);
        });
    }
    create() {
        this.scoreText = this.add.text(550, 10, this.play.score.toString().padStart(3, "0"), {
            fontFamily: "Helvetica",
            color: "black"
        });

        this.healthText = this.add.text(10, 10, this.play.health.toString().padStart(3, "0"), {
            fontFamily: "Helvetica",
            color: "red"
        });

        this.magicBulletText = this.add.text(300, 20, "Magic Bullets", {
            fontFamily: "Helvetica",
            color: "yellow"
        });
        this.magicBulletText.setOrigin();
        this.magicBulletText.setVisible(false);
    }
}
