import React, { Component } from "react";
import { dummyRoom } from "../interfaces/RoomInterface";
import { dummyUser } from "../interfaces/UserInterface";
import fire from "../../firebase";
import ParticipantInterface from "../interfaces/participantInterface";
import UserCard from "../utilities/userCard";
interface waitingLoungeInterface {
  roomCode: string;
  userCode: string;
}

class WaitingLounge extends Component<waitingLoungeInterface> {
  state = {
    room: dummyRoom(),
    user: dummyUser(),
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
  render() {
    return (
      <div className="container">
        {this.state.room.code !== "dummy" && (
          <div className="container">
            <i>Room Code: </i>
            <h1 className="display-3">{this.state.room.code}</h1>
            <hr />
            <div id="participants" className="text-center">
              <div className="list-group text-left">
                <div className="list-group-item active">Waiting Lounge:</div>
                {this.state.room.waiting.map(
                  (participant: ParticipantInterface, i) => (
                    <UserCard
                      key={participant.uid}
                      index={i}
                      userCode={participant.uid}
                      roomCode={this.props.roomCode}
                      currUserCode={this.props.userCode}
                      host={this.state.room.host}
                    >
                      waitingLounge
                    </UserCard>
                  )
                )}
              </div>
              <div className="font-weight-light h4 m-3">
                Waiting for the next round to begin.
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default WaitingLounge;
