import Article from './models/article';

module.exports = function(app) {

  const articlesHandler = function *(next) {
    this.locals.data = {ArticleStore: {articles: yield Article.find({}).sort('-createdAt')}};
    yield next;
  };

  app.get('/articles', articlesHandler);

  /* home route */
  app.get('/', articlesHandler);
};


