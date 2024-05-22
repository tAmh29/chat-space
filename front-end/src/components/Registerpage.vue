<script>
import { useRouter } from "vue-router";

const router = useRouter();

export default {
  name: "RegisterForm",
  data() {
    return {
      email: "",
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
    };
  },
  methods: {
    submitRegister: async function () {
      // Handle form submission here
      console.log(
        this.email,
        this.name,
        this.username,
        this.password,
        this.confirmPassword
      );
      const response = await fetch(
        "https://chat-space-server.vercel.app/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: this.email,
            name: this.name,
            username: this.username,
            password: this.password,
            confirmPassword: this.confirmPassword,
          }),
        }
      );
      const data = await response.json();
      // Log response data
      console.log(data);
      const text = JSON.parse(response);
      console.log(text);

      if (!response.ok) {
        console.error("HTTP error", response.status);
      } else {
        console.log("Registration successful", data);
        router.push("/login");
      }
      // Check if registration was successful
      if (response.ok) {
        // Redirect to login page
        this.$router.push("/login");
      } else {
        // Handle registration error
        console.error("Registration error:", data.error);
      }
    },
  },
};
</script>
<template>
  <div class="register-form">
    <div class="container">
      <h1>Register</h1>
      <div class="divider"></div>
      <form @submit.prevent="submitRegister" class="form">
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          placeholder="Enter email"
          v-model="email"
        />
        <label for="name">Enter your name:</label>
        <input
          type="text"
          id="name"
          placeholder="Enter your name"
          v-model="name"
        />
        <label for="username">Username:</label>
        <input
          type="text"
          id="username"
          placeholder="Enter username"
          v-model="username"
        />
        <label for="password">Password:</label>
        <input
          type="password"
          id="password"
          placeholder="Enter password"
          v-model="password"
        />
        <label for="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          placeholder="Confirm password"
          v-model="confirmPassword"
        />
        <button type="submit">Register</button>
      </form>
      <p class="not-member-text">
        Already a member?
        <router-link to="/login" class="register-link underline">
          Login
        </router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.not-member-text {
  color: #ffffff;
}
.register-link {
  text-decoration: none;
}

.underline {
  text-decoration: underline;
}

.divider {
  border-bottom: 1px solid #ffffff; /* Adjust color and thickness as needed */
  width: 30%; /* Adjust width as needed */
  margin: 0 auto 20px; /* Centers the divider and adds space below */
}
.register-form {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #251f1f; /* Assuming a dark background like in the image */
}

.container {
  background-color: #251f1f; /* Darker background for the form */
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5); /* Adding some shadow for depth */
  color: #fff; /* Light text for visibility on dark background */
  width: 400px;
  text-align: center;
}

h1 {
  margin-bottom: 20px;
}

label {
  display: block;
  text-align: left;
  font-weight: bold;
  font-family: Arial, Helvetica, sans-serif;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  width: 94%;
  padding: 12px;
  margin-top: 5px;
  border: none;
  border-radius: 4px;
  margin-bottom: 10px; /* Space between the inputs */
  background-color: #444; /* Lighter than container for contrast */
  color: #fff; /* Light text */
}

button {
  width: 100%;
  height: 40px;
  padding: 12px;
  border: none;
  border-radius: 4px;
  background-color: #251f1f; /* Styling the button with a blue color */
  border: 1px solid #ccc;
  font-weight: bold;
  color: aliceblue;
  cursor: pointer;
  margin-top: 20px; /* Spacing from the last input */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); /* Optional: Adds a shadow to the button for depth */
}

button:hover {
  background-color: #3b6f9e;
}

p {
  margin-top: 20px;
}

a {
  color: #55aaff; /* Light blue color for the link for contrast */
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
