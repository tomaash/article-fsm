import generateApi from 'koa-mongo-rest';
import Article from './models/article';
import User from './models/user';
// import bcrypt from 'bcrypt';
import uuid from 'node-uuid';
import axios from 'axios';
import {facebook} from './config';
import url from 'url';
import graph from 'fbgraph';
import promisify from 'es6-promisify';
graph.get = promisify(graph.get);

export default function(app) {
  const mongoUrl = process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || '127.0.0.1:27017/fbloginalt';
  const mongoose = require('mongoose');
  mongoose.connect(mongoUrl);

  generateApi(app, Article, '/api');

  app.post('/auth/fblogin', function *(next) {
    const shortToken = this.request.body.accessToken;
    const fbid = this.request.body.userID;
    const params = {
      'grant_type': 'fb_exchange_token',
      'client_id': facebook.client_id,
      'client_secret': facebook.client_secret,
      'fb_exchange_token': shortToken
    };
    try {
      const response = yield axios.get('https://graph.facebook.com/oauth/access_token', {params});
      // Facebook token refresh response is in url params format. Weird.
      const data = url.parse('?' + response.data, true);
      const fbtoken = data.query.access_token;
      graph.setAccessToken(shortToken);
      var profile = yield graph.get('me', {fields: 'id,name,picture'});
      var user = yield User.findOne({fbid});
      if (!user) {
        user = new User({fbid});
      }
      user.fbtoken = fbtoken;
      user.name = profile.name;
      user.picture = profile.picture.data.url;
      user.token = user.token || uuid.v1();
      user = yield user.save();
      this.body = user;
    } catch (err) {
      console.error(err);
      this.body = err.data.error;
      this.status = 401;
    }
  });

  // app.post('/auth/register', function *(next) {
  //   yield next;
  //   const SALT_WORK_FACTOR = 10;
  //   const error = {message: 'Username already exists'};
  //   try {
  //     const body = this.request.body;
  //     const salt = yield bcrypt.genSalt.bind(this, SALT_WORK_FACTOR);
  //     const hash = yield bcrypt.hash.bind(this, body.password, salt);
  //     body.password = hash;
  //     body.token = uuid.v1();
  //     const result = yield User.create(body);
  //     this.status = 201;
  //     this.body = result;
  //   } catch (err) {
  //     this.status = 409;
  //     this.body = error;
  //   }
  // });

  // app.post('/auth/login', function *(next) {
  //   yield next;
  //   try {
  //     const body = this.request.body;
  //     const error = {message: 'Username and password doesn\'t match'};
  //     const user = yield User.findOne({
  //       username: body.username
  //     });
  //     if (!user) throw error;
  //     const match = yield bcrypt.compare.bind(this, body.password, user.password);
  //     if (!match) throw error;
  //     user.token = uuid.v1();
  //     this.status = 201;
  //     this.body = yield user.save();
  //   } catch (err) {
  //     this.status = 401;
  //     this.body = err;
  //   }
  // });
}
