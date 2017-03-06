const {generateMessage} = require('./utils/message');
const {Users} = require('./users');
var users = new Users();
const util = require('util');
var simple_msg = require('./SocketEventHandlers/client_simple_msg')
module.exports = function(io,Message){

io.on('connection', (socket) => {

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