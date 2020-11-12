import React, { Component } from "react";

class LoadingText extends Component {
  render() {
    return (
      <div className="container">
        <h1 className="h1 font-weight-light container">
          {this.props.children}
        </h1>
      </div>
    );
  }
}

export default LoadingText;
