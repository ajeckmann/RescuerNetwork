const express = require("express");
const connectDB = require("./config/db");
const app = express();

connectDB();
//function to actually connect the database

//middleware
app.use(express.json({ extended: false }));

app.get("/", (req, res) => res.send("running successfully"));

//Connect to routes
app.use("/api/rescuers", require("./controllers/api/rescuerscontroller"));
app.use("/api/posts", require("./controllers/api/postscontroller"));
app.use("/api/rescuerprofile", require("./controllers/api/profilescontroller"));
app.use("/api/authorize", require("./controllers/api/authorizationcontroller"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server is listening on port  ${PORT}`));
