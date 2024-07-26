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
        "http://localhost:8000/api/register",
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
      // Check if registration was successful
      if (response.ok) {
        // Redirect to login page
        console.log("Success");
        this.$router.push("/login");
      } else {
        // Handle registration error
        console.error("Registration error:", data.error);
        alert ("Registration error: " + data.error);
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
        <button type="submit" id="register-btn" >Register</button>
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
  border-bottom: 1px solid #ffffff;
  width: 30%;
  margin: 0 auto 20px;
}
.register-form {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #c1c1c1;
}

.container {
  background-color: #251f1f;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  color: #fff;
  width: 400px;
  text-align: center;
  background-color: #4d4d4d;
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
  background-color: #444;
  color: #fff;
}

button {
  width: 100%;
  height: 40px;
  padding: 12px;
  border: none;
  border-radius: 4px;
  background-color: #251f1f;
  border: 1px solid #ccc;
  font-weight: bold;
  color: aliceblue;
  cursor: pointer;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
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

#register-btn {
  width: 100%;
  height: 40px;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-top: 20px;
  margin-bottom: 10px;
  background-color: #4d4d4d;
  color: aliceblue;
  font-weight: bold;
  text-align: center;
}

#register-btn:hover {
  background-color: #000000;
  color: aliceblue;
}

a:hover {
  text-decoration: underline;
}
</style>
