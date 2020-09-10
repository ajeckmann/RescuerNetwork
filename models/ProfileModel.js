const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  rescuer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "rescuer"
  },

  rescuerFirstName: {
    type: String
  },

  isActive: {
    required: true,
    type: Boolean
  },

  primaryStatus: {
    required: true,
    type: String
  },

  secondaryStatus: {
    type: String
  },

  baseStation: {
    type: String
  },

  otherStationsWorked: {
    type: [String]
  },

  aboutMe: {
    type: String,
    required: true
  },
  facebook: {
    type: String
  },
  instagram: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
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
      },
      completion: {
        type: Date
      }
    }
  ],

  FormalEducation: [
    {
      school: {
        type: String,
        required: true
      },
      degreeType: {
        type: String,
        required: true
      },
      major: {
        type: String
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      completionYear: {
        type: String
      },
      currentlyEnrolled: {
        type: Boolean,
        required: true
      }
    }
  ]
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);
