const express = require("express");
const cors = require("cors");
const Pusher = require("pusher");
const User = require("../back-end/model/schema.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Room = require("../back-end/model/room.js");
const multer = require("multer");

const app = express();

const path = require("path");
const exp = require("constants");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../back-end/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

dotenv.config();
app.use(express.static(path.join(__dirname, "public")));
const JWTtoken = process.env.JWTTOKEN_;

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  useTLS: true,
});

app.use(
  cors({
    origin: "https://chat-space-client.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' https://chat-space-server.vercel.app; style-src 'self' 'unsafe-inline'; script-src 'self' https://chat-space-server.vercel.app; connect-src 'self' https://chat-space-server.vercel.app; frame-src 'self'; font-src 'self'; object-src 'none';"
  );
  return next();
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Chat Space API");
});

app.get("/api/user/:username/picture", async (req, res) => {
  const userName = req.params.username;
  try {
    console.log(`Fetching profile picture for user: ${userName}`);
    // Fetch the user from the database
    const user = await User.findOne({ name: userName });
    console.log(`User found: ${user}`);
    if (user && user.profilePicture && user.profilePicture.originalName) {
      // Construct the image file path
      const profilePicturePath = path.join(
        __dirname,
        "uploads",
        user.profilePicture.originalName
      );
      console.log(`Profile picture path: ${profilePicturePath}`);
      // Send the image file
      res.sendFile(profilePicturePath);
    } else {
      res.status(404).send("No profile picture found for this user");
    }
  } catch (error) {
    console.error(`Error fetching profile picture for ${userName}:`, error);
    res.status(500).send("Internal server error");
  }
});

app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    const { userName } = req.body;
    console.log(userName);
    const img = req.file;
    console.log(img);
    const user = await User.findOne({ name: userName });

    if (!user) {
      console.log(`User not found for username: ${userName}`);
      return res.status(404).json({ error: "User not found" });
    }
    user.profilePicture = {
      data: img.buffer,
      contentType: img.mimetype,
      originalName: img.originalname,
    };
    await user.save();
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/enter-room", async (req, res) => {
  const { roomID, userName } = req.body;
  try {
    let room = await Room.findOne({ roomID });
    if (!room) {
      const newRoom = new Room({
        roomID: roomID,
        roomName: "Room for ID " + roomID,
        members: [userName],
      });
      await newRoom.save();
    }
    if (!room.members.includes(userName)) {
      room.members.push(userName);
      await room.save();
    }
    res.json({ success: true, message: "Entered room successfully" });
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json("Error: " + err);
  }
});

app.post;

app.post("/api/messages", async (req, res) => {
  const { message, userName, roomID } = req.body;
  console.log("Request body:", req.body);
  console.log("Received message for room:", roomID);
  try {
    await pusher.trigger("chat", "message", {
      message: message,
      userName: userName,
      roomID: roomID,
    });
    await Room.updateOne(
      { roomID: roomID },
      { $push: { messages: { userName, message } } }
    );
    res.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error triggering Pusher:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/users-in-room/:roomID", async (req, res) => {
  const roomID = req.params.roomID;
  try {
    console.log(`Fetching users in room: ${roomID}`);
    // Fetch the room from the database
    const room = await Room.findOne({ roomID }).populate("members");
    console.log(`Room found: ${room}`);
    if (room) {
      res.json(room.members);
    } else {
      res.status(404).send("Room not found");
    }
  } catch (error) {
    console.error(`Error fetching users in room ${roomID}:`, error);
    res.status(500).send("Internal server error");
  }
});

app.get("/api/messages/:roomID", async (req, res) => {
  const { roomID } = req.params;
  try {
    const room = await Room.findOne({ roomID }).populate("messages.userName");
    const messagesWithSenderInfo = room.messages.map((message) => {
      const isSender = req.user && message.userName === req.user.name;
      return {
        ...message.toObject(),
        isSender: isSender,
      };
    });

    res.json(messagesWithSenderInfo);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Please fill out your Username or Password" });
    }
    const user = await User.findOne({ username }).select("name password ");
    const validPassword = await bcrypt.compare(password, user.password);
    if (!user) {
      return res.status(400).json({ error: "Username does not exist" });
    }

    if (user && validPassword) {
      const token = jwt.sign({ id: user._id }, JWTtoken, { expiresIn: "2h" });
      res.json({
        user: {
          userName: user.name,
          token: token,
        },
      });
    }
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json("Error: " + err);
  }
});

app.post("/api/register", async (req, res) => {
  const { email, name, username, password, confirmPassword } = req.body;
  try {
    if (!email || !name || !username || !password) {
      return res
        .status(400)
        .json({ error: "Please fill out all the required fields" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    //hasing password
    const hash = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      name,
      username,
      password: hash, // storing hash as the password
    });

    const fieldsToCheck = ["email", "username"];
    let existingFields = [];

    for (let field of fieldsToCheck) {
      let existingUser = await User.findOne({ [field]: req.body[field] });
      if (existingUser) {
        existingFields.push(field);
      }
    }

    if (existingFields.length > 0) {
      return res
        .status(400)
        .json({ error: `${existingFields.join(" and ")} already exist` });
    }
    newUser
      .save()
      .then((register) => {
        const userToken = jwt.sign({ id: newUser._id }, JWTtoken, {
          expiresIn: "2h",
        });
        res.json({ token: userToken, user: register });
      })
      .catch((err) => {
        console.error("Error saving user:", err);
        res.status(500).json("Error: " + err);
      });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
