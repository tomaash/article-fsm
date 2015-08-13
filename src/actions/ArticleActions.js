import alt from '../alt';
import axios from 'axios';
import LoginStore from '../stores/LoginStore';

class ArticleActions {
  async fetch() {
    const response = await axios.get(
      '/api/articles?sort=-createdAt',
      LoginStore.getState().apiConfig
    );
    this.dispatch(response.data);
  }
  async post(data) {
    const response = await axios.post(
      '/api/articles',
      data,
      LoginStore.getState().apiConfig
    );
    this.dispatch(response.data);
  }
  async transition(id, transition, user) {
    const response = await axios.post(
      '/api/articles/' + id + '/transition',
      {transition, user},
      LoginStore.getState().apiConfig
    );
    this.dispatch(response.data);
  }
}

module.exports = alt.createActions(ArticleActions);
