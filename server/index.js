import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST"],
  },
});
const port = 5000;

app.get("/", (req, res) => {
  res.send("hello developer");
});

io.on("connection", (socket) => {
  console.log("user connected sucessfully", socket.id);
  socket.on("message", (data) => {
    socket.to(data.roomId).emit("recieved-message", data.message);
  });
  socket.on("join",(room) =>{
    socket.join(room);
  })
});

server.listen(port, () => {
  console.log(`app runing at http://localhost ${port}`);
});
