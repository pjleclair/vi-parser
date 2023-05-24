const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const configRouter = require('express').Router();
const {userExtractor} = require('../utils/middleware');

//import models
const Configuration = require('../models/configuration');
const User = require('../models/user');

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
configRouter.post('/', userExtractor, async (req, res) => {
    try {
      const name = req.body.name;
      const columnMappings = req.body.columnMappings;

      const decodedToken = jwt.verify(req.token, process.env.SECRET)
      if (!decodedToken.id) {
        return res.status(401).json({ error: 'token invalid' })
      }
      const user = req.user;

      // Check if the configuration name already exists in the database
      const existingConfiguration = await Configuration.findOne({ name });
      if (existingConfiguration) {
        return res.status(400).json({ error: 'Configuration name already exists' });
      }
  
      // Save the new configuration
      const newConfiguration = new Configuration({ name, columnMappings, user: user._id });
      await newConfiguration.save();

      user.configurations = user.configurations.concat(newConfiguration._id)
      await user.save();
  
      res.json({ message: 'Configuration saved successfully', config: newConfiguration });
    } catch (error) {
      console.log('Error saving configuration:', error);
      res.status(500).json({ error: 'Failed to save configuration' });
    }
  });
  
configRouter.put('/', userExtractor, async (req, res) => {
    try {
        let name = req.body.name;
        let columnMappings = req.body.columnMappings;
        const id = req.body.id;
        
        //check to see if user's token matches the config creator's
        const decodedToken = jwt.verify(req.token, process.env.SECRET)
        if (!decodedToken.id) {
            res.status(401).json({ error: 'token invalid' })
        }
        const user = req.user;
        const config = await Configuration.findById(id)
        if (config === null) {
            res.status(401).json({error: 'No configuration found with that ID'})
        } else if (!(user._id.toString() === config.user.toString())) {
            res.status(401).json({error: 'Configurations can only be updated by the creator'})
        } else {
            // Update the configuration
            if (name === '')
                name = Configuration.findById(id).name;
            if (columnMappings === undefined || (Object.keys(columnMappings).length === 0))
                columnMappings = Configuration.findById(id).columnMappings;
            Configuration.findByIdAndUpdate(id,{name: name, columnMappings: columnMappings})
            .then(config => {
                res.json({ message: 'Configuration updated successfully', config: config });
            })
            .catch(error => {
                res.status(500).json({error: 'Failed to update configuration'})
            })
        }
    } catch (error) {
        console.log('Error updating configuration:', error);
        res.status(500).json({ error: 'Failed to update configuration' });
    }
  });
  
configRouter.delete('/:id', userExtractor, async (req, res) => {
    try {
        const id = req.params.id;

        const decodedToken = jwt.verify(req.token, process.env.SECRET)
        if (!decodedToken.id) {
            res.status(401).json({ error: 'token invalid' })
        }
        const user = req.user;
        const config = await Configuration.findById(id)
        if (config === null) {
            res.status(401).json({error: 'No configuration found with that ID'})
        } else if (!(user._id.toString() === config.user.toString())) {
            res.status(401).json({error: 'Configurations can only be deleted by their creator'})
        } else {
            Configuration.findByIdAndDelete(id)
            .then(config => {
                res.json({ message: 'Configuration deleted successfully', config: config });
            })
            .catch(error => {
                res.status(500).json({error: 'Failed to delete configuration'})
        })}
    } catch (error) {
        console.log('Error deleting configuration', error);
        res.status(500).json({ error: 'Failed to delete configuration' });
    }
  })
  
  
  // Fetch configurations endpoint
configRouter.get('/', userExtractor, (req, res) => {
    Configuration.find().populate('user', {username: 1, name: 1})
      .then((configurations) => {
        if (req.user) {
            const userConfigs = configurations.map((config)=>{
                if (config.user._id.toString() === req.user._id.toString())
                    return config
            })
            if (userConfigs[0] === undefined)
                res.status(500).json({ error: 'Failed to fetch configurations' });
            else
                res.json(userConfigs)
        } else {
            res.json(configurations);
        }
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to fetch configurations' });
      });
  });

module.exports = configRouter;