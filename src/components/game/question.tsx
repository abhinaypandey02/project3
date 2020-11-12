import React, { Component } from "react";
import LoadingText from "../utilities/loadingText";
import fire from "../../firebase";
import RoomInterface, {
  dummyRoom,
  updateRoom,
} from "../interfaces/RoomInterface";
import config from "../../config";
import AnswerInterface, { dummyAnswer } from "../interfaces/answerInterface";
interface QuestionComponentInterface {
  userCode: string;
  roomCode: string;
}
class Question extends Component<QuestionComponentInterface> {
  state = {
    loaded: false,
    answer: "",
    room: dummyRoom(),
  };
  mounted = false;
  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
    fire
      .database()
      .ref("/rooms/" + this.props.roomCode)
      .on("value", (snapshot) => {
        if (!this.mounted) return;
        let room: RoomInterface = snapshot.val();
        this.setState({
          room,
          loaded: !room.questionBank[
            room.currentRound - 1
          ].questionText.includes(config.hotString),
        });
      });
  }

  onAnswerChange = (e: any) => {
    this.setState({ answer: e.target.value });
  };
  handleSubmit = () => {
    let tempAnswer: AnswerInterface = dummyAnswer(
      this.state.answer,
      this.props.userCode
    );
    let tempRoom: RoomInterface = this.state.room;
    if (tempRoom.questionBank[this.state.room.currentRound - 1].answers)
      tempRoom.questionBank[this.state.room.currentRound - 1].answers.push(
        tempAnswer
      );
    else {
      tempRoom.questionBank[this.state.room.currentRound - 1].answers = [
        tempAnswer,
      ];
    }
    let allAnswersSubmitted = true;
    for (let p in tempRoom.participants) {
      if (tempRoom.participants[p].uid === this.props.userCode)
        tempRoom.participants[p].currentAnswer = tempAnswer;
      else {
        if (tempRoom.participants[p].currentAnswer.answerText === "dummy")
          allAnswersSubmitted = false;
      }
    }
    tempRoom.allAnswersSubmitted = allAnswersSubmitted;

    updateRoom(tempRoom);
  };
  render() {
    return (
      <div className="container">
        {this.state.loaded ? (
          <div>
            <span className="badge badge-primary badge-pill">
              Round:{this.state.room.currentRound}
            </span>
            <span className="font-weight-light m-2 h3">
              {
                this.state.room.questionBank[this.state.room.currentRound - 1]
                  .questionText
              }
            </span>

            <textarea
              onChange={this.onAnswerChange}
              className="form-control m-2"
              placeholder="Your answer"
              maxLength={10}
            />
            <button className="btn btn-primary m-2" onClick={this.handleSubmit}>
              Submit Answer
            </button>
          </div>
        ) : (
          <LoadingText>loading question</LoadingText>
        )}
      </div>
    );
  }
}

export default Question;
