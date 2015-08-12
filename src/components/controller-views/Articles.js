import React from 'react';
import {Well, Input, Button} from 'react-bootstrap';
import Select from 'react-select';
import connectToStores from 'alt/utils/connectToStores';
import ArticleActions from '../../actions/ArticleActions';
import ArticleStore from '../../stores/ArticleStore';
import {addChangeHandler} from '../../utils';
import {requireAuthentication} from '../../utils';
import articleFSM from '../../../server/article-fsm';
import {clone} from 'lodash';

var optionExpander = name => ({value: name, label: name});

const states = articleFSM.stateNames.map(optionExpander);

const rolesNames = [
  "writer",
  "editor",
  "visual",
  "proofreader",
  "scheduler"
]

const roles = rolesNames.map(optionExpander);

@requireAuthentication
@connectToStores
@addChangeHandler
export default class App extends React.Component {
  static propTypes = {
    articles: React.PropTypes.array
  }
  static getStores() {
    return [ArticleStore];
  }
  static getPropsFromStores() {
    return ArticleStore.getState();
  }
  constructor(props) {
    super(props);
    this.state = {
      article: {},
      currentArticle: {},
      user: {
        roles: ""
      },
    };
    ArticleActions.fetch();
  }
  _submit() {
    ArticleActions.post(this.state.article);
    this.state.article = {};
  }
  _transition() {
    ArticleActions.transition(this.state.currentArticle._id, this.state.currentArticle.state, this.state.user.roles.split(","));
    this.setState({currentArticle: {}});
  }
  _loadCurrent(item) {
    this.setState({currentArticle: clone(item)});
  }
  _changeState(newState) {
    this.state.currentArticle.state = newState;
    this.setState({currentArticle: this.state.currentArticle});
  }
  _changeRoles(newRoles) {
    console.log(newRoles);
    this.state.user.roles = newRoles;
    this.setState({user: this.state.user});
  }
  render() {
    var stateEditor;
    if (this.state.currentArticle.title) {
      stateEditor = (
        <div >
          <h1>Change state</h1>
          <h3>{this.state.currentArticle.title}</h3>
          <div className='form-group'>
            <label>State</label>
            <Select
              value={this.state.currentArticle.state}
              options={states}
              onChange={this._changeState.bind(this)}
            />
          </div>
          <div className='form-group'>
            <label>Roles</label>
            <Select
              multi={true}
              value={this.state.user.roles}
              options={roles}
              onChange={this._changeRoles.bind(this)}
            />
          </div>

          <Button
            onClick={this._transition.bind(this)}
            bsStyle="danger">Transition</Button>
        </div>
      )
    }
    return (
      <div>
        <h1>New article</h1>
        <Input
          type="text"
          label="Title"
          placeholder="Enter title..."
          value={this.state.article.title}
          onChange={this._changeHandler.bind(this, 'article', 'title')}/>
        <Input
          type="textarea"
          label="Content"
          placeholder="Write content..."
          value={this.state.article.content}
          onChange={this._changeHandler.bind(this, 'article', 'content')}/>
        <Button
          bsStyle="primary"
          onClick={this._submit.bind(this)}>Submit</Button>
        {stateEditor}
        <h1>Newest articles</h1>
        {this.props.articles && this.props.articles.map((item, index) =>
          <Well key={index}>
            <Button
              className="pull-right"
              onClick={this._loadCurrent.bind(this, item)}
              bsStyle="warning">Change state</Button>
            <h2>{item.title}</h2>
            <p>{item.content}</p>
            <p><b>State:</b> {item.state}</p>
          </Well>
        )}
      </div>
    );
  }
}

