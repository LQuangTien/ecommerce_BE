const path = require("path");
const cors = require("cors");
const env = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const routes = require("./routes");
const cloudinary = require("cloudinary").v2;
const socketio = require('socket.io');

const app = express();
env.config();

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("DB connected");
  });

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use("/public", express.static(path.join(__dirname, "uploads")));
app.use(express.static("public"));
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

routes.forEach((route) => {
  app.use("/api", route);
});

const server = app.listen(process.env.PORT, () => {
  console.log("Server is running on port:", process.env.PORT);
});

const io = socketio(server, {
  cors: {
    origin: ["http://localhost:3000", "https://ecommerce-client-teal.vercel.app"],
  }
});

io.on('connection', (socket) => {
  app.set('socket', socket);
  console.log('aaaa')

  socket.on('my message', (msg) => {
    console.log('message: ' + msg);
  });

});

app.set('io', io);