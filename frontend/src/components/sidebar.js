import './sidebar.css';
import img from '../images/home-dark.svg';

const Sidebar = ({ toggleComponent }) => {
  const vw = window.innerWidth;

  let renderButtons =
  <ul>
    <li>
      <button onClick={() => toggleComponent('configurations')}>Config</button>
    </li>
    <li>
      <img id='img' src={img} alt='home' value='home'
        onClick={() => toggleComponent('home')}
      />
    </li>
    <li>
      <button onClick={() => toggleComponent('fileProcessor')}>Process</button>
    </li>
  </ul>

  if (vw >= 600) {
    renderButtons = 
    <ul>
      <li>
        <img id='img' src={img} alt='home' value='home'
          onClick={() => toggleComponent('home')}
        />
      </li>
      <li>
        <button onClick={() => toggleComponent('configurations')}>Config</button>
      </li>
      <li>
        <button onClick={() => toggleComponent('fileProcessor')}>Process</button>
      </li>
    </ul>
  }
  
  return (
    <div className="sidebar">
      {renderButtons}
    </div>
  );
};

export default Sidebar;
