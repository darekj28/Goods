
import React from 'react';
import {Component} from 'react'
import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	Image,
	Dimensions,
} from 'react-native'
import {Actions} from 'react-native-router-flux'


const img_src = "https://s3-us-west-2.amazonaws.com/edgarusahomepage/"

export default class HomeMadeInUsaSection extends Component {
	

	constructor(props) {
		super(props)
		this.state = {
	
		}
	}
	
	


	render() {
		var usa_url = img_src + "mia1.jpeg"
		return (
				
				<TouchableOpacity style = {styles.container} onPress = {() => Actions.madeinusa()}>
					<Text style = {styles.text}>
						Learn exactly what it means to be Made in USA right here
					</Text>

					<Image 
					style = {[styles.image]}
					source={{uri : usa_url,
						cache : 'force-cache'
					}} />

					
				</TouchableOpacity>
			

		)
	}
}

const styles = StyleSheet.create({
	container : {
		flexDirection : 'column',
		paddingTop: 8,
		borderBottomWidth : 1,
		borderBottomColor : 'darkblue',
		backgroundColor : 'white',
	},
	image : {
		height:  Dimensions.get('window').height * 0.35,
		width : Dimensions.get('window').width,	
	},
	text: {
		paddingTop : 0,
		padding : 16,
		fontSize : 20,
		color: 'darkblue'
	}
})


