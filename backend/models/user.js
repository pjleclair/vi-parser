const mongoose = require('mongoose');

//Create a Schema for users
const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    passwordHash: String,
    configurations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Config'
      }
    ]
});

module.exports = userSchema;