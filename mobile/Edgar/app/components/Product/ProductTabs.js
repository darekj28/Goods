import React from 'react';
import {Component, PureComponent} from 'react'
import {StyleSheet,
		Text,
		View,
		Image,
		TouchableOpacity,
		Dimensions
} from 'react-native'
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view'

import ProductDescription from './ProductDescription'
import RelatedProducts from './RelatedProducts'
import ManufacturerInfo from './ManufacturerInfo'

const DESCRIPTION_KEY = "1"
const RELATED_PRODUCTS_KEY = "2"
const MANUFACTURER_KEY = "3"



export default class ProductTabs extends PureComponent {
	getProductDescriptionTab = () => <ProductDescription product = {this.props.product}/>
	getRelatedProductTab = () => <RelatedProducts product = {this.props.product}/>
	getManufacturerTab = () => <ManufacturerInfo product = {this.props.product}/>

	state = {
		index: 0,
		routes: [
			{ key: '1', title: 'Description' },
			{ key: '3', title: 'Maker' },
			{ key: '2', title: 'Related' },
		],
	};

	_renderLabel({route}){
		return <View style = {tab_styles.container}>
					<Text style = {tab_styles.label}> 
						{route.title}
					</Text>
				</View>
	}

	_handleIndexChange = index => this.setState({ index });

	_renderHeader = props => <TabBar {...props}
								renderLabel = {this._renderLabel}
								// labelStyle = {tab_styles.label}
								style = {tab_styles.container}
								indicatorStyle = {tab_styles.indicator}
								// scrollEnabled = {true}
							/>;

	_renderScene = SceneMap({
		'1': this.getProductDescriptionTab,
		'2': this.getRelatedProductTab,
		'3' : this.getManufacturerTab,
	});

	render() {
		return (
			<TabViewAnimated
				style = {styles.container}
				navigationState={this.state}
				renderScene={this._renderScene}
				renderHeader={this._renderHeader}
				onIndexChange={this._handleIndexChange}
				lazy = {true}

			/>
		);
	}
}

const tab_styles = StyleSheet.create({
	label : {
		color: 'black',
		fontSize : 14,
		// width : Dimensions.get('window').width / 3,
		textAlign : 'center',
	},
	container : {
		backgroundColor : 'white'
	},
	indicator: {
		backgroundColor : 'red',
		// width : Dimensions.get('window').width / 3,
	}
})

const styles = StyleSheet.create({
	container : {
		flex:  1,
	}
});
			





