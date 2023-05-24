import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Header from './components/header';
import Configurations from './components/configurations.js';
import FileProcessor from './components/fileprocessor.js';
import Home from './components/home.js'
import Sidebar from './components/sidebar.js';
import Notification from './components/notification.js'

import loginService from './services/loginService';

import './App.css'

var XLSX = require("xlsx");

const App = () => {
  const [jsonData, setJsonData] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeComponent, setActiveComponent] = useState('home');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [notifMessage, setNotifMessage] = useState('')
  const [msgColor, setMsgColor] = useState('')

  useEffect(()=>{
    setTimeout(()=>{
      setNotifMessage('')
    },5000)
  },[notifMessage])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      const config = {
        headers: {
          Authorization: user.token
        }
      }
      axios.get('/api/login',config)
      .then((res)=>{
        if (res.status === 201) {
          setUser(user)
          setToken(user.token)
          setIsLoggedIn(true)
        } else {
          setNotifMessage('Token expired, please login again')
        }
      })
      .catch((error) => {
        setNotifMessage('Token expired, please login again')
      })
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
    } else if (activeComponent === 'home') {
      return <Home userName={user.name}/>;
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
      setNotifMessage('Logged in successfully');
      setMsgColor('#03DAC5')
    } catch (exception) {
      setMsgColor('#CF6679')
      setNotifMessage('Wrong credentials')
    }
  }

  return (
    <div>
      {(notifMessage && !isLoggedIn) && <Notification message={notifMessage} msgColor={msgColor}/>}
      {(isLoggedIn) ?
      (<div className="app">
        <Sidebar toggleComponent={toggleComponent} />
        <div className="content">
        {(notifMessage && isLoggedIn) && <Notification message={notifMessage} msgColor={msgColor}/>}
          <Header />
          <div className='main-container'>
            <div className="main">{renderActiveComponent()}</div>
          </div>
        </div>
      </div>)
      : (<div className='login'>
          <form onSubmit={handleLogin}>
            <div>
              <div>
              username:
              </div>
              <input 
                type='text'
                value={username}
                name='username'
                onChange={({target})=>setUsername(target.value)}
              />
            </div>
            <div>
              <div>
              password:
              </div>
              <input 
                type='password'
                value={password}
                name='password'
                onChange={({target})=>setPassword(target.value)}
              />
            </div>
            <button id='login' type='submit'>Login</button>
          </form>
      </div>)}
    </div>
  );
};

export default App;

