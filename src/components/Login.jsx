import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Login(props) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isError, setIsError] = useState("");
  const [isSuccess, setIsSuccess] = useState("");

  const BASE_URL = process.env.REACT_APP_API_URL;

  async function handleLogin() {
    if (username !== "" && password !== "") {
      try {
        const response = await axios.post(`${BASE_URL}/users/login`, { username, password });
        if (response.status === 200) {
          const token = response.data;
          sessionStorage.setItem("token", token);
          navigate("/table");
        } else {
          setIsSuccess("");
          setIsError("The username or password is wrong!");
        }
      } catch (error) {
        console.error(error);
        setIsError("Login failed. Please try again.");
      } finally {
        setTimeout(() => {
          setIsError("");
          setIsSuccess("");
        }, 3000);
        setUsername("");
        setPassword("");
      }
    }
  }

  async function handleRegister() {
    if (username !== "" && password !== "") {
      const userObject = { username, password };
      try {
        const response = await axios.post(`${BASE_URL}/users/register`, userObject, {
          headers: { "Content-Type": "application/json" },
        });
        if (response.status === 200) {
          setIsError("");
          setIsSuccess("You are registered! Please log in.");
        } else {
          setIsSuccess("");
          setIsError("The username already exists! Please choose another one.");
        }
      } catch (error) {
        console.error(error);
        setIsError("Registration failed. Please try again.");
      } finally {
        setTimeout(() => {
          setIsError("");
          setIsSuccess("");
        }, 3000);
        setUsername("");
        setPassword("");
      }
    }
  }

  return (
    <div className="container">
      <h1>LIBRARY HOME PAGE</h1>
      <label htmlFor="username">username:</label>
      <input
        type="text"
        name="username"
        value={username}
        onChange={(e) => setUsername(e.target.value.trim())}
      />
      <br />
      <label htmlFor="password">password:</label>
      <input
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value.trim())}
      />
      <div className="button-container">
        <button className="button login" onClick={handleLogin}>Login</button>
        <button className="button register" onClick={handleRegister}>Register</button>
      </div>
      {isError && <p className="error">{isError}</p>}
      {isSuccess && <p className="success">{isSuccess}</p>}
    </div>
  );
}

export default Login;
