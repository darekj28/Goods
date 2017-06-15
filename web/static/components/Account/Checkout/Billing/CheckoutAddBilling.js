var React = require('react');
var ReactDOM = require('react-dom');
var browserHistory = require('react-router').browserHistory;
import AppStore from '../../../../stores/AppStore.js';
import AppActions from '../../../../actions/AppActions.js';
import TextInput from '../../../Input/TextInput.js'
import CreditCardInput from '../../../Input/CreditCardInput.js'
import AddressForm from '../../../Input/AddressForm.js'

const address_inputs = ["address_city", "address_country",
					"address_line1", "address_line2", "address_zip",
					"addresss_name"]

export default class CheckoutAddBilling extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name : "",
			number: "",
			expiry: "",
			cvc : "",
			address_name : "",
			address_city : "",
			address_country : "US",
			address_line1 : "",
			address_line2 : "",
			address_zip : "",
			addresss_state: "",
			use_same_as_shipping : true
		}
	}

	// handle the text input changes
	onTextInputChange(field, value){
		var obj = {}
		obj[field] = value
		this.setState(obj)
	}

	useSameAddressChange(){
		this.setState({
			use_same_as_shipping : !this.state.use_same_as_shipping
		})
	}

	onSubmitPress(){
		swal({
		  title: "Ready?",
		  text: "Is all your information correct?",
		  showCancelButton: true,
		  confirmButtonColor: "#DD6B55",
		  confirmButtonText: "Yes",
		  cancelButtonText: "No!",
		  closeOnConfirm: true,
		  closeOnCancel: true
		},
		function () {
			this.addCreditCard.bind(this)()
		}.bind(this))
	}

	addCreditCard(){
		this.props.setLoading(true)
		this.props.toggleModal()
		var data = {}
		if (this.state.use_same_as_shipping){
			for (var i = 0; i < address_inputs.length; i++){
				var key = address_inputs[i]
				data[key] = this.props.selected_address[key]
			}	
		}	
		else {
			for (var i = 0; i < address_inputs.length; i++){
				var key = address_inputs[i]
				data[key] = this.state[key]
			}	
		}
		
		data['name'] = this.state.name
		data['cvc'] = this.state.cvc
		data['number'] = this.state.number
		data['exp_month'] = this.state['expiry'].split('/')[0]
		data['exp_year'] = this.state['expiry'].split('/')[1]
		data["jwt"] = localStorage.jwt
		var form_data = JSON.stringify(data)
		$.ajax({
			type: "POST",
			url: "/addCreditCard",
			data: form_data,
			success: function(data) {
				if (!data.success) {
					swal(data.error.title, data.error.text , data.error.type)
				}
				else {
					swal({
							title: "Thank you!", 
							text : "Your changes have been made",
							type: "success"
						})
					
					this.props.onAddingNewBillingMethod()
				}
				this.props.setLoading(false)

			}.bind(this),
			error : function(){
				ga('send', 'event', {
						eventCategory: ' server-error',
						eventAction: 'addCreditCard',
						eventLabel: AppStore.getCurrentUser().email
					});
			},
			dataType: "json",
			contentType : "application/json; charset=utf-8"
		});
	}

	render() {
		return (
			<div className = "container">
				<div className = "row">
					<div className = "col-sm-10 col-md-10 col-lg-10">
						
						
						<CreditCardInput onSubmit = {this.onSubmitPress.bind(this)}
						 onTextInputChange = {this.onTextInputChange.bind(this)} />
						
						<div className = "row">
							<div className="checkbox">
							  <label>
							  	<input disabled = {!this.props.selected_address} 
							  		checked = {this.state.use_same_as_shipping}
							  		id = "same_address_checkbox" name = "same_address" 
							  		 onClick = {this.useSameAddressChange.bind(this)} type="checkbox"/>
							  	 Use same address from shipping </label>
							</div>
							{
								!this.props.selected_address &&
								<small>	
									You must select an address before you can use this option. 
								</small>
							}
						</div>


						{ !this.state.use_same_as_shipping &&
							
								<AddressForm 
								onSubmit = {this.onSubmitPress.bind(this)}
								has_description = {false}
								onTextInputChange = {this.onTextInputChange.bind(this)}/>
						}
						
						<div className = "row">
							<div className = "col-md-11 col-lg-11 ">
								<button className = "btn btn-default" className = "pull-right"
								onClick = {this.onSubmitPress.bind(this)}>
									Add Billing Method
								</button>
							</div>
						</div>
						
					</div>
				</div>
			</div>
			
		)
	}
}

