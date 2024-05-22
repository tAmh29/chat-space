const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://tmhuynh04:8s8MDAp0hfSCjRVD@cluster0.non3two.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

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
