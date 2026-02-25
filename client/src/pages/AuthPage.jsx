import React, { useState } from 'react';
import { login, register } from '../services/api';
import { setAuthToken } from '../services/api';

const AuthPage = ({ onAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsLogin((v) => !v);
    setError(null);
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        email: form.email,
        password: form.password,
        ...(isLogin ? {} : { name: form.name })
      };
      const fn = isLogin ? login : register;
      const { data } = await fn(payload);
      setAuthToken(data.token);
      onAuthenticated(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
        <p>{isLogin ? 'Sign in to design and save your AI-powered flowcharts.' : 'Start building beautiful, AI-assisted flowcharts in seconds.'}</p>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required={!isLogin}
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && <div className="error-text">{error}</div>}
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <button className="btn link" type="button" onClick={toggleMode}>
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
