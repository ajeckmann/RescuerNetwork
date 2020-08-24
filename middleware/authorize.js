const jwt = require("jsonwebtoken");
const config = require("config");
//bring in config for the secret

module.exports = function(req, res, next) {
  //get the token from header
  const token = req.header("x-auth-token");

  //check if there is no token
  if (!token) {
    return res.status(401).json({ msg: "cannot authorize--no token" });
  }

  //then we verify the token if there is one
  //verify tkes in two things---the token itself in the header, and the secret
  try {
    const decodedtoken = jwt.verify(token, config.get("JWTSECRET"));
    req.rescuer = decodedtoken.rescuer;
    //this req.rescuer will give us the user (rescuer)'s id that we can match to getprofiles or posts
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid Token; sorry" });
  }
};
