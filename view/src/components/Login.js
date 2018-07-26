import React, { Component } from 'react';

class Login extends Component {
  render() {
    return (
      <div id="login">
        <input type="text" onChange={onChangeUsername} />
      </div>
    );
  }
}

export default Login;
