const express = require("express");
const connectDB = require("./config/db");
const app = express();

connectDB();
//function to actually connect the database
app.use(express.json({ extended: false }));

app.get("/", (req, res) => res.send("running successfully"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server is listening on port  ${PORT}`));
