import React, { useState } from 'react';

import Header from './components/header';
import Parser from './components/parser';
import FileProcessor from './components/fileprocessor.js';
import Sidebar from './components/sidebar.js';

import './App.css'

var XLSX = require("xlsx");

const App = () => {
  const [jsonData, setJsonData] = useState(null);

  const [activeComponent, setActiveComponent] = useState('parser');

  const toggleComponent = (component) => {
    setActiveComponent(component);
  };

  const renderActiveComponent = () => {
    if (activeComponent === 'parser') {
      return <Parser onFileUpload={handleFileUpload} jsonData={jsonData}/>;
    } else if (activeComponent === 'fileProcessor') {
      return <FileProcessor />;
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

  return (
    <div className="app">
      <Sidebar toggleComponent={toggleComponent} />
      <div className="content">
        <Header />
        <div className="main">{renderActiveComponent()}</div>
      </div>
    </div>
  );
};

export default App;

