import React, { Component } from "react";
import RoomInterface, { dummyRoom } from "../interfaces/RoomInterface";
import fire from "../../firebase";
import LoadingText from "../utilities/loadingText";
import UserCard from "../utilities/userCard";
import ParticipantInterface from "../interfaces/participantInterface";
import { dummyUser } from "../interfaces/UserInterface";

interface loungeInterface {
  roomCode: string;
  userCode: string;
  leaveRoom: any;
  changeTotalRounds: any;
}

class PreGameLounge extends Component<loungeInterface> {
  state = {
    room: dummyRoom(),
    user: dummyUser(),
    totalRounds: 8,
  };
  mounted = true;
  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    fire
      .database()
      .ref("/rooms/" + this.props.roomCode)
      .on("value", (snapshot) => {
        if (snapshot.val()) {
          let room: RoomInterface = snapshot.val();
          if (
            !room.participants.some(
              (participant) => participant.uid === this.props.userCode
            )
          ) {
            if (room.hasOwnProperty("waiting")) {
              if (
                !room.waiting.some(
                  (participant) => participant.uid === this.props.userCode
                )
              ) {
                this.props.leaveRoom();
              }
            } else this.props.leaveRoom();
          }

          if (!this.mounted) return;
          this.setState({ room: snapshot.val() });
        }
      });
    fire
      .database()
      .ref("/users/" + this.props.userCode)
      .on("value", (snapshot) => {
        if (snapshot.val()) {
          if (!this.mounted) return;
          this.setState({ user: snapshot.val() });
        }
      });
  }
  handleDecrement = () => {
    if (this.state.totalRounds === 1) return;
    this.props.changeTotalRounds(this.state.totalRounds - 1);
    this.setState({ totalRounds: this.state.totalRounds - 1 });
  };
  handleIncrement = () => {
    this.props.changeTotalRounds(this.state.totalRounds + 1);
    this.setState({ totalRounds: this.state.totalRounds + 1 });
  };
  render() {
    return (
      <div className="container">
        {this.state.room.code !== "dummy" && (
          <div className="container">
            <i>Room Code: </i>
            <h1 className="display-3">{this.state.room.code}</h1>
            <hr />
            {this.state.room.host === this.state.user.uid &&
              this.state.room.currentRound === 0 && (
                <div className="m-3 h4 font-weight-light">
                  Total Rounds:
                  <button
                    className="btn btn-sm btn-danger m-2"
                    onClick={this.handleDecrement}
                  >
                    -
                  </button>
                  <span className="m-2 h3">{this.state.totalRounds}</span>
                  <button
                    className="btn btn-sm btn-success m-2"
                    onClick={this.handleIncrement}
                  >
                    +
                  </button>
                </div>
              )}
            <div id="participants" className="text-left">
              <div className="list-group">
                <div className="list-group-item active">Participants:</div>
                {this.state.room.participants.map(
                  (participant: ParticipantInterface, i) => (
                    <UserCard
                      key={participant.uid}
                      index={i}
                      userCode={participant.uid}
                      roomCode={this.props.roomCode}
                      currUserCode={this.props.userCode}
                      host={this.state.room.host}
                    >
                      preGame
                    </UserCard>
                  )
                )}
              </div>
            </div>
          </div>
        )}
        {this.state.room.code === "dummy" ? (
          <LoadingText>joining room</LoadingText>
        ) : (
          <hr className="m-3" />
        )}
      </div>
    );
  }
}

export default PreGameLounge;
