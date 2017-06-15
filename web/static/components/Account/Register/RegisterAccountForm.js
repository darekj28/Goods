var React = require('react');
var ReactDOM = require('react-dom');
var browserHistory = require('react-router').browserHistory;
import AppActions from '../../../actions/AppActions.js';
import TextInput from '../../Input/TextInput.js'
const form_labels = ['Name', "Email", "Password", "Confirm Password"]
const form_inputs = ["name", "email", "password", "password_confirm"]
const input_types = ['text', 'text', 'password', 'password']
const popover_text = [null, null, "Passwords must be at least 6 characters" , "Passwords must be at least 6 characters"]
var Link = require('react-router').Link
import AccountInput from '../../Input/AccountInput'

export default class RegisterAccountForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: "",
			email: "",
			password: "",
			password_confirm : "",
			disabled: false,
			form_times : form_inputs.map((input) => 0)
		}
	}

	// handle the text input changes
	onTextInputChange(event) {
		var obj = {}
		obj[event.target.name] = event.target.value
		this.setState(obj)
	}

	onSubmitPress(event){
		event.preventDefault()
		swal({
			title: "Ready?",
			text: "Is all your information correct?",
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: "Yes",
			cancelButtonText: "No",
			closeOnConfirm: false,
			closeOnCancel: true
		},
		function () {
			this.props.setLoading(true)
			setTimeout(function (){
				this.submitData.bind(this)()
			}.bind(this),100)
			swal.close()
		}.bind(this))
	}

	submitData(){
		if (!this.state.disabled) {
			this.setState({disabled : true})
			var data = {}
			for (var i = 0; i < form_inputs.length; i++){
				var key = form_inputs[i]
				data[key] = this.state[key]
			}
			var form_data = JSON.stringify(data)
			$.ajax({
				type: "POST",
				url: "/registerUserAccount",
				data: form_data,
				success: function(data) {
					this.props.setLoading(false)
					if (!data.success) {
						swal(data.error.title, data.error.text , data.error.type)
					}
					else {
						ga('send', 'pageview', 'register-complete');
						AppActions.addCurrentUser(data.user, data.jwt)
						console.log(data.jwt)
						swal({
							title: "Thank you", 
							text : "Your account has been created. You should receive a confirmation email shortly",
							type: "success"},
							function () {
								window.location = '/'
							}.bind(this)
						)
					}
					
					this.setState({disabled : false})
				}.bind(this),
				error : function(){
					ga('send', 'event', {
						eventCategory: ' server-error',
						eventAction: 'registerUserAccount'
					});
					this.props.setLoading(false)
					this.setState({disabled : false})
				}.bind(this),
				dataType: "json",
				contentType : "application/json; charset=utf-8"
			});
		}
	
	}

	onKeyPress(e){
		// e.preventDefault()
		if (e.key === 'Enter') {
			this.onSubmitPress.bind(this)(event)
		}
	}

	onFocus(event) {
		ga('send', 'pageview', 'register-' + event.target.name);
	}


	componentDidMount(){
		$('[data-toggle="popover"]').popover(); 
	}

	render() {
		var text_inputs = form_inputs.map((form_input, index) => {
			return <AccountInput 
						index = {index}
						tabindex = {index}
						onKeyPress = {this.onKeyPress.bind(this)}
						field = {form_input}
						name = {form_input}
						className="form-control input-lg" 
						type = {input_types[index]}
						onChange = {this.onTextInputChange.bind(this)}
						value = {this.state[form_input]} 
						label = {form_labels[index]}
						popover_text = {popover_text[index]}
						onFocus = {this.onFocus.bind(this)}
					/>
		})

		return (
			<div className = "panel panel-primary account-panel">
				<div className = "panel-body account-panel-body">
					<h2 className = "account-header"> Create Account </h2>
					<form className = "form-horizontal" onSubmit = {this.onSubmitPress.bind(this)} >
						{text_inputs}
						<div className = "form-group row">
							<div className = "col-sm-12 col-md-12 col-lg-12">
								<button className = "btn btn-default" disabled = {this.state.disabled}
								 className = "account-button" onClick = {this.onSubmitPress.bind(this)}>
									Sign Up
								</button>
							</div>
						</div>

						<div className = "form-group row text-center">
							<div className = "col-sm-12 col-md-12 col-lg-12">
								By creating an account you agree to Edgar USA's 
								<a href = "/terms"> {"Terms of Service"} </a>
							</div>
						</div>

						<div className = "form-group row text-center">
							<div className = "col-sm-12 col-md-12 col-lg-12">
								Already have an account? 
								<a href = "/login"> {"Log in"} </a>
							</div>
						</div>
					</form>
				</div>
			</div>
		)
	}
}

