import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileProcessor = () => {
  const [file, setFile] = useState(null);
  const [configurations, setConfigurations] = useState([]);
  const [selectedConfiguration, setSelectedConfiguration] = useState(null);
  const [uploadMsg, setUploadMsg] = useState({});

  useEffect(() => {
    fetchConfigurations();
  }, []);

  useEffect(()=> {
    if (uploadMsg !== "") {
      setTimeout(() => {
        setUploadMsg("")
      }, 5000);
    }
  },[uploadMsg])

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
    const selectedConfig = configurations.find((config) => config._id === selectedConfigId);
    setSelectedConfiguration(selectedConfig);
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
  };

  const handleUpload = async () => {
    if (!file || !selectedConfiguration) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('configuration', JSON.stringify(selectedConfiguration));

    try {
      const response = await axios.post('/api/upload', formData);
      console.log('File upload successful:', response.data);
      setUploadMsg({msg: response.data.message, color: "green"})
      // Perform further processing or handle the server response here
    } catch (error) {
      console.log('Error uploading file:', error);
      setUploadMsg({msg: error.response.data.error, color: "red"})
    }
  };

  return (
    <div>
      <h1>File Processor</h1>
      <div>
        <h2>Select Configuration:</h2>
        {configurations && configurations.length > 0 ? (
          <select onChange={handleConfigurationSelect}>
            <option value="">Select Configuration</option>
            {configurations.map((config) => (
              <option key={config._id} value={config._id}>
                {config.name}
              </option>
            ))}
          </select>
        ) : (
          <p>No configurations found.</p>
        )}
      </div>
      <div>
        <h2>Upload File:</h2>
        <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
      </div>
      <button onClick={handleUpload}>Upload</button>
      {(uploadMsg) && (
            <div style={{color: uploadMsg.color, fontWeight: "bolder", marginTop: "1rem"}}>{uploadMsg.msg}</div>
          )}
    </div>
  );
};

export default FileProcessor;
