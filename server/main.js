import koa from 'koa';
import koaRouter from 'koa-router';
import bodyparser from 'koa-bodyparser';
import serve from 'koa-static';
import jade from 'koa-jade';
import favicon from 'koa-favicon';
import mount from 'koa-mount';

import locals from 'koa-locals';

import Router from 'react-router';
import React from 'react';
import Iso from 'iso';

import path from 'path';

import isoRoutes from './routes.iso';
import rest from './rest';
import reactRoutes from '../src/routes/routes.react';
import alt from '../src/alt';
import auth from './auth';

const port = process.env.PORT || 8080;
const app = koa();
const router = koaRouter();

app.use(jade.middleware({
  viewPath: path.join(__dirname, '../templates'),
  debug: false,
  pretty: false,
  compileDebug: false
}));

app.use(mount('/public', serve(path.join(__dirname, '../public'))));

app.use(favicon(path.join(__dirname, '../public/favicon.ico')));

app.use(bodyparser());

locals(app, {});

/* routing from express, we pass data fetched via express' locals */
isoRoutes(router);

auth(app);
rest(router);
app
  .use(router.routes())
  .use(router.allowedMethods());

// We use react-router to run the URL that is provided in routes.jsx
var getHandler = function(routes, url) {
  return new Promise(function(resolve){
    Router.run(routes, url, function (Handler) {
      resolve(Handler);
    });
  });
};

app.use(function *(next) {
  yield next;
  // Skip frontend router for api
  if (this.request.url.match('/api/')) {
    return;
  }
  // We seed our stores with data
  const handler = yield getHandler(reactRoutes, this.request.url);
  // NO ASYNC HERE! (otherwise BOOM)
  alt.bootstrap(JSON.stringify(this.locals.data || {}));
  const node = React.renderToString(React.createElement(handler));
  var iso = new Iso();
  iso.add(node, alt.flush());
  // END NO ASYNC

  this.render('layout', {html: iso.render()});
});

/* logging to the server */
app.listen(port, function() {
  console.log('Application started on ' + port);
});

