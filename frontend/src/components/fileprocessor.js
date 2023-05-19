import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './fileprocessor.css'

const FileProcessor = () => {
  const [file, setFile] = useState(null);
  const [configurations, setConfigurations] = useState([]);
  const [selectedConfiguration, setSelectedConfiguration] = useState(null);
  const [uploadMsg, setUploadMsg] = useState("");
  const [gptArray, setGptArray] = useState([])
  const [orgName, setOrgName] = useState("")
  const [campaignDesc, setCampaignDesc] = useState("")
  const [narrative, setNarrative] = useState("")
  const [donateLink, setDonateLink] = useState("")
  const [deliveryMethod, setDeliveryMethod] = useState("email")

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
    formData.append('campaignDesc', campaignDesc);
    formData.append('orgName', orgName);
    formData.append('narrative', narrative);
    formData.append('donateLink', donateLink);
    formData.append('deliveryMethod', deliveryMethod);

    try {
      const response = await axios.post('/api/upload', formData);
      console.log('File upload successful:', response.data);
      setUploadMsg({msg: response.data.message, color: "green"});
      setGptArray(response.data.gpt);
      // Perform further processing or handle the server response here
    } catch (error) {
      console.log('Error uploading file:', error);
      setUploadMsg({msg: error.response.data.error, color: "red"})
    }
  };

  const handleCampaignDescChange = (e) => {
    setCampaignDesc(e.target.value)
  }

  const handleOrgNameChange = (e) => {
    setOrgName(e.target.value)
  }
  
  const handleNarrativeChange = (e) => {
    setNarrative(e.target.value)
  }

  const handleDonateLinkChange = (e) => {
    setDonateLink(e.target.value)
  }

  const handleDeliveryMethodChange = (e) => {
    console.log(e.target.value)
    setDeliveryMethod(e.target.value)
  }

  return (
    <div>
      <h1>File Processor</h1>
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
          <p className='no-configs'>No configurations found.</p>
        )}
      <div className='config-container'>
        <div>
          <h2>Campaign description:</h2>
          <input onChange={handleCampaignDescChange} value={campaignDesc} placeholder='ex: democratic political campaign'></input>
        </div>
        <div>
          <h2>Organization name:</h2>
          <input onChange={handleOrgNameChange} value={orgName} placeholder='ex: World Economic Forum'></input>
        </div>
        <div>
          <h2>Narrative:</h2>
          <input onChange={handleNarrativeChange} value={narrative} placeholder='ex: environmental values'></input>
        </div>
        <div>
          <h2>Donate Link:</h2>
          <input onChange={handleDonateLinkChange} value={donateLink} placeholder='ex: https://bit.ly/ShJ67w'></input>
        </div>
      </div>
      <div>
        <h2>Upload File:</h2>
        <input id='file' type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
        <h2>Delivery Method:</h2>
        <div id='radio'>
          <input name='deliveryMethod' type="radio" onChange={handleDeliveryMethodChange} id='text' checked={deliveryMethod === 'text'} value='text'/>
          <label>Text</label>
        </div>
        <div id='radio'>
          <input name='deliveryMethod' type="radio" onChange={handleDeliveryMethodChange} id='email' checked={deliveryMethod === 'email'} value='email'/>
          <label>Email</label>
        </div>
      </div>
      <br />
      <button className='upload-button' onClick={handleUpload}>Upload</button>
      {(uploadMsg) && (
            <div style={{color: uploadMsg.color, fontWeight: "bolder", marginTop: "1rem"}}>{uploadMsg.msg}</div>
          )}
      <br/>
      {((gptArray)&&(gptArray.length > 0)) && (
        <div>
          <h1>Sample output:</h1>
            {gptArray.map((message,i) => {
            return <p key={i}
             dangerouslySetInnerHTML={{__html: message.trim()}}></p>
          })}
        </div>
      )}
    </div>
  );
};

export default FileProcessor;
