const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const middleware = require('./utils/middleware');
require('dotenv').config();

//import routers
const usersRouter = require('./controllers/users');
const configRouter = require('./controllers/configurations');
const uploadRouter = require('./controllers/upload');
const loginRouter = require('./controllers/login');

//config server
const app = express();
const port = 8080;

// Middleware
app.use(bodyParser.json());
app.use(express.static('build'));
app.use(cors());
app.use(fileUpload());
app.use(middleware.tokenExtractor);
app.use('/api/users',usersRouter);
app.use('/api/configurations',configRouter);
app.use('/api/upload',uploadRouter);
app.use('/api/login',loginRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
