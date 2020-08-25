const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");
//the connection string

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });
    console.log("mongo is now connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
    //make application fail
  }
};

module.exports = connectDB;
//export the function
