const mongoose = require('mongoose');
const configRouter = require('express').Router();

//import models
const Configuration = require('../models/configuration');

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



// Save configuration endpoint
configRouter.post('/', async (req, res) => {
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
  
configRouter.put('/', async (req, res) => {
    try {
      let name = req.body.name;
      let columnMappings = req.body.columnMappings;
      console.log(columnMappings)
      const id = req.body.id;
      console.log(id)
  
      // Update the configuration
      if (name === '')
        name = Configuration.findById(id).name;
      if (Object.keys(columnMappings).length === 0)
        columnMappings = Configuration.findById(id).columnMappings;
      Configuration.findByIdAndUpdate(id,{name: name, columnMappings: columnMappings})
      .then(config => {
        res.json({ message: 'Configuration updated successfully', config: config });
      })
      .catch(error => {
        res.status(500).json({error: 'Failed to update configuration'})
      })
    } catch (error) {
      console.log('Error updating configuration:', error);
      res.status(500).json({ error: 'Failed to update configuration' });
    }
  });
  
configRouter.delete('/:id', async (req, res) => {
    try {
      const id = req.params.id;
      console.log(id)
      Configuration.findByIdAndDelete(id)
      .then(config => {
        res.json({ message: 'Configuration deleted successfully:', config: config });
      })
      .catch(error => {
        res.status(500).json({error: 'Failed to delete configuration'})
      })
    } catch (error) {
      console.log('Error deleting configuration:', error);
      res.status(500).json({ error: 'Failed to delete configuration' });
    }
  })
  
  
  // Fetch configurations endpoint
configRouter.get('/', (req, res) => {
    Configuration.find()
      .then((configurations) => {
        res.json(configurations);
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to fetch configurations' });
      });
  });

module.exports = configRouter;