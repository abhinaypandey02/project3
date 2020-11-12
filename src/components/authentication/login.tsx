import React, { Component } from "react";
import fire from "../../firebase";

interface loginInterface {
  loginToRegister: any;
  onLogin: any;
}

class Login extends Component<loginInterface> {
  state = {
    email: { value: "", error: [] },
    password: { value: "", error: [] },
  };
  emptyFieldValidation(e: any) {
    if (e.target.value === "") {
      return "This field can't be empty";
    }
    return "";
  }

  validateEmail(email: any) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  handleEmailChange = (e: any) => {
    let errorText: string[] = [];
    if (this.emptyFieldValidation(e))
      errorText.push(this.emptyFieldValidation(e));
    if (!this.validateEmail(e.target.value) && e.target.value.length > 0)
      errorText.push("Not a valid E-mail");
    this.setState({ email: { value: e.target.value, error: errorText } });
  };
  handlePasswordChange = (e: any) => {
    let errorText: string[] = [];
    if (this.emptyFieldValidation(e))
      errorText.push(this.emptyFieldValidation(e));
    this.setState({ password: { value: e.target.value, error: errorText } });
  };
  handleLoginClick = async (event: any) => {
    event.preventDefault();
    await this.handleEmailChange({ target: { value: this.state.email.value } });
    await this.handlePasswordChange({
      target: { value: this.state.password.value },
    });
    if (this.state.email.error.length + this.state.password.error.length !== 0)
      return false;
    fire
      .auth()
      .signInWithEmailAndPassword(
        this.state.email.value,
        this.state.password.value
      )
      .then(() => {
        this.props.onLogin();
      })
      .catch((error: any) => {
        let errorText: string[] = this.state.password.error;
        switch (error.code) {
          case "auth/wrong-password": {
            errorText.push("Invalid Credentials!");
            break;
          }
          default: {
            errorText.push(error.message);
          }
        }
        this.setState({ password: { value: "", error: errorText } });
      });
  };

  render() {
    return (
      <div className="container">
        <h1>Welcome Back!</h1>
        <form noValidate={true}>
          <div className="form-group text-left">
            <input
              value={this.state.email.value}
              className="form-control"
              type="email"
              required={true}
              onChange={this.handleEmailChange}
              placeholder="Enter Email"
            />
            {this.state.email.error.map((e: any, index) => (
              <small key={index} className="form-text text-danger">
                {e}
              </small>
            ))}
          </div>
          <div className="form-group text-left">
            <input
              value={this.state.password.value}
              className="form-control"
              type="password"
              required={true}
              onChange={this.handlePasswordChange}
              placeholder="Enter Password"
            />
            {this.state.password.error.map((e: any, index) => (
              <small key={index} className="form-text text-danger">
                {e}
              </small>
            ))}
          </div>
          <input
            className="btn btn-primary"
            value="Login"
            onClick={this.handleLoginClick}
            type="submit"
          />
        </form>
        <button className="btn btn-link" onClick={this.props.loginToRegister}>
          New to Game? Register Now!
        </button>
      </div>
    );
  }
}

export default Login;
