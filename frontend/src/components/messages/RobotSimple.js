import React, { Component } from 'react';
const RobotSimple = (props)=>{
        const message = props.message;
        const time = props.time;
    return(
        <div className="message new" key={message.createdAt}>
            <figure className="avatar">
            <img src="./img/bot.png"/>
            </figure>
            {message.body}
            <div className="timestamp">{time}</div>
            <div className="checkmark-sent-delivered">✓</div>
            <div className="checkmark-read">✓</div>
        </div>
    );
}
export default RobotSimple