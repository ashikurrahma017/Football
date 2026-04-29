const socket = io();

let ball;
let players = [];

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#0b8f3c",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

new Phaser.Game(config);

function preload() {}

function create() {
    const scene = this;

    // Draw field
    let g = this.add.graphics();
    g.fillStyle(0x0b8f3c);
    g.fillRect(0, 0, this.scale.width, this.scale.height);

    g.lineStyle(2, 0xffffff);
    g.lineBetween(this.scale.width/2, 0, this.scale.width/2, this.scale.height);
    g.strokeCircle(this.scale.width/2, this.scale.height/2, 60);

    // Ball
    ball = this.physics.add.circle(
        this.scale.width/2,
        this.scale.height/2,
        10,
        0xffffff
    );
    ball.setStrokeStyle(2, 0x000000);
    ball.setCollideWorldBounds(true);
    ball.setBounce(0.9);

    // One test player
    let player = this.physics.add.circle(200, 200, 15, 0xff0000);
    player.setCollideWorldBounds(true);
    players.push(player);

    // Drag to shoot
    this.input.on("pointerdown", (pointer) => {
        let dx = player.x - pointer.x;
        let dy = player.y - pointer.y;

        player.setVelocity(dx * 3, dy * 3);
    });
}

function update() {}
