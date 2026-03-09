import { Scene } from "phaser";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
        // Background from Boot scene
        this.add.image(512, 384, "background");

        // Progress bar outline
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        // Progress bar fill
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        // Update progress bar as assets load
        this.load.on("progress", (progress: number) => {
            bar.width = 4 + 460 * progress;
        });
    }

    preload() {
        this.load.setPath("assets");

        // Game assets
        this.load.image("sky", "sky.png");
        this.load.image("ground", "platform.png");
        this.load.image("star2", "star.png");
        this.load.image("bomb", "bomb.png");
        this.load.image("logo", "logo.png");

        // Player sprite sheet
        this.load.spritesheet("dude", "dude.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
    }

    create() {
        // Leave unchanged (per instructions)
        this.scene.start("MainMenu");
    }
}
