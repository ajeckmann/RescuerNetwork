const express = require("express");
//declare the router
const router = express.Router();
//middleware authentification function
const authorize = require("../../middleware/authorize");
//
const bcrypt = require("bcryptjs");
const Rescuer = require("../../models/RescuerModel");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator/check");

const config = require("config");

router.get("/", authorize, async (req, res) => {
  //add authorize as a second paramater...this will make this function execute before the third parameter. It will ensure that the token actualy is a valid token
  try {
    const rescuer = await Rescuer.findById(req.rescuer.id).select("-password");
    console.log(req.rescuer);
    console.log(req.rescuer.id);
    res.json(rescuer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Issue with server");
  }
});

//authenticate user, get token back
router.post(
  "/",
  [
    check("email", "Must include a valid Email Address").isEmail(),
    check("password", "Password must be included").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let rescuerToLogin = await Rescuer.findOne({ email: email });
      if (!rescuerToLogin) {
        res
          .status(400)
          .json({ errors: [{ msg: "Incorrect Username or Password" }] });
      }

      const isMatch = await bcrypt.compare(password, rescuerToLogin.password);
      //compares the password from the req body to the already hashed password of rescuerToLogin (who presumably has been found in the database);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Incorrect Username or Password" }] });
      }
      const payload = {
        rescuer: {
          id: rescuerToLogin.id
        }
      };

      jwt.sign(
        payload,
        config.get("JWTSECRET"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) {
            throw err;
          }

          res.json({ token });
        }
      );
      //see if user exists
      //get users gravatar
      //enrypt password
      //return jsonwebtoken
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Error on Server Part");
    }
  }
);

module.exports = router;
