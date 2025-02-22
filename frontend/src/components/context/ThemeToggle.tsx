import React from 'react';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const toggleTheme = () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      {document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle; 