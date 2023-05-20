import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './configurations.css'; // Assuming you have a corresponding CSS file for styling

const Configurations = ({ onFileUpload, jsonData, onSaveConfiguration }) => {
  const [columnMappings, setColumnMappings] = useState({});
  const [sampleData, setSampleData] = useState([]);
  const [name, setName] = useState('');
  const [uploadMsg, setUploadMsg] = useState({});
  const [updateMsg, setUpdateMsg] = useState({});
  const [configurations, setConfigurations] = useState([])
  const [selectedConfiguration, setSelectedConfiguration] = useState({name:''})

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

  useEffect(()=> {
    if (uploadMsg !== "") {
      setTimeout(() => {
        setUploadMsg("")
      }, 5000);
    }
  },[uploadMsg])

  useEffect(()=> {
    if (updateMsg !== "") {
      setTimeout(() => {
        setUpdateMsg("")
      }, 5000);
    }
  },[updateMsg])

  useEffect(()=> {
    fetchConfigurations();
  },[])

  const fetchConfigurations = () => {
    axios.get('/api/configurations')
    .then((response) => {
      setConfigurations(response.data)
    })
    .catch((error) => {
      console.log('Error fetching configurations:', error);
    });
  };

  const handleConfigurationSelect = (event) => {
    const selectedConfigId = event.target.value;
    if (selectedConfigId === 'select')
      setSelectedConfiguration({name:''})
    const selectedConfig = configurations.find((config) => config._id === selectedConfigId);
    console.log(selectedConfig)
    setSelectedConfiguration(selectedConfig);
  };

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

  const saveConfiguration = (name,columnMappings) => {
    const configuration = {
      name,
      columnMappings: {...columnMappings}
    }
    console.log(configuration)
    axios.post('/api/configurations', configuration)
      .then((response) => {
        console.log('Configuration saved successfully:', response.data);
        setUploadMsg({msg: response.data.message, color: "#BB86FC"});
      })
      .catch((error) => {
        console.error('Error saving configuration:', error);
        setUploadMsg({msg: error.response.data.error, color: "red"});
      });
  };

  const updateConfiguration = (name,id,columnMappings) => {
    const configuration = {
      name,
      id,
      columnMappings: {...columnMappings}
    }
    console.log(configuration)
    axios.put('/api/configurations', configuration)
      .then((response) => {
        console.log('Configuration updated successfully:', response.data);
        setUpdateMsg({msg: response.data.message, color: "#BB86FC"});
      })
      .catch((error) => {
        console.error('Error updating configuration:', error);
        setUpdateMsg({msg: error.response.data.error, color: "#CF6679"});
      });
  };

  const deleteConfiguration = (id) => {
    const idObj = {
      id
    }
    console.log(idObj)
    if (window.confirm("Are you sure you want to delete this configuration?"))
    {
      axios.delete(`/api/configurations/${id}`)
        .then((response) => {
          console.log('Configuration deleted succesfully:', response.data);
          setUpdateMsg({msg: response.data.message, color: "#BB86FC"});
        })
        .catch((error) => {
          console.error('Error deleting configuration:', error);
          setUpdateMsg({msg: error.response.data.error, color: "#CF6679"});
        });
    } else {setUpdateMsg({msg: "Configuration deletion aborted", color: "#CF6679"})}
  }

  return (
    <div className="configurations">
      <h1 style={{color: "#03DAC5"}}>Configurations</h1>
      <p style={{width: 'fit-content'}}>Upload a file below to create a configuration:</p>
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
                  <td className='select'>
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
          <button onClick={() => saveConfiguration(name, columnMappings)}>
            Save Configuration
          </button>
          {(uploadMsg) && (
            <h2 style={{color: uploadMsg.color, fontWeight: "bolder", marginTop: "1rem"}}>{uploadMsg.msg}</h2>
          )}
        </div>
      )}
      <h2 style={{color: "#BB86FC"}}>--or--</h2>
      <p style={{width: 'fit-content'}}>Select an existing configuration to update or delete:</p>
        {configurations && configurations.length > 0 ? (
          <div className='config-update-container'>
            <div className='select'>
              <select onChange={handleConfigurationSelect}>
                <option value="select">Select Configuration</option>
                {configurations.map((config) => (
                  <option key={config._id} value={config._id}>
                    {config.name}
                  </option>
                ))}
              </select>
              <span className='focus'></span>
            </div>
            {(selectedConfiguration && (selectedConfiguration.name.length > 0)) && (<button id='delete' onClick={()=>deleteConfiguration(selectedConfiguration._id)}>Delete</button>)}
          </div>
        ) : (
          <p className='no-configs'>No configurations found.</p>
        )}
        {(selectedConfiguration && (selectedConfiguration.name.length > 0)) && (
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
                {Object.keys(selectedConfiguration.columnMappings).map((columnName, index) => (
                  <tr key={index}>
                    <td>{columnName}</td>
                    <td className='select'>
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
            <button id='update' onClick={() => updateConfiguration(name, selectedConfiguration._id, columnMappings)}>
              Update Configuration
            </button>
            {(updateMsg) && (
              <h2 style={{color: updateMsg.color, fontWeight: "bolder", marginTop: "1rem"}}>{updateMsg.msg}</h2>
            )}
        </div>
        )}
    </div>
  );
};

export default Configurations;
