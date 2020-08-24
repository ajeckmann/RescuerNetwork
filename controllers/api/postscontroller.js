const express = require("express");
const router = express.Router();
//declare the router

//all routes stem from localhost:5000/api/posts; ('/allposts' corresponds to 'localhost:5000/api/posts/allposts')
router.get("/", (req, res) => res.send("Post route"));

router.get("/allposts", (req, res) => res.send("all posts route"));

router.get("/chicken", (req, res) => res.send("all chicken route"));
module.exports = router;
