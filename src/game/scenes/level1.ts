import { Scene } from "phaser";

type ArcadeColliderObject =
    | Phaser.Types.Physics.Arcade.GameObjectWithBody
    | Phaser.Tilemaps.Tile
    | Phaser.Physics.Arcade.Body
    | Phaser.Physics.Arcade.StaticBody;

export class Level1 extends Scene {
    camera!: Phaser.Cameras.Scene2D.Camera;
    background!: Phaser.GameObjects.Image;
    player!: Phaser.Physics.Arcade.Sprite;
    platforms!: Phaser.Physics.Arcade.StaticGroup;
    stars!: Phaser.Physics.Arcade.Group;
    bombs!: Phaser.Physics.Arcade.Group;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    scoreText!: Phaser.GameObjects.Text;

    gameOver: boolean;
    score: number;

    constructor() {
        super("Level1");
        this.gameOver = false;
        this.score = 0;
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.add.image(400, 300, "sky");

        this.platforms = this.physics.add.staticGroup();

        const ground = this.platforms.create(
            400,
            568,
            "ground",
        ) as Phaser.Physics.Arcade.Sprite;
        ground.setScale(2);
        ground.refreshBody();
        this.platforms.create(600, 400, "ground");
        this.platforms.create(50, 250, "ground");
        this.platforms.create(750, 220, "ground");

        this.player = this.physics.add.sprite(100, 450, "dude");
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.stars = this.physics.add.group({
            key: "star2",
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 },
        });

        this.stars.children.iterate((child) => {
            const star = child as Phaser.Physics.Arcade.Image;
            star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
            return true;
        });

        this.bombs = this.physics.add.group();

        this.scoreText = this.add.text(16, 16, "Score: 0", {
            fontSize: "32px",
            color: "#000",
        });

        this.cursors = this.input.keyboard!.createCursorKeys();

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);

        this.physics.add.overlap(
            this.player,
            this.stars,
            this.handleCollectStar,
            undefined,
            this,
        );

        this.physics.add.collider(
            this.player,
            this.bombs,
            this.handleHitBomb.bind(this),
            undefined,
            this,
        );
    }

    update() {
        if (this.gameOver) {
            this.changeScene();
            return;
        }

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play("left", true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play("right", true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play("turn");
        }

        if (this.cursors.up.isDown && this.player.body?.touching.down) {
            this.player.setVelocityY(-330);
        }
    }

    private handleCollectStar = (
        playerObj: ArcadeColliderObject,
        starObj: ArcadeColliderObject,
    ) => {
        const star = starObj as Phaser.Physics.Arcade.Image;
        star.disableBody(true, true);

        this.score += 10;
        this.scoreText.setText("Score: " + this.score);

        if (this.stars.countActive(true) === 0) {
            this.stars.children.iterate((child) => {
                const resetStar = child as Phaser.Physics.Arcade.Image;
                resetStar.enableBody(true, resetStar.x, 0, true, true);
                return true;
            });

            const player = playerObj as Phaser.Physics.Arcade.Sprite;
            const x =
                player.x < 400 ?
                    Phaser.Math.Between(400, 800)
                :   Phaser.Math.Between(0, 400);

            const bomb = this.bombs.create(
                x,
                16,
                "bomb",
            ) as Phaser.Physics.Arcade.Image;

            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

            //bomb.setAllowGravity(false);
        }
    };

    private handleHitBomb() {
        this.physics.pause();

        this.player.setTint(0xff0000);
        this.player.anims.play("turn");

        this.gameOver = true;
    }

    changeScene() {
        if (this.gameOver) {
            this.scene.start("GameOver");
        }
    }
}
