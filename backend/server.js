const http = require('http'); 
const express = require('express'); 
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const moment = require('moment');
const util = require('util');
const _ = require('lodash');

const {generateMessage} = require('./utils/message');
const {Users} = require('./users');

const general_arr = require("./utils/message_src/greeting")

var users = new Users();

/* App setup */
/* Create express app */
var app = express();
/* Morgan is a logging framework, outputs requests into terminal. For debugging.*/
app.use(morgan('combined'));
// cors is ...
app.use(cors());


/* Create http server that can process http requests and send them to the app */
var server = http.createServer(app);
/* Configure app to work with socket.io */
/* io variable is a web sockets server */
const io = socketIO(server);

/* Configure middleware to serve frontend static files */
/* Not needed, because I'm going to serve frontend separately. */
const path = require('path');
const staticFiles = path.join(__dirname, '../frontend');
app.use('/static', express.static(staticFiles));

app.use((req, res) => res.sendFile(staticFiles+'/index.html'));


/* Mongoose config */
mongoose.Promise = global.Promise;
/* Connecting to mongo. */
/* Default local mongoDB url */
var MONGO_DB_URL = 'mongodb://localhost:27017/chat'
/* For Docker */
if ( process.env.DB_PORT ) {
    /* If there's a DB_PORT variable, then we're in Docker
       (I've set it in docker-compose) */
    /* and so I'm changing mongo url to this: */
    /* mongodb: is mongo's protocol, */
    /* db is the name of the container that runs mongo */
    MONGO_DB_URL = util.format('mongodb://db:%s/chat', process.env.DB_PORT);
}
/* Conncetiong to mongoose to mongo */
mongoose.connect(MONGO_DB_URL);

/* Message model */
const Message = require('./models/message');




io.on('connection', (socket) => {
    console.log('New user connected');
    /* Send a welcome message to the user who just connected */
    /* socket.emit('server:newMessage',
       generateMessage("Admin", "Welcome to our chat!!"));*/
    
    /* Once user connected - send him a current userlist. */
    socket.emit('server:udateUserList',
		users.getAllUsers());



    socket.on('client:joinRoom', (channel, callback) => {
	/* Do the socket magic that allows to send messages only to people in the room */
	socket.join(channel);
	/* Get all the messages from this channel */
	Message.find({channel:channel}).then((messages)=>{
	    console.log(`All messages on the ${channel} channel: ${messages} `);
	    callback(messages);
	});

	//socket.leave(channel);
    });    

    /* Join a room */
    socket.on('join', (params, callback) => {
	/* Make sure the user isn't already on this channel */
	users.removeUser(socket.id);
	/* Add user to the channel (to the users object) */
	users.addUser(socket.id, params.username, params.channel);
	console.log(`${params.username} joined ${params.channel}`);

	/* Emit an event to people in this room,
	   telling them to update the list of users,
	   and sending them the new user list. */
	io.to(params.channel).emit('server:updateUserList',
				   users.getUserList(params.channel));
	/*add a hello message*/
		socket.emit('server:first_hello',generateMessage("Admin",`Welcome ${params.username} I'm Your Election assistant`));
	callback();
    });

    /* listening to the event. Receivemessages from user. */
    socket.on('client:createMessage', (message, callback) => {

	/* Creating message */
	var message = new Message({
	    author: message.from,
	    body: message.body,
	    createdAt: moment().valueOf()	    
	});
	//print the user's message
	socket.emit('server:newMessage', message);
	/*Check if the users question matches a predefined Q*/
	var grtng= general_arr.greeting.indexOf(message.body)
	var grtng_resp = general_arr.greeting_response
	if(grtng!=-1){
	var rand_reply = grtng_resp[Math.floor(Math.random()*grtng_resp.length)];
	
	setTimeout(()=>{
		socket.emit('server:newMessage', generateMessage("Admin",rand_reply));
	}, 400);
	}else if(message.body.toLowerCase().indexOf("info") >= 0) {
		setTimeout(()=>{
			socket.emit('server:newMessage', generateMessage("Admin","ok great in which municipality do u leave ?"));
		}, 400);
	}else{
		setTimeout(()=>{
		socket.emit('server:newMessage', generateMessage("Admin","Sorry I didn't get what you get You can type help"));
		}, 400);
	}

	
	
    });

    /* Disconnect */
    socket.on('disconnect', () => {
	var user = users.removeUser(socket.id);
	if (user) {
	    console.log(`${user.username} has left ${user.channel}`);
	    io.to(user.channel).emit('server:updateUserList',
				     users.getUserList(user.channel));
	}
    });
    
});


/* Server setup */
/* Set port with PORT environment variable. Or use 3000 by default. */
const port = process.env.PORT || 3000;
/* Start server */
server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
