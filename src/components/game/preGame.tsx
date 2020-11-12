import React, { Component } from "react";
import HostJoin from "./hostJoin";
import UserInterface, {
  getUser,
  updateUser,
} from "../interfaces/UserInterface";
import RoomInterface, {
  getRoom,
  updateRoom,
} from "../interfaces/RoomInterface";
import LoadingText from "../utilities/loadingText";
import MainGame from "./mainGame";
import ParticipantInterface, {
  dummyParticipant,
} from "../interfaces/participantInterface";
import fire from "../../firebase";

interface mainGameInterface {
  userCode: string;
}

class PreGame extends Component<mainGameInterface> {
  state = {
    roomJoined: false,
    roomCode: "dummy",
    loaded: false,
  };
  mounted = false;

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
    getUser(this.props.userCode).then((snapshot) => {
      if (!this.mounted) return;
      let user: UserInterface = snapshot.val();
      if (user) {
        if (user.roomCode !== "none") {
          getRoom(user.roomCode).then((snapshot) => {
            if (!this.mounted) return;
            let room = snapshot.val();
            if (room) {
              if (
                room.participants.some(
                  (participant: ParticipantInterface) =>
                    participant.uid === this.props.userCode
                ) ||
                room.waiting.some(
                  (participant: ParticipantInterface) =>
                    participant.uid === this.props.userCode
                )
              ) {
                this.setState({
                  roomCode: user.roomCode,
                  roomJoined: true,
                  loaded: true,
                });
                return;
              }
            }
            user.roomCode = "none";
            updateUser(user).then(() => {
              this.setState({ loaded: true });
            });
          });
        } else {
          this.setState({ loaded: true });
        }
      }
    });
  }

  onRoomCreate = (roomCode: string) => {
    if (!this.mounted) return;
    this.setState({
      roomJoined: true,
      roomCode: roomCode,
    });
    getUser(this.props.userCode).then((snapshot) => {
      let user: UserInterface = snapshot.val();
      if (user) {
        user.roomCode = roomCode;
        updateUser(user);
      }
    });
  };
  onRoomJoined = (roomCode: string) => {
    getRoom(roomCode).then((snapshot) => {
      if (snapshot.val()) {
        let room: RoomInterface = snapshot.val();
        if (
          !room.participants.some(
            (participant) => participant.uid === this.props.userCode
          )
        ) {
          if (room.currentRound > 0 && !room.waitingForPlayers)
            if (room.hasOwnProperty("waiting")) {
              if (
                !room.waiting.some(
                  (participant) => participant.uid === this.props.userCode
                )
              )
                room.waiting.push(dummyParticipant(this.props.userCode));
            } else room.waiting = [dummyParticipant(this.props.userCode)];
          else {
            room.participants.push(dummyParticipant(this.props.userCode));
          }

          updateRoom(room).then(() => {
            this.setState({
              roomJoined: true,
              roomCode: roomCode,
            });
          });
        } else {
          this.setState({ roomJoined: true, roomCode });
        }
      }
    });
    getUser(this.props.userCode).then((snapshot) => {
      let user: UserInterface = snapshot.val();
      if (user) {
        user.roomCode = roomCode;
        updateUser(user);
      }
    });
  };

  leaveRoom = () => {
    let roomCode = this.state.roomCode;
    this.setState({
      roomJoined: false,
      roomCode: "dummy",
    });
    getRoom(roomCode).then((snapshot) => {
      if (snapshot.val()) {
        let room: RoomInterface = snapshot.val();
        if (
          room.participants.some(
            (participant) => participant.uid === this.props.userCode
          )
        ) {
          room.participants = room.participants.filter(
            (e) => e.uid !== this.props.userCode
          );
          updateRoom(room);
        }
        if (
          room.hasOwnProperty("waiting") &&
          room.waiting.some(
            (participant) => participant.uid === this.props.userCode
          )
        ) {
          room.waiting = room.waiting.filter(
            (e) => e.uid !== this.props.userCode
          );
          updateRoom(room);
        }
      }
      getUser(this.props.userCode).then((s) => {
        let x = s.val();
        x.roomCode = "none";
        updateUser(x).then(() => {
          if (!this.mounted) return;
        });
      });
    });
  };
  deleteRoom = () => {
    fire
      .database()
      .ref("/rooms/" + this.state.roomCode)
      .remove();
    this.setState({
      roomJoined: false,
      roomCode: "dummy",
    });
  };
  render() {
    return (
      <div className="container">
        {!this.state.roomJoined && this.state.loaded && (
          <HostJoin
            userCode={this.props.userCode}
            key={"menu" + this.props.userCode + this.state.roomCode}
            onRoomCreate={this.onRoomCreate}
            onRoomJoined={this.onRoomJoined}
          />
        )}
        {this.state.roomJoined && this.state.loaded && (
          <MainGame
            userCode={this.props.userCode}
            key={"lounge" + this.props.userCode + this.state.roomCode}
            roomCode={this.state.roomCode}
            leaveRoom={this.leaveRoom}
            deleteRoom={this.deleteRoom}
          />
        )}
        {!this.state.loaded && <LoadingText>authenticated</LoadingText>}
      </div>
    );
  }
}

export default PreGame;
