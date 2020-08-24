//define our Rescuer Schema. The basic info needed to verify a user

const mongoose = require("mongoose");

const RescuerSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },

  lastname: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },

  //add validation later
  dateofbirth: {
    type: Date,
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Rescuer = mongoose.model("rescuer", RescuerSchema);
