import React, { Component } from "react";
import fire from "../../firebase";
import { dummyRoom } from "../interfaces/RoomInterface";
import ParticipantInterface from "../interfaces/participantInterface";
import UserCard from "../utilities/userCard";
import LoadingText from "../utilities/loadingText";

interface postAnswerLoungeInterface {
  userCode: string;
  roomCode: string;
}

class PostAnswerLounge extends Component<postAnswerLoungeInterface> {
  state = {
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
        let room = snapshot.val();
        if (room) this.setState({ room });
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
                      postAnswer
                    </UserCard>
                  )
                )}
              </div>
              <div className="font-weight-light h4 m-3">
                Waiting for all players to submit their answers.
              </div>
            </div>
          </div>
        )}
        {this.state.room.code === "dummy" ? (
          <LoadingText>submitting answer</LoadingText>
        ) : (
          <hr className="m-3" />
        )}
      </div>
    );
  }
}

export default PostAnswerLounge;
