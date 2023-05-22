import React, { useState, useEffect } from 'react';

import Header from './components/header';
import Configurations from './components/configurations.js';
import FileProcessor from './components/fileprocessor.js';
import Sidebar from './components/sidebar.js';

import loginService from './services/loginService';

import './App.css'

var XLSX = require("xlsx");

const App = () => {
  const [jsonData, setJsonData] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeComponent, setActiveComponent] = useState('configurations');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      setToken(user.token)
      setIsLoggedIn(true)
    }
  }, [])

  const toggleComponent = (component) => {
    setActiveComponent(component);
  };

  const renderActiveComponent = () => {
    if (activeComponent === 'configurations') {
      return <Configurations onFileUpload={handleFileUpload} jsonData={jsonData} token={token}/>;
    } else if (activeComponent === 'fileProcessor') {
      return <FileProcessor token={token}/>;
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setJsonData(parsedData);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const user = await loginService.login({username: username, password: password})
      window.localStorage.setItem(
        'loggedAppUser', JSON.stringify(user)
      )
      setToken(`Bearer ${user.token}`)
      setUser(user);
      setUsername('');
      setPassword('');
      setIsLoggedIn(true);
    } catch (exception) {
      setErrorMessage('Wrong credentials')
    }
  }

  return (
    (isLoggedIn) ?
    (<div className="app">
      <Sidebar toggleComponent={toggleComponent} />
      <div className="content">
        <Header username={user.name}/>
        <div className="main">{renderActiveComponent()}</div>
      </div>
    </div>)
    : (<div className='login'>
        <div style={{color:"#CF6679"}}>{errorMessage}</div>
        <form onSubmit={handleLogin}>
          <div>
            username: <input 
              type='text'
              value={username}
              name='username'
              onChange={({target})=>setUsername(target.value)}
            />
          </div>
          <div>
            password: <input 
              type='text'
              value={password}
              name='password'
              onChange={({target})=>setPassword(target.value)}
            />
          </div>
          <button type='submit'>Login</button>
        </form>
    </div>)
  );
};

export default App;

