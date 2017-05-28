var React = require('react');
var ReactDOM = require('react-dom');

import {Grid, Col, Row} from 'react-bootstrap';
var browserHistory = require('react-router').browserHistory;
import {formatPrice} from '../Input/Util'


export default class ProductPreview extends React.Component {
  	constructor(props) {
		super(props);
		this.state = {

		}
  	}

  	goToProduct(){
  		browserHistory.push('/eg/' + this.props.product.product_id)
  	}



  	render() {
  		// hard coded for now

  		var date = this.props.product.sale_end_date
  		// if (this.state.invalid_product) return <div id = {this.props.product.product_id}/>
  		var col_size = this.props.col_size
		return (

			<div 
			id = {this.props.product.product_id} 
			onClick = {this.goToProduct.bind(this)}
			className = {"home-product-preview col-md-" + col_size + " col-lg-" + col_size}
			>
				<div className = "row home-product-preview-image-row">
					{this.props.product.images.length == 0 ? 
						<div> No Image For This Product </div>

							:
							<img 
							src = {"https://s3-us-west-2.amazonaws.com/publicmarketproductphotos/" 
							+ this.props.product.main_image}
							className = "img-responsive img-rounded center-block home-product-preview-image"/>
					}
				</div>
				<div className = "row home-product-preview-details">
						<span className = "home-product-preview-price"> ${formatPrice(this.props.product.price)} </span> <br/>
						<span className = "home-product-preview-name"> {this.props.product.name} </span> <br/>
						
						<span className = "home-product-preview-manufacturer"> By {this.props.product.manufacturer} </span> <br/>
				</div>
			</div>
		);
	}
}