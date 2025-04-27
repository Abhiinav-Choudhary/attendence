import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/sign.css';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!username || !email || !password) {
      alert("Please fill in all required fields");
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:7000/user/', {
        username,
        email,
        password
      });
  
      const userData = response.data.user; // assuming backend returns user here
     
      // Save user to localStorage (or context if you're using it)
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("username", userData.username);
  
      alert("Registration successful");
      navigate('/login'); // make sure the route name is correct
      console.log(response.data);
  
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.error || "Request failed");
    }
  };
  
  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
  
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
  
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
  
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
  
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}  