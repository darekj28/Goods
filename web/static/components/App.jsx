var React = require('react');
var ReactDOM = require('react-dom');

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			test: ""
		}
	}

		onSubmitPress(){
			var real_url = "https://whereisitmade.herokuapp.com"
			var test_url = "http://0.0.0.0:5000"
			var product_name = document.getElementById('product_name').value
			var url_link = document.getElementById('url_link').value
			var location = document.getElementById('location').value
			var manufacturer_name = document.getElementById('manufacturer_name').value
			var contact_information = document.getElementById('contact_information').value
			var origin = document.getElementById('origin').value
			var barcode_upc = document.getElementById('barcode_upc').value
			var additional_info = document.getElementById('additional_info').value
			// check if an image is submitted
			var image_div = document.getElementById('image')
			if (image_div.files.length > 0) {
				var image_file = image_div.files[0]
				var reader = new FileReader()
				reader.readAsDataURL(image_file)

				reader.onloadend = function( ){
	    			var data = reader.result
	    			var trim_image_data = data.split(',')[1]
	    			var image_list = []
	    			image_list.push(trim_image_data)
					  	var formData = JSON.stringify({
					  		"product_name" : product_name,
					  		"url_link" : url_link,
					  		"location" : location,
					  		"manufacturer_name" : manufacturer_name ,
					  		"contact_information" : contact_information,
					  		"images" : image_list,
					  		"origin" : origin,
					  		"barcode_upc" : barcode_upc,
					  		"additional_info" : additional_info

					  	})
					  	$.ajax({
						  type: "POST",
						  url: real_url  + "/userSubmitProductInformation",
						  data: formData,
						  success: function() {
						  		window.location.reload();
						  },
						  error : function(){
						  	console.log("error")
						  },
						  dataType: "json",
						  contentType : "application/json; charset=utf-8"
						});
					}
				}

			// otherwise we submit if there is no photo
			else {
				var formData = JSON.stringify({
					  		"product_name" : product_name,
					  		"url_link" : url_link,
					  		"location" : location,
					  		"manufacturer_name" : manufacturer_name ,
					  		"contact_information" : contact_information,
					  		"origin" : origin,
					  		"barcode_upc" : barcode_upc,
					  		"additional_info" : additional_info
					  	})
				$.ajax({
						  type: "POST",
						  url: real_url + "/browserSubmitInformation",
						  data: formData,
						  success: function() {
						  		window.location.reload();
						  },
						  error : function(){
						  	console.log("error")
						  },
						  dataType: "json",
						  contentType : "application/json; charset=utf-8"
					});
			}
		}
	render() {
		return (
			<div> 
				<a href = "/adminLogin">  Click here for admin login </a>
				<div id = "form">
						Product Name:  <input type="text" id = "product_name"/><br/>
						Manufacturer Name:  <input type="text" id = "manufacturer_name"/><br/>
						Location:  <input type="text" id = "location"/><br/>
						Url Link:  <input type="text" id = "url_link"/><br/>
						Contact Information:  <input type="text" id = "contact_information"/><br/>
						Origin:  <input type="text" id = "origin"/><br/>
						Additional Info:  <input type="text" id = "additional_info"/><br/>
						Barcode UPC:  <input type="text" id = "barcode_upc"/><br/>
						Image:  <input type="file" accept = "image/*" id = "image"/> <br/>
						<button type="submit" id = "submit_button"> Submit </button>
				</div>
			</div>
			)
		}
	}

