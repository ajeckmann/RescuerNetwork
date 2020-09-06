const express = require("express");
const bcrypt = require("bcryptjs");
const authorize = require("../../middleware/authorize");
const jwt = require("jsonwebtoken");
const config = require("config");

const { check, validationResult } = require("express-validator/check");

const Rescuer = require("../../models/RescuerModel");

//declare the router
const router = express.Router();

//register a rescuer
router.post(
  "/",
  [
    check("firstname", "Must include your first name")
      .not()
      .isEmpty(),
    check("lastname", "Must include your last name")
      .not()
      .isEmpty(),
    check("email", "Must include a valid email address").isEmail(),
    check("password", "Password must be between 4 and 8 characters").isLength({
      min: 4,
      max: 8
    }),
    check("dateofbirth", "Must include DOB")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.log(errors );
      return res.status(400).json({ bodyErrors: errors.array() });
    }

    const { firstname, lastname, email, password, dateofbirth } = req.body;

    try {
      //see if user exists and if so send back error
      //search for a user with whose email equals that in the request
      let userToFind = await Rescuer.findOne({ email: email });
      if (userToFind) {
        res.status(400).json({
          errors: [{ msg: "This user already exists in the database" }]
        });
      }

      rescuerToRegister = new Rescuer({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
        dateofbirth: dateofbirth
      });

      //create salt
      const salt = await bcrypt.genSalt(12);
      //

      //hash password
      rescuerToRegister.password = await bcrypt.hash(password, salt);
      //

      //save user to db
      await rescuerToRegister.save();
      //

      //create our payload from our user
      const payload = {
        rescuer: {
          id: rescuerToRegister.id
        }
      };
      jwt.sign(
        payload,
        config.get("JWTSECRET"),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
      //
    } catch (err) {
      console.error(err.message);
      res.status(500).send("error in server");
    }

    //encrypt the password
  }
);

//get all rescuers
router.get("/allrescuers", [authorize], async (req, res) => {
  try {
    const allRescuers = await Rescuer.find().sort({ lastname: -1 });
    return res.json(allRescuers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
