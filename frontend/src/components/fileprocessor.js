import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './fileprocessor.css'
import Notification from './notification'

const FileProcessor = ({token}) => {
  const [file, setFile] = useState(null);
  const [configurations, setConfigurations] = useState([]);
  const [selectedConfiguration, setSelectedConfiguration] = useState(null);
  const [uploadMsg, setUploadMsg] = useState(null);
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
        console.log({msg: 'Error fetching configurations', color: "#CF6679"});
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

    const config = {
      headers: {
        Authorization: token
      }
    }

    try {
      const response = await axios.post('/api/upload/', formData, config);
      setUploadMsg({msg: response.data.message, color: '#03DAC5'});
      setGptArray(response.data.gpt);
      // Perform further processing or handle the server response here
    } catch (error) {
      console.log('Error uploading file:', error);
      setUploadMsg({msg: error.response.data.error, color: "#CF6679"})
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
      {(uploadMsg) && <Notification message={uploadMsg.msg} msgColor={uploadMsg.color}/>}
      <h1 style={{color: "#FFFFFF"}}>File Processor</h1>
      <div className='config-select-container'>
        <h2 style={{color: "#8CFC86",margin:'0 0 .5rem 0'}}>Select Configuration:</h2>
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
      </div>
      <div className='gpt-container'>
        <h2 style={{color: "#8CFC86"}}>GPT Details:</h2>
        <div className='config-container'>
          <div id='gpt-field'>
            <h3>Campaign description:</h3>
            <input onChange={handleCampaignDescChange} value={campaignDesc} placeholder='ex: democratic political campaign'></input>
          </div>
          <div id='gpt-field'>
            <h3>Organization name:</h3>
            <input onChange={handleOrgNameChange} value={orgName} placeholder='ex: World Economic Forum'></input>
          </div>
          <div id='gpt-field'>
            <h3>Narrative:</h3>
            <input onChange={handleNarrativeChange} value={narrative} placeholder='ex: environmental values'></input>
          </div>
          <div id='gpt-field'>
            <h3>Donate Link:</h3>
            <input onChange={handleDonateLinkChange} value={donateLink} placeholder='ex: https://bit.ly/ShJ67w'></input>
          </div>
        </div>
        <div id='divider' style={{border: "1px solid rgb(47, 51, 54)", width: '100%', margin: '1rem'}}></div>
        <div className='upload-container'>
          <div className='file-container'>
            <h2 style={{color: "#8CFC86"}}>Upload File:</h2>
            <input id='file' type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
          </div>
          <div className='delivery-container'>
            <h2 style={{color: "#8CFC86"}}>Delivery Method:</h2>
            <div className='radio-container'>
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
        </div>
      </div>
      <br />
      <button className='upload-button' onClick={handleUpload}>Upload</button>
      <br/>
      {((gptArray)&&(gptArray.length > 0)) && (
        <div className='gpt-array'>
          <h1>Generated Content:</h1>
            {gptArray.map((message,i) => {
            return <p id='gpt' key={i}
             dangerouslySetInnerHTML={{__html: message.trim()}}></p>
          })}
        </div>
      )}
      <div id='mobile'></div>
    </div>
  );
};

export default FileProcessor;
