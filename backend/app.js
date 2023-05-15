const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

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

// Save configuration endpoint
app.post('/api/configurations', (req, res) => {
  const {name, columnMappings } = req.body;

  const configuration = new Configuration();
  configuration.name = name;
  configuration.columns = columnMappings;
  configuration
    .save()
    .then((savedConfiguration) => {
      res.json(savedConfiguration);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to save configuration' });
    });
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

// File upload endpoint
app.post('/api/upload', (req, res) => {
  // Handle the file upload and processing here
  // You can access the uploaded file using req.files and the configuration using req.body.configuration

  // Placeholder response
  res.json({ message: 'File uploaded and processed successfully' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
