import React from 'react';
import './header.css'; // Assuming you have a corresponding CSS file for styling

const Header = ({username}) => {
  return (
    <header className="header">
      <h1>VI Parser</h1>
      <h3>{username} logged in</h3>
    </header>
  );
};

export default Header;