import React, { Component } from 'react';
const RobotImage = (props)=>{
    const message = props.message
    const time = props.time
    return(
        <div className="message new" key={message.createdAt}>
            <figure className="avatar">
            <img src="./img/bot.png"/>
            </figure>
            <img src="./img/vote.gif"/>
            <div className="timestamp">{time}</div>
            <div className="checkmark-sent-delivered">✓</div>
            <div className="checkmark-read">✓</div>
        </div>
    );
}
export default RobotImage