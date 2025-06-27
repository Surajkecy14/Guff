import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins (adjust in production)
    methods: ["GET", "POST"],
  },
});

const port = 5000;

app.get("/", (req, res) => {
  res.send("Hello Developer! GuffHanum server is running.");
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Join room event
  socket.on("join", (room) => {
    socket.join(room);
    console.log(`🔁 ${socket.id} joined room: ${room}`);
  });

  // Message event
  socket.on("message", (data) => {
    const { roomId, message } = data;

    // Emit to all users in the room except sender
    socket.to(roomId).emit("recieved-message", {
      message,
      senderId: socket.id,
    });

    console.log(`💬 Message from ${socket.id} in room ${roomId}: ${message}`);
  });

  // Optional: handle disconnect
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
