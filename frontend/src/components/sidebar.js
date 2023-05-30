import './sidebar.css';
import homeImg from '../images/home-dark.svg';
import configImg from '../images/config-dark.svg';
import processImg from '../images/process-dark.svg';

const Sidebar = ({ toggleComponent }) => {
  const vw = window.innerWidth;

  let renderButtons =
  <ul>
    <li>
      {/* <button onClick={() => toggleComponent('configurations')}>Config</button> */}
      <img id='img' src={configImg} alt='configurations' value='configurations'
        onClick={() => toggleComponent('configurations')}
      />
    </li>
    <li>
      <img id='img' src={homeImg} alt='home' value='home'
        onClick={() => toggleComponent('home')}
      />
    </li>
    <li>
      <img id='img' src={processImg} alt='process' value='fileProcessor'
          onClick={() => toggleComponent('fileProcessor')}
        />
    </li>
  </ul>

  if (vw >= 600) {
    renderButtons = 
    <ul>
      <li>
        <img id='img' src={homeImg} alt='home' value='home'
          onClick={() => toggleComponent('home')}
        />
      </li>
      <li>
        <img id='img' src={configImg} alt='configurations' value='configurations'
          onClick={() => toggleComponent('configurations')}
        />
      </li>
      <li>
        <img id='img' src={processImg} alt='process' value='fileProcessor'
            onClick={() => toggleComponent('fileProcessor')}
          />
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
