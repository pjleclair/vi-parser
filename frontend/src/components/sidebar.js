import React from 'react';
import './sidebar.css'

const Sidebar = ({ toggleComponent }) => {
  return (
    <div className="sidebar">
      <h2>Menu</h2>
      <ul>
        <li>
          <button onClick={() => toggleComponent('configurations')}>Config</button>
        </li>
        <li>
          <button onClick={() => toggleComponent('fileProcessor')}>Processor</button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
