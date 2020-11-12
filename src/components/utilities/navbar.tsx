import React, { Component } from "react";
import fire from "../../firebase";
import config from "../../config";
import { dummyUser } from "../interfaces/UserInterface";

interface navbarInterface {
  onSignOut: any;
  registerToLogin: any;
  loginToRegister: any;
  visibilities: any;
  userCode: string;
  toggleQuestionForm: any;
}

class Navbar extends Component<navbarInterface> {
  state = {
    loaded: false,
    user: dummyUser(),
  };
  mounted = false;
  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
    fire.auth().onAuthStateChanged((user) => {
      if (!this.mounted) return;
      if (user) {
        fire
          .database()
          .ref("/users/" + this.props.userCode)
          .on("value", (snapshot) => {
            if (!this.mounted) return;
            if (snapshot.val()) {
              this.setState({ user: snapshot.val() });
            }
            this.setState({ loaded: true });
          });
      } else {
        this.setState({ loaded: true });
      }
    });
  }

  render() {
    return (
      <div className="mb-5">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <h2 className="navbar-brand">{config.appName}</h2>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <div className="mr-auto" />
            <div className="navbar-nav">
              {this.props.userCode !== "dummy" && this.state.loaded && (
                <div className="nav-item dropdown">
                  <div
                    className="nav-link dropdown-toggle text-white"
                    id="navbarDropdown"
                    role="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    {this.state.user.firstName} {this.state.user.lastName}
                  </div>
                  <div
                    className="dropdown-menu dropdown-menu-right"
                    aria-labelledby="navbarDropdown"
                  >
                    {this.state.user.uid === "Bz8fuRhVXKXH5HRf9hPnGuL9pwd2" && (
                      <button
                        className="btn btn-link text-black dropdown-item"
                        onClick={this.props.toggleQuestionForm}
                      >
                        Add Question
                      </button>
                    )}
                    <div className="dropdown-divider" />
                    <button
                      className="btn btn-link text-black dropdown-item"
                      onClick={this.props.onSignOut}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
              {this.props.userCode === "dummy" &&
                this.state.loaded &&
                this.props.visibilities.registerCompVisibility && (
                  <button
                    className="btn btn-link nav-link nav-item active"
                    onClick={this.props.registerToLogin}
                  >
                    Sign In
                  </button>
                )}
              {this.props.userCode === "dummy" &&
                this.state.loaded &&
                this.props.visibilities.loginCompVisibility && (
                  <button
                    className="btn btn-link nav-link nav-item active"
                    onClick={this.props.loginToRegister}
                  >
                    Sign Up
                  </button>
                )}
              {!this.state.loaded && (
                <span className="nav-item text-white">loading...</span>
              )}
            </div>
          </div>
        </nav>
      </div>
    );
  }
}

export default Navbar;
