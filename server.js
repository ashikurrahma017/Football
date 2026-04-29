const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let players = [];

io.on("connection", (socket) => {

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

    socket.on("goal", data => {
        io.emit("goal", data);
    });

    socket.on("disconnect", () => {
        players = players.filter(id => id !== socket.id);
    });

});

http.listen(3000, () => console.log("Server running"));
