import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';
import moment from 'moment';
import { ArtyomBuilder } from 'artyom.js';
let artyom = ArtyomBuilder.getInstance();
/* Bootstrap */
import { Grid, Row, Col } from 'react-bootstrap';

/* My Components */
import Sidebar from './sidebar';
import Header from './header';
import Message from './message';
import MessageBox from './messagebox';

/* Socket.io magic incatations. */
/* These two lines automatically connect to the server, allowing me */
/* to emit and receive events */
import io from 'socket.io-client';

var socket = io(`http://localhost:3000`);

export default class App extends Component {
    constructor(props) {
	super(props);
	this.state = {
	    username: "",
	    channel: "",
	    users: [],
	    messages:[],	    
	    channels:["General",
		      "Strtups",
		      "Wwwdev",
		      "Rationality",
		      "AskHC",
		      "ShowHC",
		      "Science",
		      "Design",
		      "Marketing"]	    
	};

	this.setUsername = this.setUsername.bind(this);
	this.joinChannel = this.joinChannel.bind(this);	
	this.generateMessage = this.generateMessage.bind(this);	
    }
    
	generateMessage(author, body){
	    return {
		author,
		body,
		createdAt: moment().valueOf()
	    }
	}
    setUsername(username){
	/* temporarily set state here to pass username conveniently to the server */
	/* getting username from get url and adding it to the state before I emit
	   join */
	this.setState({
	    username: username,
	    channel: this.props.params.channel
	}, () => {
  	    socket.emit('join', this.state, (err)=>{
		console.log(`${this.state.username} joined ${this.state.channel}`);
	    });
	});

    }

    componentDidMount() {
	socket.on('connect', () => {
				
	    /* Taking channel from the url parsed by router */
	    this.setState({messages:this.state.messages.concat([this.generateMessage("Admin","Please Type your Username")])});
		this.renderMessages()
	});
	
	socket.on('disconnect', () => {
	    /* console.log(">>>> src/components/chat.js:");
	       console.log('Disconnected from server');*/
	});

	/* Receive new message, add it to the state */
	socket.on(`server:newMessage`, data => {
	    /* Add new message to the state */
	    this.setState({
		messages: this.state.messages.concat([data])
	    });
		if (data.author == "Admin") {
			artyom.say(data.body);
		}
	    console.log(">>>> src/components/chat.js:");
	    console.log('Message received from server and added to state', data);
	    this.scrollToBottom();
	})

	/*Bot posts the first message*/
	socket.on(`server:first_hello`, data => {
	    /* Add new message to the state */
	    this.setState({
		messages: this.state.messages.concat([data])
	    });
	    this.scrollToBottom();
	})
	/* Update user list */
	socket.on('server:updateUserList', (users) => {
	    /* console.log('users list:', users);*/
	    this.setState({users});
	});
	fetch(`http://localhost:3000/api/cc`) 
            .then(result=> {
               return result.json()
            }).then(json=>{console.log('parsed json', json)})
    }

    joinChannel(channel) {
	if (!channel) {
	    var channel = "General";
	}
	/* Join channel */
	/* Server will make the socket join the channel I'm passing */
	/* And return all the messages from this channel as an acknowledgement. */
  	socket.emit('client:joinRoom', channel, (messages)=>{
	    console.log(messages);
	    this.setState({
		messages: messages
	    });
	});
    }
    
    scrollToBottom() {
	var messages = ReactDOM.findDOMNode(this.refs.messages);
	var clientHeight = messages.clientHeight;
	var scrollTop = messages.scrollTop;
	var scrollHeight = messages.scrollHeight;	
	var messageHeight = 44;
	if (clientHeight + scrollTop + messageHeight + messageHeight >= scrollHeight) {
	    console.log('should scroll');
	    messages.scrollTop = scrollHeight;
	}
    };
    
    renderMessages() {
	const messages = this.state.messages;
	/* console.log(">>>> src/components/chat.js:");
	   console.log('Taking messages from the state and rendering them');*/
	if (!messages) {
	    return (
		<p>No messages.</p>
	    );
	};
	return messages.map((message) => {
	    var formattedDate = moment(message.createdAt).fromNow();
	    /* .format('YYYY-MM-DD')*/
	    if (message.author =="Admin") {
			return (
				<div className="message new" key={message.createdAt}>
					<figure className="avatar">
						<img src="http://askavenue.com/img/17.jpg"/>
					</figure>
					{message.body}
					<div className="timestamp">{formattedDate}</div>
					<div className="checkmark-sent-delivered">✓</div>
					<div className="checkmark-read">✓</div>
				</div>
			)
		}else{
			return(
				<div className="message message-personal new">{message.body}
					<div className="checkmark-sent-delivered">✓</div>
					<div className="checkmark-read">✓</div>
				</div>
			)
}

	});
    }
    
    
    render() {
	/* router parses url for me, and I'm grabbing get parameters */
	/* var username = this.props.location.query.username;*/
	/* console.log(this.props.location);*/

	return (
	    <div className="mainWrapper">


		<div className="avenue-messenger">
				<Header/>
				<div className="chat">
					<div className="chat-title">
						<h1>Admin</h1>
						<h2>RE/MAX</h2>
					</div>
					<div className="messages" ref="messages">
					<div className="messages-content mCustomScrollbar _mCS_1">
					<div id="mCSB_1" className="mCustomScrollBox mCS-light mCSB_vertical mCSB_inside" style={{maxHeight: "none"}} >
					<div id="mCSB_1_container" className="mCSB_container" style={{position: "relative", top: "0px", left: "0px"}} >
						{ this.renderMessages() }
						<div className="message loading new"><figure className="avatar"><img src="http://askavenue.com/img/17.jpg"/></figure><span></span></div>
					</div>
					</div>
					</div>
					</div>

					   <MessageBox socket = { socket }
							username={this.state.username}
							setUsername = {this.setUsername}
							channel={this.props.params.channel}/>
				</div>
		</div>

  
	    </div>
	);
    }
}
