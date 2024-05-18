<script>
export default {
  name: "LoginForm",
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    async submitForm() {
      // Handle form submission here
      console.log(this.username, this.password);
      const response = await fetch(
        "https://chat-space-server.vercel.app/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        }
      );
      const data = await response.json();

      // Check if login was successful
      if (response.ok) {
        localStorage.setItem("userName", data.user.userName);
        this.$router.push("/landingpage");
        console.log("Success");
      } else {
        // Handle login error
        console.error("Login error:", data.error);
      }
    },
  },
};
</script>

<template>
  <div class="login-form">
    <div class="container">
      <h1>Login</h1>

      <form @submit.prevent="submitForm">
        <div>
          <label for="username">Username:</label>
          <input
            type="text"
            id="username"
            placeholder="Enter username"
            v-model="username"
            required
          />
        </div>
        <div>
          <label for="password">Password:</label>
          <input
            type="password"
            id="password"
            placeholder="Enter password"
            v-model="password"
            required
          />
        </div>
        <button type="submit" id="login-btn">Login</button>
        <p>
          <router-link to="/register" class="register-link">
            <span class="not-member-text">Not a Member?</span>
            <span class="underline"> Register</span>
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
input[type="text"],
input[type="password"] {
  margin-top: 5px;
}
.not-member-text {
  color: #ffffff;
}
.register-link {
  text-decoration: none;
}

.underline {
  text-decoration: underline;
}

.register-link {
  display: block;
  text-align: center;
}

.underline {
  text-decoration: underline;
}
.container {
  width: 400px;
  height: 450px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 5%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}

.login-form {
  margin: 0 auto;
  width: 100vw;
  padding: 0 10px;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #251f1f;
  color: aliceblue;
}

.login-form label {
  margin-bottom: 10px;
  font-weight: bold;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
}

.login-form form {
  width: 300px;
  height: 250px;
}

.login-form input {
  width: 96%;
  height: 30px;
  border-radius: 5px;
  border: 1px solid #ccc;
  padding: 5px;
  margin-bottom: 10px;
}

h1 {
  font-size: 30px;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
}

#login-btn {
  width: 100%;
  height: 40px;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-top: 20px;
  margin-bottom: 10px;
  background-color: #251f1f;
  color: aliceblue;
  font-weight: bold;
  text-align: center;
}

#login-btn:hover {
  background-color: #000000;
  color: aliceblue;
}
</style>
