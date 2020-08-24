const express = require("express");
const router = express.Router();
const authorize = require("../../middleware/authorize");
const Profile = require("../../models/ProfileModel");
const Rescuer = require("../../models/RescuerModel");

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

module.exports = router;
