import ReactDOM from 'react-dom';
import React from 'react';
import { applyMiddleware, createStore } from 'redux';
import superagent from 'superagent';

const defaultState = { checked: false };
const reducer = function(state = defaultState, action) {
  switch (action.type) {
    case 'LOAD_ARTICLES':
      return Object.assign({}, state, {
        articlesCount: action.payload.articlesCount
      });
  }
  return state;
};

const promiseMiddleware = store => next => action => {
  if (action.payload && typeof action.payload.then === 'function') {
    return action.payload.then(
      res => {
        action.payload = res.body;
        next(action);
      },
      error => {
        action.error = true;
        action.payload = error;
        next(action);
      }
    );
  }
  next(action);
};

const store = createStore(reducer, applyMiddleware(promiseMiddleware));

const ARTICLE_URL =
  'https://conduit.productionready.io/api/articles?limit=10&offset=0';

class App extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentWillMount() {
    store.subscribe(() => this.setState(store.getState()));
  }

  render() {
    const onClick = () => store.dispatch({
      type: 'LOAD_ARTICLES',
      payload: superagent.get(ARTICLE_URL)
    });
    return (
      <div>
        <h1>Articles</h1>
        <div>
          <button onClick={onClick}>Load Articles</button>
        </div>
        <div>
          Number of Articles: {this.state.articlesCount}
        </div>
      </div>
    );
  }
}

ReactDOM.render((
  <App />
), document.getElementById('main'));
