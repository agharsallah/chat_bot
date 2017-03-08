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
        var mun_exist = []
        all_mun.features.forEach( function (arrayItem)
        {
            var city_name = arrayItem.properties.name_en;
            var city_pop = arrayItem.properties.citizens;
            var city_area = arrayItem.properties.area;
            var city_seats = arrayItem.properties.seats;
            var closness = natural.JaroWinklerDistance(city_name,message.body)
            var obj = {"name":city_name,"population":city_pop}
            if (closness > 0.95) {
                pass(obj);
            }
        });
        function pass(params) {
            if (params) {
                mun_exist.push(params)
            }
        }
        
    if(grtng!=-1){
        var rand_reply = grtng_resp[Math.floor(Math.random()*grtng_resp.length)];
        setTimeout(()=>{
            socket.emit('server:newMessage', generateMessage("Admin",rand_reply));
        }, 400);
        
    }else if(message.body.toLowerCase().indexOf("info") >= 0) {
        setTimeout(()=>{
            socket.emit('server:newMessage', generateMessage("Admin","ok great in which municipality do u leave ?"));
        }, 400);
    
    }else if(mun_exist.length!=0){
         socket.emit('server:newMessage', generateMessage("Admin",`in ${mun_exist[0].name} Lives arround ${mun_exist[0].population} people`));
    }else if(message.body=="random"){
         socket.emit('server:newMessage', generateMessage("img","election_gif"));
         console.log(message.body)
    }else{
        setTimeout(()=>{
        socket.emit('server:newMessage', generateMessage("Admin","Sorry I didn't get what you've typed, You can type help"));
        }, 400);
    }

    } 
    }
}