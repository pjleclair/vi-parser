import React from 'react';
import './sidebar.css'

const Sidebar = ({ toggleComponent }) => {
  return (
    <div className="sidebar">
      <h2>Menu</h2>
      <ul>
        <li>
          <button onClick={() => toggleComponent('parser')}>Parser</button>
        </li>
        <li>
          <button onClick={() => toggleComponent('fileReader')}>File Reader</button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
