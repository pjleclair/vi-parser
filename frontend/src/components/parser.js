import React, { useState, useEffect } from 'react';
//import './parser.css'; // Assuming you have a corresponding CSS file for styling

const Parser = ({ onFileUpload, jsonData, onSaveConfiguration }) => {
  const [columnMappings, setColumnMappings] = useState({});
  const [sampleData, setSampleData] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    if (jsonData && jsonData.length > 0) {
      setSampleData(jsonData[0]);
      setColumnMappings(
        Object.keys(jsonData[0]).reduce((acc, key, index) => {
          acc[index] = '';
          return acc;
        }, {})
      );
    }
  }, [jsonData]);

  const handleColumnMapping = (e) => {
    const { name, value } = e.target;
    setColumnMappings((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleInputChange = (e) => {
    setName(e.target.value);
  };

  return (
    <div className="parser">
      <input type="file" onChange={onFileUpload} />
      {sampleData.length > 0 && (
        <div className="sample-data">
          <h2>Sample Data:</h2>
          <table>
            <thead>
              <tr>
                {Object.keys(sampleData).map((key, index) => (
                  <th key={index}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {Object.values(sampleData).map((value, index) => (
                  <td key={index}>{value}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {sampleData.length > 0 && (
        <div className="column-mapping">
          <h2>Column Mapping:</h2>
          <table>
            <thead>
              <tr>
                <th>Column</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(sampleData).map((columnName, index) => (
                <tr key={index}>
                  <td>{columnName}</td>
                  <td>
                    <select
                      name={index}
                      value={columnMappings[index]}
                      onChange={handleColumnMapping}
                    >
                      <option value="">Select Value</option>
                      <option value="fullName">Full Name</option>
                      <option value="phoneNumber">Phone Number</option>
                      <option value="emailAddress">Email Address</option>
                      <option value="party">Party</option>
                      <option value="age">Age</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <input type="text" value={name} onChange={handleInputChange} placeholder="Configuration Name" />
          <button onClick={() => onSaveConfiguration(name, columnMappings)}>
            Save Configuration
          </button>
        </div>
      )}
    </div>
  );
};

export default Parser;
