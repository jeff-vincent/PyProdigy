import React, { useState } from 'react';

const SignUpLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password}),
      });

      if (response.ok) {
        // Handle successful sign-up
        const userData = await response.json();
        const userID = userData.id;
        // Optionally, you can perform additional actions after sign-up
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({username: email, password}).toString(),
      });

      if (response.ok) {
        const data = await response.json();
        const {access_token} = data;

        // Store the JWT in the browser's localStorage
        localStorage.setItem('jwt', access_token);

        // Call createContainer function here
        await createContainer();
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error(error);
    }
  };

const createContainer = async (userID) => {
  try {
    const response = await fetch(`/compute/start/${userID}`, {
      method: 'GET',
    });

    if (response.ok) {
      // Handle successful container creation
    } else {
      console.error('Error:', response.status);
    }
  } catch (error) {
    console.error(error);
  }
};

  return (
      <div className="auth-container" style={{paddingRight: '2in'}}>
        <form onSubmit={handleSignUp} className="auth-form">
          <div className="form-group">
            <div>
              <label>Email:</label>
            </div>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
            />
          </div>
          <div className="form-group">
            <div>
              <label>Password:</label>
            </div>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
            />
          </div>
          <button type="submit" className="form-button">Sign Up</button>
        </form>
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <div>
              <label>Email:</label>
            </div>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
            />
          </div>
          <div className="form-group">
            <div>
              <label>Password:</label>
            </div>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
            />
          </div>
          <button type="submit" className="form-button">Login</button>
        </form>
      </div>
  );
}

export default SignUpLogin;

