const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// Serve static files from public folder
app.use(express.static("public"));

// Simple test route (optional)
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Socket connection (for multiplayer later)
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// IMPORTANT: Render uses dynamic port
const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
