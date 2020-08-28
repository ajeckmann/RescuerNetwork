const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  rescuer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "rescuer"
  },
  posterName: {
    type: String
  },

  likes: [
    {
      rescuer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "rescuer"
      },
      firstName: {
        type: String
      },
      lastName: {
        type: String
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  },

  comments: [
    {
      rescuer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "rescuer"
      },
      content: {
        type: String,
        required: true
      },
      commenterFirstName: {
        type: String
      },
      commenterLastName: {
        type: String
      },

      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

module.exports = Post = mongoose.model("post", PostSchema);
