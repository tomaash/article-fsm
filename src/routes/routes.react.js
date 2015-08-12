import React from 'react';
import {Route, DefaultRoute} from 'react-router';

import App from '../components/controller-views/App';
import Login from '../components/controller-views/Login';
import Profile from '../components/controller-views/Profile';
import Articles from '../components/controller-views/Articles';

const routes = (
  <Route name='home' path='/' handler={App}>
    <DefaultRoute name='articles' handler={Articles} />
    <Route name='login' path='/login' handler={Login} />
    <Route name='profile' path='/profile' handler={Profile} />
  </Route>
);

module.exports = routes;
