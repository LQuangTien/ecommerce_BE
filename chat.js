module.exports = function (socket, io) {
  socket.on("my message", (msg) => {
    console.log("message: " + msg);
  });

  socket.on("submit", (data) => {
    console.log(data);
    const notify = socket.id + " is comment " + data.comment;
    io.of("/admin").emit("notify admin", notify);
  });
};
