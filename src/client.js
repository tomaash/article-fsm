import Iso from 'iso';
import router from './router';
import React from 'react';
// import reactRoutes from './routes/routes.react';
import alt from './alt';

/*
  Once we bootstrap the stores, we run react-router using Router.HistoryLocation
  The element is created and we just render it into the container
*/

if (process.browser) {
  var chromeDebug = require('alt/utils/chromeDebug');
  chromeDebug(alt);
}

Iso.bootstrap(function (state, _, container) {

  // bootstrap the state from the server
  alt.bootstrap(state);

  router.run(function (Handler) {
    // req.params are passed in as props to the component
    let node = React.createElement(Handler);
    React.render(node, container);
  });
});

