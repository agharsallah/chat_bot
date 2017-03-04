const {generateMessage} = require('./utils/message');
const {Users} = require('./users');

const general_arr = require("./utils/message_src/greeting")
const all_mun = require("./utils/message_src/all_mun")

var users = new Users();
const moment = require('moment');
const util = require('util');
var natural = require('natural');

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

	/* Creating message */
	var message = new Message({
	    author: message.from,
	    body: message.body,
	    createdAt: moment().valueOf()	    
	});
	//print the user's message
	socket.emit('server:newMessage', message);
	/*Check if the users question matches a predefined Q*/
	var grtng= general_arr.greeting.indexOf(message.body);
	var grtng_resp = general_arr.greeting_response;
	var verif = []
	//_.findIndex(all_mun.features) 
		all_mun.features.forEach( function (arrayItem)
		{
			var city_name = arrayItem.properties.name_en;
			var city_pop = arrayItem.properties.citizens;
			var city_area = arrayItem.properties.area;
			var city_seats = arrayItem.properties.seats;
			var closness = natural.JaroWinklerDistance(city_name,message.body)
		    
		    if (closness > 0.95) {
					socket.emit('server:newMessage', generateMessage("Admin",`in ${city_name} Lives arround ${city_pop} people`));
					console.log(arrayItem.properties.citizens)
					
		    }else{
		    	mun_exist =0;
		    }
		});
		
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
}