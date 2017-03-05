//array that contains key words
const general_arr = require("./../utils/message_src/greeting")
//array that contains mun infos
const all_mun = require("./../utils/message_src/all_mun")
//message model
const {generateMessage} = require('./../utils/message');
const moment = require('moment');
var natural = require('natural');

module.exports = (socket,message,Message)=>{
    /* Creating message */
    var message = new Message({
        author: message.from,
        body: message.body,
        createdAt: moment().valueOf()       
    });
    /*Check if the users question matches a predefined Q*/
    var grtng= general_arr.greeting.indexOf(message.body);
    var grtng_resp = general_arr.greeting_response;

    return{

    //print the user's message
    emit:()=>{
        socket.emit('server:newMessage', message);

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

    } 
    }
}