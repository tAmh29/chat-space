<script>
import { ref, onMounted } from "vue";
import Pusher from "pusher-js";

export default {
  name: "LandingPage",
  setup() {
    const messages = ref([]);
    const message = ref("");
    const name = ref(localStorage.getItem("userName"));
    const boxes = ref([]);
    const isUserInRoom = ref(false);
    const currentRoomID = ref(null);
    const showPopup = ref(true);
    const profileImageUrl = ref({}); // Store the profile image URL keyed by username

    onMounted(async () => {
      Pusher.logToConsole = true;

      const pusher = new Pusher("632c83562f64dd0b614e", {
        cluster: "us3",
      });

      const currentUsername = localStorage.getItem("userName");
      console.log("Current username:", currentUsername);
      if (currentUsername) {
        await fetchProfilePicture(currentUsername);
      }

      const channel = pusher.subscribe("chat");
      channel.bind("message", (data) => {
        console.log("Message data received:", data);
        if (data.roomID === currentRoomID.value) {
          const isSender = data.userName === name.value;
          messages.value.push({
            userName: data.userName,
            message: data.message,
            isSender: isSender,
          });
          if (data.userName) {
            fetchProfilePicture(data.userName); // Fetch the profile picture for the sender
          } else {
            console.error("Received data with undefined username:", data);
          }
        } else {
          console.log(
            `Message for room ${data.roomID} ignored in room ${currentRoomID.value}`
          );
        }
      });

      // Fetch profile pictures for all users in the room when the page is reloaded
      if (currentRoomID.value) {
        await EnterRoom(currentRoomID.value);
      }

      showPopup.value = true;
      console.log(showPopup.value);
    });

    const EnterRoom = async (roomID) => {
      try {
        let currentUsername = localStorage.getItem("userName");
        const response = await fetch(
          "chat-space-server.vercel.app/api/enter-room",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              roomID,
              userName: currentUsername,
            }),
          }
        );
        console.log(roomID);
        const data = await response.json();
        console.log(data);
        if (data.success) {
          isUserInRoom.value = true;
          currentRoomID.value = roomID;

          const messagesResponse = await fetch(
            `chat-space-server.vercel.app/api/messages/${roomID}`
          );
          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();

            messages.value = messagesData.map((msg) => ({
              ...msg,
              isSender: msg.userName === name.value, // Use the current username to set the isSender
            })); // Assuming the server sends an array of messages
          } else {
            console.error("Failed to load messages");
          }

          // Fetch the profile pictures for all users in the room
          const usersInRoom = await fetchUsersInRoom(roomID); // Replace with your actual implementation
          for (const user of usersInRoom) {
            console.log(`Fetching profile picture for user: ${user}`); // Add logging
            await fetchProfilePicture(user); // Ensure this is the correct field
          }
        } else {
          console.log("Error: ", data.error);
        }
      } catch (error) {
        console.error("Error entering room:", error);
      }
      console.log(isUserInRoom.value);
    };

    const closePopup = () => {
      showPopup.value = false;
    };

    const addRoom = async () => {
      boxes.value.push({
        id: boxes.value.length,
        name: name.value,
      });
    };

    async function fetchUsersInRoom(roomID) {
      try {
        const response = await fetch(
          `chat-space-server.vercel.app/api/users-in-room/${roomID}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        console.log(`Users in room ${roomID}:`, users); // Log the users
        return users;
      } catch (error) {
        console.error(`Error fetching users in room ${roomID}:`, error);
        throw error;
      }
    }

    const fetchProfilePicture = async (username) => {
      if (!username) {
        console.error("Username is undefined");
        return;
      }

      if (!profileImageUrl.value[username]) {
        // Check if we've already fetched this user's picture
        try {
          console.log(`Fetching profile picture for user: ${username}`);
          const response = await fetch(
            `chat-space-server.vercel.app/api/user/${username}/picture`
          );
          if (!response.ok) {
            throw new Error(
              `Failed to fetch profile picture: ${response.statusText}`
            );
          }
          const imageBlob = await response.blob();
          profileImageUrl.value[username] = URL.createObjectURL(imageBlob); // Store it keyed by username
          console.log(
            `Profile picture for ${username}:`,
            profileImageUrl.value[username]
          );
        } catch (error) {
          console.error(
            `Error fetching profile picture for ${username}:`,
            error
          );
          profileImageUrl.value[username] = ""; // Set a default or error image path
        }
      } else {
        console.log("Profile picture already fetched for", username);
      }
    };

    const handlePictureInput = async (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("userName", name.value);
        formData.append("image", file);

        const response = await fetch(
          "chat-space-server.vercel.app/api/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();
        if (result.success) {
          profileImageUrl.value[name.value] = result.imageUrl;
          await fetchProfilePicture(name.value);
        } else {
          console.error("Failed to upload picture:", result.error);
        }
      }
    };

    const sendMessage = async () => {
      await fetch("chat-space-server.vercel.app/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.value,
          userName: name.value,
          roomID: currentRoomID.value,
        }),
      });
      message.value = "";
    };
    console.log("Current room ID:", currentRoomID.value);
    const deleteRoom = async (id) => {
      boxes.value.splice(id, 1);
      isUserInRoom.value = false;
    };

    return {
      messages,
      message,
      sendMessage,
      name,
      boxes,
      addRoom,
      deleteRoom,
      EnterRoom,
      isUserInRoom,
      room: currentRoomID,
      showPopup,
      closePopup,
      handlePictureInput,
      profileImageUrl,
      fetchProfilePicture,
    };
  },
};
</script>

<template>
  <div class="landing-page">
    <div class="pop-ups" v-if="showPopup">
      <p>Welcome to the Chat Page!</p>
      <p>Please add a room and Enter a channel</p>
      <button @click="closePopup">Close</button>
    </div>
    <div class="page-container" v-show="!showPopup">
      <header class="nav-bar">
        <div class="navbar-container">
          <div class="upload-btn-wrapper">
            <img :src="profileImageUrl[name]" alt="" />
            <input type="file" name="image" @change="handlePictureInput" />
          </div>
          <div class="profileName">{{ name }}</div>
        </div>
      </header>
      <div class="body-content">
        <div class="left-column">
          <div class="chat-container">
            <div v-for="box in boxes" :key="box.id" class="chat-box">
              Channel ID: {{ room }}
              <input
                v-model="box.id"
                type="number"
                placeholder="Enter a number"
              />
              <button class="enter-room" @click="() => EnterRoom(box.id)">
                Enter
              </button>
            </div>
          </div>
          <button class="add-room" @click="addRoom">Add Room</button>
          <button class="delete-room" @click="deleteRoom">Delete Room</button>
        </div>
        <div class="right-column">
          <div class="messages-container" v-if="isUserInRoom">
            <ul>
              <li v-for="(item, index) in messages" :key="index">
                {{ item.announcement }}
              </li>
              <li
                v-for="(item, index) in messages"
                :key="index"
                :class="{
                  'message-sent': item.isSender,
                  'message-received': !item.isSender,
                }"
              >
                <img
                  :src="profileImageUrl[item.userName]"
                  alt=""
                  class="my-image-class"
                />
                <div class="message-content">
                  <strong>{{ item.userName }}</strong
                  >: {{ item.message }}
                </div>
              </li>
            </ul>
            <form class="message-form" @submit.prevent="sendMessage">
              <input
                type="text"
                v-model="message"
                class="message-input"
                placeholder="Type a message..."
              />
              <button class="send-button" type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-content {
  padding: 10px;
  border-radius: 15px;
  margin: 0 10px;
  max-width: calc(100% - 60px); /* Deduct the image width and margins */
  word-wrap: break-word;
}

/*image*/
.my-image-class {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}
.body-content {
  /* background: linear-gradient(
    207deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(72, 84, 97, 1) 100%
  ); */

  margin-top: 19px;
  border-radius: 15px;
  display: flex;
  justify-content: space-between;
  height: 80vh;
  width: 100%;
}

.profileName {
  color: white;
  font-size: 20px;
  font-weight: bold;
  margin-left: 10px;
}

.upload-btn-wrapper {
  position: relative;
  overflow: hidden;
  display: inline-block;
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.upload-btn-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

input[type="file"] {
  font-size: 100px;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%; /* Ensure the input covers the area */
  height: 100%; /* Ensure the input covers the area */
  opacity: 0;
  cursor: pointer; /* Change the cursor to indicate it's clickable */
}

.nav-bar {
  display: flex;
  justify-content: start;
  align-items: center;
  height: 100px;
  background: linear-gradient(
    195deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(72, 84, 97, 1) 100%
  );
  border-radius: 10px 10px 0 0;
}

.navbar-container {
  display: flex;
  justify-content: start;
  align-items: center;
  padding: 30px;
}

.pop-ups {
  background-color: #8c8686;
  border-radius: 5%;
  width: 300px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.page-container {
  width: 100%;
}
.chat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 1em;
  height: 90px;
}

.leave-room {
  background-color: #526780;
  color: white;
  padding: 0.5em 1em;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.enter-room {
  background-color: #526780;
  color: white;
  padding: 0.5em 1em;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.add-room {
  background-color: #526780;
  color: white;
  padding: 0.5em 1em;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 1em;
}

.delete-room {
  background-color: #526780;
  color: white;
  padding: 0.5em 1em;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 1em;
  margin-left: 1em;
}

.header-chat {
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
}

.landing-page {
  text-align: center;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2%;
  box-sizing: border-box;

  background: linear-gradient(
    200deg,
    rgba(2, 0, 36, 1) 0%,
    rgba(187, 188, 193, 1) 51%
  );
  flex-wrap: wrap;
  color: #fff;
}

.left-column,
.right-column {
  flex-basis: calc(50% - 10px);
}

.left-column {
  align-self: flex-start;
  flex: 1;
  background: linear-gradient(
    207deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(72, 84, 97, 1) 100%
  );
  height: 100%;
  border-radius: 10px;
  margin-right: 10px;
}

.chat-box:hover {
  background-color: #c7baba;
}

body,
h1 {
  margin: 0;
}

.chat-box:nth-child(n + 6) {
  display: none;
}

.chat-container {
  max-height: 500px;

  max-height: calc(5 * (100px + 2em));
}

.search-form {
  margin: 0;
}

.search-box {
  width: 100%;
  padding: 0.5em;
  margin-bottom: 1em;
  box-sizing: border-box;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  color: #ffffff;
  font-family: "roboto", sans-serif;
  background-color: #303030;
}

.search-box:focus {
  outline: none;
  border-color: #526780;
}

.right-column {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  flex: 3;
  align-self: flex-end;
  background: linear-gradient(
    207deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(72, 84, 97, 1) 100%
  );
  border-radius: 10px;
}

/* .message-sent,
.message-received {
  padding: 0.5em 1em;
  border-radius: 5px;
  margin-bottom: 0.5em;
  color: white;
  max-width: 50%;
  align-items: center;
  width: fit-content;
} */

.message-sent,
.message-received {
  padding: 0.5em 1em;
  display: flex;
  align-items: center;
  border-radius: 5px;
  margin-bottom: 0.5em;
  color: white;
  max-width: 50%;
  position: relative;
  width: fit-content;
}

.message-sent {
  margin-left: auto;
  background-color: #41731b;
  flex-direction: row-reverse;
  justify-content: flex-end;
}

.message-received {
  flex-direction: row;
  align-self: inline-start;
  background-color: #526780;
}

.message-received .my-image-class {
  order: -1; /* Moves the image to the left */
  margin-right: 10px; /* Spacing between image and message */
}

.messages-container ul li {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* Align to the start for the sender */
  margin-bottom: 10px;
}

.messages-container {
  overflow-y: auto; /* Allows scrolling if there are many messages */
  margin-bottom: 2em;
  width: 100%;
  height: 100%;
  flex: 1;
  flex-grow: 1; /* Allow the container to grow */
  flex-shrink: 1;
  display: flex;
  flex-direction: column;
  padding: 0 10px;
  box-sizing: border-box;
}

.messages-container ul {
  padding-left: 0; /* Remove default padding */
  /* Rest of your styles */
}

.message-form {
  display: flex;
  position: absolute;
  width: 98.7%;
  box-sizing: border-box;
  margin: auto;
  left: 50%;
  transform: translateX(-50%);
  bottom: 10px;
}
.message-input {
  flex-grow: 1;
  padding: 0.5em;
  margin-right: 0.5em;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
}

.send-button {
  padding: 0.5em 1em;
  border: none;
  border-radius: 5px;
  background-color: #526780;
  color: white;
  cursor: pointer;
}

.send-button:hover {
  background-color: #6f8aab;
}
</style>
