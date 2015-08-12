import React from 'react';
import LoginStore from '../../stores/LoginStore';
import connectToStores from 'alt/utils/connectToStores';

@connectToStores
export default class Profile extends React.Component {
  static propTypes = {
    user: React.PropTypes.object
  }
  static getStores() {
    return [LoginStore];
  }
  static getPropsFromStores() {
    return LoginStore.getState();
  }
  render() {
    if (!this.props.user) {
      return <h1>Not logged in</h1>;
    }
    return (
      <div>
        <h1>Profile</h1>
        <h4>{this.props.user.name}</h4>
        <img src={this.props.user.picture}/>
      </div>
    );
  }
}
