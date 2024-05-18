const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomID: { type: String, unique: true },
    roomName: { type: String, unique: true },
  members: { type: Array, default: [] },
  messages: [{
    userName: String,
    message: String,
  }]
  });


const Room = mongoose.model('Room', roomSchema);

module.exports = Room;