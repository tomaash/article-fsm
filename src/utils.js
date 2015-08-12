module.exports = {
  addChangeHandler: function(target) {
    target.prototype._changeHandler = function(key, attr, event) {
      var state = {};
      state[key] = this.state[key] || {};
      state[key][attr] = event.currentTarget.value;
      this.setState(state);
    };
    return target;
  },
  requireAuthentication: function(target) {
    target.willTransitionTo = function(transition) {
      if (process.browser) {
        if (!localStorage.reactTestUser) {
          transition.redirect('/login');
        }
      }
    };
    return target;
  }
};
