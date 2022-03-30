const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            trim: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
        },
        subComment: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                    trim: true,
                },
                content: {
                    type: String,
                    required: true,
                }
            }
        ]
    },
    { timestamps: true }
);


module.exports = mongoose.model("Comment", commentSchema);
