const User = require('../models/user');
const jwt = require('jsonwebtoken');

//Fetch token helper
const tokenExtractor = (req,res,next) => {
  let authorization = req.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    authorization = authorization.replace('Bearer ', '')
  }
  req.token = authorization;
  next()
}

//Fetch user helper
const userExtractor = async (req,res,next) => {
  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    req.user = await User.findById(decodedToken.id)
  } catch (error) {
    console.log('Error:', error)
  }
  next()
}

module.exports = {tokenExtractor,userExtractor};