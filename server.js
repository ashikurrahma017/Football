const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let players = [];

io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    if (players.length < 2) {
        players.push(socket.id);

        const team = players.length === 1 ? "A" : "B";
        socket.emit("team", team);

        if (players.length === 2) {
            io.emit("start");
        }
    }

    socket.on("shoot", data => {
        socket.broadcast.emit("shoot", data);
    });

    socket.on("disconnect", () => {
        players = players.filter(id => id !== socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("Running on", PORT));
