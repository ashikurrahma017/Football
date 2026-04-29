window.onload = function () {

    const config = {
        type: Phaser.AUTO,
        width: 900,
        height: 500,
        backgroundColor: "#0b8f3c",
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    function preload() {}

    function create() {
        // Field text
        this.add.text(300, 220, "GAME WORKING ✅", {
            fontSize: "32px",
            color: "#ffffff"
        });

        // Center circle
        let graphics = this.add.graphics();
        graphics.lineStyle(2, 0xffffff);
        graphics.strokeCircle(450, 250, 60);

        // Mid line
        graphics.lineBetween(450, 0, 450, 500);

        // Ball (black-white style)
        let ball = this.add.circle(450, 250, 10, 0xffffff);
        ball.setStrokeStyle(2, 0x000000);

        // One player (test)
        let player = this.add.circle(200, 250, 15, 0xff0000);
        player.setStrokeStyle(2, 0xffffff);
    }

    function update() {}

    new Phaser.Game(config);
};
