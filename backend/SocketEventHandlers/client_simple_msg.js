const general_arr = require("./../utils/message_src/greeting")
const all_mun = require("./../utils/message_src/all_mun")
const {generateMessage} = require('./../utils/message');

var Client_simple_msg = function (socket) {
    this.socket = socket;
    // Expose handler methods for events
    this.handler = {
        message:    message.bind(this)    // and this.socket in events
    }
}

// Events


function message() {
    // Reply to sender
            console.log("messagxxxxxxxxxxxxe")
    this.socket.emit('test', 'PONG!');

};

module.exports = Client_simple_msg;