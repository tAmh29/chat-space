const mongoose = require("mongoose");

const dotenv = require("dotenv");

dotenv.config();

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
  .then(() => console.log("Connected successfully to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Connection successful
db.once("open", function () {
  // we're connected!
  console.log("Connected successfully to MongoDB");
});

const userSchema = new mongoose.Schema({
  email: { type: String },
  name: { type: String },
  profilePicture: {
    data: Buffer,
    contentType: String,
    originalName: String,
  },
  username: { type: String },
  password: { type: String },
});

module.exports = User = mongoose.model("user", userSchema);
