import React, { Component } from 'react';
import './App.css';
import Login from './components/Login';
import Spot from './components/Spot';

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

const Keys = {
  TOKEN: 'spot_data_token',
  LAST_ITEM: 'spot_data_last_item',
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      login: {
        username: '',
        password: '',
        token: '',
        requesting: false,
        error: null,
      },
      spot: {},
      lastIndex: 1,
    };

    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);

    this.getSpot = this.getSpot.bind(this);
    this.handleClickOk = this.handleClickOk.bind(this);
    this.handleChangeCategory = this.handleChangeCategory.bind(this);
  }

  componentDidMount() {
    const index = localStorage.getItem(Keys.LAST_ITEM);
    if (index) {
      this.setState({
        ...this.state,
        lastIndex: index,
      });
    }
  }

  handleLoginSubmit(e) {
    e.preventDefault(); // submitをキャンセル
    this.setState({
      login: {
        requesting: true,
      }
    });

    // fetchしてtokenを取得
    const { username, password } = this.state.login;

    fetch(
      `${process.env.REACT_APP_WEB_API}/login`,
      {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers,
        body: JSON.stringify({ username, password }),
      }
    ).then((res) => {
      console.log('login:', res);
      if (res.status === 200) {
        return res.json();
      } else {
        const err = new Error(res.statusText);
        err.status = err.status;
        throw err;
      }
    }).then((data) => {
      if (data.token) {
        const { login } = this.state;
        this.setState({
          login: {
            ...login,
            token: data.token,
          }
        });

        // headerにセットしておく
        headers['Authorization'] = `Bearer ${data.token}`;

        // スポット
        this.getSpot(this.state.lastIndex);
      }
    }).catch((err) => {
      console.error(err);
      this.setState({
        login: {
          error: err,
        }
      });
    });
  }

  handleChangeUsername(e) {
    const value = e.target.value;
    const { login } = this.state;
    this.setState({
      login: {
        ...login,
        username: value,
      }
    });
  }

  handleChangePassword(e) {
    const value = e.target.value;
    const { login } = this.state;
    this.setState({
      login: {
        ...login,
        password: value,
      }
    });
  }

  getSpot(index) {
    fetch(
      `${process.env.REACT_APP_WEB_API}/spots/${index}`,
      {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers,
      }
    ).then((res) => {
      console.log('spots:', res);
      if (res.status === 200) {
        return res.json();
      } else {
        const err = new Error(res.statusText);
        err.status = err.status;
        throw err;
      }
    }).then((data) => {
      if (data) {
        let item = data;
        if (Array.isArray(data)) {
          item = data[0];
        }
        this.setState({
          spot: {
            ...item,
          }
        });
      }
    }).catch((err) => {
      console.error(err);
      this.setState({
        error: err,
      });
    });
  }

  handleClickOk() {
    const { spot } = this.state;

    fetch(
      `${process.env.REACT_APP_WEB_API}/spots/${spot.id}`,
      {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        headers,
        body: JSON.stringify({
          id: spot.id,
          category_id: spot.category_id,
        }),
      }
    ).then((res) => {
      console.log('update:', res);
      if (res.status === 200) {
        // 次のやつに遷移
        const nextId = spot.id + 1;
        this.setState({
          lastIndex: nextId,
        });
        localStorage.setItem(Keys.LAST_ITEM, nextId);

        this.getSpot(nextId);
      } else {
        const err = new Error(res.statusText);
        err.status = err.status;
        throw err;
      }
    }).catch((err) => {
      console.error(err);
      this.setState({
        error: err,
      });
    });
  }

  handleChangeCategory(e) {
    const value = parseInt(e.target.value, 10);
    const { spot } = this.state;
    this.setState({
      spot: {
        ...spot,
        category_id: value,
      }
    });
  }

  renderLoginForm() {
    if (this.state.login.token) {
      return null;
    }

    const { requesting, error } = this.state.login;

    return (
      <Login
        onSubmit={this.handleLoginSubmit}
        onChangeUsername={this.handleChangeUsername}
        onChangePassword={this.handleChangePassword}
        requesting={requesting}
        error={error}
      />
    );
  }

  renderSpot() {
    const {
      login: {
        token
      },
      spot
    } = this.state;

    if (token && spot) {
      return (
        <Spot
          {...spot}
          onClickOk={this.handleClickOk}
          onChangeCategory={this.handleChangeCategory}
        />
      );
    }

    return null;
  }

  renderMessage() {
    const { error } = this.state;

    if (error) {
      return (
        <div>
          {error.message}
        </div>
      );
    }

    return null;
  }

  render() {
    return (
      <div className="App">
        {this.renderLoginForm()}
        {this.renderSpot()}
        {this.renderMessage()}
      </div>
    );
  }
}

export default App;
