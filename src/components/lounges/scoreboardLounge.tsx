import React, { Component } from "react";
import RoomInterface, { dummyRoom } from "../interfaces/RoomInterface";
import { codeToName, dummyUser } from "../interfaces/UserInterface";
import { dummyParticipant } from "../interfaces/participantInterface";
import fire from "../../firebase";
import LoadingText from "../utilities/loadingText";
import ScoreCard from "../utilities/scoreCard";
interface ScoreboardLoungeInterace {
  userCode: string;
  roomCode: string;
}
class ScoreboardLounge extends Component<ScoreboardLoungeInterace> {
  state = {
    room: dummyRoom(),
    user: dummyUser(),
    participant: dummyParticipant(),
    answerPickedBy: [],
    answerPickedOf: "",
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
        if (room) {
          for (let participant of room.participants) {
            if (participant.uid === this.props.userCode)
              this.setState({ participant });
          }
          if (room.questionBank[room.currentRound - 1].answers) {
            for (let answer of room.questionBank[room.currentRound - 1]
              .answers) {
              if (
                answer.hasOwnProperty("selectedBy") &&
                answer.submittedBy === this.props.userCode
              ) {
                codeToName(answer.selectedBy).then((s) => {
                  if (!this.mounted) return;
                  this.setState({ answerPickedBy: s });
                });
              }
              if (
                answer.hasOwnProperty("selectedBy") &&
                answer.selectedBy.includes(this.props.userCode)
              ) {
                codeToName([this.props.userCode]).then((s) => {
                  if (!this.mounted) return;
                  this.setState({ answerPickedOf: s[0] });
                });
              }
            }
          }
          this.setState({ room: snapshot.val() });
        }
      });
    fire
      .database()
      .ref("/users/" + this.props.userCode)
      .on("value", (snapshot) => {
        if (!this.mounted) return;
        if (snapshot.val()) {
          this.setState({ user: snapshot.val() });
        }
      });
  }

  render() {
    return (
      <div>
        {this.state.answerPickedOf !== "" && (
          <div>
            <div className="h3 font-weight-light">
              You Picked{" "}
              <span className="badge badge-warning badge-pill">
                {this.state.answerPickedOf}
              </span>
              's answer!
            </div>
            {this.state.answerPickedBy.length > 0 && (
              <div className="h3 font-weight-light">
                Your Answer was picked by{" "}
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
                      <span className="badge badge-info badge-pill m-1">
                        {ans}
                      </span>
                    </span>
                  );
                })}
              </div>
            )}
            {this.state.answerPickedBy.length === 0 && (
              <div>No-one picked your answer:(</div>
            )}
          </div>
        )}
        <div className="list-group">
          <div className="list-group-item active">Scoreboard:</div>
          {this.state.room.participants.map((participant, index) => (
            <ScoreCard
              key={participant.uid}
              index={index}
              userCode={participant.uid}
              roomCode={this.props.roomCode}
            />
          ))}
        </div>
        {this.state.answerPickedOf === "" && (
          <LoadingText>loading scoreboard</LoadingText>
        )}
      </div>
    );
  }
}

export default ScoreboardLounge;
