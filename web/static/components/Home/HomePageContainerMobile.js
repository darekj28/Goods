var React = require('react');
var ReactDOM = require('react-dom');
import HomeProductPreviewMobile from './HomeProductPreviewMobile'
import HomePageSingleImage from './HomePageSingleImage'
const HOME_TAG = "Home_Page"

export default class HomePageContainerMobile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			products : [],
		}
	}

	componentDidMount(){
	}


	orderProducts(product_list) {
		var ordered_products = []
		product_list.map((product, index) => {
			if (product.inventory == 0) {
				ordered_products.push(product)
			}
			else {
				ordered_products.unshift(product)
			}
		})
		return ordered_products
	}
	
	render() {
		var ordered_products = this.orderProducts(this.props.products)
		var products = ordered_products.map((product, index) =>
				<div className = "row">
					<HomeProductPreviewMobile product = {product}/>
				</div>
			)

		return (
			<div className = "hidden-sm hidden-md hidden-lg">
				<div className = "top-buffer"/>
				<HomePageSingleImage />
				<div style = {{"marginBottom" : "-10px"}} className ="container-fluid">
					{products}
				</div>
			</div>
			);
	}
}