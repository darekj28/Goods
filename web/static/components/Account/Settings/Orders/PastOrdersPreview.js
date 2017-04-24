var React = require('react');
var ReactDOM = require('react-dom');
var Link = require('react-router').Link;
var browserHistory = require('react-router').browserHistory;
import AppStore from '../../../../stores/AppStore.js';
import {Row, Grid} from 'react-bootstrap'
import OrderDisplay from './OrderDisplay.js'

export default class PastOrdersPreview extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			past_orders : []
		}
	}

	

	componentDidMount(){
			var request_data = JSON.stringify({
				"jwt" : localStorage.jwt,
				"user" : AppStore.getCurrentUser()
			})
			$.ajax({
			  type: "POST",
			  url: "/getUserOrders",
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
		var orders = this.state.past_orders
		if (orders.length == 0){
			var order_display = <h1> You haven't bought anything on <a href = "/"> Edgar USA </a> yet.</h1>
		}
		else {
			var order_display = orders.map((order, index) => {
				if (index < 5){
					return (
						<Row>
							<OrderDisplay order = {order} index = {index} />
						</Row>
						)
					}
				}
			)
		}
	
		return (
			<div>
				<Link to = "/orders"> Click to View Past Orders </Link>
				<Grid>
					{order_display}
				</Grid>
			</div>	
		)
	}
}

