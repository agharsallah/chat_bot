import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Button, Navbar, Nav, NavItem } from 'react-bootstrap';
import { IndexLinkContainer, LinkContainer } from 'react-router-bootstrap';

export default class Header extends Component {
    render() {
	return (
			<div className="agent-face">
				<div className="half">
				<img className="agent circle" src="./img/bot.png" /></div>
			</div>
	);
    }
}


