const socket = io();

let team;
let turn = "A";

let playersA = [];
let playersB = [];
let ball;

let scoreA = 0;
let scoreB = 0;
let timeLeft = 120;

const config = {
    type: Phaser.AUTO,
    width: 900,
    height: 500,
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

    // Ball (black & white feel)
    ball = scene.physics.add.circle(450, 250, 10, 0xffffff);
    ball.setStrokeStyle(2, 0x000000);
    ball.setBounce(0.9);
    ball.setDrag(40);
    ball.setCollideWorldBounds(true);

    createTeam(scene, playersA, 200, 0xff4444);
    createTeam(scene, playersB, 700, 0x4444ff);

    // Collisions
    [...playersA, ...playersB].forEach(p => {
        scene.physics.add.collider(p, ball);
    });

    // Goals
    const goalLeft = scene.add.rectangle(5, 250, 10, 150);
    const goalRight = scene.add.rectangle(895, 250, 10, 150);

    scene.physics.add.existing(goalLeft, true);
    scene.physics.add.existing(goalRight, true);

    scene.physics.add.overlap(ball, goalLeft, () => handleGoal("B"));
    scene.physics.add.overlap(ball, goalRight, () => handleGoal("A"));

    // Socket events
    socket.on("team", t => team = t);
    socket.on("start", () => console.log("Game Started"));

    socket.on("shoot", data => {
        shoot(data);
        switchTurn();
    });

    socket.on("goal", data => resetBall());

    // Input
    scene.input.on("pointerdown", pointer => {
        if (team !== turn) return;

        const player = getNearest(pointer, team);
        if (!player) return;

        const dx = player.x - pointer.x;
        const dy = player.y - pointer.y;

        const vx = dx * 4;
        const vy = dy * 4;

        shoot({ id: player.id, vx, vy });
        socket.emit("shoot", { id: player.id, vx, vy });

        switchTurn();
    });

    // Timer
    scene.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
            timeLeft--;
            if (timeLeft <= 0) endGame();
        }
    });

    function handleGoal(scoredTeam) {
        if (scoredTeam === "A") scoreA++;
        else scoreB++;

        socket.emit("goal");
        resetBall();
    }

    function resetBall() {
        ball.setPosition(450, 250);
        ball.setVelocity(0, 0);
    }

    function endGame() {
        alert(`Final Score\nA: ${scoreA} | B: ${scoreB}`);
        location.reload();
    }
}

// -------- FIELD DRAW --------
function drawField(scene) {
    const g = scene.add.graphics();

    // Grass
    g.fillStyle(0x0b8f3c);
    g.fillRect(0, 0, 900, 500);

    // Mid line
    g.lineStyle(2, 0xffffff);
    g.lineBetween(450, 0, 450, 500);

    // Center circle
    g.strokeCircle(450, 250, 60);

    // Boxes
    g.strokeRect(0, 150, 120, 200);
    g.strokeRect(780, 150, 120, 200);
}

// -------- PLAYERS --------
function createTeam(scene, arr, x, color) {
    for (let i = 0; i < 11; i++) {
        let y = 50 + i * 40;

        let p = scene.physics.add.circle(x, y, 14, color);
        p.setStrokeStyle(2, 0xffffff);
        p.setBounce(0.8);
        p.setDrag(60);
        p.setCollideWorldBounds(true);

        p.id = `${x}-${i}`;
        arr.push(p);
    }
}

// -------- UTIL --------
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

function shoot(data) {
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
