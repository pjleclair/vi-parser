import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './configurations.css'; // Assuming you have a corresponding CSS file for styling
import Notification from './notification'

const Configurations = ({ onFileUpload, jsonData, token }) => {
  const [columnMappings, setColumnMappings] = useState({});
  const [sampleData, setSampleData] = useState([]);
  const [name, setName] = useState('');
  const [updateMsg, setUpdateMsg] = useState(null);
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
    const config = {
      headers: {
        Authorization: token
      }
    }
    axios.get('/api/configurations/',config)
    .then((response) => {
      setConfigurations(response.data)
    })
    .catch((error) => {
      console.log({msg: 'Error fetching configurations', color: '#CF6679'});
    });
  };

  const handleConfigurationSelect = (event) => {
    const selectedConfigId = event.target.value;
    if (selectedConfigId === 'select')
      setSelectedConfiguration({name:''})
    const selectedConfig = configurations.find((config) => config._id === selectedConfigId);
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
    const config = {
      headers: {
        Authorization: token
      }
    }
    console.log(config,token)
    axios.post('/api/configurations/', configuration, config)
      .then((response) => {
        console.log('Configuration saved successfully:', response.data);
        setUpdateMsg({msg: response.data.message, color: "#03DAC5"});
      })
      .catch((error) => {
        console.error('Error saving configuration:', error);
        setUpdateMsg({msg: error.response.data.error, color: "#CF6679"});
      });
  };

  const updateConfiguration = (name,id,columnMappings) => {
    const configuration = {
      name,
      id,
      columnMappings: {...columnMappings}
    }
    const config = {
      headers: {
        Authorization: token
      }
    }
    axios.put('/api/configurations/', configuration, config)
      .then((response) => {
        console.log('Configuration updated successfully:', response.data);
        setUpdateMsg({msg: response.data.message, color: "#03DAC5"});
      })
      .catch((error) => {
        console.error('Error updating configuration:', error);
        setUpdateMsg({msg: error.response.data.error, color: "#CF6679"});
      });
  };

  const deleteConfiguration = (id) => {
    const config = {
      headers: {
        Authorization: token
      }
    }
    if (window.confirm("Are you sure you want to delete this configuration?"))
    {
      axios.delete(`/api/configurations/${id}`,config)
        .then((response) => {
          console.log('Configuration deleted succesfully');
          setUpdateMsg({msg: response.data.message, color: "#03DAC5"});
        })
        .catch((error) => {
          console.error('Error deleting configuration:', error);
          setUpdateMsg({msg: error.response.data.error, color: "#CF6679"});
        });
    } else {setUpdateMsg({msg: "Configuration deletion aborted", color: "#CF6679"})}
  }

  return (
    <div className="configurations">
      {(updateMsg) && <Notification message={updateMsg.msg} msgColor={updateMsg.color}/>}
      <h1 style={{color: "#FFFFFF"}}>Configurations</h1>
      <div className='select-config-container'>
        <div className='upload-config-container'>
          <p style={{width: 'fit-content', margin: '0'}}>Upload a file below to create a configuration:</p>
          <input type="file" onChange={onFileUpload} />
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
                      <td>{sampleData[index]}</td>
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
            </div>
          )}
        </div>
        <div id='divider'></div>
        <div className='update-config-container'>
          <p style={{width: 'fit-content', margin: '0'}}>Select an existing configuration to update or delete:</p>
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
                            value={selectedConfiguration.columnMappings[index]}
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
            </div>
            )}
          </div>
        </div>
        <div id='mobile'></div>
      </div>
    );
};

export default Configurations;
