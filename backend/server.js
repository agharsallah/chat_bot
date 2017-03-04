const http = require('http'); 
const express = require('express'); 
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const _ = require('lodash');


var app = express();
/* Morgan is a logging framework, outputs requests into terminal. For debugging.*/
app.use(morgan('combined'));
app.use(cors());

var server = http.createServer(app);

const io = socketIO(server);

/* Configure middleware to serve frontend static files */
/* Not needed, because I'm going to serve frontend separately. */
const path = require('path');
const staticFiles = path.join(__dirname, '../frontend');

app.get('/api/cc', function (req, res) {
  res.json('Hello World!')
})
/* Mongoose config */
mongoose.Promise = global.Promise;
/* Connecting to mongo. */
/* Default local mongoDB url */
var MONGO_DB_URL = 'mongodb://localhost:27017/chat'
/* For Docker */
if ( process.env.DB_PORT ) {
    MONGO_DB_URL = util.format('mongodb://db:%s/chat', process.env.DB_PORT);
}
mongoose.connect(MONGO_DB_URL);

/* Message model */
const Message = require('./models/message');

var Client_simple_msg = require('./SocketEventHandlers/Client_simple_msg');

require('./socket')(io,Message);


/* Server setup */
/* Set port with PORT environment variable. Or use 3000 by default. */
const port = process.env.PORT || 3000;
/* Start server */
server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
