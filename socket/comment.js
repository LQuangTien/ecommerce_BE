const User = require("../models/user.js");
const Comment = require("../models/comment.js");
const Notify = require("../models/notify.js");

module.exports = function (socket, io) {
  socket.on("submit", async (commentContent) => {
    try {
      // const now = new Date(); 
      // const commentCreatedAt = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();
      
      const commentCreatedAt = new Date().toISOString();
      
      const user = await User.findOne({ _id: socket.user._id });

      const comment = {
        userId: user._id,
        userName: user.username,
        content: commentContent.comment,
        rating: commentContent.rating,
        createdAt:commentCreatedAt
      };


      const updatedComment = Comment.findOneAndUpdate(
        { productId: commentContent.productId },
        {
            $push: {
              comment
            }       
        },
        { new: true, upsert: true }
      ).exec(async (err, data) => {

        const newCommentBeAdded = data.comment.find((doc)=> doc.createdAt.toISOString()===commentCreatedAt);

        socket.emit("submit", newCommentBeAdded);

        const newNotify = new Notify({
          productId: commentContent.productId,
          productName: commentContent.productName,
          userId: user._id,
          userName: user.username,
          commentId: newCommentBeAdded._id,
        });

        const savedNotify = await newNotify.save();

        // console.log("id", commentContent.productId)
        console.log("comment", newCommentBeAdded);
        console.log("notify", savedNotify);

        //Notify to all online admin is connecting to /admin domain
        io.of("/admin").emit("notify admin", savedNotify);
      });

      // const savedComment = await newComment.save();

    } catch (error) {
      socket.emit("error", error);
      console.log(error);
    }
  });
};

