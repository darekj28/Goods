var React = require('react');
var ReactDOM = require('react-dom');
var browserHistory = require('react-router').browserHistory;
import AppStore from '../../../stores/AppStore'
import PageContainer from '../../Misc/PageContainer'
import Spinner from '../../Misc/Spinner'
import LoginBox from './LoginBox'


const LOGIN_STATE = 0
const REGISTER_STATE = 1
const BACKGROUND_IMAGE = "https://s3-us-west-2.amazonaws.com/edgarusahomepage/usalarge.gif"

export default class LoginPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			is_loading : false,
			form_state : REGISTER_STATE
		}
	}

	componentDidMount(){
		var user = AppStore.getCurrentUser()
		if (user) {
			if (!user.is_guest) {
				window.location = '/'	
			}
		}
	}

	setLoading(is_loading) {
		this.setState({is_loading : is_loading})
	}

	setFormState(form_state) {
		this.setState({form_state : form_state})
	}



	render() {
		var background_style = {
			backgroundImage : "url(" + BACKGROUND_IMAGE + ")",
			height: "530px",
			backgroundSize : "cover"
		}
		return (
			<PageContainer>
				<div style = {background_style}>
					<div className="edgar-container-fluid" className = "responsive-site">
						<div className="edgar-fixed-container">
							<div className="edgar-row log-out-wrapper">
								<div className="inviteWrapper edgar-col-xs-60">
									<div className="edgar-row">
										<div className="edgar-col-xs-60">
											<div className="newLoginProcess edgar-row">
												
												<LoginBox 
												setFormState = {this.setFormState.bind(this)}
												form_state = {this.state.form_state} />


												<div className="clear">
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</PageContainer>
			
		)
	}
}

