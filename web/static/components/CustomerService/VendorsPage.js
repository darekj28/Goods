var React = require('react');
var ReactDOM = require('react-dom');

var browserHistory = require('react-router').browserHistory
import PageContainer from '../Misc/PageContainer'

import {AlertMessages} from '../Misc/AlertMessages'

export default class VendorsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		}
	}


	render() {
		return (
				<PageContainer>
					<div className = "container">
						<h1> Vendors Page </h1>
					</div>
				</PageContainer>
		);
	}
}