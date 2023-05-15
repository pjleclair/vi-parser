import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileProcessor = () => {
  const [configurations, setConfigurations] = useState([]);
  const [selectedConfiguration, setSelectedConfiguration] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    axios
      .get('/api/configurations') // Replace with the appropriate API endpoint
      .then((response) => {
        setConfigurations(response.data);
      })
      .catch((error) => {
        console.error('Error fetching configurations:', error);
      });
  }, []);

  const handleConfigurationSelect = (e) => {
    setSelectedConfiguration(e.target.value);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!selectedConfiguration || !selectedFile) {
      console.error('Please select a configuration and file');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('configuration', selectedConfiguration);

    axios
      .post('/api/upload', formData) // Replace with the appropriate API endpoint
      .then((response) => {
        console.log('File uploaded and processed:', response.data);
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
      });
  };

  return (
    <div>
      <h2>File Processor</h2>
      <select value={selectedConfiguration} onChange={handleConfigurationSelect}>
        <option value="">Select Configuration</option>
        {configurations.map((configuration) => (
          <option key={configuration.id} value={configuration.id}>
            {configuration.name}
          </option>
        ))}
      </select>
      <br />
      <input type="file" onChange={handleFileChange} />
      <br />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default FileProcessor;
