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
      axios.get('/api/configurations/')
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
      const response = await axios.post('/api/upload/', formData);
      console.log('File upload successful:', response.data);
      setUploadMsg({msg: response.data.message, color: '#BB86FC'});
      setGptArray(response.data.gpt);
      // Perform further processing or handle the server response here
    } catch (error) {
      console.log('Error uploading file:', error);
      setUploadMsg({msg: error.response.data.error, color: "CF6679"})
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
    <div className='processor-container'>
      <h1 style={{color: "#03DAC5"}}>File Processor</h1>
      <h2 style={{color: "#BB86FC"}}>Select Configuration:</h2>
        {configurations && configurations.length > 0 ? (
          <div className='select'>
            <select onChange={handleConfigurationSelect}>
              <option value="">Select Configuration</option>
              {configurations.map((config) => (
                <option key={config._id} value={config._id}>
                  {config.name}
                </option>
              ))}
            </select>
            <span className='focus'></span>
          </div>
        ) : (
          <p className='no-configs'>No configurations found.</p>
        )}
      <h2 style={{color: "#BB86FC",marginTop:'3rem'}}>GPT Details:</h2>
      <div className='config-container'>
        <div>
          <h3>Campaign description:</h3>
          <input onChange={handleCampaignDescChange} value={campaignDesc} placeholder='ex: democratic political campaign'></input>
        </div>
        <div>
          <h3>Organization name:</h3>
          <input onChange={handleOrgNameChange} value={orgName} placeholder='ex: World Economic Forum'></input>
        </div>
        <div>
          <h3>Narrative:</h3>
          <input onChange={handleNarrativeChange} value={narrative} placeholder='ex: environmental values'></input>
        </div>
        <div>
          <h3>Donate Link:</h3>
          <input onChange={handleDonateLinkChange} value={donateLink} placeholder='ex: https://bit.ly/ShJ67w'></input>
        </div>
      </div>
      <div className='upload-container'>
        <div className='file-container'>
          <h2 style={{color: "#BB86FC"}}>Upload File:</h2>
          <input id='file' type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
        </div>
        <div>
          <h2 style={{color: "#BB86FC"}}>Delivery Method:</h2>
          <div id='radio'>
            <input name='deliveryMethod' type="radio" onChange={handleDeliveryMethodChange} id='text' checked={deliveryMethod === 'text'} value='text'/>
            <label>Text</label>
          </div>
          <div id='radio'>
            <input name='deliveryMethod' type="radio" onChange={handleDeliveryMethodChange} id='email' checked={deliveryMethod === 'email'} value='email'/>
            <label>Email</label>
          </div>
        </div>
      </div>
      <br />
      <button className='upload-button' onClick={handleUpload}>Upload</button>
      {(uploadMsg) && (
            <h2 style={{color: uploadMsg.color, fontWeight: "bolder", marginTop: "1rem"}}>{uploadMsg.msg}</h2>
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
