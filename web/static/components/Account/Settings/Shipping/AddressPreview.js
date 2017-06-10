var React = require('react');
var ReactDOM = require('react-dom');
var Link = require('react-router').Link;
var browserHistory = require('react-router').browserHistory;
import AppStore from '../../../../stores/AppStore.js';

export default class AddressPreview extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			
		}
	}

	// will do this with a modal
	editAddress(){
		this.props.toggleModal(this.props.address)
	}

	onDeletePress(){
		var address = this.props.address
		swal({
		  title: "Ready?",
		  text: "Are you sure you want to delete : " + address.address_line1 + "?",
		  showCancelButton: true,
		  confirmButtonColor: "#DD6B55",
		  confirmButtonText: "Yes",
		  cancelButtonText: "No",
		  closeOnConfirm: true,
		  closeOnCancel: true
		},
		function () {
			this.deleteAddress.bind(this)()
		}.bind(this))
	}

	// shows a preview of the address 
	// then asks the user if they want to delete it
	deleteAddress(){
		this.props.deleteAddress(this.props.address)
	}

	setDefaultAddress(){
		this.props.setLoading(true)
		var data = {}
		data["jwt"] = localStorage.jwt
		data["address_id"] = this.props.address.id
		var form_data = JSON.stringify(data)
		$.ajax({
			type: "POST",
			url: "/setDefaultAddress",
			data: form_data,
			success: function(data) {
				if (!data.success) {
					swal("Sorry", "It seems there was an error setting a default address. " + data.error 
						+ ". Please try again", "warning")
				}
				else {
						swal({
							title: "Default address set",
							type: "success"
						})
						this.props.refreshSettings()
					}
				this.props.setLoading(false)
			}.bind(this),
			error : function(){
				console.log("error")
			},
			dataType: "json",
			contentType : "application/json; charset=utf-8"
		});
	}

	getDefaultButton(){
		if (this.props.address.id == AppStore.getCurrentUser().default_address) {
			return (
				<button className = "btn btn-default btn-sm" disable = {true}>
					Default address
				</button>
			)
		}
		else{
			return (
				<button className = "btn btn-default btn-sm" onClick = {this.setDefaultAddress.bind(this)}>
					Set as default 
				</button>
			)

		} 
	}




	render() {
		var address = this.props.address
		var default_button = this.getDefaultButton.bind(this)()

		return (
			<div className = "col-sm-4 col-md-4 col-lg-4 settings-preview-column grey-solid-border">
				<span className = "account-page-text block-span"> {address.name} </span>
				<span className = "account-page-text block-span">{address.address_line1}  </span>
				{address.address_line2 && <span className = "block-span"> {address.address_line2}  </span> }
				<span className = "account-page-text block-span"> 
					{address.address_city}, {address.address_state} {address.address_zip}
				</span>
				<span className = "account-page-text block-span">
					<div className = "small-buffer"/>
				</span>
				<span className = "block-span">
					{default_button}
					<button style = {{"margin-left":"8px"}}className = "btn btn-default btn-sm" onClick = {this.editAddress.bind(this)}>
						Edit
					</button>
					<button style = {{"margin-left":"8px"}} className = "btn btn-default btn-sm " onClick = {this.onDeletePress.bind(this)}>
						Delete
					</button>
					

				</span>
			</div>
		)
	}
}

