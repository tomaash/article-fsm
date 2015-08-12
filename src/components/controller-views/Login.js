import React from 'react';
import {Alert, Button, Well} from 'react-bootstrap';
import LoginActions from '../../actions/LoginActions';
import LoginStore from '../../stores/LoginStore';
import connectToStores from 'alt/utils/connectToStores';
import {facebook} from '../../../server/config';
/* global FB */
@connectToStores
export default class Login extends React.Component {
  static propTypes = {
    user: React.PropTypes.object
  }
  static getStores() {
    return [LoginStore];
  }
  static getPropsFromStores() {
    return LoginStore.getState();
  }
  constructor(props){
    super(props);
    this.state = {};
  }
  componentDidMount(){
    if (window.FB) {
      this.checkLoginState();
    } else {
      window.fbAsyncInit = () => {
        FB.init({
          appId: facebook.client_id,
          xfbml: true,
          version: 'v2.3'
        });

        this.checkLoginState();
      };

      // Load the SDK asynchronously
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = '//connect.facebook.net/en_US/sdk.js';
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    }
  }
  // testAPI() {
  //   console.log('Welcome!  Fetching your information.... ');
  //   FB.api('/me', (response) => {
  //     console.log(response);
  //     console.log('Successful login for: ' + response.name);
  //     this.setState({
  //       profile: response
  //     });
  //   });
  // }
  statusChangeCallback(response) {
    console.log(response);
    this.setState({response});
    // Logged into your app and Facebook.
    if (response.status === 'connected') {
      LoginActions.fblogin(response.authResponse);
      // this.testAPI();
    }
  }
  checkLoginState() {
    FB.getLoginStatus((response) => {
      this.statusChangeCallback(response);
    });
  }
  _handleLoginClick() {
    FB.login((status) => {
      console.log(status);
      this.checkLoginState();
    });
  }
  _handleLogoutClick() {
    FB.logout((status) => {
      console.log(status);
      LoginActions.logout();
      this.checkLoginState();
    });
  }

  render() {
    const status = this.state.response && this.state.response.status;
    var profile;
    var loginButton;
    var logoutButton;
    var loginMessage;
    var loadingIndicator;
    var successAlert;
    if (status === 'not_authorized') {
      loginMessage = 'Connect to ReactTest app';
    }
    else if (status === 'unknown') {
      loginMessage = 'Login to Facebook';
    }
    else if (status === 'connected') {
      successAlert = <Alert bsStyle="success">Client side logged in!</Alert>;
      logoutButton = (
        <Button
          bsStyle="primary"
          bsSize="large"
          onClick={this._handleLogoutClick.bind(this)}>
          Logout</Button>);

    } else {
      loadingIndicator = <p>Loading...</p>;
    }
    if (this.props.user) {
      profile = (
        <Well>
          <h2>Profile from server</h2>
          <h4>{this.props.user.name}</h4>
          <img src={this.props.user.picture}/>
        </Well>
      );
    }
    if (loginMessage) {
      loginButton = (
        <Button
          bsStyle="primary"
          bsSize="large"
          onClick={this._handleLoginClick.bind(this)}>
          {loginMessage}</Button>);
    }
    return (
      <div>
        <h1>Login</h1>
        {loadingIndicator}
        {loginButton}
        {successAlert}
        {profile}
        {logoutButton}
      </div>
    );
  }
}
