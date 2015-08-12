import alt from '../alt';
import {defer} from 'lodash';
import LoginActions from '../actions/LoginActions';
import router from '../router';

const USER_STORAGE_KEY = 'reactTestUser';

class LoginStore {
  constructor() {
    this.bindActions(LoginActions);
    this.user = null;
    this.error = null;
    this.apiConfig = {};
  }
  saveUser(data) {
    if (data.ok) {
      this.storeUser(data.user);
      this.redirectToHome();
    }
    else {
      this.clearUser();
      this.error = data.error.message;
      this.redirectToLogin();
    }
  }
  storeUser(user) {
    this.user = user;
    this.error = null;
    this.apiConfig = {
      headers: {
        'auth-token': user.token
      }
    };
    // api.updateToken(user.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
  loadLocalUser() {
    if (!process.browser) {
      return;
    }
    var user;
    try {
      user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
    } finally {
      if (user) {
        this.storeUser(user);
      }
    }
  }
  clearUser() {
    this.user = null;
    this.apiConfig = {};
    localStorage.removeItem(USER_STORAGE_KEY);
  }
  redirectToHome() {
    defer(router.transitionTo.bind(this, 'articles'));
  }
  redirectToLogin() {
    defer(router.transitionTo.bind(this, 'login'));
  }
  onFblogin(data) {
    this.saveUser(data);
  }
  onLogout() {
    this.clearUser();
    this.redirectToLogin();
  }
}

module.exports = (alt.createStore(LoginStore));
