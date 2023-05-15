import React from 'react';
//import './parser.css'; // Assuming you have a corresponding CSS file for styling

const Parser = ({ onFileUpload, jsonData }) => {
  return (
    <div className="parser">
      <input type="file" onChange={onFileUpload} />
      {jsonData && (
        <div className="parsed-data">
          <h2>Parsed Data:</h2>
          <pre>{JSON.stringify(jsonData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Parser;
