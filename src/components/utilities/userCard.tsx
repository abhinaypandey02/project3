import React, { Component } from "react";
import fire from "../../firebase";
import RoomInterface, {
  dummyRoom,
  getRoom,
  updateRoom,
} from "../interfaces/RoomInterface";
import { dummyUser } from "../interfaces/UserInterface";
import { dummyParticipant } from "../interfaces/participantInterface";

class UserCard extends Component<{
  userCode: string;
  currUserCode: string;
  host: string;
  index: number;
  roomCode: string;
}> {
  state = {
    user: dummyUser(),
    room: dummyRoom(),
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

          for (let p in room.participants)
            if (room.participants[p].uid === this.props.userCode)
              this.setState({ participant: room.participants[p] });
        }
      });
  }

  kick = () => {
    getRoom(this.props.roomCode).then((snapshot) => {
      if (snapshot.val()) {
        let tempRoom: RoomInterface = snapshot.val();
        tempRoom.participants = tempRoom.participants.filter(
          (e) => e.uid !== this.props.userCode
        );
        updateRoom(tempRoom);
      }
    });
  };

  render() {
    return (
      <div className="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <span className="badge badge-primary badge-pill m-1">
            {this.props.index + 1}
          </span>
          <span className="h4 m-1">
            {this.state.user.firstName === "dummy"
              ? "loading..."
              : this.state.user.firstName}
          </span>
          <span className="badge badge-info m-1">
            {this.props.userCode === this.props.currUserCode && "You"}
          </span>
          <span className="badge badge-secondary m-1">
            {this.props.userCode === this.props.host && "Host"}
          </span>
        </div>
        <div>
          {this.props.children === "postAnswer" && (
            <span>
              {this.state.participant.currentAnswer.submittedBy === "dummy" ? (
                <svg
                  width="1.5em"
                  height="1.5em"
                  viewBox="0 0 16 16"
                  className="bi bi-clock-fill"
                  fill="#ffbf00"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"
                  />
                </svg>
              ) : (
                <svg
                  width="1.5em"
                  height="1.5em"
                  viewBox="0 0 16 16"
                  className="bi bi-check-circle-fill"
                  fill="MediumSeaGreen"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
                  />
                </svg>
              )}
            </span>
          )}
          {this.props.children === "postAnswerPick" && (
            <span>
              {!this.state.participant.chosenAns ? (
                <svg
                  width="1.5em"
                  height="1.5em"
                  viewBox="0 0 16 16"
                  className="bi bi-clock-fill"
                  fill="#ffbf00"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"
                  />
                </svg>
              ) : (
                <svg
                  width="1.5em"
                  height="1.5em"
                  viewBox="0 0 16 16"
                  className="bi bi-check-circle-fill"
                  fill="MediumSeaGreen"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
                  />
                </svg>
              )}
            </span>
          )}
          {this.props.children === "postReady" && (
            <span>
              {!this.state.participant.readyForNextRound ? (
                <svg
                  width="1.5em"
                  height="1.5em"
                  viewBox="0 0 16 16"
                  className="bi bi-clock-fill"
                  fill="#ffbf00"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"
                  />
                </svg>
              ) : (
                <svg
                  width="1.5em"
                  height="1.5em"
                  viewBox="0 0 16 16"
                  className="bi bi-check-circle-fill"
                  fill="MediumSeaGreen"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
                  />
                </svg>
              )}
            </span>
          )}
          {this.props.children === "waitingLounge" && (
            <span>
              <svg
                width="1.5em"
                height="1.5em"
                viewBox="0 0 16 16"
                className="bi bi-clock-fill"
                fill="#ffbf00"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"
                />
              </svg>
            </span>
          )}
          {this.props.currUserCode === this.props.host &&
            this.props.userCode !== this.props.host && (
              <span className="btn btn-sm btn-danger m-1" onClick={this.kick}>
                Kick
              </span>
            )}
        </div>
      </div>
    );
  }
}
export default UserCard;
