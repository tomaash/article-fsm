import alt from '../alt';
import axios from 'axios';

class LoginActions {
  constructor() {
    this.generateActions('logout', 'loadLocalUser');
  }
  async fblogin(data) {
    try {
      const response = await axios.post('/auth/fblogin', data);
      this.dispatch({ok: true, user: response.data});
    } catch (err) {
      this.dispatch({ok: false, error: err});
    }
  }
}

module.exports = alt.createActions(LoginActions);
