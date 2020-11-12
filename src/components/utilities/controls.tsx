import React, { Component } from "react";
import RoomInterface, {
  dummyRoom,
  updateRoom,
} from "../interfaces/RoomInterface";
import fire from "../../firebase";
import config from "../../config";
import { dummyUser } from "../interfaces/UserInterface";
import { dummyParticipant } from "../interfaces/participantInterface";

interface controlsInterface {
  userCode: string;
  leaveRoom: any;
  deleteRoom: any;
  roomCode: string;
  startGame: any;
  newRound: any;
}

class Controls extends Component<controlsInterface> {
  state = {
    room: dummyRoom(),
    user: dummyUser(),
    participant: dummyParticipant(),
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
  participantReady = () => {
    let tempRoom = this.state.room;
    tempRoom.allReadyForNextRound = true;
    for (let participant of tempRoom.participants) {
      if (participant.uid === this.props.userCode)
        participant.readyForNextRound = true;
      else {
        if (!participant.readyForNextRound)
          tempRoom.allReadyForNextRound = false;
      }
    }
    if (tempRoom.allReadyForNextRound) {
      this.props.newRound();
    }
    updateRoom(tempRoom);
  };

  newGame = () => {
    let tempRoom = this.state.room;
    tempRoom.currentRound = 0;
    tempRoom.roundOver = false;
    updateRoom(tempRoom);
  };
  render() {
    return (
      <div className="container">
        {this.state.room.code !== "dummy" &&
          this.state.room.currentRound === 0 &&
          this.state.room.participants.length < config.min_players && (
            <h4 className="text-secondary font-weight-light m-2">
              {config.min_players - this.state.room.participants.length} more
              player
              {config.min_players - 1 !== this.state.room.participants.length &&
                "s"}{" "}
              needed to start
            </h4>
          )}
        {this.state.room.code !== "dummy" &&
          this.state.room.currentRound === 0 &&
          this.state.user.uid !== this.state.room.host &&
          this.state.room.participants.length >= config.min_players && (
            <h4 className="text-secondary font-weight-light m-2">
              Waiting for host to start the game.
            </h4>
          )}
        {this.state.room.code !== "dummy" &&
          this.state.user.uid === this.state.room.host &&
          this.state.room.currentRound === 0 && (
            <div>
              <button
                type="button"
                className="btn btn-primary m-2"
                disabled={
                  this.state.room.participants.length < config.min_players
                }
                onClick={this.props.startGame}
              >
                Start Game
              </button>
            </div>
          )}
        {this.state.room.code !== "dummy" &&
          this.state.room.allAnswersPicked &&
          !this.state.room.allReadyForNextRound &&
          !this.state.participant.readyForNextRound && (
            <div>
              <button
                className="btn btn-success m-2"
                onClick={this.participantReady}
              >
                Next Round
              </button>
            </div>
          )}
        {this.state.room.code !== "dummy" &&
          this.state.room.roundOver &&
          this.state.user.uid === this.state.room.host && (
            <div>
              <button className="btn btn-success m-2" onClick={this.newGame}>
                New Game
              </button>
            </div>
          )}
        {this.state.room.code !== "dummy" &&
          this.state.room.roundOver &&
          this.state.user.uid !== this.state.room.host && (
            <h4 className="text-secondary font-weight-light m-2">
              Waiting for host to start another round.
            </h4>
          )}
        {this.state.room.code !== "dummy" &&
          this.state.room.waitingForPlayers && (
            <h4 className="text-secondary font-weight-light m-2">
              Round terminated because of lack of players. Waiting for players.
            </h4>
          )}
        {this.state.room.code !== "dummy" &&
          this.state.user.uid === this.state.room.host && (
            <div>
              <button
                className="btn btn-danger m-2"
                onClick={this.props.deleteRoom}
              >
                Delete Room
              </button>
            </div>
          )}

        {this.state.room.code !== "dummy" &&
          this.state.user.uid !== this.state.room.host && (
            <div>
              <button
                className="btn btn-danger m-2"
                onClick={this.props.leaveRoom}
              >
                Leave Room
              </button>
            </div>
          )}
      </div>
    );
  }
}

export default Controls;
