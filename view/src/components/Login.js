import React, { Component } from 'react';
import './Login.css';

class Login extends Component {
  renderError() {
    const { error: err } = this.props;

    if (err) {
      return (
        <div className="error">
          {err.message}
        </div>
      );
    }

    return null;
  }

  render() {
    const {
      requesting,
      onSubmit,
      onChangeUsername,
      onChangePassword
    } = this.props;

    return (
      <form id="login" onSubmit={onSubmit}>
        <input
          type="text"
          name="username"
          placeholder="UserName"
          onChange={onChangeUsername}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={onChangePassword}
        />
        <button
          type="submit"
          disabled={requesting}
        >
          Sign In
        </button>
        {this.renderError()}
      </form>
    );
  }
}

export default Login;
