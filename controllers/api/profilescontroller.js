const express = require("express");
const router = express.Router();
const authorize = require("../../middleware/authorize");
const Profile = require("../../models/ProfileModel");
const Rescuer = require("../../models/RescuerModel");
const Post = require("../../models/PostModel");
const { check, validationResult } = require("express-validator/check");

//declare the router

router.get("/myprofile", authorize, async (req, res) => {
  try {
    const profileToFetch = await Profile.findOne({
      rescuer: req.rescuer.id
    }).populate("rescuer", ["firstname", "lastname"]);
    console.log(req.rescuer.id);
    console.log(req.rescuer);

    if (!profileToFetch) {
      console.log("none");
      return res.status(400).json({ msg: "user has no profile" });
    }
    res.json(profileToFetch);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Issue with Server");
  }
});

///create or update profile

router.post(
  "/",
  [
    authorize,
    [
      check("isActive", "Must Check Whether Active or Inactive")
        .not()
        .isEmpty(),
      check("primaryStatus", "Must select a primary status")
        .not()
        .isEmpty(),
      check("aboutMe", "Must Write Something")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      isActive,
      primaryStatus,
      secondaryStatus,
      baseStation,
      otherStationsWorkedArray,
      aboutMe,
      facebook,
      instagram
    } = req.body;

    let rescuerToFind = await Rescuer.findById(req.rescuer.id);
    //object with all the data from the request, to then be passed into the new instance.
    const ProfileData = {};
    ProfileData.rescuer = req.rescuer.id;
    ProfileData.isActive = isActive;
    ProfileData.primaryStatus = primaryStatus;
    if (secondaryStatus) ProfileData.secondaryStatus = secondaryStatus;
    if (baseStation) ProfileData.baseStation = baseStation;
    if (otherStationsWorkedArray)
      ProfileData.otherStationsWorked = otherStationsWorkedArray;
    if (aboutMe) ProfileData.aboutMe = aboutMe;
    if (facebook) ProfileData.facebook = facebook;
    if (instagram) ProfileData.instagram = instagram;
    ProfileData.rescuerFirstName = rescuerToFind.firstname;
    ProfileData.rescuerLastName = rescuerToFind.lastname;

    try {
      //check for presence of profile

      let profileToFind = await Profile.findOne({ rescuer: req.rescuer.id });
      if (profileToFind) {
        updatedProfile = await Profile.findOneAndUpdate(
          {
            rescuer: req.rescuer.id
          },
          { $set: ProfileData },
          { new: true, upsert: true }
        );
        console.log("profile updated");
        return res.json(updatedProfile);
      } else {
        let profileToCreate = new Profile(ProfileData);
        //create new instance of Profile class; pass in ProfileDate object created above
        await profileToCreate.save();
        res.json(profileToCreate);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Issue with Server");
    }
  }
);
//get all profiles
router.get("/", async (req, res) => {
  try {
    const allprofiles = await Profile.find().populate("rescuer", [
      "firstname",
      "lastname"
    ]);
    res.json(allprofiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Issues retrieving profiles");
  }
});

//get profile by rescuer's id

router.get("/:rescuer_id", async (req, res) => {
  try {
    const profileToFetch = await Profile.findOne({
      rescuer: req.params.rescuer_id
    }).populate("rescuer", ["firstname", "lastname", "dateofbirth", "email"]);

    if (!profileToFetch) {
      res
        .status(400)
        .json({ errors: [{ msg: "can't find profile for rescuer" }] });
    }
    res.json(profileToFetch);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Cannot Find Profile for Rescuer" });
    }
    res.status(500).send("Server Issues retrieving rescuer's profile");
  }
});

//delete my profile

router.delete("/myprofile", authorize, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ rescuer: req.rescuer.id });
    res.json({ msg: "profile deleted" });
  } catch (error) {}
});

//delete all my posts
router.delete("/myposts", authorize, async (req, res) => {
  try {
    await Post.deleteMany({ rescuer: req.rescuer.id });
    res.json({ msg: "profile deleted" });
  } catch (error) {}
});

//delete my whole account
router.delete("/myaccount", authorize, async (req, res) => {
  try {
    //must delete posts and profile if going to delete account
    await Profile.findOneAndRemove({ rescuer: req.rescuer.id });
    await Post.deleteMany({ rescuer: req.rescuer.id });
    await Rescuer.findOneAndRemove({ _id: req.rescuer.id });
    res.json({ msg: "account, posts, profile deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Issues with Server");
  }
});

///add Fire/Rescue Training
router.put(
  "/addfireservicetraining",
  [
    authorize,
    [
      check("course", "Must Include Training Course")
        .not()
        .isEmpty(),
      check("academy", "Must Include Training Academy")
        .not()
        .isEmpty(),
      check("city", "Must Include City")
        .not()
        .isEmpty(),
      check("city", "Must Include City")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { course, academy, city, state, completion } = req.body;
    const FireServiceTrainingToAdd = {};
    FireServiceTrainingToAdd.course = course;
    FireServiceTrainingToAdd.academy = academy;
    FireServiceTrainingToAdd.city = city;
    FireServiceTrainingToAdd.state = state;
    if (completion) FireServiceTrainingToAdd.completion = completion;

    try {
      const profileToUpdate = await Profile.findOne({
        rescuer: req.rescuer.id
      });
      profileToUpdate.FireServiceTraining.unshift(FireServiceTrainingToAdd);
      await profileToUpdate.save();
      res.json(profileToUpdate);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Issues with Server adding Training");
    }
  }
);

///add Formal Training

router.put(
  "/addformaleducation",
  [
    authorize,
    [
      check("school", "Must Include Name of School")
        .not()
        .isEmpty(),
      check("degree", "Must Include Type of Degree")
        .not()
        .isEmpty(),
      check("major", "Must Include Concentration")
        .not()
        .isEmpty(),
      check("city", "Must Include City")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ errors: errors.array() });
    }

    //destructuring the req
    const {
      school,
      degreeType,
      major,
      city,
      state,
      completionYear,
      currentlyEnrolled
    } = req.body;

    const FormalEducationToAdd = {};
    FormalEducationToAdd.school = school;
    FormalEducationToAdd.degreeType = degreeType;
    if (major) FormalEducationToAdd.major = major;
    FormalEducationToAdd.city = city;
    FormalEducationToAdd.state = state;
    if (completionYear) FormalEducationToAdd.completionYear = completionYear;
    FormalEducationToAdd.currentlyEnrolled = currentlyEnrolled;

    try {
      const profileToUpdate = await Profile.findOne({
        rescuer: req.rescuer.id
      });
      profileToUpdate.FormalEducation.unshift(FormalEducationToAdd);
      await profileToUpdate.save();
      res.json(profileToUpdate);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Issues with Server adding Training");
    }
  }
);

//delete academy training
router.delete(
  "/deletefireservicetraining/:trainingId",
  authorize,
  async (req, res) => {
    try {
      profileToEdit = await Profile.findOne({ rescuer: req.rescuer.id });
      const trainingIndexToDelete = profileToEdit.FireServiceTraining.map(
        i => i.id
      ).indexOf(req.params.trainingId);
      //this takes care of what happens if you try to delete the same item twice, and the index reverts to -1 (in which case it just removes an element )
      if (trainingIndexToDelete == -1) {
        return res.json({ msg: "nothing to delete" });
      }
      profileToEdit.FireServiceTraining.splice(trainingIndexToDelete, 1);
      //edit the FireService Training array...remove one element at the "trainingIndexToDelete" index;
      await profileToEdit.save();
      res.json(profileToEdit.FireServiceTraining);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Issues with Server deleting Training");
    }
  }
);
//delete formal education
router.delete(
  "/deleteformaleducation/:educationId",
  authorize,
  async (req, res) => {
    try {
      profileToEdit = await Profile.findOne({ rescuer: req.rescuer.id });
      const educationIndexToDelete = profileToEdit.FormalEducation.map(
        e => e.id
      ).indexOf(req.params.educationId);
      console.log(educationIndexToDelete);
      if (educationIndexToDelete == -1) {
        return res.json({ msg: "nothing to delete" });
      }
      profileToEdit.FormalEducation.splice(educationIndexToDelete, 1);
      await profileToEdit.save();
      res.json(profileToEdit.FormalEducation);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Issues with Server deleting Education");
    }
  }
);
module.exports = router;
