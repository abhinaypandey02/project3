import React, { Component } from "react";
import { codeToName, dummyUser } from "../interfaces/UserInterface";
import RoomInterface, { dummyRoom } from "../interfaces/RoomInterface";
import ParticipantInterface, {
  dummyParticipant,
} from "../interfaces/participantInterface";
import fire from "../../firebase";
import { dummyAnswer } from "../interfaces/answerInterface";
interface ScoreCardInterface {
  userCode: string;
  roomCode: string;
  index: number;
}
class ScoreCard extends Component<ScoreCardInterface> {
  state = {
    user: dummyUser(),
    room: dummyRoom(),
    participant: dummyParticipant(),
    answer: dummyAnswer(),
    answerPickedBy: [],
  };
  mounted = false;

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
    fire
      .database()
      .ref("/users/" + this.props.userCode)
      .on("value", (snapshot) => {
        if (!this.mounted) return;
        let user = snapshot.val();
        if (user) {
          this.setState({ user });
        }
      });
    fire
      .database()
      .ref("/rooms/" + this.props.roomCode)
      .on("value", (snapshot) => {
        if (!this.mounted) return;
        let room = snapshot.val();
        if (room) {
          this.setState({ room });

          for (let p of room.participants)
            if (p.uid === this.props.userCode) {
              this.setState({ participant: p });
              if (room.questionBank[room.currentRound - 1].answers)
                this.participantAnswer(p, room);
            }
        }
      });
  }
  participantAnswer = (part: ParticipantInterface, room: RoomInterface) => {
    for (let ans of room.questionBank[room.currentRound - 1].answers) {
      if (ans.submittedBy === part.uid) {
        if (!this.mounted) return;
        this.setState({
          answer: ans,
        });
        if (ans.hasOwnProperty("selectedBy"))
          codeToName(ans.selectedBy).then((s) => {
            if (!this.mounted) return;
            this.setState({ answerPickedBy: s });
          });
      }
    }
  };

  render() {
    return (
      <div className="list-group-item d-flex flex-wrap justify-content-between align-items-center">
        <div className="badge badge-primary badge-pill m-1">
          {this.props.index + 1}
        </div>
        <div className="text-left mx-2 flex-grow-1 font-weight-light">
          <div className="h4 m-1">
            {this.state.user.firstName === "dummy"
              ? "loading..."
              : this.state.user.firstName}
          </div>
          submitted{" "}
          <span className="badge-light badge badge-pill">
            {this.state.answer.answerText}
          </span>{" "}
          which was picked by{" "}
          {this.state.user.uid !== "dummy" &&
            this.state.answerPickedBy.length === 0 &&
            "no-one."}
          {this.state.answerPickedBy.map((ans: any, index) => {
            let l = this.state.answerPickedBy.length;
            let punctuation = "";
            if (l - 1 === index) {
              if (l !== 1) punctuation = " and ";
            } else {
              if (index !== 0) punctuation = ", ";
            }
            return (
              <span key={index}>
                {punctuation}
                <span className="badge badge-info badge-pill m-1">{ans}</span>
              </span>
            );
          })}
        </div>
        <span>
          Score:
          <span className="badge badge-info badge-pill m-1">
            {this.state.participant.score}
          </span>
        </span>
      </div>
    );
  }
}

export default ScoreCard;
