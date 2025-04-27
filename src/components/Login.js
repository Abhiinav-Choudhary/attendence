import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import '../styles/login.css';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate =useNavigate();
  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Logging in with', email, password);
    // Add login logic here
    navigate('/dashbord')
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
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
        <button type="submit">Login</button>
        <p className="signup-text">Don't have an account? <Link to={'/signup'}>Sign up</Link></p>
      </form>
    </div>
  );
};

export default LoginPage;
