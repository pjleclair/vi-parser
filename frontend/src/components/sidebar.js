import React from 'react';
import './sidebar.css'

const Sidebar = ({ toggleComponent }) => {
  return (
    <div className="sidebar">
      <h2>Menu</h2>
      <ul>
        <li>
          <button onClick={() => toggleComponent('configurations')}>Configs</button>
        </li>
        <li>
          <button onClick={() => toggleComponent('fileProcessor')}>File Processor</button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
