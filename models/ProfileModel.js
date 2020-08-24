const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  rescuer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "rescuer"
  },

  isActive: {
    required: true,
    type: Boolean
  },

  title1: {
    required: true,
    type: String
  },

  title2: {
    type: String
  },

  baseStation: {
    type: String
  },

  otherStationsWorked: {
    type: [String]
  },

  FireServiceTraining: [
    {
      course: {
        type: String,
        required: true
      },
      academy: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      }
    }
  ],

  FormalEducation: [
    {
      school: {
        type: String,
        required: true
      },
      degree: {
        type: String,
        required: true
      },
      major: {
        type: String
      },
      completionYear: {
        type: String
      },
      currentlyEnrolled: {
        type: Boolean
      }
    }
  ],

  facebook: {
    type: String
  },
  instagram: {
    type: String
  }
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);
