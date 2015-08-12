import React from 'react';
import {Navbar, Nav} from 'react-bootstrap';
import {NavItemLink} from 'react-router-bootstrap';

import {RouteHandler} from 'react-router';
import LoginActions from '../../actions/LoginActions';

/* global FB */
export default class App extends React.Component {
  constructor(props) {
    super(props);
    LoginActions.loadLocalUser();
  }
  _logout() {
    FB.logout((status) => {
      console.log(status);
      LoginActions.logout();
    });
  }
  render() {
    return (
      <div className="container app">
        <Navbar brand='FB Login Test'>
          <Nav>
            <NavItemLink to='login'>Login</NavItemLink>
            <NavItemLink to='profile'>Profile</NavItemLink>
            <NavItemLink to='articles'>Articles</NavItemLink>
          </Nav>
          <ul className="nav navbar-nav pull-right space-right">
            <li onClick={this._logout.bind(this)}>
              <a href="#">Logout</a>
            </li>
          </ul>
        </Navbar>
        <RouteHandler {...this.props} />
      </div>
    );
  }
}

