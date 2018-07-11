const bulletSpeed = 1500;
const playerSpeed = 200;
const alienSpeed = 150;

const fireRate = 50;
const bulletLifespan = 1000;
const spawnDelay = 200;
const minSpawnDelay = 75;

const worldHeight = 800;
const worldWidth = 1200;

const magicBulletScore = 250;

// Import helpers from the utility file
import { getRotation, getVelocity } from "../util.js";

export default class Play extends Phaser.Scene {
    /*
     * This function is used to calculate what rotation the player
     * should be at to face the mouse
     */
    getPlayerRotation() {
        const mouse = this.input.activePointer.positionToCamera(this.cameras.main);
        return getRotation(this.player, mouse);
    }
    preload() {
        this.load.image("player", "img/player.png");
        this.load.image("ground", "img/ground.png");
        this.load.image("bullet", "img/bullet.png");
        this.load.image("alien", "img/alien.png");
        
        this.load.audio("machine-gun", "audio/machine-gun.ogg");
        this.load.audio("squelch", "audio/squelch.wav");
        this.load.audio("bassdrop", "audio/bassdrop.wav");
    }
    init() {
        this.canFire = true;

        this.score = 0;
        this.health = 100;

        this.keys = undefined;
        this.bullets = undefined;
        this.player = undefined;
        this.aliens = undefined;

        this.gunSound = undefined;
        this.particles = undefined;
        this.emitter = undefined;
    }
    create() {
        // This resizes the world to be larger than the screen
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        const ground = this.add.tileSprite(worldWidth/2, worldHeight/2, worldWidth, worldHeight, "ground");

        this.player = this.physics.add.sprite(worldWidth/2, worldHeight/2, "player");
        this.player.setScale(4);
        this.player.setCollideWorldBounds(true);

        this.bullets = this.physics.add.group();
        this.bullets.defaultKey = "bullet";

        // This sets the camera to follow the player
        const camera = this.cameras.main;
        camera.startFollow(this.player);
        camera.setBounds(0, 0, worldWidth, worldHeight);

        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            Up: Phaser.Input.Keyboard.KeyCodes.UP,

            A: Phaser.Input.Keyboard.KeyCodes.A,
            Left: Phaser.Input.Keyboard.KeyCodes.LEFT,

            S: Phaser.Input.Keyboard.KeyCodes.S,
            Down: Phaser.Input.Keyboard.KeyCodes.DOWN,

            D: Phaser.Input.Keyboard.KeyCodes.D,
            Right: Phaser.Input.Keyboard.KeyCodes.RIGHT
        });

        this.aliens = this.physics.add.group();
        this.aliens.defaultKey = "alien";

        /*
         * This spawns a new alien every
         * spawnDelay - score miliseconds
         */
        const spawnAlien = () => {
            const alien = this.aliens.create(Math.random()*worldWidth, Math.random()*worldHeight);
            alien.setScale(2);
            this.time.addEvent({
                delay: Math.max(minSpawnDelay, spawnDelay-this.score),
                callback: spawnAlien
            });
        };
        this.time.addEvent({
            delay: spawnDelay,
            callback: spawnAlien
        });

        this.gunSound = this.sound.add("machine-gun");
        this.gunSound.volume = .1

        this.particles = this.add.particles("bullet");

        /*
         * This starts the hud scene ontop of this one
         */
        this.scene.manager.start("hud", this);  
    }
    update() {
        // Movement along the Y axis
        if (this.keys.W.isDown || this.keys.Up.isDown) {
            this.player.setVelocityY(-playerSpeed);
        } else if (this.keys.S.isDown || this.keys.Down.isDown) {
            this.player.setVelocityY(playerSpeed);
        } else {
            this.player.setVelocityY(0);
        }

        // Movement along the X axis
        if (this.keys.A.isDown || this.keys.Left.isDown) {
            this.player.setVelocityX(-playerSpeed);
        } else if (this.keys.D.isDown || this.keys.Right.isDown) {
            this.player.setVelocityX(playerSpeed);
        } else {
            this.player.setVelocityX(0);
        }

        // Update the player to face the mouse
        this.player.rotation = this.getPlayerRotation();

        if (this.input.activePointer.primaryDown) {
            // Play the gun sound, but don't restart it if 
            // it's already playing
            if (!this.gunSound.isPlaying) {
                this.gunSound.play();
            }

            // Only fire as fast as the fire rate
            if (this.canFire) {
                this.canFire = false;
                this.createBullet(); 
                this.time.addEvent({
                    delay: fireRate,
                    callback: () => {
                        // Allow firing again
                        this.canFire = true;
                    }
                });
            }
        } else {
            this.gunSound.pause();  
        }

        for (let alien of this.aliens.getChildren()) {
            // Rotate the alien to face the player
            const rotation = getRotation(alien, this.player);
            alien.rotation = rotation;

            // Move the alien towards the player
            const velocity = getVelocity(rotation);
            alien.setVelocityX(velocity.x * alienSpeed);
            alien.setVelocityY(velocity.y * alienSpeed);
        }

        let gameOver = false;

        this.physics.collide(this.player, this.aliens, (player, alien) => {
            alien.destroy();

            // Pulse the camera red
            this.cameras.main.flash(500, 255, 0, 0, 0);

            this.health -= 5;
            this.events.emit("updateHUD");
            this.sound.play("squelch");

            if (this.health === 0) {
                gameOver = true;
            }

        });

        this.physics.collide(this.bullets, this.aliens, (bullet, alien) => {
            // If the player has magic bullets
            // then the bullet goes through aliens
            // otherwise destroy it
            if (this.score < magicBulletScore) {
                bullet.destroy();
            }

            alien.destroy();
            this.score++;

            // Trigger an update of the score on the hud
            this.events.emit("updateHUD");


            // If the player reaches the magicBulletScore
            // then the player starts eminating bullets
            if (this.score === magicBulletScore) {
                this.events.emit("magicBullets");
                this.sound.play("bassdrop");
                this.emitter = this.particles.createEmitter({
                    speed: 100,
                    scale: { 
                        start: 1,
                        end: 0
                    },
                    blendMode: 'ADD' 
                });
                this.emitter.startFollow(this.player);
            }
        });

        if (gameOver) {
            this.scene.start("gameover");
        }
    }
    /*
     * This function is used to create a bullet
     * and setup a timer to destroy it
     */
    createBullet() {
        const bullet = this.bullets.create(this.player.x, this.player.y);

        const rotation = this.getPlayerRotation();
        bullet.rotation = rotation;

        const velocity = getVelocity(rotation);
        bullet.setVelocityX(velocity.x * bulletSpeed);
        bullet.setVelocityY(velocity.y * bulletSpeed);

        this.time.addEvent({
            delay: bulletLifespan,
            callback: () => {
                bullet.destroy();
            }
        });

        return bullet;
    }
};
