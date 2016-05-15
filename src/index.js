import ReactDOM from 'react-dom';
import React from 'react';
import { Link, Router, Route, IndexRoute, hashHistory } from 'react-router';
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

const Header = () => {
  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <Link to="/" className="navbar-brand">
          Conduit
        </Link>

        <Link to="login">Login</Link>
      </div>
    </nav>
  );
}

const Home = () => {
  return (
    <h1>Home</h1>
  );
}

const Login = () => {
  return (
    <h1>Login</h1>
  );
}

class App extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentWillMount() {
    store.subscribe(() => this.setState(store.getState()));
  }

  render() {
    return (
      <div>
        <Header />
        {this.props.children}
      </div>
    );
  }
}

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="login" component={Login} />
    </Route>
  </Router>
), document.getElementById('main'));
