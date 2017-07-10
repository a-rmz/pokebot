require('dotenv').load();
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const debug = require('debug')('pokebot:server');

const router = require('./routes/facebook');

const app = express();
app.use(logger('dev'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  // Health check to verify that the server is running
  res.send('I\'m just a health check :)');
});

app.use('/facebook', router);

app.listen(3030, () => {
  debug('Magic bot server running on port 3030! 🦄 🤖');
});
