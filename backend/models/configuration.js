const mongoose = require('mongoose');

// Create a Schema for configurations
const configurationSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 5,
        required: true
    },
    columnMappings: Object,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
  });

module.exports = mongoose.model('Configuration',configurationSchema);