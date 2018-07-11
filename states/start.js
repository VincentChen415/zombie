export default class Start extends Phaser.Scene {
    init() {
        this.keys = undefined;
    }
    create() {
        this.keys = this.input.keyboard.addKeys({
            Space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            Enter: Phaser.Input.Keyboard.KeyCodes.ENTER
        });
    }
    update() {
        if (this.keys.Space.isDown || this.keys.Enter.isDown) {
            this.scene.start("play");
        }
    }
}
