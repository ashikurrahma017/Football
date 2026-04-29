const socket = io();

let team;
let turn = "A";

let playersA = [];
let playersB = [];
let ball;

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#0b8f3c",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: { create, update }
};

new Phaser.Game(config);

function create() {
    const scene = this;

    drawField(scene);

    // Ball
    ball = scene.physics.add.circle(
        scene.scale.width / 2,
        scene.scale.height / 2,
        10,
        0xffffff
    );
    ball.setStrokeStyle(2, 0x000000);
    ball.setBounce(0.9);
    ball.setDrag(30);
    ball.setCollideWorldBounds(true);

    // Teams
    createTeam(scene, playersA, scene.scale.width * 0.25, 0xff4444);
    createTeam(scene, playersB, scene.scale.width * 0.75, 0x4444ff);

    // Collisions
    [...playersA, ...playersB].forEach(p => {
        scene.physics.add.collider(p, ball);
    });

    // Goalposts
    const goalLeft = scene.add.rectangle(5, scene.scale.height/2, 10, 150);
    const goalRight = scene.add.rectangle(scene.scale.width-5, scene.scale.height/2, 10, 150);

    scene.physics.add.existing(goalLeft, true);
    scene.physics.add.existing(goalRight, true);

    scene.physics.add.overlap(ball, goalLeft, () => goal("B"));
    scene.physics.add.overlap(ball, goalRight, () => goal("A"));

    // Socket
    socket.on("team", t => {
        team = t;
        console.log("You are:", team);
    });

    socket.on("start", () => {
        console.log("Game Started");
    });

    socket.on("shoot", data => {
        applyShot(data);
        switchTurn();
    });

    // Input (DRAG SYSTEM)
    scene.input.on("pointerdown", pointer => {
        if (team !== turn) return;

        let player = getNearest(pointer, team);
        if (!player) return;

        let dx = player.x - pointer.x;
        let dy = player.y - pointer.y;

        let vx = dx * 4;
        let vy = dy * 4;

        applyShot({ id: player.id, vx, vy });
        socket.emit("shoot", { id: player.id, vx, vy });

        switchTurn();
    });

    function goal(teamScored) {
        console.log("Goal:", teamScored);
        resetBall();
    }

    function resetBall() {
        ball.setPosition(scene.scale.width/2, scene.scale.height/2);
        ball.setVelocity(0, 0);
    }
}

function drawField(scene) {
    const g = scene.add.graphics();
    const w = scene.scale.width;
    const h = scene.scale.height;

    g.fillStyle(0x0b8f3c);
    g.fillRect(0, 0, w, h);

    g.lineStyle(2, 0xffffff);
    g.lineBetween(w/2, 0, w/2, h);
    g.strokeCircle(w/2, h/2, 60);

    g.strokeRect(0, h/2-100, 120, 200);
    g.strokeRect(w-120, h/2-100, 120, 200);
}

function createTeam(scene, arr, x, color) {
    for (let i = 0; i < 5; i++) {
        let y = 100 + i * 80;

        let p = scene.physics.add.circle(x, y, 15, color);
        p.setStrokeStyle(2, 0xffffff);
        p.setBounce(0.8);
        p.setDrag(50);
        p.setCollideWorldBounds(true);

        p.id = `${x}-${i}`;
        arr.push(p);
    }
}

function getNearest(pointer, team) {
    let arr = team === "A" ? playersA : playersB;

    let min = Infinity;
    let chosen = null;

    arr.forEach(p => {
        let d = Phaser.Math.Distance.Between(pointer.x, pointer.y, p.x, p.y);
        if (d < min) {
            min = d;
            chosen = p;
        }
    });

    return chosen;
}

function applyShot(data) {
    let all = [...playersA, ...playersB];
    let p = all.find(x => x.id === data.id);
    if (p) {
        p.setVelocity(data.vx, data.vy);
    }
}

function switchTurn() {
    turn = turn === "A" ? "B" : "A";
}

function update() {}
