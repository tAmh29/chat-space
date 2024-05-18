const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/mydb")

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Connection successful
db.once('open', function() {
    // we're connected!
    console.log("Connected successfully to MongoDB");
});

const userSchema = new mongoose.Schema({
    email: { type: String},
    name: { type: String },
    profilePicture: {
        data: Buffer,
        contentType: String,
        originalName: String
      },
    username: { type: String},
    password: { type: String},
});

module.exports = User = mongoose.model('user', userSchema);
