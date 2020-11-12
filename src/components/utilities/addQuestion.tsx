import React, { Component } from "react";
import fire from "../../firebase";
import QuestionInterface, {
  dummyQuestion,
} from "../interfaces/questionInterface";

class AddQuestion extends Component {
  state = {
    questionText: "",
    dollarCount: 0,
  };
  onQuestionChange = (e: any) => {
    this.setState({
      questionText: e.target.value,
      dollarCount: e.target.value.split("$").length - 1,
    });
  };
  onSubmit = (e: any) => {
    e.preventDefault();
    let tempQuestion: QuestionInterface = dummyQuestion(
      this.state.questionText,
      this.state.dollarCount,
      []
    );
    fire
      .database()
      .ref("totalQuestions")
      .once("value", (s) => {
        fire
          .database()
          .ref("/questionBank/" + s.val())
          .set(tempQuestion)
          .then(() => {
            fire
              .database()
              .ref("totalQuestions")
              .set(s.val() + 1);
          });
      });
  };
  render() {
    return (
      <form className="container" noValidate={true} onSubmit={this.onSubmit}>
        <input
          placeholder={"Question"}
          className="form-control"
          onChange={this.onQuestionChange}
        />
        <br />
        <h1 className="m-2 font-weight-light">
          Number of dollars:{this.state.dollarCount}
        </h1>
        <button type="submit" className="m-2 btn btn-primary">
          Submit
        </button>
      </form>
    );
  }
}

export default AddQuestion;
