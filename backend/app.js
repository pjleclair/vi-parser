const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload')
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 8080;

// MongoDB configuration
const MONGO_URI = 'mongodb+srv://fullstack:fs0pen@cluster0.00quc3x.mongodb.net/?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Create a Schema for configurations
const configurationSchema = new mongoose.Schema({
    name: String,
    columnMappings: Object,
  });

// Create a Model for configurations
const Configuration = mongoose.model('Configuration', configurationSchema);

//OpenAI Configuration
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${process.env.API_KEY}`,
}
console.log(headers)
const apiUrl="https://api.openai.com/v1/completions";

//Twilio Configuration
const accountSid = process.env.ACC_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

// Middleware
app.use(bodyParser.json());
app.use(express.static('build'))
app.use(cors())
app.use(fileUpload())

// Save configuration endpoint
app.post('/api/configurations', async (req, res) => {
  try {
    const name = req.body.name;
    const columnMappings = req.body.columnMappings;

    // Check if the configuration name already exists in the database
    const existingConfiguration = await Configuration.findOne({ name });
    if (existingConfiguration) {
      return res.status(400).json({ error: 'Configuration name already exists' });
    }

    // Save the new configuration
    const newConfiguration = new Configuration({ name, columnMappings });
    await newConfiguration.save();

    res.json({ message: 'Configuration saved successfully', config: newConfiguration });
  } catch (error) {
    console.log('Error saving configuration:', error);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});


// Fetch configurations endpoint
app.get('/api/configurations', (req, res) => {
  Configuration.find()
    .then((configurations) => {
      res.json(configurations);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to fetch configurations' });
    });
});


const XLSX = require('xlsx');

app.post('/api/upload', (req, res) => {
  if (!req.files || !req.files.file || !req.body.configuration) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const file = req.files.file;
  const configuration = JSON.parse(req.body.configuration);
  const campaignDesc = req.body.campaignDesc;
  const orgName = req.body.orgName;
  const narrative = req.body.narrative;
  const donateLink = req.body.donateLink;
  // Read the uploaded file
  const workbook = XLSX.read(file.data, { type: 'buffer' });

  // Assume the first sheet is the one we're interested in
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert the sheet data to JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  //console.log(jsonData); // Log the converted JSON data to the console

  // Combine the file data with the configuration
  const combinedData = jsonData.map((row) => {
    const combinedRow = {};

    try {
      Object.entries(configuration.columnMappings).forEach(([index, mappedColumnName]) => {
        const columnIndex = parseInt(index, 10);
        const columnName = Object.keys(row)[columnIndex];

        if (columnName !== undefined && row[columnName] !== undefined) {
          combinedRow[mappedColumnName] = row[columnName];
        }
      });
    } catch (error) {
      console.error('Error in Row:', row);
      throw error;
    }

    return combinedRow;
  });

  //make API call to OpenAI
  let msgArray = [];
  const promises = Array.from(combinedData, (obj, index) => {
    console.log(obj)
    const data={
      "model": "text-davinci-003",
      "prompt": `Create a fundraising text message addressed to ${obj.fullName} for a ${campaignDesc} named "${orgName}" based on ${narrative} that targets US citizens of age ${obj.age} that are members of the ${obj.party} political party - be sure to include a shortened hyperlink to donate at ${donateLink} and address the recipient by first name`,
      "max_tokens": 240,
      "temperature": 0.3
    }
  
    return axios
    .post(apiUrl, data, { headers })
    .then((response) => {
      // Handle the response
      console.log(response.data.choices[0].text);
      return response.data.choices[0].text;
    })
    .catch((error) => {
      // Handle errors
      return error;
    });
  });
  
  Promise.all(promises)
  .then((responses) => {
    msgArray = responses;
    console.log(msgArray);
    // Continue with further processing using msgArray
    msgArray.map((msg, index) => {
      const num = combinedData[index].phoneNumber.replace(/-/g,'');
      client.messages
      .create({ body: msg, from: "+18885459281", to: `+1${num}` })
        .then(message => console.log(message.sid));
    });

    res.json({ data: combinedData, message: "File upload successful", gpt: msgArray});
  })
  .catch((error) => {
    // Handle errors in promise.all
    console.error(error);
  });

});


// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
