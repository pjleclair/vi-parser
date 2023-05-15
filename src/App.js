import React, { useState } from 'react';
import Header from './components/header';
import Parser from './components/parser';
var XLSX = require("xlsx");

const App = () => {
  const [jsonData, setJsonData] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });
      setJsonData(parsedData);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <Header />
      <Parser onFileUpload={handleFileUpload} jsonData={jsonData} />
    </div>
  );
};

export default App;