var React = require('react');
var ReactDOM = require('react-dom');
import {Grid, Row, Col, Button} from 'react-bootstrap';
import HomeProductPreview from './HomeProductPreview'

const product_id_list = [1,2,3,4,5,6,7,8, 21]
export default class HomePageMainContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			products : [],
		}
	}

	componentDidMount(){
		this.fetchProductInformation.bind(this)()
	}


	fetchProductInformation(){
	  	var form_data = JSON.stringify({
				"product_id_list" : product_id_list
			})
		$.ajax({
		  type: "POST",
		  url: "/getBatchedProductInformation",
		  data: form_data,
		  success: function(data) {
			if (!data.success){
				console.log(data.error)
			}
			else {
				this.setState({products : data.products})
			}
		  }.bind(this),
		  error : function(){
			console.log("error")
		  },
		  dataType: "json",
		  contentType : "application/json; charset=utf-8"
		})
	}
	
	render() {
		// for now these are hard coded preview products
		
		// make sure this is divides 12
		var items_per_row = 4


		var products = this.state.products.map((product, index) =>
				<HomeProductPreview col_size = {12 / items_per_row} product = {product}/>
			)

		var product_rows = []

		var num_rows = Math.floor((products.length - 1) / items_per_row + 1)
		// console.log(num_rows)
		for (var i = 0; i < num_rows; i++){
			var this_row = []
			for (var j = i * items_per_row; j < items_per_row * (i+1); j++){
				if (j < products.length){
					this_row.push(products[j])
				}
				else {
					console.log("did not add item " + j)		
				}
			}
			product_rows.push(
				<div className = "row row-eq-height product-preview-row">
					{this_row}
				</div>
			)
		}


		return (
			<div className = "container-fluid home-container">
				<div className="row show-grid">
					<div className = "col-xs-12 col-md-12 col-sm-12 col-lg-12">
						<div>
							<center>
								<div id = "text-part">	
									<h1>
										<b>
											Weekly Deals on American Made Products
										</b>
									</h1>
									
								</div>
								<br/>
							      
							</center>
						</div>
					</div>
				</div>
				
				<div className = "container-fluid home-product-preview-container">
					<div className = "container">
						{product_rows}
					</div>
				</div>
				
			</div>
			);
	}
}