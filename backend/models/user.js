const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

//Create a Schema for users
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    passwordHash: String,
    configurations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Configuration'
      }
    ]
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);