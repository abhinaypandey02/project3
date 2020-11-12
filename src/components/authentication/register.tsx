import React, { Component } from "react";
import fire from "../../firebase";
import UserInterface, { updateUser } from "../interfaces/UserInterface";
import config from "../../config";

interface registerInterface {
  onRegistered: Function;
  registerToLogin: any;
}

class Register extends Component<registerInterface> {
  state = {
    firstName: { value: "", error: [] },
    lastName: { value: "", error: [] },
    email: { value: "", error: [] },
    password: { value: "", error: [] },
    confirmPassword: { value: "", error: [] },
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

  handleFirstNameChange = (e: any) => {
    let errorText: string[] = [];
    if (this.emptyFieldValidation(e))
      errorText.push(this.emptyFieldValidation(e));
    this.setState({ firstName: { value: e.target.value, error: errorText } });
  };
  handleLastNameChange = (e: any) => {
    let errorText: string[] = [];
    if (this.emptyFieldValidation(e))
      errorText.push(this.emptyFieldValidation(e));
    this.setState({ lastName: { value: e.target.value, error: errorText } });
  };
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
    if (e.target.value.length < 6)
      errorText.push("Password should be at least 6 characters!");
    this.setState({ password: { value: e.target.value, error: errorText } });
  };
  handleConfirmPasswordChange = (e: any) => {
    let errorText: string[] = [];
    if (this.emptyFieldValidation(e))
      errorText.push(this.emptyFieldValidation(e));
    if (e.target.value !== this.state.password.value)
      errorText.push("Passwords don't match!");
    this.setState({
      confirmPassword: { value: e.target.value, error: errorText },
    });
  };
  handleSubmitClick = async (event: any) => {
    event.preventDefault();
    await this.handleFirstNameChange({
      target: { value: this.state.firstName.value },
    });
    await this.handleLastNameChange({
      target: { value: this.state.lastName.value },
    });
    await this.handleEmailChange({ target: { value: this.state.email.value } });
    await this.handleConfirmPasswordChange({
      target: { value: this.state.confirmPassword.value },
    });
    await this.handlePasswordChange({
      target: { value: this.state.password.value },
    });
    let errors: number =
      this.state.firstName.error.length +
      this.state.lastName.error.length +
      this.state.email.error.length +
      this.state.password.error.length +
      this.state.confirmPassword.error.length;
    if (errors !== 0) {
      return false;
    } else {
      fire
        .auth()
        .createUserWithEmailAndPassword(
          this.state.email.value,
          this.state.password.value
        )
        .then(() => {
          let uid = fire.auth().currentUser?.uid;
          let tempUser: UserInterface = {
            uid: "",
            firstName: this.state.firstName.value,
            lastName: this.state.lastName.value,
            roomCode: "none",
          };
          if (uid !== undefined) tempUser.uid = uid;
          updateUser(tempUser);
          this.props.onRegistered();
        })
        .catch((error) => {
          let errorText: string[] = this.state.confirmPassword.error;
          switch (error.code) {
            case "auth/email-already-in-use": {
              errorText.push(
                "This e-mail is already in use. Please login to continue."
              );
              break;
            }
            case "auth/network-request-failed": {
              errorText.push("Unable to connect to the internet");
              break;
            }
            default: {
              errorText.push(error.code);
            }
          }
          this.setState({ confirmPassword: { value: "", error: errorText } });
          this.setState({ password: { value: "", error: [] } });
          return null;
        });
    }
  };

  render() {
    return (
      <div className="container">
        <h1 className="m-2">
          Welcome to {config.appName}
          {this.state.firstName.value !== "" && " "}
          {this.state.firstName.value}!
        </h1>
        <hr />
        <form className="container" noValidate={true}>
          <div className="row">
            <div className="mt-2 form-group text-left col-md">
              <input
                value={this.state.firstName.value}
                className="form-control"
                placeholder="Enter First Name"
                onChange={this.handleFirstNameChange}
                required
              />
              {this.state.firstName.error.map((e: any, index) => (
                <small key={index} className="form-text text-danger">
                  {e}
                </small>
              ))}
            </div>

            <div className="form-group text-left col-md mt-2">
              <input
                value={this.state.lastName.value}
                className="form-control"
                placeholder="Enter Last Name"
                onChange={this.handleLastNameChange}
                required
              />
              {this.state.lastName.error.map((e: any, index) => (
                <small key={index} className="form-text text-danger">
                  {e}
                </small>
              ))}
            </div>
          </div>
          <div className="form-group text-left">
            <input
              value={this.state.email.value}
              className="form-control"
              type="email"
              placeholder="Enter Email"
              onChange={this.handleEmailChange}
              required
            />
            {this.state.email.error.map((e: any, index) => (
              <small key={index} className="form-text text-danger">
                {e}
              </small>
            ))}
          </div>
          <div className="row">
            <div className="form-group text-left col-md">
              <input
                className="form-control"
                type="password"
                placeholder="Enter Password"
                onChange={this.handlePasswordChange}
                value={this.state.password.value}
                required
              />
              {this.state.password.error.map((e: any, index) => (
                <small key={index} className="form-text text-danger">
                  {e}
                </small>
              ))}
            </div>
            <div className="form-group text-left col-md">
              <input
                className="form-control"
                type="password"
                value={this.state.confirmPassword.value}
                placeholder="Confirm Password"
                onChange={this.handleConfirmPasswordChange}
                required
              />
              {this.state.confirmPassword.error &&
                this.state.confirmPassword.error.map((e: any, index) => (
                  <small key={index} className="form-text text-danger">
                    {e}
                  </small>
                ))}
            </div>
          </div>
          <input
            type="submit"
            onClick={this.handleSubmitClick}
            className="btn btn-primary"
            value="Start"
          />
        </form>
        <button className="btn btn-link" onClick={this.props.registerToLogin}>
          Already Registered? Login Now!
        </button>
      </div>
    );
  }
}

export default Register;
