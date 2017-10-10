import React from 'react';
import {Component} from 'react'
import {
	View,
	Text,
	TouchableOpacity
} from 'react-native';
import {Actions} from 'react-native-router-flux'
import {connect} from 'react-redux'
import Icon from 'react-native-vector-icons/FontAwesome'
import IconBadge from 'react-native-icon-badge'

function mapStateToProps(state) {
	return {
		user : state.user
	}
	this.getCartIcon = this.getCartIcon.bind(this);
}

class CartIcon extends Component {

	constructor(props) {
		super(props)
		this.state = {
		}
	}

	navigateToCart(){
		Actions.cart()
	}

	render() {
		

		var badge_count = this.props.user.cart_size
		return (
			<TouchableOpacity 
				onPress = {this.navigateToCart}
				style = {{
						padding : 8,
						paddingRight : 4,
						paddingBottom : 4,
					}}
				>
				<IconBadge
					MainElement={
						<Icon 
							name = "shopping-cart"
							size = {24}
							style = {{
								paddingRight : 12,
								paddingTop : 0,
							}}
						/>
					}
					BadgeElement={
						<Text style={{color:'white', fontSize : 10}}>{badge_count}</Text>
					}
					IconBadgeStyle={{
						position:'absolute',
						top:-8,
						right:2,
						minWidth : 10,
						width:18,
						height:18,
						borderRadius:18,
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: '#FF0000',
						borderColor : 'white',
						borderWidth : 1,
					}}
					Hidden={!badge_count}
				/>	
			</TouchableOpacity>
		)
				
	}
}


export default connect(mapStateToProps)(CartIcon);