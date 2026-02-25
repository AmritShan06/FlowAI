import React from 'react';

const DarkModeToggle = ({ darkMode, onToggle }) => {
  return (
    <button className="btn secondary" onClick={onToggle}>
      {darkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

export default DarkModeToggle;
