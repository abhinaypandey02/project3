import React, { Component } from "react";
import AnswerInterface from "../interfaces/answerInterface";
import RoomInterface, {
  dummyRoom,
  updateRoom,
} from "../interfaces/RoomInterface";
import fire from "../../firebase";
interface AnswerCardInterface {
  roomCode: string;
  answer: AnswerInterface;
  userCode: string;
  animatingIndex: number;
  index: number;
  incrementAnimatingIndex: any;
}
class AnswerCard extends Component<AnswerCardInterface> {
  state = {
    room: dummyRoom(),
    classes: "",
  };
  mounted = false;

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
    if (this.props.animatingIndex < this.props.index) {
      this.setState({ classes: "d-none" });
    }
    if (this.props.animatingIndex === this.props.index) {
      this.setState({ classes: "answerCard" });
    }
    fire
      .database()
      .ref("/rooms/" + this.props.roomCode)
      .on("value", (snapshot) => {
        if (!this.mounted) return;
        let room = snapshot.val();
        if (room) {
          this.setState({ room });
        }
      });
  }
  handleClick = (e: any) => {
    e.preventDefault();
    let tempRoom: RoomInterface = this.state.room;
    for (let ans of tempRoom.questionBank[tempRoom.currentRound - 1].answers) {
      if (ans.submittedBy === this.props.answer.submittedBy) {
        if (ans.selectedBy) ans.selectedBy.push(this.props.userCode);
        else ans.selectedBy = [this.props.userCode];
      }
    }
    tempRoom.allAnswersPicked = true;
    for (let part of tempRoom.participants) {
      if (part.uid === this.props.userCode) {
        part.chosenAns = true;
      } else {
        if (!part.chosenAns) tempRoom.allAnswersPicked = false;
      }
    }
    if (tempRoom.allAnswersPicked) {
      for (let ans of tempRoom.questionBank[tempRoom.currentRound - 1]
        .answers) {
        for (let p of tempRoom.participants) {
          if (p.uid === ans.submittedBy && ans.hasOwnProperty("selectedBy")) {
            p.score += ans.selectedBy.length * ans.selectedBy.length;
          }
        }
      }
    }
    tempRoom.participants.sort((a, b) => b.score - a.score);

    updateRoom(tempRoom);
  };
  render() {
    return (
      <div
        className={this.state.classes}
        onAnimationEnd={this.props.incrementAnimatingIndex}
      >
        {this.state.room.code !== "dummy" ? (
          <button
            onClick={this.handleClick}
            className="list-group-item list-group-item-action btn btn-link d-flex justify-content-between align-items-center"
          >
            {this.props.answer.answerText}
          </button>
        ) : (
          <div className="list-group-item d-flex justify-content-between align-items-center">
            loading
          </div>
        )}
      </div>
    );
  }
}

export default AnswerCard;
