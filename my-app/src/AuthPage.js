import React, { useState } from 'react';
import axios from 'axios';

function AuthPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    try {
      setError('');
      setMessage('');
      const response = await axios.post('http://localhost:5000/api/register', { email, password });
      setMessage(response.data.message);

      await handleLogin(true);

    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleLogin = async (isAfterRegister = false) => {
    try {
      if (!isAfterRegister) {
        setError('');
        setMessage('');
      }

      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      const { token } = response.data;

      onLoginSuccess(token);

    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div>

      {/* HEADER */}
      <div style={{
        width: '100%',
        padding: '20px',
        backgroundColor: 'black',
        color: 'white',
        textAlign: 'center',
        fontSize: '28px',
        fontWeight: 'bold',
        letterSpacing: '1px'
      }}>
        AI Resume Builder
      </div>

      {/* LOGIN BOX */}
      <div style={{
        padding: '50px',
        maxWidth: '400px',
        margin: '100px auto',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>

        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
          Login or Register
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            style={{
              padding: '12px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{
              padding: '12px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>

            <button
              onClick={() => handleLogin()}
              style={{ padding: '12px', flex: 1, cursor: 'pointer' }}
            >
              Login
            </button>

            <button
              onClick={handleRegister}
              style={{ padding: '12px', flex: 1, cursor: 'pointer' }}
            >
              Register
            </button>

          </div>

          {error && (
            <p style={{ color: 'red', textAlign: 'center', marginTop: '15px' }}>
              {error}
            </p>
          )}

          {message && (
            <p style={{ color: 'green', textAlign: 'center', marginTop: '15px' }}>
              {message}
            </p>
          )}

        </div>

      </div>

    </div>
  );
}

export default AuthPage;