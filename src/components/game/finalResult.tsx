import React, { Component } from "react";
import { dummyRoom } from "../interfaces/RoomInterface";
import fire from "../../firebase";
import { codeToName } from "../interfaces/UserInterface";
interface FinalResultInterface {
  roomCode: string;
}
class FinalResult extends Component<FinalResultInterface> {
  state = {
    room: dummyRoom(),
    winners: [],
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
        if (room) {
          this.setState({ room });
          let tempWinners = [];
          for (let part of room.participants) {
            if (part.score === room.participants[0].score) {
              tempWinners.push(part.uid);
            }
          }
          codeToName(tempWinners).then((s) => {
            if (!this.mounted) return;
            this.setState({ winners: s });
          });
        }
      });
  }
  render() {
    return (
      <div>
        {this.state.winners.length > 0 && (
          <div className="h1">
            <div className="h1 m-4 font-weight-light">
              {this.state.winners.length === 1 ? "Winner:" : "Winners:"}
            </div>
            {this.state.winners.map((ans: any, index) => {
              let l = this.state.winners.length;
              let punctuation = "";
              if (l - 1 === index) {
                if (l !== 1) punctuation = " and ";
              } else {
                if (index !== 0) punctuation = ", ";
              }
              return (
                <span key={index}>
                  {punctuation}
                  <span className="badge badge-info badge-pill m-1" key={index}>
                    {ans}
                  </span>
                </span>
              );
            })}
          </div>
        )}
        <hr className="m-3" />
      </div>
    );
  }
}

export default FinalResult;
