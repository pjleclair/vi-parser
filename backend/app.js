const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload')


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
    columns: mongoose.Schema.Types.Mixed,
  });

// Create a Model for configurations
const Configuration = mongoose.model('Configuration', configurationSchema);

// Middleware
app.use(bodyParser.json());
app.use(express.static('build'))
app.use(cors())
app.use(fileUpload())

// Save configuration endpoint
app.post('/api/configurations', async (req, res) => {
  try {
    const { name, columnMappings } = req.body;

    // Check if the configuration name already exists in the database
    const existingConfiguration = await Configuration.findOne({ name });
    if (existingConfiguration) {
      return res.status(400).json({ error: 'Configuration name already exists' });
    }

    // Save the new configuration
    const newConfiguration = new Configuration({ name, columnMappings });
    await newConfiguration.save();

    res.json({ message: 'Configuration saved successfully' });
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
  const configuration = req.body.configuration;

  // Read the uploaded file
  const workbook = XLSX.read(file.data, { type: 'buffer' });

  // Assume the first sheet is the one we're interested in
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert the sheet data to JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  console.log(jsonData); // Log the converted JSON data to the console

  // Combine the file data with the configuration
  const result = {
    fileData: jsonData,
    configuration: configuration,
  };

  res.json({ data: result, message: "File upload successful"});
});


// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
