import React from 'react';
import './header.css'; // Assuming you have a corresponding CSS file for styling

const Header = ({username}) => {
  return (
    <header className="header">
      <h1>Smart<span>Raiser</span>.ai</h1>
      <div id='loggedin'>
        <h3><span>{username}</span> logged in</h3>
      </div>
    </header>
  );
};

export default Header;