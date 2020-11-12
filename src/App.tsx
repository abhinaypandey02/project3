import "./App.css";
import Authentication from "./components/authentication/authentication";
import React, { Component } from "react";
import fire from "./firebase";
import PreGame from "./components/game/preGame";
import Navbar from "./components/utilities/navbar";
import LoadingText from "./components/utilities/loadingText";
import AddQuestion from "./components/utilities/addQuestion";

class App extends Component {
  state = {
    visibilities: {
      registerCompVisibility: true,
      loginCompVisibility: false,
    },
    loadingVisible: true,
    userCode: "dummy",
    questionFormVisible: false,
  };

  componentDidMount() {
    this.hasAuthenticated();
  }

  hasAuthenticated = () => {
    fire.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ userCode: user.uid });
      }
      this.setState({ loadingVisible: false });
    });
  };
  registerToLogin = () => {
    this.setState({
      visibilities: {
        registerCompVisibility: false,
        loginCompVisibility: true,
      },
    });
  };

  loginToRegister = () => {
    this.setState({
      visibilities: {
        registerCompVisibility: true,
        loginCompVisibility: false,
      },
    });
  };
  toggleQuestionForm = () => {
    this.setState({ questionFormVisible: !this.state.questionFormVisible });
  };

  onSignOut = () => {
    fire
      .auth()
      .signOut()
      .then(() => {
        this.setState({ isAuthenticated: false });
      })
      .catch();
    this.setState({ userCode: "dummy" });
  };

  render() {
    return (
      <div className="mb-5">
        <Navbar
          onSignOut={this.onSignOut}
          registerToLogin={this.registerToLogin}
          loginToRegister={this.loginToRegister}
          visibilities={this.state.visibilities}
          userCode={this.state.userCode}
          key={"navbar" + this.state.userCode}
          toggleQuestionForm={this.toggleQuestionForm}
        />
        <div className="d-flex align-items-center container text-center vh-80">
          {this.state.questionFormVisible &&
            this.state.userCode !== "dummy" && <AddQuestion />}
          {this.state.loadingVisible && (
            <LoadingText>authenticating</LoadingText>
          )}
          {this.state.userCode === "dummy" && !this.state.loadingVisible && (
            <Authentication
              registerToLogin={this.registerToLogin}
              loginToRegister={this.loginToRegister}
              visibilities={this.state.visibilities}
              hasAuthenticated={this.hasAuthenticated}
            />
          )}
          {this.state.userCode !== "dummy" &&
            !this.state.questionFormVisible &&
            !this.state.loadingVisible && (
              <PreGame
                key={"maingame" + this.state.userCode}
                userCode={this.state.userCode}
              />
            )}
        </div>
      </div>
    );
  }
}

export default App;
