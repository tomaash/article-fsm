import Router from 'react-router';
import routes from './routes/routes.react';

var config = {routes};
if (process.browser) {
  config.location = Router.HistoryLocation;
}

const router = Router.create(config);

export default router;
