import React, { Component } from 'react';
const UserSimple = (props)=>{
    const message = props.message
    return(
        <div className="message message-personal new">{message.body}
            <div className="checkmark-sent-delivered">✓</div>
            <div className="checkmark-read">✓</div>
        </div>
    );
}
export default UserSimple