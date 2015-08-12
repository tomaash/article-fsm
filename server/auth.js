import User from './models/user';

export default function(app) {
  app.use(function * (next) {
    const token = this.req.headers['auth-token'];
    const isApi = !!this.request.url.match(/^\/api/);
    const user = token && (yield User.findOne({token}));
    if (isApi && !user) {
      this.status = 401;
      this.body = '401 Unauthorized';
      return;
    }
    this.request.user = user;
    yield next;
  });
}
