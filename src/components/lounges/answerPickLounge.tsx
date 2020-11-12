import React, { Component } from "react";
import { dummyUser } from "../interfaces/UserInterface";
import { dummyRoom } from "../interfaces/RoomInterface";
import { dummyParticipant } from "../interfaces/participantInterface";
import fire from "../../firebase";
import AnswerInterface from "../interfaces/answerInterface";
import AnswerCard from "../utilities/answerCard";
import LoadingText from "../utilities/loadingText";
interface AnswerPickLoungeInterface {
  userCode: string;
  roomCode: string;
}
class AnswerPickLounge extends Component<AnswerPickLoungeInterface> {
  state = {
    user: dummyUser(),
    room: dummyRoom(),
    participant: dummyParticipant(),
    animatingIndex: 0,
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
          room.questionBank[room.currentRound - 1].answers = room.questionBank[
            room.currentRound - 1
          ].answers.filter((answer: AnswerInterface) => {
            return answer.submittedBy !== this.props.userCode;
          });
          this.setState({ room });
          if (this.state.participant.uid === "dummy") {
            for (let p in room.participants)
              if (room.participants[p].uid === this.props.userCode)
                this.setState({ participant: room.participants[p] });
          }
        }
      });
  }
  incrementAnimatingIndex = () => {
    this.setState({ animatingIndex: this.state.animatingIndex + 1 });
  };

  render() {
    return (
      <div>
        {this.state.room.code !== "dummy" && (
          <div id="participants" className="text-left">
            <div className="list-group">
              <div className="list-group-item active">Pick an Answer:</div>
              {this.state.room.questionBank[
                this.state.room.currentRound - 1
              ].answers.map((answer: AnswerInterface, i) => {
                if (answer.submittedBy !== this.state.user.uid)
                  return (
                    <AnswerCard
                      key={
                        answer.submittedBy +
                        this.state.animatingIndex.toString()
                      }
                      incrementAnimatingIndex={this.incrementAnimatingIndex}
                      index={i}
                      roomCode={this.props.roomCode}
                      answer={answer}
                      userCode={this.props.userCode}
                      animatingIndex={this.state.animatingIndex}
                    />
                  );
                return undefined;
              })}
            </div>
          </div>
        )}
        {this.state.room.code === "dummy" ? (
          <LoadingText>loading answers</LoadingText>
        ) : (
          <hr className="m-3" />
        )}
      </div>
    );
  }
}

export default AnswerPickLounge;
