import React, { useEffect, useState } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import DarkModeToggle from './components/DarkModeToggle';
import { setAuthToken } from './services/api';

const App = () => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const handleAuthenticated = (userData) => {
    setUser(userData);
    setAuthToken(userData.token);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span>AI Flowchart Builder</span>
        </div>
        <div className="header-actions">
          <DarkModeToggle darkMode={darkMode} onToggle={() => setDarkMode((v) => !v)} />
          {user && (
            <>
              <span className="user-label">{user.email}</span>
              <button className="btn secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </header>
      <main className="app-main">
        {!user ? <AuthPage onAuthenticated={handleAuthenticated} /> : <DashboardPage />}
      </main>
    </div>
  );
};

export default App;
