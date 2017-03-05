const {generateMessage} = require('./utils/message');
const {Users} = require('./users');

const general_arr = require("./utils/message_src/greeting")
const all_mun = require("./utils/message_src/all_mun")

var users = new Users();
const moment = require('moment');
const util = require('util');
var natural = require('natural');
var simple_msg = require('./SocketEventHandlers/client_simple_msg')
const say = require('say');

module.exports = function(io,Message){

io.on('connection', (socket) => {
    /* Join a room */
    socket.on('join', (params, callback) => {
	/* Make sure the user isn't already on this channel */
	users.removeUser(socket.id);
	/* Add user to the channel (to the users object) */
	users.addUser(socket.id, params.username, params.channel);
	console.log(`${params.username} joined conversation`);
	/*add a hello message*/
		socket.emit('server:first_hello',generateMessage("Admin",`Welcome ${params.username} I'm Your Election assistant`));
    say.speak('hi there');

    });
    
    /* listening to the event. Receivemessages from user. */
    socket.on('client:createMessage', (message, callback) => {
    	//send the socket/ message I got from socket,and the Message model from db
    	var simple = simple_msg(socket,message,Message)
    	simple.emit();
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
}