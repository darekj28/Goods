var React = require('react');
var ReactDOM = require('react-dom');
var browserHistory = require('react-router').browserHistory;
import AppActions from '../../actions/AppActions'
import TextInput from '../Misc/Input/TextInput.js'


export default class AdminLoginPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username : "",
			password : "",
		}
}

	// this has to be moved to the server side, will do when I'm back from dinner 3/11
	onLoginSubmit() {
		this.props.onLoginSubmit(this.state.username, this.state.password)
	}

	onTextInputChange(field, value) {
		var obj = {}
		obj[field] = value
		this.setState(obj)
	}

	// this has to be moved to the server side, will do when I'm back from dinner 3/11
	onLoginSubmit() {
		var form_data = JSON.stringify({
			'username' : this.state.username,
			'password' : this.state.password 
		})
		$.ajax({
			type: "POST",
			data: form_data,
			url: "/checkAdminLogin",
			success: function(data) {
				if (data.success) {
					AppActions.addCurrentUser(data.user, data.jwt)
					browserHistory.push('/adminTools')
				}
				else {
					swal("nice try!")
				}
			}.bind(this),
			dataType: "json",
			contentType : "application/json; charset=utf-8"
		})
	}

	render() {
		return (
			<div>
				<h2> Heathcliffe required </h2>
				<TextInput label = "Username" onTextInputChange = {this.onTextInputChange.bind(this)}
					 value = {this.state.username} field = "username" input_type = "text"/>
				<TextInput label = "Password" onTextInputChange = {this.onTextInputChange.bind(this)}
				value = {this.state.password} field = "password" input_type = "password"/>
				<div>
					<button onClick = {this.onLoginSubmit.bind(this)}> Admin Login </button>
				</div>
			</div>
		);
	}
}