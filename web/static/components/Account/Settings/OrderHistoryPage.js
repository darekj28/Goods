var React = require('react');
var ReactDOM = require('react-dom');
var Config = require('Config')
var url = Config.serverUrl
import AppStore from '../../../stores/AppStore.js';
import TopNavBar from '../../Misc/TopNavBar'
import PastOrdersDisplay from './PastOrdersDisplay.js'
var browserHistory = require('react-router').browserHistory;

export default class OrderHistoryPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			past_orders : []
		}
	}

	// no need to be on settings if no one is logged in
	componentWillMount(){
		var current_user = AppStore.getCurrentUser()
		if (current_user == null || !current_user || current_user == {}){
			browserHistory.push('/')
		}
	}


	componentDidMount(){
			var request_data = JSON.stringify({
				"user" : AppStore.getCurrentUser()
			})
			$.ajax({
			  type: "POST",
			  url: url + "/getUserOrders",
			  data : request_data,
			  success: function(data) {
				this.setState({past_orders: data.orders})
			  }.bind(this),
			  error : function(){
				console.log("error")
			  },
			  dataType: "json",
			  contentType : "application/json; charset=utf-8"
			});
	}

	render() {
		return (
			<div>
				<TopNavBar />
				<div className = "container">
					 {/* <SettingsFormPersonal /> */}
					 <PastOrdersDisplay past_orders = {this.state.past_orders}/>
				</div>
			</div>	
		)
	}
}

