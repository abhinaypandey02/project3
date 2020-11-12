import React, { Component } from "react";
import Register from "./register";
import Login from "./login";

interface authenticationInterface {
  hasAuthenticated: any;
  registerToLogin: any;
  loginToRegister: any;
  visibilities: any;
}

class Authentication extends Component<authenticationInterface> {
  render() {
    return (
      <div className="container">
        {this.props.visibilities.registerCompVisibility && (
          <Register
            registerToLogin={this.props.registerToLogin}
            onRegistered={this.props.hasAuthenticated}
          />
        )}
        {this.props.visibilities.loginCompVisibility && (
          <Login
            loginToRegister={this.props.loginToRegister}
            onLogin={this.props.hasAuthenticated}
          />
        )}
      </div>
    );
  }
}

export default Authentication;
