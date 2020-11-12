import React, { Component } from "react";
import { dummyRoom, getRoom, updateRoom } from "../interfaces/RoomInterface";
import { dummyParticipant } from "../interfaces/participantInterface";

interface menuInterface {
  userCode: string;
  onRoomCreate: any;
  onRoomJoined: any;
}

class HostJoin extends Component<menuInterface> {
  state = {
    joinGame: { value: "", error: [] },
    hostGame: { value: "", error: [] },
  };
  consonants = [
    "b",
    "c",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    "m",
    "n",
    "p",
    "q",
    "r",
    "s",
    "t",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];
  vowels = ["a", "e", "i", "o", "u"];
  onHost = (event: any) => {
    event.preventDefault();
    let code: string = this.randomGenerator();

    getRoom(code)
      .then((snapshot) => {
        if (snapshot.val() === null) this.createRoom(code);
      })
      .catch((e) => {
        this.setState({ hostGame: { value: "", error: [e.message] } });
      });
  };

  randomGenerator(): string {
    let letter1 = this.consonants[Math.floor(Math.random() * 21)];
    let letter3 = this.consonants[Math.floor(Math.random() * 21)];
    let letter2 = this.vowels[Math.floor(Math.random() * 5)];
    let letter4 = this.vowels[Math.floor(Math.random() * 5)];
    let letter6 = this.vowels[Math.floor(Math.random() * 5)];
    let letter5 = this.consonants[Math.floor(Math.random() * 21)];
    return letter1 + letter2 + letter3 + letter4 + letter5 + letter6;
  }

  createRoom = (code: string) => {
    updateRoom(
      dummyRoom(
        this.props.userCode,
        [dummyParticipant(this.props.userCode)],
        [],
        8,
        undefined,
        undefined,
        undefined,
        undefined,
        code
      )
    )
      .then(() => {
        this.props.onRoomCreate(code);
      })
      .catch((e) => {
        this.setState({ hostGame: { value: "", error: [e.message] } });
      });
  };
  onCodeChange = (e: any) => {
    this.setState({
      joinGame: { value: e.target.value, error: this.state.joinGame.error },
    });
  };
  joinRoom = (event: any) => {
    event.preventDefault();
    if (this.state.joinGame.value === "") {
      this.setState({
        joinGame: { value: "", error: ["This field can't be empty"] },
      });
      return;
    }
    getRoom(this.state.joinGame.value.toLowerCase()).then((snapshot) => {
      if (snapshot.val()) {
        let tempRoom = snapshot.val();
        this.props.onRoomJoined(tempRoom.code);
      } else {
        let errors: string[] = [];
        errors.push("Unable to find a game with that code");
        this.setState({
          joinGame: { value: this.state.joinGame.value, error: errors },
        });
      }
    });
  };

  render() {
    return (
      <form className="container" noValidate={true}>
        <h3 className="mb-4">Enter Room Code</h3>
        <div className="form-group text-left">
          <div className="row ">
            <input
              className="form-control mx-2 mt-2 col-md-9"
              onChange={this.onCodeChange}
              placeholder="Room Code"
            />
            <input
              value="Join Room"
              type="submit"
              className="btn btn-secondary mx-2 mt-2 col-md-2"
              onClick={this.joinRoom}
            />
          </div>
          {this.state.joinGame.error.map((e: any, index) => (
            <small key={index} className="form-text text-danger">
              {e}
            </small>
          ))}
        </div>

        <h5 className="my-4">or</h5>
        <button className="btn btn-primary" onClick={this.onHost}>
          Host your own game!
        </button>
        {this.state.hostGame.error.map((e: any, index) => (
          <small key={index} className="form-text text-danger">
            {e}
          </small>
        ))}
      </form>
    );
  }
}

export default HostJoin;
