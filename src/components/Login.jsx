import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isError, setIsError] = useState("");
  const [isSuccess, setIsSuccess] = useState("");

  const BASE_URL = process.env.REACT_APP_API_URL; // Make sure this is set correctly in Vercel

  const handleLogin = async () => {
    if (!username || !password) return setIsError("Enter username and password.");

    try {
      const response = await axios.post(
        `${BASE_URL}/users/login`,
        { username, password },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      // Check backend response structure
      if (response.status === 200 && response.data.token) {
        sessionStorage.setItem("token", response.data.token);
        navigate("/table");
      } else {
        setIsError(response.data.message || "Invalid credentials.");
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        setIsError("Username or password is incorrect.");
      } else {
        setIsError("Login failed. Please try again.");
      }
    } finally {
      setTimeout(() => {
        setIsError("");
        setIsSuccess("");
      }, 3000);
      setUsername("");
      setPassword("");
    }
  };

  const handleRegister = async () => {
    if (!username || !password) return setIsError("Enter username and password.");

    try {
      const response = await axios.post(
        `${BASE_URL}/users/register`,
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        setIsSuccess("Registration successful! Please login.");
      } else {
        setIsError(response.data.message || "Registration failed.");
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 409) {
        setIsError("Username already exists.");
      } else {
        setIsError("Registration failed. Please try again.");
      }
    } finally {
      setTimeout(() => {
        setIsError("");
        setIsSuccess("");
      }, 3000);
      setUsername("");
      setPassword("");
    }
  };

  return (
    <div className="container">
      <h1>LIBRARY HOME PAGE</h1>
      <label>Username:</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <label>Password:</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="button-container">
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleRegister}>Register</button>
      </div>
      {isError && <p className="error">{isError}</p>}
      {isSuccess && <p className="success">{isSuccess}</p>}
    </div>
  );
}

export default Login;
