const User = require("../models/user.js");
const Comment = require("../models/comment.js");
const Notify = require("../models/notify.js");

module.exports = function (socket, io) {
  socket.on("submit", async (commentContent) => {
    try {
      const user = await User.findOne({ _id: socket.user._id });

      const comment = {
        userId: user._id,
        userName: user.username,
        content: commentContent.comment,
        rating: commentContent.rating,
      };
      // const newComment = await new Comment({
      //   productId: commentContent.productId,
      //   productName: commentContent.productName,
      //   comment,
      // });

      const updatedComment = Comment.findOneAndUpdate(
        { _id: commentContent.productId },
        {
          $push: {
            comment
          },
        },
        { new: true, upsert: true }
      ).exec();

      // const savedComment = await newComment.save();

      socket.emit("submit", updatedComment);

      const newNotify = new Notify({
        productId: commentContent.productId,
        productName: commentContent.productName,
        userId: user._id,
        userName: user.username,
        commentId: updatedComment._id,
      });

      const savedNotify = await newNotify.save();

      //Notify to all online admin is connecting to /admin domain
      io.of("/admin").emit("notify admin", savedNotify);
    } catch (error) {
      socket.emit("error", error);
      console.log(error);
    }
  });
};
